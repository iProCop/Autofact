import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { MockYooKassaProvider } from '../payments/mock-yookassa.provider';
import { AuthUser } from '../common/decorators/current-user.decorator';
export declare class PurchasesService {
    private readonly prisma;
    private readonly pricing;
    private readonly payments;
    private readonly config;
    constructor(prisma: PrismaService, pricing: PricingService, payments: MockYooKassaProvider, config: ConfigService);
    private feeSplit;
    initiate(user: AuthUser, reportId: string): Promise<{
        confirmationUrl: string | null;
        reportId: string;
        platformFeeKopecks: number;
        expertPayoutKopecks: number;
        transactionId: string;
        paymentId: string;
        amountKopecks: number;
    }>;
    confirmMockPayment(paymentId: string): Promise<{
        ok: boolean;
        alreadyProcessed: boolean;
    }>;
    confirmMock(paymentId: string, reportId: string): Promise<{
        ok: boolean;
        alreadyProcessed: boolean;
        purchase: {
            id: string;
            createdAt: Date;
            reportId: string;
            transactionId: string;
            clientId: string;
            priceKopecks: number;
            platformFeeKopecks: number;
            expertPayoutKopecks: number;
        } | null;
    } | {
        ok: boolean;
        purchase: {
            id: string;
            createdAt: Date;
            reportId: string;
            transactionId: string;
            clientId: string;
            priceKopecks: number;
            platformFeeKopecks: number;
            expertPayoutKopecks: number;
        };
        alreadyProcessed?: undefined;
    }>;
    history(user: AuthUser): Promise<({
        report: {
            id: string;
            make: string;
            model: string;
            year: number;
            title: string;
        };
    } & {
        id: string;
        createdAt: Date;
        reportId: string;
        transactionId: string;
        clientId: string;
        priceKopecks: number;
        platformFeeKopecks: number;
        expertPayoutKopecks: number;
    })[]>;
}
