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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const pricing_service_1 = require("../pricing/pricing.service");
const platform_score_service_1 = require("../platform-score/platform-score.service");
let ReportsService = class ReportsService {
    prisma;
    pricing;
    platformScore;
    constructor(prisma, pricing, platformScore) {
        this.prisma = prisma;
        this.pricing = pricing;
        this.platformScore = platformScore;
    }
    async getExpertProfileId(userId) {
        const expert = await this.prisma.expertProfile.findUnique({
            where: { userId },
        });
        if (!expert)
            throw new common_1.ForbiddenException('Профиль эксперта не найден');
        return expert;
    }
    async createDraft(user, dto) {
        if (user.role !== client_1.Role.EXPERT && user.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Только эксперт может создавать отчёты');
        }
        const expert = await this.getExpertProfileId(user.userId);
        const overall = (dto.engineScore +
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
                defects: (dto.defects ?? []),
                basePriceKopecks: dto.basePriceKopecks,
                region: dto.region,
                city: dto.city,
                status: client_1.ReportStatus.DRAFT,
            },
        });
    }
    async publish(user, reportId) {
        const report = await this.prisma.carReport.findUnique({
            where: { id: reportId },
            include: { expert: true },
        });
        if (!report)
            throw new common_1.NotFoundException('Отчёт не найден');
        if (report.expert.userId !== user.userId && user.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Нельзя публиковать чужой отчёт');
        }
        const published = await this.prisma.carReport.update({
            where: { id: reportId },
            data: {
                status: client_1.ReportStatus.PUBLISHED,
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
    async recalculatePlatformScore(vin) {
        const reports = await this.prisma.carReport.findMany({
            where: {
                vin,
                status: { in: [client_1.ReportStatus.PUBLISHED, client_1.ReportStatus.DISPUTED] },
            },
            include: { expert: true },
        });
        const result = this.platformScore.calculate(reports.map((r) => ({
            expertId: r.expertId,
            overallScore: Number(r.expertOverallScore),
            expertRating: Number(r.expert.rating),
        })));
        const status = result.disputed
            ? client_1.ReportStatus.DISPUTED
            : client_1.ReportStatus.PUBLISHED;
        await this.prisma.carReport.updateMany({
            where: {
                vin,
                status: { in: [client_1.ReportStatus.PUBLISHED, client_1.ReportStatus.DISPUTED] },
            },
            data: {
                platformScore: result.platformScore,
                status: result.platformScore === null ? client_1.ReportStatus.PUBLISHED : status,
            },
        });
    }
    async list(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 12;
        const where = {
            status: { in: [client_1.ReportStatus.PUBLISHED, client_1.ReportStatus.DISPUTED] },
            ...(query.make
                ? { make: { contains: query.make, mode: 'insensitive' } }
                : {}),
            ...(query.model
                ? { model: { contains: query.model, mode: 'insensitive' } }
                : {}),
            ...(query.region
                ? { region: { contains: query.region, mode: 'insensitive' } }
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
                    media: { orderBy: { sortOrder: 'asc' }, take: 1 },
                },
            }),
            this.prisma.carReport.count({ where }),
        ]);
        const now = new Date();
        const mapped = items
            .map((item) => {
            const price = this.pricing.getPriceKopecks(item.basePriceKopecks, item.createdAt, now);
            if (price.archived)
                return null;
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
                platformScore: item.platformScore === null ? null : Number(item.platformScore),
                priceKopecks: price.priceKopecks,
                priceMultiplier: price.multiplier,
                ageDays: price.ageDays,
                expert: {
                    ...item.expert,
                    rating: Number(item.expert.rating),
                },
                coverUrl: item.media[0]?.url ?? null,
                createdAt: item.createdAt,
            };
        })
            .filter(Boolean);
        return { items: mapped, total, page, limit };
    }
    async getOne(reportId, user) {
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
                media: { orderBy: { sortOrder: 'asc' } },
            },
        });
        if (!report)
            throw new common_1.NotFoundException('Отчёт не найден');
        const price = this.pricing.getPriceKopecks(report.basePriceKopecks, report.createdAt);
        let purchased = false;
        let isOwner = false;
        if (user) {
            if (user.role === client_1.Role.EXPERT || user.role === client_1.Role.ADMIN) {
                const expert = await this.prisma.expertProfile.findUnique({
                    where: { userId: user.userId },
                });
                isOwner = !!expert && expert.id === report.expertId;
            }
            if (user.role === client_1.Role.CLIENT || user.role === client_1.Role.ADMIN) {
                const client = await this.prisma.clientProfile.findUnique({
                    where: { userId: user.userId },
                });
                if (client) {
                    const purchase = await this.prisma.purchase.findUnique({
                        where: {
                            clientId_reportId: { clientId: client.id, reportId },
                        },
                    });
                    purchased = !!purchase;
                }
            }
        }
        const canViewFull = purchased || isOwner || user?.role === client_1.Role.ADMIN;
        const previewMedia = report.media.slice(0, 1);
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
            platformScore: report.platformScore === null ? null : Number(report.platformScore),
            disputed: report.status === client_1.ReportStatus.DISPUTED,
            priceKopecks: price.priceKopecks,
            priceMultiplier: price.multiplier,
            ageDays: price.ageDays,
            archived: price.archived,
            expert: {
                ...report.expert,
                rating: Number(report.expert.rating),
            },
            media: canViewFull ? report.media : previewMedia,
            purchased,
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
                    defects: report.defects,
                    mileage: report.mileage,
                }
                : null,
            createdAt: report.createdAt,
        };
    }
    async myReports(user) {
        const expert = await this.getExpertProfileId(user.userId);
        return this.prisma.carReport.findMany({
            where: { expertId: expert.id },
            orderBy: { createdAt: 'desc' },
            include: { media: { take: 1, orderBy: { sortOrder: 'asc' } } },
        });
    }
    async addMedia(user, reportId, fileName, type = client_1.MediaType.PHOTO) {
        const report = await this.prisma.carReport.findUnique({
            where: { id: reportId },
            include: { expert: true, media: true },
        });
        if (!report)
            throw new common_1.NotFoundException('Отчёт не найден');
        if (report.expert.userId !== user.userId && user.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Нельзя менять чужой отчёт');
        }
        return this.prisma.reportMedia.create({
            data: {
                reportId,
                type,
                url: `/uploads/${fileName}`,
                sortOrder: report.media.length,
            },
        });
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pricing_service_1.PricingService,
        platform_score_service_1.PlatformScoreService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map