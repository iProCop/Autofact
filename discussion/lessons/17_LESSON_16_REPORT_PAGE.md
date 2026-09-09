# Урок 16 — Страница отчёта

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\web`  
**Эталон:** `app/reports/[id]/page.tsx`, `media-gallery.tsx`, `score-panel.tsx`, `auction-sheet.tsx`  
**Статус:** [ ] не начат  

**Предусловие:** Уроки 14–15, API getOne.

---

## Карта шагов (что / зачем)

| Шаг | Что | Зачем |
|-----|-----|--------|
| **1** | `/reports/[id]` | Одна карточка осмотра |
| **2** | Preview vs full | Уважать `locked` с API |
| **3** | Галерея / scores | Показать медиа и оценки |
| **4** | Аукционный лист | Отрисовать `defects` (если есть) |
| **5** | CTA «Купить» | Если locked и CLIENT → урок 18 |

---

## Куда писать

| Файл | Что |
|------|-----|
| `src/app/reports/[id]/page.tsx` | `api(/reports/${id})` |
| `src/components/media-gallery.tsx` | слайдер/сетка фото |
| `src/components/score-panel.tsx` | engine/body/… |
| `src/components/auction-sheet.tsx` | точки defects (упрощённо ok) |

---

## Поведение `locked`

| Состояние | UI |
|-----------|-----|
| `locked: true` | обложка, краткие scores, цена, кнопка купить / «войти» |
| `locked: false` | VIN, notes, все media, defects |

Не пытайся «угадать» полный доступ на клиенте — доверяй API.

---

## Чеклист

- [ ] Гость видит preview
- [ ] Владелец-эксперт видит full без покупки
- [ ] Platform score / disputed отображаются, если есть

## Как сдаёшь

«Урок 16 готов».

## Дальше

[`17_LESSON_16_EXPERT_CABINET.md`](./17_LESSON_16_EXPERT_CABINET.md).
