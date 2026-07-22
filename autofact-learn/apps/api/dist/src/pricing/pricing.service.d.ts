export declare class PricingService {
    getPriceKopecks(basePriceKopecks: number, createdAt: Date, now?: Date): {
        priceKopecks: number;
        multiplier: number;
        archived: true;
        ageDays: number;
    } | {
        priceKopecks: number;
        multiplier: number;
        archived: false;
        ageDays: number;
    };
    multiplierForAge(ageDays: number): number;
    ageInDays(createdAt: Date, now?: Date): number;
}
