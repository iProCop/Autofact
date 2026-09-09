# Урок 18 — Покупка в UI

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\web`  
**Эталон:** `app/payments/mock/page.tsx`, `app/purchases/page.tsx`, кнопка на странице отчёта  
**Статус:** [ ] не начат  

**Предусловие:** Урок 12 (Purchases API) + 16 (страница отчёта).

---

## Карта шагов (что / зачем)

| Шаг | Что | Зачем |
|-----|-----|--------|
| **1** | Кнопка «Купить» на отчёте | Старт оплаты для CLIENT |
| **2** | `initiate` → confirmationUrl | Получить mock-ссылку оплаты |
| **3** | Mock pay page | Имитация «оплатил» → confirm |
| **4** | `/purchases` | Список купленных отчётов |
| **5** | После покупки | `locked: false`, полный отчёт |

---

## Куда писать

| Файл | Что |
|------|-----|
| `reports/[id]/page.tsx` | CTA купить |
| `app/payments/mock/page.tsx` | confirm |
| `app/purchases/page.tsx` | mine |

---

## Поток

```
CLIENT на /reports/:id
  → POST /purchases/:id/initiate
  → redirect /payments/mock?paymentId=...&reportId=...
  → кнопка «Оплатить» → POST confirm
  → redirect обратно на отчёт (уже full)
```

Не подключай реальную YooKassa — только mock.

---

## Чеклист

- [ ] Купить отчёт end-to-end
- [ ] Повторная покупка показывает понятную ошибку
- [ ] Список покупок открывается

## Как сдаёшь

«Урок 18 готов».

## Дальше

[`19_LESSON_18_POLISH.md`](./19_LESSON_18_POLISH.md) — демо и полировка.
