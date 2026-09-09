# Урок 5 — Users / профили

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\api`  
**Эталон смотреть:** `autofact-learn/apps/api/src/users/`  
**Эталон не трогаем.**  
**Статус:** [x] сдан  
**Делает:** только ты  

**Предусловие:** Урок 4 сдан (JWT, `/auth/me`, роли).

---

## Цель урока

1. Модуль **Users** (отдельно от Auth)  
2. `GET /users/me` — полный профиль из БД (User + client/expert)  
3. `GET /users/experts` — публичный список экспертов (с фильтром по региону)  
4. Понять разницу: **Auth** vs **Users**

---

## Зачем отдельный Users (аналогия)

| Отдел | Что делает |
|-------|------------|
| **Auth (ресепшен)** | Пропуска: register, login, JWT, «кто на браслете» |
| **Users (картотека)** | Анкеты из склада: полное дело, список экспертов |

`/auth/me` сейчас отдаёт только то, что **внутри JWT** (`userId`, `email`, `role`).  
`/users/me` ходит в **Postgres** и отдаёт профили: рейтинг эксперта, подписка клиента, bio и т.д.

Браслет говорит «кто ты»; картотека — «что о тебе записано».

---

## Структура файлов

```
src/users/
  users.module.ts
  users.service.ts
  users.controller.ts
```

---

## Шаг 1. UsersService — `src/users/users.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Полное «я» из БД по id из JWT */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        // passwordHash НЕ отдаём!
        expert: true,
        client: true,
      },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  /** Каталог экспертов (для клиента позже на web) */
  async listExperts(region?: string) {
    return this.prisma.expertProfile.findMany({
      where: region
        ? { region: { contains: region, mode: 'insensitive' } }
        : undefined,
      orderBy: { rating: 'desc' },
      take: 50,
      select: {
        id: true,
        fullName: true,
        region: true,
        city: true,
        bio: true,
        rating: true,
        inspectionsCount: true,
        salesCount: true,
        specializations: true,
        avatarUrl: true,
      },
    });
  }
}
```

### Разбор

| Кусок | Зачем |
|-------|--------|
| `select` вместо всего User | Не светить `passwordHash` |
| `expert: true, client: true` | Подтянуть связанные профили |
| `NotFoundException` | Редкий случай: токен валиден, а User удалили |
| `contains` + `mode: 'insensitive'` | Поиск региона без учёта регистра |
| `orderBy: rating desc` | Сначала сильные эксперты |
| `take: 50` | Не выгружать всю таблицу |

---

## Шаг 2. UsersController — `src/users/users.controller.ts`

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    // user.userId — из браслета (JWT), дальше идём в БД
    return this.users.getMe(user.userId);
  }

  /** Публично: каталог можно смотреть без логина */
  @Get('experts')
  experts(@Query('region') region?: string) {
    return this.users.listExperts(region);
  }
}
```

| Эндпоинт | Auth | Аналогия |
|----------|------|----------|
| `GET /api/v1/users/me` | Bearer обязателен | «Дай моё личное дело» |
| `GET /api/v1/users/experts` | нет | «Список мастеров у стойки» |
| `GET /api/v1/users/experts?region=Москва` | нет | Фильтр по городу/региону |

`@Query('region')` — параметр из URL после `?`.

**Порядок путей:** `me` и `experts` — статические сегменты. Если позже добавишь `:id`, ставь его **ниже**, иначе Nest может перепутать.

---

## Шаг 3. UsersModule — `src/users/users.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

`PrismaModule` уже `@Global()` — импортировать снова не нужно.  
`JwtStrategy` уже в `AuthModule` — для `JwtAuthGuard` на `/users/me` этого достаточно, **если** `AuthModule` подключён в `AppModule` (уже есть).

---

## Шаг 4. Подключи в AppModule

```typescript
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
  // ...
})
export class AppModule {}
```

---

## Шаг 5. Проверка

```powershell
cd C:\AutoFact\autofact-solo\apps\api
npm run start:dev
```

### A. Полный профиль

1. Swagger → login/register → Authorize  
2. `GET /api/v1/users/me`  

Ожидание (клиент): есть `client`, `expert: null`, **нет** `passwordHash`.  
Эксперт: есть `expert` с `fullName`, `rating`, …

Сравни с `GET /auth/me` — там только поля из JWT, без профиля из БД.

### B. Список экспертов

```
GET /api/v1/users/experts
GET /api/v1/users/experts?region=Москва
```

Без токена должно работать. Если экспертов регистрировал в уроке 4 — они появятся в списке.

### C. Без токена на `/users/me`

→ **401** (JwtAuthGuard).

---

## Частые ошибки

| Симптом | Причина | Что сделать |
|---------|---------|-------------|
| 401 на `/users/me` | Нет Authorize | Вставь access token |
| `passwordHash` в ответе | Забыл `select`, взял весь User | Используй `select` как в уроке |
| Пустой `experts` | Нет EXPERT в БД | Зарегистрируй эксперта через `/auth/register` |
| Nest не видит роуты | UsersModule не в AppModule | Шаг 4 |
| `Unknown strategy jwt` | AuthModule не загружен | AuthModule должен быть в imports AppModule |

---

## Чеклист

- [ ] `users.service.ts` / `controller` / `module` созданы  
- [ ] `UsersModule` в `AppModule`  
- [ ] `/users/me` с Bearer → профиль из БД без passwordHash  
- [ ] `/users/experts` без токена → массив  
- [ ] `/users/experts?region=...` фильтрует  
- [ ] Понимаю: Auth = пропуска, Users = картотека  

---

## Как сдаёшь

1. «Урок 5 готов»  
2. JSON `/users/me` (можно обрезать длинные поля)  
3. Сколько экспертов вернул `/users/experts`  

---

## Дальше

**Урок 6 — Pricing:** динамическая цена отчёта по возрасту + unit-тесты Jest.
