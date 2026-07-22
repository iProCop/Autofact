import { Injectable } from '@nestjs/common';

/** Dynamic report price from createdAt + basePrice (kopecks). */
@Injectable()
export class PricingService {
  getPriceKopecks(basePriceKopecks: number, createdAt: Date, now = new Date()) {
    const ageDays = this.ageInDays(createdAt, now);
    if (ageDays > 60) {
      return { priceKopecks: 0, multiplier: 0, archived: true as const, ageDays };
    }
    const multiplier = this.multiplierForAge(ageDays);
    return {
      priceKopecks: Math.round(basePriceKopecks * multiplier),
      multiplier,
      archived: false as const,
      ageDays,
    };
  }

  multiplierForAge(ageDays: number): number {
    if (ageDays <= 3) return 1;
    if (ageDays <= 10) return 0.8;
    if (ageDays <= 30) return 0.5;
    if (ageDays <= 60) return 0.2;
    return 0;
  }

  ageInDays(createdAt: Date, now = new Date()): number {
    const ms = now.getTime() - createdAt.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }
}
