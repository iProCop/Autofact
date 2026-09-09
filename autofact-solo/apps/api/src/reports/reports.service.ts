import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReportStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { PlatformScoreService } from '../platform-score/platform-score.service';
import { CreateReportDto, ListReportsQueryDto } from './reports.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
    private readonly platformScore: PlatformScoreService,
  ) {}

  private async getExpertProfileId(userId: string) {
    const expert = await this.prisma.expertProfile.findUnique({
      where: { userId },
    });
    if (!expert) {
      throw new ForbiddenException('Профиль эксперта не найден');
    }
    return expert;
  }

  async createDraft(user: AuthUser, dto: CreateReportDto) {
    if (user.role !== Role.EXPERT && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Только эксперт может создавать отчёты');
    }

    const expert = await this.getExpertProfileId(user.userId);
    const overall =
      (dto.engineScore +
        dto.bodyScore +
        dto.paintScore +
        dto.interiorScore +
        (dto.tiresScore ?? 7) +
        (dto.electricsScore ?? 7)) /
      6;

    return this.prisma.carReport.create({
      data: {
        expertId: expert.id,
        title: dto.title,
        summary: dto.summary ?? '',
        expertNotes: dto.expertNotes ?? '',
        vin: dto.vin,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        mileage: dto.mileage,
        engineScore: dto.engineScore,
        bodyScore: dto.bodyScore,
        paintScore: dto.paintScore,
        interiorScore: dto.interiorScore,
        tiresScore: dto.tiresScore ?? 7,
        electricsScore: dto.electricsScore ?? 7,
        expertOverallScore: overall,
        basePriceKopecks: dto.basePriceKopecks,
        region: dto.region,
        city: dto.city,
        status: ReportStatus.DRAFT,
      },
    });
  }

  async publish(user: AuthUser, reportId: string) {
    const report = await this.prisma.carReport.findUnique({
      where: { id: reportId },
      include: { expert: true },
    });

    if (!report) {
      throw new NotFoundException('Отчёт не найден');
    }
    if (report.expert.userId !== user.userId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Нельзя публиковать чужой отчёт');
    }

    const published = await this.prisma.carReport.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    await this.prisma.expertProfile.update({
      where: { id: report.expertId },
      data: { inspectionsCount: { increment: 1 } },
    });

    if (published.vin) {
      await this.recalculatePlatformScore(published.vin);
    }

    return published;
  }

  async recalculatePlatformScore(vin: string) {
    const reports = await this.prisma.carReport.findMany({
      where: {
        vin,
        status: { in: [ReportStatus.PUBLISHED, ReportStatus.DISPUTED] },
      },
      include: { expert: true },
    });

    const result = this.platformScore.calculate(
      reports.map((r) => ({
        expertId: r.expertId,
        overallScore: Number(r.expertOverallScore),
        expertRating: Number(r.expert.rating),
      })),
    );

    const status = result.disputed
      ? ReportStatus.DISPUTED
      : ReportStatus.PUBLISHED;

    await this.prisma.carReport.updateMany({
      where: {
        vin,
        status: { in: [ReportStatus.PUBLISHED, ReportStatus.DISPUTED] },
      },
      data: {
        platformScore: result.platformScore,
        status: result.platformScore === null ? ReportStatus.PUBLISHED : status,
      },
    });
  }

  async list(query: ListReportsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const where = {
      status: { in: [ReportStatus.PUBLISHED, ReportStatus.DISPUTED] },
      ...(query.make
        ? { make: { contains: query.make, mode: 'insensitive' as const } }
        : {}),
      ...(query.model
        ? { model: { contains: query.model, mode: 'insensitive' as const } }
        : {}),
      ...(query.region
        ? { region: { contains: query.region, mode: 'insensitive' as const } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.carReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          expert: {
            select: {
              id: true,
              fullName: true,
              rating: true,
              region: true,
              city: true,
            },
          },
        },
      }),
      this.prisma.carReport.count({ where }),
    ]);

    const now = new Date();
    const mapped = items
      .map((item) => {
        const price = this.pricing.getPriceKopecks(
          item.basePriceKopecks,
          item.createdAt,
          now,
        );
        if (price.archived) return null;
        return {
          id: item.id,
          title: item.title,
          make: item.make,
          model: item.model,
          year: item.year,
          mileage: item.mileage,
          region: item.region,
          city: item.city,
          status: item.status,
          expertOverallScore: Number(item.expertOverallScore),
          platformScore:
            item.platformScore === null ? null : Number(item.platformScore),
          priceKopecks: price.priceKopecks,
          priceMultiplier: price.timeMultiplier,
          ageDays: price.ageDays,
          expert: {
            ...item.expert,
            rating: Number(item.expert.rating),
          },
          coverUrl: null as string | null,
          createdAt: item.createdAt,
        };
      })
      .filter(Boolean);

    return { items: mapped, total, page, limit };
  }

  async getOne(reportId: string, user?: AuthUser | null) {
    const report = await this.prisma.carReport.findUnique({
      where: { id: reportId },
      include: {
        expert: {
          select: {
            id: true,
            fullName: true,
            rating: true,
            region: true,
            city: true,
            bio: true,
            specializations: true,
          },
        },
      },
    });
    if (!report) {
      throw new NotFoundException('Отчёт не найден');
    }

    const price = this.pricing.getPriceKopecks(
      report.basePriceKopecks,
      report.createdAt,
    );

    let isOwner = false;
    if (user && (user.role === Role.EXPERT || user.role === Role.ADMIN)) {
      const expert = await this.prisma.expertProfile.findUnique({
        where: { userId: user.userId },
      });
      isOwner = !!expert && expert.id === report.expertId;
    }

    const canViewFull = isOwner || user?.role === Role.ADMIN;

    const scoresPreview = {
      bodyScore: report.bodyScore,
      paintScore: report.paintScore,
      techScore: report.engineScore,
      interiorScore: report.interiorScore,
      overall: Number(report.expertOverallScore),
    };

    return {
      id: report.id,
      title: report.title,
      make: report.make,
      model: report.model,
      year: report.year,
      mileage: report.mileage,
      region: report.region,
      city: report.city,
      status: report.status,
      expertOverallScore: Number(report.expertOverallScore),
      platformScore:
        report.platformScore === null ? null : Number(report.platformScore),
      disputed: report.status === ReportStatus.DISPUTED,
      priceKopecks: price.priceKopecks,
      priceMultiplier: price.timeMultiplier,
      ageDays: price.ageDays,
      archived: price.archived,
      expert: {
        ...report.expert,
        rating: Number(report.expert.rating),
      },
      purchased: false,
      isOwner,
      locked: !canViewFull,
      scores: scoresPreview,
      inspection: canViewFull
        ? {
            vin: report.vin ?? null,
            summary: report.summary,
            expertNotes: report.expertNotes,
            bodyScore: report.bodyScore,
            paintScore: report.paintScore,
            techScore: report.engineScore,
            interiorScore: report.interiorScore,
            tiresScore: report.tiresScore,
            electricsScore: report.electricsScore,
            mileage: report.mileage,
          }
        : null,
      createdAt: report.createdAt,
    };
  }

  async myReports(user: AuthUser) {
    const expert = await this.getExpertProfileId(user.userId);
    return this.prisma.carReport.findMany({
      where: { expertId: expert.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
