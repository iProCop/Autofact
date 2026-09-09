# Урок 11 — Аукционный лист (defects)

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\api`  
**Эталон:** `autofact-learn/.../reports/dto/reports.dto.ts` (`DefectDto`), schema `defects Json`  
**Web-эталон (потом):** `apps/web/src/components/auction-sheet.tsx`  
**Статус:** [ ] не начат  

**Предусловие:** Урок 9–10.

---

## Карта шагов (что / зачем)

| Шаг | Что | Зачем |
|-----|-----|--------|
| **1** | Поле `defects Json` в `CarReport` | Хранить точки дефектов на схеме кузова |
| **2** | `DefectDto` + в `CreateReportDto` | Валидировать массив дефектов при создании |
| **3** | Сохранение в `createDraft` | Писать `defects` в БД |
| **4** | Отдача в `getOne` (full) | Владелец/покупатель видит аукционный лист |

---

## Куда писать

| Шаг | Файл |
|-----|------|
| 1 | `prisma/schema.prisma` |
| 2 | `src/reports/reports.dto.ts` |
| 3–4 | `src/reports/reports.service.ts` |

UI схемы кузова — **урок 16** (web). Сейчас только API + данные.

---

## Формат дефекта (элемент массива)

| Поле | Смысл |
|------|--------|
| `id` | строковый id |
| `view` | ракурс: side / top / rear / interior |
| `x`, `y` | координаты 0–1 на схеме |
| `type` | scratch / dent / rust / … |
| `severity` | 1–3 |
| `title`, `note?`, `photoUrl?` | описание |

Шкала оценок кузова/ЛКП уже есть в отчёте (1–10); defects — **точки на схеме**.

---

## Шаг 1. Schema

```prisma
model CarReport {
  // ...
  /// [{id,view,x,y,type,severity,title,note,photoUrl}]
  defects Json @default("[]")
}
```

```powershell
npx prisma migrate dev --name report_defects
```

---

## Шаг 2. DTO

Скопируй `DefectDto` из эталона в `reports.dto.ts`.  
В `CreateReportDto`:

```typescript
@ApiPropertyOptional({ type: [DefectDto] })
@IsOptional()
@IsArray()
@ValidateNested({ each: true })
@Type(() => DefectDto)
defects?: DefectDto[];
```

Пакеты: `class-validator` (`IsArray`, `ValidateNested`), `class-transformer` (`Type`).

---

## Шаг 3–4. Service

В `createDraft`:

```typescript
defects: (dto.defects ?? []) as unknown as Prisma.InputJsonValue,
```

В `getOne` при `canViewFull` отдай `defects` внутри `inspection` (как в эталоне).

---

## Чеклист

- [ ] migrate defects
- [ ] DefectDto + CreateReportDto
- [ ] create с defects в Swagger
- [ ] getOne full отдаёт defects

## Как сдаёшь

«Урок 11 готов».

## Дальше

[`12_LESSON_11_PURCHASES.md`](./12_LESSON_11_PURCHASES.md) — покупка отчёта.
