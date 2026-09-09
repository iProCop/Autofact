# Урок 7 — Pricing: режимы AUTO/MANUAL + стратегии

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\api\src\pricing`  
**Эталон смотреть:** `autofact-learn/apps/api/src/pricing/`  
**SSOT:** [`../6_PRICING_MODEL.md`](../6_PRICING_MODEL.md) (v3)  
**Эталон не трогаем.**  
**Статус:** [ ] не начат  
**Делает:** только ты  

**Предусловие:** Урок 6 сдан (вилка + time decay + `getPriceKopecks`).

---

## Цель урока

Расширить уже существующий Pricing:

1. Файл **`pricing-policy.ts`** — режимы и стратегии  
2. Метод **`getPrice(...)`** — полный расчёт с mode/strategy  
3. **`canChangePricingMode`** — не чаще 1 раза в сутки  
4. Дописать тесты  
5. Старый `getPriceKopecks(...)` оставить как обёртку (AUTO + BALANCE)

HTTP и поля на отчёте — на уроке Reports. Сейчас снова **чистая логика + Jest**.

---

## Зачем (из жизни)

Урок 6: «цена сама падает со временем».  
Реальность: не всем экспертам это нравится.

| Режим | Аналогия |
|-------|----------|
| **AUTO** | Автопилот: платформа крутит цену по правилам |
| **MANUAL** | Руль у эксперта: он ставит цену сам, автопилот только **подсказывает** |

| Стратегия | Аналогия |
|-----------|----------|
| **FAST** | «Продать быстрее» → ценник −15% от оптимума |
| **BALANCE** | Золотая середина |
| **MAX_PROFIT** | «Поторговаться» → ценник +20%, дольше ждать |

---

## Правила (кратко)

### Режим

- Дефолт: **AUTO**  
- Смена режима ≤ **1 раз в 24 часа**  
- При смене цена продажи **не сбрасывается**  
- В MANUAL алгоритм **не меняет** `priceKopecks`, считает `recommendedPriceKopecks`

### Стратегия

- Дефолт: **BALANCE**  
- Менять можно когда угодно  
- Множители: FAST **0.85**, BALANCE **1**, MAX_PROFIT **1.2**  
- В AUTO входит в цену продажи; в MANUAL — только в рекомендацию

### Формулы

```
recommended = round(base × time × demand × strategy)

AUTO:   price = recommended
MANUAL: price = manualPrice (или base, если не передали)
```

Time decay — **тот же**, что в уроке 6.

---

## Структура (добавляешь / меняешь)

```
src/pricing/
  car-class.ts              ← уже есть (урок 6)
  pricing-policy.ts         ← НОВЫЙ
  pricing.service.ts        ← расширяешь
  pricing.service.spec.ts   ← дописываешь тесты
  pricing.module.ts         ← без изменений
```

---

## Шаг 1. `pricing-policy.ts`

```typescript
/** Кто управляет ценой продажи. */
export enum PricingMode {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}

/** Агрессивность алгоритма / рекомендации. */
export enum PricingStrategy {
  FAST = 'FAST',
  BALANCE = 'BALANCE',
  MAX_PROFIT = 'MAX_PROFIT',
}

export const STRATEGY_MULTIPLIER: Record<PricingStrategy, number> = {
  [PricingStrategy.FAST]: 0.85,
  [PricingStrategy.BALANCE]: 1,
  [PricingStrategy.MAX_PROFIT]: 1.2,
};
```

---

## Шаг 2. Расширь типы и сервис

В `pricing.service.ts` добавь импорты:

```typescript
import {
  PricingMode,
  PricingStrategy,
  STRATEGY_MULTIPLIER,
} from './pricing-policy';
```

### Обнови `PriceResult`

```typescript
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
  /** false в MANUAL — время/спрос/стратегия не жмут цену продажи */
  autoApplied: boolean;
};
```

### Вход для полного расчёта

```typescript
export type GetPriceInput = {
  basePriceKopecks: number;
  createdAt: Date;
  now?: Date;
  demandMultiplier?: number;
  mode?: PricingMode;
  strategy?: PricingStrategy;
  /** Цена продажи в MANUAL (по умолчанию = base) */
  manualPriceKopecks?: number;
};
```

### Методы

```typescript
strategyMultiplier(strategy: PricingStrategy): number {
  return STRATEGY_MULTIPLIER[strategy];
}

/** Смена режима не чаще раза в сутки. */
canChangePricingMode(
  lastModeChangeAt: Date | null | undefined,
  now = new Date(),
): boolean {
  if (!lastModeChangeAt) return true;
  const dayMs = 24 * 60 * 60 * 1000;
  return now.getTime() - lastModeChangeAt.getTime() >= dayMs;
}

/** Старый вход (урок 6) → AUTO + BALANCE */
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
```

Методы `timeMultiplierForAge`, `clampDemand`, `ageInDays`, вилка — **не ломай**, они уже из урока 6.

### Разбор

| Поле / метод | Смысл |
|--------------|--------|
| `recommendedPriceKopecks` | Что алгоритм считает «правильным» сейчас |
| `priceKopecks` | Что реально продаём |
| `autoApplied` | true = автопилот реально применил формулу к цене |
| `canChangePricingMode` | Защита от дёрганья AUTO↔MANUAL каждый час |

Сверься с эталоном: `autofact-learn/.../pricing.service.ts`.

---

## Шаг 3. Допиши тесты в `pricing.service.spec.ts`

Старые тесты урока 6 оставь (они зовут `getPriceKopecks` → AUTO+BALANCE).  
Добавь блок:

```typescript
import { PricingMode, PricingStrategy } from './pricing-policy';

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
    const now = new Date(createdAt.getTime() + 30 * day); // time 0.7
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
```

Запуск:

```powershell
cd C:\AutoFact\autofact-solo\apps\api
npm test -- pricing.service.spec.ts
```

Ожидание: старые + новые тесты зелёные (ориентир **~14** passed, как в эталоне).

---

## Частые ошибки

| Симптом | Причина | Что сделать |
|---------|---------|-------------|
| Старые тесты падают: нет `recommendedPriceKopecks` | Не обновил `PriceResult` / return | Всегда заполняй оба поля цены |
| MANUAL цена = recommended | Забыл ветку `if (MANUAL)` | В MANUAL `price = manualPrice` |
| FAST не влияет | Зовешь только `getPriceKopecks` | Для стратегий нужен `getPrice({ strategy })` |
| TS не видит enum | Нет файла / импорта | `pricing-policy.ts` |

---

## Чеклист

- [ ] Есть `pricing-policy.ts`  
- [ ] `getPrice` + `canChangePricingMode` + `strategyMultiplier`  
- [ ] `getPriceKopecks` остался и работает (AUTO+BALANCE)  
- [ ] Тесты: FAST, MAX_PROFIT, MANUAL, лимит 24ч  
- [ ] `npm test -- pricing.service.spec.ts` зелёный  
- [ ] Понимаю: AUTO меняет цену, MANUAL только рекомендует  

---

## Как сдаёшь

1. «Урок 7 готов»  
2. Вывод тестов pricing  

---

## Дальше

**Урок 8 — Platform Score** → [`09_LESSON_8_PLATFORM_SCORE.md`](./09_LESSON_8_PLATFORM_SCORE.md)  
Потом Reports: поля `pricingMode` / `pricingStrategy` / `currentPriceKopecks` на отчёте.
