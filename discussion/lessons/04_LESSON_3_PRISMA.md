# Урок 3 — Prisma (схема + Nest)

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\api`  
**Эталон смотреть:** `autofact-learn/apps/api/prisma/schema.prisma`  
**Эталон не трогаем.**  
**Статус:** [x] сдан  
**Делает:** только ты  

**Предусловие:** Урок 1 (Postgres на **5434**) и Урок 2 (Nest на **3011**) сданы.

---

## Цель урока

1. Подключить **Prisma 6** к Nest  
2. Описать в `schema.prisma` модели: **User**, **ExpertProfile**, **ClientProfile** + роли  
3. Сделать **миграцию** → таблицы появятся в Postgres  
4. Создать **PrismaModule / PrismaService** и подключить в `AppModule`  
5. Проверить в Adminer, что таблицы есть  

Отчёты (`CarReport`), покупки, медиа — **позже** (уроки 8–11). Сейчас фундамент: пользователи и профили.

---

## Зачем Prisma (простыми словами)

| Без ORM | С Prisma |
|---------|----------|
| Пишешь SQL руками | Описываешь модели в `schema.prisma` |
| Легко ошибиться в типах | TypeScript знает поля (`user.email`) |
| Миграции «как получится» | `prisma migrate` создаёт SQL и историю |

**Слова:**

| Слово | Что это |
|-------|---------|
| **schema.prisma** | Чертёж БД: модели, связи, enums |
| **миграция** | SQL-скрипт «как привести БД к чертежу» |
| **Prisma Client** | Сгенерированный код: `prisma.user.findMany()` |
| **PrismaService** | Обёртка клиента для Nest (один на всё приложение) |
| **relation** | Связь таблиц (User ↔ ExpertProfile) |

---

## Важно: Prisma **6**, не 7

Эталон на Prisma **6.x**. Prisma 7 иначе настраивается и с Nest пока неудобнее.

Ставь явно:

```powershell
npm install @prisma/client@6.19.2
npm install -D prisma@6.19.2
```

Если CLI создаст `prisma.config.ts` (признак v7) — удали его и перепроверь версии в `package.json` (`"prisma": "6.…"`).

---

## Проверь `.env` перед стартом

В `apps/api/.env` должно быть (порт **5434**, БД **autofact_solo**):

```env
DATABASE_URL="postgresql://autofact:autofact@localhost:5434/autofact_solo?schema=public"
```

Пароль = тот, что в `docker-compose` (`POSTGRES_PASSWORD`).  
Контейнер Postgres должен быть **healthy**:

```powershell
cd C:\AutoFact\autofact-solo
docker compose ps
```

---

## Что сделать по шагам

### Шаг 1. Установи Prisma 6

```powershell
cd C:\AutoFact\autofact-solo\apps\api

npm install @prisma/client@6.19.2
npm install -D prisma@6.19.2
```

---

### Шаг 2. Инициализация

```powershell
npx prisma init
```

Появится папка `prisma/` и файл `prisma/schema.prisma`.  
Prisma может дописать что-то в `.env` — **проверь**, что `DATABASE_URL` всё ещё на `localhost:5434` и `autofact_solo`.

Открой `prisma/schema.prisma`. Заготовка будет примерно:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Это оставляем. Ниже допишешь модели.

---

### Шаг 3. Напиши схему (User + профили)

Замени содержимое `prisma/schema.prisma` на следующее (перепиши / набери сам, сверяясь с экраном):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ----- Перечисления (ограниченный набор значений) -----

enum Role {
  CLIENT
  EXPERT
  ADMIN
}

enum SubscriptionLevel {
  NONE
  BASIC
  PRO
  ENTERPRISE
}

// ----- Пользователь (логин) -----

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         Role
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Связи 1:0..1 — у юзера может быть один экспертный и/или клиентский профиль
  expert ExpertProfile?
  client ClientProfile?
}

// ----- Профиль эксперта -----

model ExpertProfile {
  id               String   @id @default(cuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName         String
  region           String
  city             String
  bio              String   @default("")
  avatarUrl        String?
  specializations  String[]
  rating           Decimal  @default(4.5) @db.Decimal(3, 2)
  inspectionsCount Int      @default(0)
  salesCount       Int      @default(0)
  payoutDetails    String?
  balanceKopecks   Int      @default(0)

  @@index([region])
  @@index([rating])
}

// ----- Профиль клиента -----

model ClientProfile {
  id                 String            @id @default(cuid())
  userId             String            @unique
  user               User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscriptionLevel  SubscriptionLevel @default(NONE)
  subscriptionEndsAt DateTime?
}
```

#### Разбор ключевых мест

| Кусок | Зачем |
|-------|--------|
| `enum Role` | Клиент / эксперт / админ — не свободная строка |
| `@id @default(cuid())` | Уникальный id (не автоинкремент числа) |
| `email @unique` | Один email = один аккаунт |
| `passwordHash` | Хэш пароля (не сам пароль; хешировать будем в уроке Auth) |
| `ExpertProfile?` | Опциональная связь: не у каждого User есть эксперт-профиль |
| `userId @unique` + `User @relation` | Один профиль на одного User |
| `onDelete: Cascade` | Удалили User → профиль тоже удалится |
| `String[]` | Массив строк в Postgres (специализации) |
| `Decimal @db.Decimal(3, 2)` | Рейтинг вроде `4.50` |
| `balanceKopecks` | Деньги в **копейках** (целые числа, без float) |
| `@@index([region])` | Быстрее фильтр по региону |

Сверься с эталоном `autofact-learn/.../schema.prisma` — там ещё много моделей. **Сейчас копировать всё не нужно.** Добавим по урокам.

---

### Шаг 4. Миграция (создать таблицы в БД)

```powershell
cd C:\AutoFact\autofact-solo\apps\api

npx prisma migrate dev --name init_users
```

Что произойдёт:

1. Prisma сравнит schema с БД  
2. Создаст папку `prisma/migrations/…_init_users/` с SQL  
3. Применит SQL к Postgres  
4. Сгенерирует **Prisma Client** (`node_modules/@prisma/client`)

Если спросит про shadow DB / reset — для пустой учебной БД можно соглашаться.  
Если ошибка соединения — проверь Docker и `DATABASE_URL`.

Полезные команды:

```powershell
npx prisma migrate status
npx prisma studio
```

`studio` — GUI в браузере (таблицы и строки). Можно вместо Adminer.

---

### Шаг 5. PrismaService

Создай папку и файлы:

`src/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**Зачем:** при старте Nest открываем соединение с БД, при остановке — закрываем.  
`extends PrismaClient` — у сервиса сразу есть `this.user`, `this.expertProfile` и т.д.

---

### Шаг 6. PrismaModule (глобальный)

`src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

`@Global()` — любой модуль сможет сделать `constructor(private prisma: PrismaService)` **без** повторного импорта PrismaModule в каждом модуле.  
Импортировать PrismaModule нужно **один раз** — в `AppModule`.

---

### Шаг 7. Подключи в `AppModule`

`src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

### Шаг 8. (Рекомендуется) Health проверяет БД

Чтобы убедиться, что Nest реально достучался до Postgres, расширь сервис.

**`app.service.ts`:**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    const users = await this.prisma.user.count();
    return {
      ok: true,
      service: 'autofact-solo-api',
      database: 'up',
      usersCount: users,
      timestamp: new Date().toISOString(),
    };
  }
}
```

**`app.controller.ts`** — метод должен быть `async` (или оставь `return this.appService.getHealth()` — Nest сам дождётся Promise):

```typescript
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
```

Перезапуск:

```powershell
npm run start:dev
```

`GET http://localhost:3011/api/v1/health` → что-то вроде:

```json
{
  "ok": true,
  "service": "autofact-solo-api",
  "database": "up",
  "usersCount": 0,
  "timestamp": "..."
}
```

`usersCount: 0` — нормально, пользователей ещё нет (урок Auth).

---

### Шаг 9. Глазами в Adminer

1. http://localhost:8081  
2. Система: PostgreSQL  
3. Сервер: `postgres`  
4. User / Password: как в compose  
5. БД: `autofact_solo`  

Должны появиться таблицы вроде:

- `User`
- `ExpertProfile`
- `ClientProfile`
- `_prisma_migrations`

(имена могут быть в том же регистре, как в schema.)

---

## Частые ошибки

| Симптом | Причина | Что сделать |
|---------|---------|-------------|
| `Can't reach database` | Docker down / неверный порт | `docker compose ps`, URL с **5434** |
| `Authentication failed` | Пароль ≠ compose | Сверь `POSTGRES_PASSWORD` и `DATABASE_URL` |
| `Prisma 7` / `prisma.config.ts` | Поставилась v7 | Откати на 6.19.2, удали config v7 |
| `Unknown model user` в Nest | Не сделал migrate / generate | `npx prisma migrate dev` или `npx prisma generate` |
| Health падает на `count` | PrismaModule не в AppModule | Шаг 7 |
| Таблиц нет в Adminer | Миграция не прошла / другая БД | Проверь имя БД `autofact_solo` |

---

## Чеклист

- [ ] Prisma **6.x** в `package.json`  
- [ ] `schema.prisma`: Role, SubscriptionLevel, User, ExpertProfile, ClientProfile  
- [ ] `npx prisma migrate dev --name init_users` прошёл  
- [ ] Есть `src/prisma/prisma.service.ts` и `prisma.module.ts`  
- [ ] `PrismaModule` в `AppModule`  
- [ ] Health отдаёт `database: "up"` и `usersCount`  
- [ ] В Adminer / Studio видны таблицы  

---

## Как сдаёшь урок

В чат:

1. «Урок 3 готов»  
2. JSON с `/api/v1/health` (с `database` / `usersCount`)  
3. Список таблиц, которые видишь в Adminer (или скрин текстом)  

Я проверю `schema.prisma`, prisma-модуль и миграции в **solo**.

---

## Дальше

**Урок 4 — Auth JWT:** register/login, хеш пароля, access/refresh, RolesGuard.  
Полный текст: [`05_LESSON_4_AUTH.md`](./05_LESSON_4_AUTH.md).  
Там уже появится создание `User` + профиля в БД.
