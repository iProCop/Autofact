"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const pricing_service_1 = require("../pricing/pricing.service");
const mock_yookassa_provider_1 = require("../payments/mock-yookassa.provider");
let PurchasesService = class PurchasesService {
    prisma;
    pricing;
    payments;
    config;
    constructor(prisma, pricing, payments, config) {
        this.prisma = prisma;
        this.pricing = pricing;
        this.payments = payments;
        this.config = config;
    }
    feeSplit(priceKopecks) {
        const feePercent = Number(this.config.get('PLATFORM_FEE_REPORT_PERCENT') ?? 20);
        const platformFeeKopecks = Math.round((priceKopecks * feePercent) / 100);
        return {
            platformFeeKopecks,
            expertPayoutKopecks: priceKopecks - platformFeeKopecks,
        };
    }
    async initiate(user, reportId) {
        if (user.role !== client_1.Role.CLIENT && user.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Покупать могут только клиенты');
        }
        const client = await this.prisma.clientProfile.findUnique({
            where: { userId: user.userId },
        });
        if (!client)
            throw new common_1.ForbiddenException('Профиль клиента не найден');
        const report = await this.prisma.carReport.findUnique({
            where: { id: reportId },
        });
        if (!report)
            throw new common_1.NotFoundException('Отчёт не найден');
        if (report.status !== client_1.ReportStatus.PUBLISHED &&
            report.status !== client_1.ReportStatus.DISPUTED) {
            throw new common_1.BadRequestException('Отчёт недоступен для покупки');
        }
        const existing = await this.prisma.purchase.findUnique({
            where: { clientId_reportId: { clientId: client.id, reportId } },
        });
        if (existing)
            throw new common_1.ConflictException('Отчёт уже куплен');
        const price = this.pricing.getPriceKopecks(report.basePriceKopecks, report.createdAt);
        if (price.archived || price.priceKopecks <= 0) {
            throw new common_1.BadRequestException('Отчёт в архиве');
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
                type: client_1.TransactionType.PURCHASE,
                amountKopecks: price.priceKopecks,
                yookassaPaymentId: payment.paymentId,
                status: client_1.TransactionStatus.PENDING,
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
    async confirmMockPayment(paymentId) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { yookassaPaymentId: paymentId },
        });
        if (!transaction)
            throw new common_1.NotFoundException('Транзакция не найдена');
        if (transaction.status === client_1.TransactionStatus.SUCCEEDED) {
            return { ok: true, alreadyProcessed: true };
        }
        await this.payments.confirmMock(paymentId);
        throw new common_1.BadRequestException('Используйте confirm с reportId (см. PaymentsController)');
    }
    async confirmMock(paymentId, reportId) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { yookassaPaymentId: paymentId },
        });
        if (!transaction)
            throw new common_1.NotFoundException('Транзакция не найдена');
        if (transaction.status === client_1.TransactionStatus.SUCCEEDED) {
            const purchase = await this.prisma.purchase.findUnique({
                where: { transactionId: transaction.id },
            });
            return { ok: true, alreadyProcessed: true, purchase };
        }
        const client = await this.prisma.clientProfile.findUnique({
            where: { userId: transaction.userId },
        });
        if (!client)
            throw new common_1.BadRequestException('Клиент не найден');
        const report = await this.prisma.carReport.findUnique({
            where: { id: reportId },
            include: { expert: true },
        });
        if (!report)
            throw new common_1.NotFoundException('Отчёт не найден');
        const existing = await this.prisma.purchase.findUnique({
            where: { clientId_reportId: { clientId: client.id, reportId } },
        });
        if (existing)
            throw new common_1.ConflictException('Отчёт уже куплен');
        const fees = this.feeSplit(transaction.amountKopecks);
        await this.payments.confirmMock(paymentId);
        const purchase = await this.prisma.$transaction(async (tx) => {
            await tx.transaction.update({
                where: { id: transaction.id },
                data: { status: client_1.TransactionStatus.SUCCEEDED },
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
                    type: client_1.TransactionType.SALE,
                    amountKopecks: fees.expertPayoutKopecks,
                    status: client_1.TransactionStatus.SUCCEEDED,
                    yookassaPaymentId: paymentId,
                },
            });
            return created;
        });
        return { ok: true, purchase };
    }
    async history(user) {
        const client = await this.prisma.clientProfile.findUnique({
            where: { userId: user.userId },
        });
        if (!client)
            return [];
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
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pricing_service_1.PricingService,
        mock_yookassa_provider_1.MockYooKassaProvider,
        config_1.ConfigService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map