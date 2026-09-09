import { BadRequestException } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CarClass } from './car-class';
import { PricingMode, PricingStrategy } from './pricing-policy';

describe('PricingService', () => {
  const service = new PricingService();
  const day = 24 * 60 * 60 * 1000;
  const base = 220_000;

  describe('слой 1 — вилка', () => {
    it('пропускает цену внутри MID', () => {
      expect(() =>
        service.assertBasePriceInBand(CarClass.MID, 220_000),
      ).not.toThrow();
    });

    it('ругается на цену ниже минимума', () => {
      expect(() =>
        service.assertBasePriceInBand(CarClass.MID, 50_000),
      ).toThrow(BadRequestException);
    });
  });

  describe('слой 2 — время', () => {
    it('0-6 дней = 100%', () => {
      const createdAt = new Date('2026-08-01T10:00:00Z');
      const now = new Date(createdAt.getTime() + 5 * day);
      const r = service.getPriceKopecks(base, createdAt, now);
      expect(r.timeMultiplier).toBe(1);
      expect(r.priceKopecks).toBe(220_000);
      expect(r.archived).toBe(false);
    });

    it('7-20 дней = 85%', () => {
      const createdAt = new Date('2026-08-01T10:00:00Z');
      const now = new Date(createdAt.getTime() + 10 * day);
      const r = service.getPriceKopecks(base, createdAt, now);
      expect(r.timeMultiplier).toBe(0.85);
      expect(r.priceKopecks).toBe(Math.round(220_000 * 0.85));
    });

    it('21-44 дней = 70%', () => {
      const createdAt = new Date('2026-08-01T10:00:00Z');
      const now = new Date(createdAt.getTime() + 30 * day);
      const r = service.getPriceKopecks(base, createdAt, now);
      expect(r.timeMultiplier).toBe(0.7);
      expect(r.priceKopecks).toBe(Math.round(220_000 * 0.7));
    });

    it('45-89 дней = 50%', () => {
      const createdAt = new Date('2026-08-01T10:00:00Z');
      const now = new Date(createdAt.getTime() + 60 * day);
      const r = service.getPriceKopecks(base, createdAt, now);
      expect(r.timeMultiplier).toBe(0.5);
      expect(r.priceKopecks).toBe(110_000);
    });

    it('>=90 дней = historical 10%, archived', () => {
      const createdAt = new Date('2026-01-01T10:00:00Z');
      const now = new Date(createdAt.getTime() + 100 * day);
      const r = service.getPriceKopecks(base, createdAt, now);
      expect(r.archived).toBe(true);
      expect(r.historical).toBe(true);
      expect(r.timeMultiplier).toBe(0.1);
      expect(r.priceKopecks).toBe(22_000);
    });
  });

  describe('слой 3 — заготовка demand', () => {
    it('demand 1.5 режется до 1.2', () => {
      const createdAt = new Date('2026-08-01T10:00:00Z');
      const now = new Date(createdAt.getTime() + 2 * day);
      const r = service.getPriceKopecks(base, createdAt, now, 1.5);
      expect(r.demandMultiplier).toBe(1.2);
      expect(r.priceKopecks).toBe(Math.round(220_000 * 1 * 1.2));
    });
  });

  describe('strategies', () => {
    it('AUTO + FAST: −15%', () => {
      const createdAt = new Date('2026-08-01T10:00:00Z');
      const now = new Date(createdAt.getTime() + 2 * day);
      const r = service.getPrice({
        basePriceKopecks: base,
        createdAt,
        now,
        mode: PricingMode.AUTO,
        strategy: PricingStrategy.FAST,
      });
      expect(r.strategyMultiplier).toBe(0.85);
      expect(r.priceKopecks).toBe(Math.round(220_000 * 0.85));
    });

    it('AUTO + MAX_PROFIT: +20%', () => {
      const createdAt = new Date('2026-08-01T10:00:00Z');
      const now = new Date(createdAt.getTime() + 2 * day);
      const r = service.getPrice({
        basePriceKopecks: base,
        createdAt,
        now,
        mode: PricingMode.AUTO,
        strategy: PricingStrategy.MAX_PROFIT,
      });
      expect(r.priceKopecks).toBe(Math.round(220_000 * 1.2));
    });
  });

  describe('MANUAL mode', () => {
    it('цена эксперта; рекомендация по алгоритму', () => {
      const createdAt = new Date('2026-08-01T10:00:00Z');
      const now = new Date(createdAt.getTime() + 30 * day);
      const r = service.getPrice({
        basePriceKopecks: base,
        createdAt,
        now,
        mode: PricingMode.MANUAL,
        strategy: PricingStrategy.BALANCE,
        manualPriceKopecks: 200_000,
      });
      expect(r.autoApplied).toBe(false);
      expect(r.priceKopecks).toBe(200_000);
      expect(r.recommendedPriceKopecks).toBe(Math.round(220_000 * 0.7));
    });
  });

  describe('лимит смены режима', () => {
    it('первый раз можно', () => {
      expect(service.canChangePricingMode(null)).toBe(true);
    });

    it('внутри 24ч нельзя', () => {
      const last = new Date('2026-08-01T10:00:00Z');
      const now = new Date(last.getTime() + 12 * 60 * 60 * 1000);
      expect(service.canChangePricingMode(last, now)).toBe(false);
    });

    it('после 24ч можно', () => {
      const last = new Date('2026-08-01T10:00:00Z');
      const now = new Date(last.getTime() + 25 * 60 * 60 * 1000);
      expect(service.canChangePricingMode(last, now)).toBe(true);
    });
  });
});
