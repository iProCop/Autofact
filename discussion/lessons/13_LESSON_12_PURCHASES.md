# Урок 12 — Purchases (mock YooKassa)

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\api`  
**Эталон:** `autofact-learn/apps/api/src/purchases/`, `src/payments/`  
**Статус:** [ ] не начат  

**Предусловие:** Уроки 9–11.

---

## Карта шагов (что / зачем)

| Шаг | Что | Зачем |
|-----|-----|--------|
| **1** | Prisma: Transaction, Purchase (+ enums) | Фиксация оплаты и факта покупки |
| **2** | `MockYooKassaProvider` | Имитация платёжки без реальных денег |
| **3** | `PurchasesService.initiate` | Создать PENDING-платёж + сумму из Pricing |
| **4** | confirm mock | После «оплаты» создать Purchase, открыть полный отчёт |
| **5** | `getOne` + purchased | `locked: false` для купившего клиента |
| **6** | `GET /purchases/mine` | Список покупок клиента |

---

## Куда писать

| Шаг | Файл |
|-----|------|
| 1 | `prisma/schema.prisma` |
| 2 | `src/payments/mock-yookassa.provider.ts`, `payments.module.ts` |
| 3–6 | `src/purchases/*`, дописать `reports.service.ts` getOne |
| 6 | `app.module.ts` |

---

## Зачем

Клиент платит за отчёт → получает полный доступ (VIN, notes, media, defects).  
`@@unique([clientId, reportId])` — нельзя купить дважды.

---

## Шаг 1. Schema (минимум)

Enums: `TransactionType`, `TransactionStatus` (как в эталоне).

Модели `Transaction`, `Purchase` — см. эталон `schema.prisma`.  
Связи: `User.transactions`, `ClientProfile.purchases`, `CarReport.purchases`.

```powershell
npx prisma migrate dev --name purchases
```

---

## Шаг 2. Mock payment

`MockYooKassaProvider`:
- `createPayment({ amountKopecks, description, metadata })` → `{ paymentId, confirmationUrl }`
- `confirmMock(paymentId)` — пометить успешным в памяти/БД

`confirmationUrl` может вести на mock-страницу web (урок 18) или просто строку для Swagger.

---

## Шаг 3. initiate

`POST /purchases/:reportId/initiate` (JWT, CLIENT):

1. Найти ClientProfile  
2. Отчёт PUBLISHED/DISPUTED  
3. Нет существующего Purchase → иначе 409  
4. Цена = `pricing.getPriceKopecks(...)`  
5. Создать Transaction PENDING + вернуть `confirmationUrl`

Комиссия платформы (например 20%) — `platformFeeKopecks` / `expertPayoutKopecks` (эталон `feeSplit`).

---

## Шаг 4. Confirm

`POST /purchases/confirm` (mock): paymentId + reportId →  
Transaction SUCCEEDED + Purchase + `expert.salesCount++` / balance.

Сверяйся с эталоном `purchases.service.ts`.

---

## Шаг 5. Lock в getOne

Если CLIENT и есть Purchase по reportId → `purchased: true`, `locked: false`, полный `inspection`.

---

## Чеклист

- [ ] migrate Purchase/Transaction
- [ ] initiate + confirm в Swagger
- [ ] повторная покупка → 409
- [ ] getOne после покупки открывает полный отчёт

## Как сдаёшь

«Урок 12 готов».

## Дальше

Часть C — Next.js: [`14_LESSON_13_NEXT_SCAFFOLD.md`](./14_LESSON_13_NEXT_SCAFFOLD.md).
