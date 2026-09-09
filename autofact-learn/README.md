# autofact-learn — эталон (образец)

Готовая MVP-сборка агента: NestJS API + Prisma + Next.js web.

**Не меняй код здесь ради учёбы.** Смотри и запускай.  
**Учебный код** — только в `../autofact-solo/` по `../discussion/lessons/`.

Карта репо: [`../README.md`](../README.md)

## Что уже есть в эталоне

| Слой | Модули |
|------|--------|
| API | Auth JWT, Users, Pricing, Platform Score, Reports, Purchases, mock payments |
| DB | Prisma schema + seed |
| Web | каталог, отчёт, login/register, кабинет эксперта, mock pay, bottom nav |

## Запуск эталона

```powershell
cd C:\AutoFact\autofact-learn
docker compose up -d
cd apps\api
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
# другой терминал
cd C:\AutoFact\autofact-learn\apps\web
npm install
npm run dev
```

Порты — в `docker-compose.yml` и `.env` (не пересекай с solo).
