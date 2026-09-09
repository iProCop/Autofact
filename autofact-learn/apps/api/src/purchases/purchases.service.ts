import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ReportStatus,
  Role,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { MockYooKassaProvider } from '../payments/mock-yookassa.provider';
import { AuthUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
    private readonly payments: MockYooKassaProvider,
    private readonly config: ConfigService,
  ) {}

  private feeSplit(priceKopecks: number) {
    const feePercent = Number(
      this.config.get<string>('PLATFORM_FEE_REPORT_PERCENT') ?? 20,
    );
    const platformFeeKopecks = Math.round((priceKopecks * feePercent) / 100);
    return {
      platformFeeKopecks,
      expertPayoutKopecks: priceKopecks - platformFeeKopecks,
    };
  }

  async initiate(user: AuthUser, reportId: string) {
    if (user.role !== Role.CLIENT && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Покупать могут только клиенты');
    }

    const client = await this.prisma.clientProfile.findUnique({
      where: { userId: user.userId },
    });
    if (!client) throw new ForbiddenException('Профиль клиента не найден');

    const report = await this.prisma.carReport.findUnique({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException('Отчёт не найден');
    if (
      report.status !== ReportStatus.PUBLISHED &&
      report.status !== ReportStatus.DISPUTED
    ) {
      throw new BadRequestException('Отчёт недоступен для покупки');
    }

    const existing = await this.prisma.purchase.findUnique({
      where: { clientId_reportId: { clientId: client.id, reportId } },
    });
    if (existing) throw new ConflictException('Отчёт уже куплен');

    const price = this.pricing.getPriceKopecks(
      report.basePriceKopecks,
      report.createdAt,
    );
    // archived+historical (10%) ещё можно купить как справку; нулевая цена — нет
    if (price.priceKopecks <= 0) {
      throw new BadRequestException('Отчёт в архиве');
    }

    const fees = this.feeSplit(price.priceKopecks);
    const payment = await this.payments.createPayment({
      amountKopecks: price.priceKopecks,
      description: `Покупка отчёта ${report.title}`,
      metadata: { reportId, clientId: client.id, userId: user.userId },
    });

    const transaction = await this.prisma.transaction.create({
      data: {
        userId: user.userId,
        type: TransactionType.PURCHASE,
        amountKopecks: price.priceKopecks,
        yookassaPaymentId: payment.paymentId,
        status: TransactionStatus.PENDING,
      },
    });

    return {
      transactionId: transaction.id,
      paymentId: payment.paymentId,
      amountKopecks: price.priceKopecks,
      ...fees,
      confirmationUrl: payment.confirmationUrl,
      reportId,
    };
  }

  async confirmMockPayment(paymentId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { yookassaPaymentId: paymentId },
    });
    if (!transaction) throw new NotFoundException('Транзакция не найдена');
    if (transaction.status === TransactionStatus.SUCCEEDED) {
      return { ok: true, alreadyProcessed: true };
    }

    await this.payments.confirmMock(paymentId);

    // Recover reportId from payment metadata pattern: stored only in mock URL / recreate via latest pending purchase attempt
    // We encode report in yookassa id flow by looking up client's open purchase intent via amount match — better: parse from confirmation metadata table.
    // For MVP mock: paymentId is unique; store reportId in a lightweight PendingPayment row isn't available — use Transaction.amount + user + find unpaid report from client history.
    // Simplest robust MVP: require reportId query param on confirm endpoint.

    throw new BadRequestException(
      'Используйте confirm с reportId (см. PaymentsController)',
    );
  }

  async confirmMock(paymentId: string, reportId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { yookassaPaymentId: paymentId },
    });
    if (!transaction) throw new NotFoundException('Транзакция не найдена');
    if (transaction.status === TransactionStatus.SUCCEEDED) {
      const purchase = await this.prisma.purchase.findUnique({
        where: { transactionId: transaction.id },
      });
      return { ok: true, alreadyProcessed: true, purchase };
    }

    const client = await this.prisma.clientProfile.findUnique({
      where: { userId: transaction.userId },
    });
    if (!client) throw new BadRequestException('Клиент не найден');

    const report = await this.prisma.carReport.findUnique({
      where: { id: reportId },
      include: { expert: true },
    });
    if (!report) throw new NotFoundException('Отчёт не найден');

    const existing = await this.prisma.purchase.findUnique({
      where: { clientId_reportId: { clientId: client.id, reportId } },
    });
    if (existing) throw new ConflictException('Отчёт уже куплен');

    const fees = this.feeSplit(transaction.amountKopecks);
    await this.payments.confirmMock(paymentId);

    const purchase = await this.prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.SUCCEEDED },
      });

      const created = await tx.purchase.create({
        data: {
          clientId: client.id,
          reportId,
          priceKopecks: transaction.amountKopecks,
          platformFeeKopecks: fees.platformFeeKopecks,
          expertPayoutKopecks: fees.expertPayoutKopecks,
          transactionId: transaction.id,
        },
      });

      await tx.expertProfile.update({
        where: { id: report.expertId },
        data: {
          balanceKopecks: { increment: fees.expertPayoutKopecks },
          salesCount: { increment: 1 },
        },
      });

      await tx.transaction.create({
        data: {
          userId: report.expert.userId,
          type: TransactionType.SALE,
          amountKopecks: fees.expertPayoutKopecks,
          status: TransactionStatus.SUCCEEDED,
          yookassaPaymentId: paymentId,
        },
      });

      return created;
    });

    return { ok: true, purchase };
  }

  async history(user: AuthUser) {
    const client = await this.prisma.clientProfile.findUnique({
      where: { userId: user.userId },
    });
    if (!client) return [];

    return this.prisma.purchase.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: 'desc' },
      include: {
        report: {
          select: {
            id: true,
            title: true,
            make: true,
            model: true,
            year: true,
          },
        },
      },
    });
  }
}
