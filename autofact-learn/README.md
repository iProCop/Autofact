# autofact-learn — эталон (образец)

Готовая сборка агента. Можно запускать и подглядывать.

**Учебный код пиши в** `../autofact-solo/` по файлам в `../discussion/lessons/`.

## Запуск эталона

```powershell
cd C:\AutoFact\autofact-learn
docker compose up -d
cd apps\api
npm run start:dev
# другой терминал
cd C:\AutoFact\autofact-learn\apps\web
npm run dev
```

Подробности портов — в `docker-compose.yml` и `.env` у api/web.
