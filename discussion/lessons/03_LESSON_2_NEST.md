# Урок 2 — NestJS каркас

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\api`  
**Эталон смотреть (не копировать целиком):** `autofact-learn/apps/api`  
**Эталон не трогаем.**  
**Статус:** [x] сдан  
**Делает:** только ты  

**Предусловие:** Урок 1 сдан — Postgres/Redis/Adminer в solo работают.

---

## Цель урока

С нуля поднять **NestJS API** в solo:

1. Каркас проекта (`nest new`)  
2. Файл `.env` (порт **не** как у эталона)  
3. Глобальный префикс `/api/v1`  
4. ValidationPipe + ConfigModule  
5. Swagger на `/api/docs`  
6. Простой эндпоинт **health** — проверка, что сервер жив  

Prisma, Auth, отчёты — **не в этом уроке** (уроки 3–4+).

---

## Зачем NestJS (простыми словами)

| Без Nest | С Nest |
|----------|--------|
| Сам раскладываешь роуты, валидацию, модули | Готовая структура: Module → Controller → Service |
| Легко превратить в «кашу» | Удобно расти (Auth, Reports, Purchases) |

**Слова:**

| Слово | Что это |
|-------|---------|
| **Module** | Коробка: «здесь живут связанные куски» |
| **Controller** | Вход: HTTP-запросы (`GET /…`) |
| **Service** | Логика (позже: БД, расчёты) |
| **Pipe** | Обработка входа (валидация body) |
| **Swagger** | Документация API в браузере |

---

## Важно: порты solo ≠ learn

| Что | Эталон (learn) | Твой solo (рекомендация) |
|-----|----------------|--------------------------|
| API | **3010** | **3011** |
| Postgres | 5433 | **5434** (урок 1) |
| CORS / будущий web | 3000 | пока можно `http://localhost:3000` |

В `.env` для solo:

```env
DATABASE_URL="postgresql://autofact:autofact@localhost:5434/autofact_solo?schema=public"
PORT=3011
CORS_ORIGIN="http://localhost:3000"
```

`DATABASE_URL` пока **не используем в коде** — положим заранее, пригодится в уроке 3 (Prisma).

---

## Что сделать по шагам

### Шаг 0. Терминал и папка

Docker Desktop запущен, solo-контейнеры подняты (`docker compose ps` в solo).

```powershell
cd C:\AutoFact\autofact-solo\apps
```

Папка `api` сейчас **пустая** (или почти). Nest CLI сам создаст содержимое **внутрь** `api`.

Если внутри `api` уже есть мусор (старый `node_modules` без исходников) — можно очистить папку `api`, оставив её пустой, **или** создать проект во временной папке и перенести. Проще: пустая `api`.

Проверка:

```powershell
dir api
```

---

### Шаг 1. Создай Nest-проект

Из `C:\AutoFact\autofact-solo\apps`:

```powershell
npx -y @nestjs/cli@11 new api --package-manager npm --skip-git --strict
```

Что означают флаги:

| Флаг | Зачем |
|------|--------|
| `new api` | Имя папки / проекта = `api` |
| `--skip-git` | Не создавать вложенный `.git` (репо уже в `C:\AutoFact`) |
| `--strict` | Строгий TypeScript |
| `--package-manager npm` | npm, не yarn/pnpm |

CLI спросит про пакетный менеджер, если что — выбери **npm**.  
Дождись конца `npm install` (может занять пару минут).

**Ожидаемая структура (упрощённо):**

```
autofact-solo/apps/api/
  src/
    main.ts
    app.module.ts
    app.controller.ts
    app.service.ts
  package.json
  tsconfig.json
  nest-cli.json
  ...
```

---

### Шаг 2. Поставь нужные пакеты для каркаса

```powershell
cd C:\AutoFact\autofact-solo\apps\api

npm install @nestjs/config @nestjs/swagger swagger-ui-express class-validator class-transformer
```

| Пакет | Зачем |
|-------|--------|
| `@nestjs/config` | Читать `.env` |
| `@nestjs/swagger` + `swagger-ui-express` | Документация `/api/docs` |
| `class-validator` + `class-transformer` | Валидация DTO (пригодится с урока 4; Pipe подключим уже сейчас) |

Prisma / JWT / bcrypt — **не ставь сейчас** (уроки 3–4).

---

### Шаг 3. Создай `.env` и `.env.example`

В корне `apps/api` создай файл **`.env`**:

```env
DATABASE_URL="postgresql://autofact:autofact@localhost:5434/autofact_solo?schema=public"
JWT_ACCESS_SECRET="solo-dev-access-change-me"
JWT_REFRESH_SECRET="solo-dev-refresh-change-me"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"
PORT=3011
UPLOAD_DIR="uploads"
PLATFORM_FEE_REPORT_PERCENT=20
CORS_ORIGIN="http://localhost:3000"
```

Создай рядом **`.env.example`** — то же самое, но без секретных «боевых» значений (можно те же для учёбы).  
`.env` в git не коммить (уже в корневом `.gitignore`).

Проверь пароль Postgres: в уроке 1 у тебя в compose был `POSTGRES_PASSWORD: autofact`. Если ставил другой — подставь свой в `DATABASE_URL`.

---

### Шаг 4. Подключи ConfigModule в `app.module.ts`

Открой `src/app.module.ts`.

Сейчас там что-то вроде `AppController` / `AppService`. Оставь их (health сделаем через них) и добавь Config:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

`isGlobal: true` — ConfigService доступен везде без повторного импорта.

---

### Шаг 5. Health в сервисе и контроллере

**`src/app.service.ts`** — логика ответа:

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      ok: true,
      service: 'autofact-solo-api',
      timestamp: new Date().toISOString(),
    };
  }
}
```

**`src/app.controller.ts`** — маршрут:

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
```

Итоговый URL будет:  
`GET http://localhost:3011/api/v1/health`  
(префикс добавим в `main.ts`).

Если CLI оставил `GET /` на `getHello` — **замени** на health как выше (или оставь оба, но для сдачи нужен именно `/health`).

---

### Шаг 6. Настрой `main.ts` (самое важное)

Открой `src/main.ts` и **замени** содержимое на понятную версию:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Все роуты: /api/v1/...
  app.setGlobalPrefix('api/v1');

  // Валидация body в будущих DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // выкинуть поля, которых нет в DTO
      forbidNonWhitelisted: true,   // иначе — ошибка 400
      transform: true,              // строки → числа и т.п. где нужно
    }),
  );

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000',
    credentials: true,
  });

  const swagger = new DocumentBuilder()
    .setTitle('AutoInspect API (solo)')
    .setDescription('Учебный API — сборка с нуля')
    .setVersion('0.1')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swagger),
  );

  const port = config.get<number>('PORT') ?? 3011;
  await app.listen(port);

  console.log(`API     http://localhost:${port}/api/v1`);
  console.log(`Health  http://localhost:${port}/api/v1/health`);
  console.log(`Swagger http://localhost:${port}/api/docs`);
}
bootstrap();
```

**Разбор:**

| Строка | Зачем |
|--------|--------|
| `setGlobalPrefix('api/v1')` | Версионирование API |
| `ValidationPipe` | Единые правила валидации |
| `enableCors` | Браузер (Next) сможет ходить на API |
| `SwaggerModule.setup('api/docs', …)` | UI документации (**без** префикса `api/v1` — путь отдельный) |
| `PORT` из `.env` | Solo на **3011** |

Сверься с эталоном `autofact-learn/apps/api/src/main.ts` — идея та же; у них ещё uploads/static — это урок про медиа, не сейчас.

---

### Шаг 7. Запуск

```powershell
cd C:\AutoFact\autofact-solo\apps\api
npm run start:dev
```

В консоли должны появиться строки с API / Health / Swagger.

Проверки в браузере или PowerShell:

```powershell
Invoke-WebRequest -Uri "http://localhost:3011/api/v1/health" -UseBasicParsing
```

Ожидание: JSON вроде `{"ok":true,"service":"autofact-solo-api",...}`

Swagger: http://localhost:3011/api/docs  

Там должен быть тег **health** и метод `GET /api/v1/health`.

Остановка: `Ctrl+C` в терминале, где крутится `start:dev`.

---

## Частые ошибки

| Симптом | Причина | Что сделать |
|---------|---------|-------------|
| `nest: command not found` после CLI | Вызываешь глобальный nest | Используй `npx @nestjs/cli …` или скрипты из `package.json` |
| Порт занят | Learn на 3010 или старый процесс | В `.env` поставь **3011**, убей лишний `node` |
| `Cannot find module '@nestjs/config'` | Не сделал `npm install` пакетов | Шаг 2 |
| Health 404 | Забыл префикс или путь | URL = `/api/v1/health`, не `/health` |
| Swagger пустой / 404 | Неверный path в `setup` | Должно быть `'api/docs'` |
| Папка `api` не пустая, CLI ругается | Конфликт файлов | Очисти `apps/api` (кроме того, что сам хочешь сохранить) и повтори `nest new` |
| `.env` не читается | Файл не в корне `apps/api` | Рядом с `package.json` |

---

## Чеклист

- [ ] `nest new` создал проект в `autofact-solo/apps/api`  
- [ ] Установлены config, swagger, class-validator, class-transformer  
- [ ] Есть `.env` с `PORT=3011` и `DATABASE_URL` на порт **5434**  
- [ ] `ConfigModule.forRoot({ isGlobal: true })` в `AppModule`  
- [ ] `main.ts`: prefix `api/v1`, ValidationPipe, CORS, Swagger  
- [ ] `GET /api/v1/health` отвечает JSON  
- [ ] Swagger открывается на `/api/docs`  
- [ ] Понимаю: Module / Controller / Service / зачем prefix  

---

## Как сдаёшь урок

В чат:

1. «Урок 2 готов»  
2. Порт API  
3. Ответ `GET /api/v1/health` (скопируй JSON)  
4. Открывается ли Swagger  

Я проверю файлы в `autofact-solo/apps/api` (не трогая learn) и скажу, что поправить словами.

---

## Дальше

После сдачи → полный [`04_LESSON_3_PRISMA.md`](./04_LESSON_3_PRISMA.md) (Prisma: schema, migrate, PrismaService).
