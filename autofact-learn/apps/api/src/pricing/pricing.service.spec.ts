import { PricingService } from './pricing.service';

describe('PricingService', () => {
  const service = new PricingService();
  const base = 100_000;
  const day = 24 * 60 * 60 * 1000;

  it('day 1-3 = 100%', () => {
    const createdAt = new Date('2026-07-20T10:00:00Z');
    const now = new Date(createdAt.getTime() + 2 * day);
    expect(service.getPriceKopecks(base, createdAt, now).priceKopecks).toBe(100_000);
  });

  it('day 4-10 = 80%', () => {
    const createdAt = new Date('2026-07-01T10:00:00Z');
    const now = new Date(createdAt.getTime() + 5 * day);
    expect(service.getPriceKopecks(base, createdAt, now).priceKopecks).toBe(80_000);
  });

  it('day 11-30 = 50%', () => {
    const createdAt = new Date('2026-06-01T10:00:00Z');
    const now = new Date(createdAt.getTime() + 15 * day);
    expect(service.getPriceKopecks(base, createdAt, now).priceKopecks).toBe(50_000);
  });

  it('day 31-60 = 20%', () => {
    const createdAt = new Date('2026-05-01T10:00:00Z');
    const now = new Date(createdAt.getTime() + 40 * day);
    expect(service.getPriceKopecks(base, createdAt, now).priceKopecks).toBe(20_000);
  });

  it('>60 days archived', () => {
    const createdAt = new Date('2026-01-01T10:00:00Z');
    const now = new Date(createdAt.getTime() + 70 * day);
    const result = service.getPriceKopecks(base, createdAt, now);
    expect(result.archived).toBe(true);
    expect(result.priceKopecks).toBe(0);
  });
});
