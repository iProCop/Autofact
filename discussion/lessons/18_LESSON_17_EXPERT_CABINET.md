# Урок 17 — Кабинет эксперта

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\web`  
**Эталон:** `app/expert/page.tsx`  
**Статус:** [ ] не начат  

**Предусловие:** Auth UI + Reports API (create, publish, media, mine).

---

## Карта шагов (что / зачем)

| Шаг | Что | Зачем |
|-----|-----|--------|
| **1** | `/expert` только для EXPERT | Кабинет создания осмотров |
| **2** | Список `GET /reports/mine` | Черновики и опубликованные |
| **3** | Форма создания | `POST /reports` (CreateReportDto) |
| **4** | Publish кнопка | `POST /reports/:id/publish` |
| **5** | Upload фото | `POST /reports/:id/media` (FormData) |

---

## Куда писать

| Файл | Что |
|------|-----|
| `src/app/expert/page.tsx` | кабинет |
| опционально `components/report-form.tsx` | форма полей DTO |

---

## Форма (минимум полей)

title, make, model, year, mileage, scores (4–6), basePriceKopecks, region, city, vin?, summary?

После create — показать id и кнопки «Опубликовать» / «Добавить фото».

`api` с `FormData`: не ставь `Content-Type: application/json` вручную (в эталоне api.ts это уже учтено).

---

## Guard на клиенте

Если role !== EXPERT → редирект на login/каталог.

---

## Чеклист

- [ ] Создать черновик из UI
- [ ] Publish → появляется в каталоге
- [ ] Фото видно как cover

## Как сдаёшь

«Урок 17 готов».

## Дальше

[`18_LESSON_17_PURCHASE_UI.md`](./18_LESSON_17_PURCHASE_UI.md).
