# Урок 14 — Каталог отчётов (mobile-first)

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\web`  
**Эталон:** `apps/web/src/app/reports/page.tsx`, `components/report-card.tsx`  
**Статус:** [ ] не начат  

**Предусловие:** Урок 13.

---

## Карта шагов (что / зачем)

| Шаг | Что | Зачем |
|-----|-----|--------|
| **1** | Страница `/reports` | Лента опубликованных осмотров |
| **2** | `ReportCard` | Карточка: фото, цена, score, город |
| **3** | Фильтры make/region | Query в `GET /reports?...` |
| **4** | Пагинация (простая) | page / limit |
| **5** | Mobile-first вёрстка | Узкий экран — основной |

---

## Куда писать

| Файл | Что |
|------|-----|
| `src/app/reports/page.tsx` | загрузка списка через `api()` |
| `src/components/report-card.tsx` | UI карточки |
| `src/lib/api.ts` | тип `ReportListItem` (если ещё нет) |

---

## Данные с API

`GET /reports` → `{ items, total, page, limit }`.

На карточке показывай:
- `coverUrl` через `fileUrl`
- `title`, make/model/year
- `priceKopecks` (формат: копейки → рубли)
- `expertOverallScore`, `platformScore`
- ссылка на `/reports/[id]`

---

## UX

- Одна колонка на мобиле, gap между карточками  
- Пустой список — понятный текст «Пока нет отчётов»  
- Ошибка API — сообщение, не белый экран  

---

## Чеклист

- [ ] Каталог грузит реальные отчёты с solo API
- [ ] Клик ведёт на страницу отчёта (заглушка ok до урока 16)
- [ ] Выглядит читаемо на ширине ~390px

## Как сдаёшь

«Урок 14 готов».

## Дальше

[`15_LESSON_14_AUTH_UI.md`](./15_LESSON_14_AUTH_UI.md).
