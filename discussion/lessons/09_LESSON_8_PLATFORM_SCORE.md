# Урок 8 — Platform Score («мудрость толпы»)

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\api`  
**Эталон смотреть:** `autofact-learn/apps/api/src/platform-score/`  
**Эталон не трогаем.**  
**Статус:** [x] сдан  
**Делает:** только ты  

**Предусловие:** Урок 7 сдан (режимы/стратегии цены).

---

## Цель урока

1. Сервис **PlatformScoreService** — сводная оценка по VIN из нескольких независимых отчётов  
2. Правила: ≥3 экспертов, взвешенное среднее, флаг **disputed**  
3. Unit-тесты Jest  
4. `PlatformScoreModule` в `AppModule`  

HTTP и привязка к Reports — **позже**. Сейчас чистая логика + тесты (как Pricing).

---

## Зачем (из жизни)

Один эксперт осмотрел Camry и поставил **8/10**.  
Другой — ту же машину (тот же VIN) и поставил **7**.  
Третий — **9**.

Платформа может показать клиенту не только «мнение Ивана», а **платформенный балл**:

> «По 3 независимым осмотрам средняя оценка платформы ≈ 8.0»

Это и есть **«мудрость толпы»** (wisdom of the crowd): несколько независимых взглядов надёжнее одного.

| Ситуация | Что делаем |
|----------|------------|
| Меньше 3 разных экспертов | Платформенного балла **нет** (`null`) — рано судить |
| Один эксперт дважды | Считаем **один раз** (уникальность по `expertId`) |
| Эксперт с рейтингом 4.9 vs 3.0 | Голос «сильного» эксперта весит больше |
| Оценки разъехались сильно (разброс > 2.0 на шкале 1–10) | Ставим **`disputed: true`** — «эксперты не согласны», клиенту предупреждение |

Шкала оценок отчёта у нас **1–10** (как в аукционном листе).  
Порог спора: **20% от шкалы** → `max - min > 2.0`.

---

## Аналогия: комиссия оценщиков

- Каждый эксперт — отдельный оценщик с «репутацией» (`expertRating`).  
- Нужно **минимум 3 независимых** мнения.  
- Итог = **среднее с весами** (кого больше уважают — тот тянет сильнее).  
- Если один сказал 3, другой 9 — комиссия в **споре** (`disputed`), даже если среднее посчитано.

---

## Формула (когда экспертов ≥ 3)

Для каждого уникального эксперта вес:

```
w = max(expertRating, 0.1)   // чтобы вес не был 0
```

```
platformScore = round2( Σ(overallScore × w) / Σ(w) )
```

`round2` = округление до 2 знаков: `Math.round(x * 100) / 100`.

`disputed = (max(overall) - min(overall)) > 2.0`

---

## Структура

```
src/platform-score/
  platform-score.service.ts
  platform-score.service.spec.ts
  platform-score.module.ts
```

---

## Шаг 1. PlatformScoreService

`src/platform-score/platform-score.service.ts`

```typescript
import { Injectable } from '@nestjs/common';

export type ExpertScoreInput = {
  expertId: string;
  overallScore: number; // 1–10
  expertRating: number; // рейтинг эксперта (например 4.5)
};

export type PlatformScoreResult = {
  platformScore: number | null;
  disputed: boolean;
  sampleSize: number;
};

@Injectable()
export class PlatformScoreService {
  /**
   * Взвешенное среднее по рейтингу эксперта при ≥ 3 независимых отчётах.
   * Спор, если разброс max-min > 2.0 (20% шкалы 1–10).
   */
  calculate(scores: ExpertScoreInput[]): PlatformScoreResult {
    const unique = this.uniqueByExpert(scores);

    if (unique.length < 3) {
      return {
        platformScore: null,
        disputed: false,
        sampleSize: unique.length,
      };
    }

    const values = unique.map((s) => s.overallScore);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const disputed = max - min > 2.0;

    let weightSum = 0;
    let weighted = 0;
    for (const item of unique) {
      const w = Math.max(Number(item.expertRating), 0.1);
      weighted += item.overallScore * w;
      weightSum += w;
    }

    const platformScore = Math.round((weighted / weightSum) * 100) / 100;

    return {
      platformScore,
      disputed,
      sampleSize: unique.length,
    };
  }

  /** Один эксперт — один голос (берём первое вхождение). */
  private uniqueByExpert(scores: ExpertScoreInput[]): ExpertScoreInput[] {
    const map = new Map<string, ExpertScoreInput>();
    for (const s of scores) {
      if (!map.has(s.expertId)) {
        map.set(s.expertId, s);
      }
    }
    return [...map.values()];
  }
}
```

### Разбор

| Кусок | Зачем |
|-------|--------|
| `uniqueByExpert` | Не накрутить балл одним экспертом с 5 отчётами |
| `length < 3` → `null` | Мало данных — честно говорим «балла пока нет» |
| `max - min > 2` | Сильный разброс → спор |
| `Math.max(rating, 0.1)` | Нулевой рейтинг не обнуляет голос полностью |
| `sampleSize` | Сколько независимых мнений учли (для UI: «на основе 4 осмотров») |

Позже Reports передаст сюда массив оценок по одному VIN; сейчас тестируем массивом вручную.

---

## Шаг 2. Тесты

`platform-score.service.spec.ts`

```typescript
import { PlatformScoreService } from './platform-score.service';

describe('PlatformScoreService', () => {
  const service = new PlatformScoreService();

  it('null, если меньше 3 экспертов', () => {
    const result = service.calculate([
      { expertId: 'a', overallScore: 8, expertRating: 5 },
      { expertId: 'b', overallScore: 8.2, expertRating: 4 },
    ]);
    expect(result.platformScore).toBeNull();
    expect(result.disputed).toBe(false);
    expect(result.sampleSize).toBe(2);
  });

  it('один эксперт дважды не считается за двоих', () => {
    const result = service.calculate([
      { expertId: 'a', overallScore: 8, expertRating: 5 },
      { expertId: 'a', overallScore: 9, expertRating: 5 },
      { expertId: 'b', overallScore: 8, expertRating: 5 },
    ]);
    expect(result.platformScore).toBeNull();
    expect(result.sampleSize).toBe(2);
  });

  it('считает взвешенное среднее для 3+ экспертов', () => {
    const result = service.calculate([
      { expertId: 'a', overallScore: 8, expertRating: 5 },
      { expertId: 'b', overallScore: 8, expertRating: 5 },
      { expertId: 'c', overallScore: 9, expertRating: 5 },
    ]);
    // (8*5 + 8*5 + 9*5) / 15 = 8.333… → 8.33
    expect(result.platformScore).toBeCloseTo(8.33, 1);
    expect(result.disputed).toBe(false);
    expect(result.sampleSize).toBe(3);
  });

  it('disputed, если разброс > 2.0', () => {
    const result = service.calculate([
      { expertId: 'a', overallScore: 5, expertRating: 4 },
      { expertId: 'b', overallScore: 7, expertRating: 4 },
      { expertId: 'c', overallScore: 9, expertRating: 4 },
    ]);
    // max-min = 4 > 2
    expect(result.disputed).toBe(true);
    expect(result.platformScore).not.toBeNull();
  });

  it('больший рейтинг эксперта тянет среднее сильнее', () => {
    const result = service.calculate([
      { expertId: 'star', overallScore: 9, expertRating: 5 },
      { expertId: 'mid1', overallScore: 6, expertRating: 1 },
      { expertId: 'mid2', overallScore: 6, expertRating: 1 },
    ]);
    // (9*5 + 6*1 + 6*1) / 7 ≈ 8.14 — ближе к 9, чем к 6
    expect(result.platformScore!).toBeGreaterThan(7.5);
    expect(result.disputed).toBe(true); // 9-6 = 3 > 2
  });
});
```

Запуск:

```powershell
cd C:\AutoFact\autofact-solo\apps\api
npm test -- platform-score.service.spec.ts
```

Ожидание: все тесты зелёные (5 passed).

`toBeCloseTo(8.33, 1)` — сравнение float с точностью до 1 знака после запятой (не падать из‑за `8.333333`).

---

## Шаг 3. Module + AppModule

`platform-score.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { PlatformScoreService } from './platform-score.service';

@Module({
  providers: [PlatformScoreService],
  exports: [PlatformScoreService],
})
export class PlatformScoreModule {}
```

В `AppModule`:

```typescript
import { PlatformScoreModule } from './platform-score/platform-score.module';

@Module({
  imports: [
    // ...
    PricingModule,
    PlatformScoreModule,
  ],
})
```

---

## Частые ошибки

| Симптом | Причина | Что сделать |
|---------|---------|-------------|
| Балл есть при 2 экспертах | Забыли `unique` / порог 3 | Сверь `unique.length < 3` |
| Один expertId три раза → балл | Нет `uniqueByExpert` | Добавь Map по `expertId` |
| `disputed` всегда false | Порог неверный / шкала 5 | На шкале 1–10 порог **2.0** |
| Float «плавает» в тесте | `toBe(8.33)` строго | Используй `toBeCloseTo` |

---

## Чеклист (MVP урока 8)

- [ ] `PlatformScoreService.calculate` + `uniqueByExpert`  
- [ ] null при `< 3` уникальных экспертов (**не** `> 3`)  
- [ ] disputed при разбросе **> 2.0**  
- [ ] 5 тестов в `platform-score.service.spec.ts` (не `platform-score.spec.ts`)  
- [ ] `PlatformScoreModule` в `AppModule`  
- [ ] Понимаю: зачем веса и зачем спор  

---

## Разобрать позже (не блокер урока 8)

> Полный Q&A и backlog: [`../7_PLATFORM_SCORE.md`](../7_PLATFORM_SCORE.md)  
> Вернёмся на **уроке 9 (Reports)** и после MVP.

| Тема | Сейчас (урок 8) | Потом |
|------|-----------------|-------|
| **Freshness window** (180 дней) | Нет дат в `ExpertScoreInput` | Фильтр по `inspectedAt` перед `calculate()` |
| **Последний vs первый осмотр** | `uniqueByExpert` берёт **первое** вхождение | На Reports — сортировка по `publishedAt`, latest wins |
| **`disputed` → `ReportStatus.DISPUTED`** | Только флаг в результате | `recalculatePlatformScore(vin)` на уроке 9 |
| **UI: null vs disputed** | `sampleSize` в ответе | Копирайт в каталоге / карточке отчёта (уроки 13–15) |
| **Усиление веса топ-экспертов** | Линейный `expertRating` | v2: decay по времени, опционально `w²` |
| **Пустой массив `calculate([])`** | Работает (`null`, `sampleSize: 0`) | Можно добавить отдельный тест |

**Типичные опечатки при сдаче:** `expertRaiting` → `expertRating`, `> 3` → `< 3`, имя файла тестов.

---

## Как сдаёшь

1. «Урок 8 готов»  
2. Вывод `npm test -- platform-score.service.spec.ts`  

---

## Дальше

**Урок 9 — Reports API** → [`10_LESSON_9_REPORTS.md`](./10_LESSON_9_REPORTS.md)
