# Урок 6 — Pricing (гибрид: вилка + время)

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\api`  
**Эталон смотреть:** `autofact-learn/apps/api/src/pricing/`  
**Модель (SSOT):** [`../6_PRICING_MODEL.md`](../6_PRICING_MODEL.md)  
**Эталон не трогаем руками** (агент уже подтянул шкалу под модель).  
**Статус:** [x] сдан  
**Делает:** только ты  

**Предусловие:** Урок 5 сдан.

---

## Цель урока

Реализовать **два слоя** гибридной цены (+ заглушку третьего):

1. **Слой 1** — вилка по классу авто (мин / макс / рекомендация)  
2. **Слой 2** — множитель по возрасту отчёта  
3. **Слой 3** — `demandMultiplier` пока всегда **1** (формула готова)  
4. Unit-тесты Jest  
5. `PricingModule` в `AppModule`  

HTTP не нужен. Полный спрос (просмотры, избранное) — позже.

**Формула:**

```
priceKopecks = round(basePriceKopecks × timeMultiplier × demandMultiplier)
```

Деньги — **только копейки** (int).

---

## Теория коротко

| Слой | Кто решает | Зачем |
|------|------------|--------|
| 1. База | Эксперт в вилке платформы | Контроль + защита клиента от космоса |
| 2. Время | Алгоритм всегда | Честная скидка за «черствение» |
| 3. Спрос | Данные (позже) | ±20% к «временной» цене |

Подробности и таблицы — в [`6_PRICING_MODEL.md`](../6_PRICING_MODEL.md).

### Слой 2 (запомнить)

| ageDays | multiplier | Статус |
|---------|------------|--------|
| 0–6 | 1.00 | Полная цена (неделя) |
| 7–20 | 0.85 | Мягкое снижение |
| 21–44 | 0.70 | Выгода |
| 45–89 | 0.50 | Глубокая скидка |
| ≥90 | 0.10 | `archived` + `historical` (справка, не основная выдача) |

---

## Структура

```
src/pricing/
  car-class.ts              ← вилки (слой 1)
  pricing.service.ts
  pricing.service.spec.ts
  pricing.module.ts
```

---

## Шаг 1. Вилки классов — `car-class.ts`

```typescript
/** Классы авто для вилки базовой цены (копейки). */
export enum CarClass {
  ECONOMY = 'ECONOMY',
  MID = 'MID',
  PREMIUM = 'PREMIUM',
  LUXURY = 'LUXURY',
  RARE = 'RARE',
}

export type PriceBand = {
  minKopecks: number;
  maxKopecks: number;
  recommendedKopecks: number;
};

/** 1 ₽ = 100 копеек */
export const CAR_CLASS_BANDS: Record<CarClass, PriceBand> = {
  [CarClass.ECONOMY]: {
    minKopecks: 80_000,   // 800 ₽
    maxKopecks: 200_000,  // 2 000 ₽
    recommendedKopecks: 120_000,
  },
  [CarClass.MID]: {
    minKopecks: 150_000,
    maxKopecks: 350_000,
    recommendedKopecks: 220_000,
  },
  [CarClass.PREMIUM]: {
    minKopecks: 250_000,
    maxKopecks: 600_000,
    recommendedKopecks: 400_000,
  },
  [CarClass.LUXURY]: {
    minKopecks: 500_000,
    maxKopecks: 1_500_000,
    recommendedKopecks: 800_000,
  },
  [CarClass.RARE]: {
    minKopecks: 500_000,
    maxKopecks: 3_000_000,
    recommendedKopecks: 800_000,
  },
};
```

---

## Шаг 2. PricingService

`src/pricing/pricing.service.ts`

```typescript
import { BadRequestException, Injectable } from '@nestjs/common';
import { CarClass, CAR_CLASS_BANDS, PriceBand } from './car-class';

export type PriceResult = {
  priceKopecks: number;
  basePriceKopecks: number;
  timeMultiplier: number;
  demandMultiplier: number;
  ageDays: number;
  archived: boolean;
  historical: boolean;
};

@Injectable()
export class PricingService {
  getBand(carClass: CarClass): PriceBand {
    return CAR_CLASS_BANDS[carClass];
  }

  /** Слой 1: цена эксперта должна попасть в вилку. */
  assertBasePriceInBand(carClass: CarClass, basePriceKopecks: number): void {
    const band = this.getBand(carClass);
    if (
      basePriceKopecks < band.minKopecks ||
      basePriceKopecks > band.maxKopecks
    ) {
      throw new BadRequestException(
        `Цена вне вилки для ${carClass}: ${band.minKopecks}…${band.maxKopecks} коп.`,
      );
    }
  }

  /**
   * Итоговая цена.
   * demandMultiplier по умолчанию 1 (слой 3 ещё без метрик).
   */
  getPriceKopecks(
    basePriceKopecks: number,
    createdAt: Date,
    now = new Date(),
    demandMultiplier = 1,
  ): PriceResult {
    const ageDays = this.ageInDays(createdAt, now);
    const timeMultiplier = this.timeMultiplierForAge(ageDays);
    const archived = ageDays >= 90;
    const historical = archived;

    const demand = this.clampDemand(demandMultiplier);
    const priceKopecks = Math.round(
      basePriceKopecks * timeMultiplier * demand,
    );

    return {
      priceKopecks,
      basePriceKopecks,
      timeMultiplier,
      demandMultiplier: demand,
      ageDays,
      archived,
      historical,
    };
  }

  timeMultiplierForAge(ageDays: number): number {
    if (ageDays <= 6) return 1;
    if (ageDays <= 20) return 0.85;
    if (ageDays <= 44) re9turn 0.7;
    if (ageDays <= 89) return 0.5;
    return 0.1; // historical после 90 дней
  }

  /** Заготовка слоя 3: пока просто режем в [0.8, 1.2]. */
  clampDemand(demandMultiplier: number): number {
    return Math.min(1.2, Math.max(0.8, demandMultiplier));
  }

  ageInDays(createdAt: Date, now = new Date()): number {
    const ms = now.getTime() - createdAt.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }
}
```

### Разбор

| Метод | Слой |
|-------|------|
| `getBand` / `assertBasePriceInBand` | 1 |
| `timeMultiplierForAge` | 2 |
| `clampDemand` | 3 (заготовка) |
| `getPriceKopecks` | сборка формулы |

`archived: true` при ≥90 — каталог потом скроет из основной выдачи; `historical` + цена 10% — «справка» ещё можно купить дешево (продуктово решим в Reports).

---

## Шаг 3. Тесты

`pricing.service.spec.ts`

```typescript
import { BadRequestException } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CarClass } from './car-class';

describe('PricingService', () => {
  const service = new PricingService();
  const day = 24 * 60 * 60 * 1000;
  const base = 220_000; // реком. MID

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
});
```

Запуск:

```powershell
cd C:\AutoFact\autofact-solo\apps\api
npm test -- pricing.service.spec.ts
```

Ожидание: все тесты зелёные (7 штук).

---

## Шаг 4. PricingModule + AppModule

```typescript
// pricing.module.ts
import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';

@Module({
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
```

В `AppModule` → `imports: [ ..., PricingModule ]`.

---

## Чеклист

- [ ] `car-class.ts` с вилками в копейках  
- [ ] `assertBasePriceInBand` + `getPriceKopecks`  
- [ ] Шкала времени 7 / 21 / 45 / 90 (+ historical 10%)  
- [ ] `demandMultiplier` по умолчанию 1, clamp 0.8…1.2  
- [ ] Тесты проходят  
- [ ] `PricingModule` в `AppModule`  
- [ ] Прочитал [`6_PRICING_MODEL.md`](../6_PRICING_MODEL.md)  

---

## Как сдаёшь

1. «Урок 6 готов»  
2. Вывод `npm test -- pricing.service.spec.ts`  

---

## Дальше

**Урок 7 — Pricing: режимы и стратегии** → [`08_LESSON_7_PRICING_MODES.md`](./08_LESSON_7_PRICING_MODES.md)  
SSOT: [`../6_PRICING_MODEL.md`](../6_PRICING_MODEL.md) v3.0 (AUTO/MANUAL, FAST/BALANCE/MAX_PROFIT).

**Урок 8 — Platform Score** → [`09_LESSON_8_PLATFORM_SCORE.md`](./09_LESSON_8_PLATFORM_SCORE.md)
