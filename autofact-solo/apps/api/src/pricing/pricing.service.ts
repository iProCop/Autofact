import { BadRequestException, Injectable } from '@nestjs/common';
import { CarClass, CAR_CLASS_BANDS, PriceBand } from './car-class';
import {
  PricingMode,
  PricingStrategy,
  STRATEGY_MULTIPLIER,
} from './pricing-policy';

export type PriceResult = {
  priceKopecks: number;
  recommendedPriceKopecks: number;
  basePriceKopecks: number;
  timeMultiplier: number;
  demandMultiplier: number;
  strategyMultiplier: number;
  ageDays: number;
  archived: boolean;
  historical: boolean;
  mode: PricingMode;
  strategy: PricingStrategy;
  autoApplied: boolean;
};

export type GetPriceInput = {
  basePriceKopecks: number;
  createdAt: Date;
  now?: Date;
  demandMultiplier?: number;
  mode?: PricingMode;
  strategy?: PricingStrategy;
  manualPriceKopecks?: number;
};

@Injectable()
export class PricingService {
  getBand(carClass: CarClass): PriceBand {
    return CAR_CLASS_BANDS[carClass];
  }

  assertBasePriceInBand(carClass: CarClass, basePriceKopecks: number): void {
    const band = this.getBand(carClass);
    if (
      basePriceKopecks < band.minKopecks ||
      basePriceKopecks > band.maxKopecks
    ) {
      throw new BadRequestException(
        `Цена вне вилки для ${carClass}: от ${band.minKopecks} до ${band.maxKopecks} коп., рекомендуемая — ${band.recommendedKopecks}`,
      );
    }
  }

  strategyMultiplier(strategy: PricingStrategy): number {
    return STRATEGY_MULTIPLIER[strategy];
  }

  canChangePricingMode(
    lastModeChangeAt: Date | null | undefined,
    now = new Date(),
  ): boolean {
    if (!lastModeChangeAt) return true;
    const dayMs = 24 * 60 * 60 * 1000;
    return now.getTime() - lastModeChangeAt.getTime() >= dayMs;
  }

  getPrice(input: GetPriceInput): PriceResult {
    const now = input.now ?? new Date();
    const mode = input.mode ?? PricingMode.AUTO;
    const strategy = input.strategy ?? PricingStrategy.BALANCE;
    const demand = this.clampDemand(input.demandMultiplier ?? 1);
    const stratMul = this.strategyMultiplier(strategy);

    const ageDays = this.ageInDays(input.createdAt, now);
    const timeMultiplier = this.timeMultiplierForAge(ageDays);
    const archived = ageDays >= 90;
    const historical = archived;
    const recommendedPriceKopecks = Math.round(
      input.basePriceKopecks * timeMultiplier * demand * stratMul,
    );

    if (mode === PricingMode.MANUAL) {
      const priceKopecks =
        input.manualPriceKopecks ?? input.basePriceKopecks;
      return {
        priceKopecks,
        recommendedPriceKopecks,
        basePriceKopecks: input.basePriceKopecks,
        timeMultiplier,
        demandMultiplier: demand,
        strategyMultiplier: stratMul,
        ageDays,
        archived,
        historical,
        mode,
        strategy,
        autoApplied: false,
      };
    }

    return {
      priceKopecks: recommendedPriceKopecks,
      recommendedPriceKopecks,
      basePriceKopecks: input.basePriceKopecks,
      timeMultiplier,
      demandMultiplier: demand,
      strategyMultiplier: stratMul,
      ageDays,
      archived,
      historical,
      mode,
      strategy,
      autoApplied: true,
    };
  }

  getPriceKopecks(
    basePriceKopecks: number,
    createdAt: Date,
    now = new Date(),
    demandMultiplier = 1,
  ): PriceResult {
    return this.getPrice({
      basePriceKopecks,
      createdAt,
      now,
      demandMultiplier,
      mode: PricingMode.AUTO,
      strategy: PricingStrategy.BALANCE,
    });
  }

  timeMultiplierForAge(ageDays: number): number {
    if (ageDays <= 6) return 1;
    if (ageDays <= 20) return 0.85;
    if (ageDays <= 44) return 0.7;
    if (ageDays <= 89) return 0.5;
    return 0.1;
  }

  clampDemand(demandMultiplier: number): number {
    return Math.min(1.2, Math.max(0.8, demandMultiplier));
  }

  ageInDays(createdAt: Date, now = new Date()): number {
    const ms = now.getTime() - createdAt.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }
}
