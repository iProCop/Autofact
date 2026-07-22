import { PurchasesService } from './purchases.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
declare class InitiatePurchaseDto {
    reportId: string;
}
declare class MockConfirmDto {
    paymentId: string;
    reportId: string;
}
export declare class PurchasesController {
    private readonly purchases;
    constructor(purchases: PurchasesService);
    initiate(user: AuthUser, dto: InitiatePurchaseDto): Promise<{
        confirmationUrl: string | null;
        reportId: string;
        platformFeeKopecks: number;
        expertPayoutKopecks: number;
        transactionId: string;
        paymentId: string;
        amountKopecks: number;
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
    mockConfirm(dto: MockConfirmDto): Promise<{
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
}
export {};
