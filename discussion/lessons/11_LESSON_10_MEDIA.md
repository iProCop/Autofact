# Урок 10 — Медиа (upload + ReportMedia)

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\api`  
**Эталон:** `autofact-learn/apps/api/src/reports/` (upload в controller + `addMedia`)  
**Эталон не трогаем.**  
**Статус:** [ ] не начат  
**Делает:** только ты  

**Предусловие:** Урок 9 сдан (Reports create/publish/list/getOne).

---

## Карта шагов (что / зачем)

| Шаг | Что | Зачем |
|-----|-----|--------|
| **1** | Prisma: `MediaType`, `ReportMedia` | Хранить ссылки на фото отчёта в БД |
| **2** | Папка `uploads/` + static | Файлы лежат на диске, отдаются по URL |
| **3** | `POST /reports/:id/media` | Эксперт загружает фото к своему отчёту |
| **4** | `addMedia` в service | Запись в БД + проверка владельца |
| **5** | cover в `list` / media в `getOne` | Обложка в каталоге, галерея на карточке |

---

## Куда писать

| Шаг | Файл |
|-----|------|
| 1 | `prisma/schema.prisma` |
| 2 | `src/main.ts` (+ папка `uploads` в корне api) |
| 3–4 | `reports.controller.ts`, `reports.service.ts` |
| 5 | дописать `list` / `getOne` в `reports.service.ts` |

---

## Цель

Фото осмотра: upload на диск (mock S3), связь с `CarReport`, первое фото = обложка каталога.

---

## Шаг 1. Schema

```prisma
enum MediaType {
  PHOTO
  VIDEO
  DOC
}

model CarReport {
  // ...
  media ReportMedia[]
}

model ReportMedia {
  id        String    @id @default(cuid())
  reportId  String
  report    CarReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  type      MediaType
  url       String
  sortOrder Int       @default(0)
  createdAt DateTime  @default(now())

  @@index([reportId])
}
```

```powershell
npx prisma migrate dev --name report_media
```

---

## Шаг 2. Static files

В `main.ts` после `NestFactory.create`:

```typescript
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });
```

`.env`: `UPLOAD_DIR=uploads` (по желанию).

---

## Шаг 3–4. Upload endpoint

Сверяйся с эталоном: `reports.controller.ts` → `POST :id/media` + `FileInterceptor` + `diskStorage`.

Service `addMedia(user, reportId, fileName, type)`:
- найти отчёт + expert
- только владелец / ADMIN
- `reportMedia.create({ url: `/uploads/${fileName}`, sortOrder: media.length })`

---

## Шаг 5. Отдача в API

- `list`: `include: { media: { take: 1, orderBy: { sortOrder: 'asc' } } }` → `coverUrl`
- `getOne`: все media; если `locked` — можно отдать только первое (как в эталоне)

---

## Чеклист

- [ ] migrate `ReportMedia`
- [ ] static `/uploads`
- [ ] POST media работает в Swagger
- [ ] coverUrl в каталоге

## Как сдаёшь

«Урок 10 готов» + скрин upload / cover в list.

## Дальше

[`12_LESSON_11_AUCTION_SHEET.md`](./12_LESSON_11_AUCTION_SHEET.md) — дефекты JSON.
