# Урок 4 — Auth JWT (register / login / refresh / роли)

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\api`  
**Эталон смотреть:** `autofact-learn/apps/api/src/auth/` и `src/common/`  
**Эталон не трогаем.**  
**Статус:** [x] сдан  
**Делает:** только ты  

**Предусловие:** Урок 3 сдан (User + профили в БД, PrismaService работает).

---

## Цель урока

1. Регистрация и вход (`POST /auth/register`, `/auth/login`)  
2. Пароль хранится как **bcrypt-хеш**, не открытым текстом  
3. Выдача **access** + **refresh** JWT  
4. Обновление токена (`POST /auth/refresh`)  
5. Защита маршрута через **JwtAuthGuard**  
6. Заготовка **RolesGuard** + декоратор `@Roles(...)`  
7. Эндпоинт `GET /auth/me` — «кто я» по Bearer-токену  

**Как читать этот урок:** сначала блок «Клуб и пропуска» (понимание), потом код **по шагам 1→9**, не всё сразу. После каждого смыслового куска — проверка в Swagger (см. «Учись блоками»).

---

## Клуб и пропуска — главная аналогия

Представь **закрытый клуб AutoInspect**.

| В жизни (клуб) | В коде |
|----------------|--------|
| Анкета на ресепшене | `POST /auth/register` + `RegisterDto` |
| Сейф с отпечатками пальцев, не листочками с паролями | `passwordHash` + `bcrypt` |
| «Назовите email и пароль» у входа | `POST /auth/login` |
| Временный **браслет** на 15 минут | `accessToken` (JWT) |
| Пластиковая **карточка** на 7 дней | `refreshToken` (JWT) |
| Показать браслет охраннику у двери | заголовок `Authorization: Bearer …` |
| Инструкция охраннику: как читать браслет | `JwtStrategy` |
| Охранник у двери («есть браслет?») | `JwtAuthGuard` → иначе **401** |
| Табличка на двери: «только сотрудники» | `@Roles(EXPERT)` + `RolesGuard` → иначе **403** |
| Сотрудник ресепшена (логика) | `AuthService` |
| Окошко ресепшена (куда подходят люди) | `AuthController` |
| Печать клуба (секретный штамп) | `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` в `.env` |

### Один день посетителя (сценарий)

1. **Регистрация** — заполнил анкету → в базе появился человек + профиль → сразу выдали браслет + карточку.  
2. **`GET /auth/me`** — подошёл к двери с браслетом → охранник прочитал → «ты client@…, роль CLIENT».  
3. **Браслет протух** (через 15 мин) — `/me` даёт **401**. Идёшь на ресепшен с **карточкой** (`/auth/refresh`) → новый браслет.  
4. **Клиент лезет в `expert-only`** — браслет настоящий, но роль не та → **403** (узнали кто ты, но сюда нельзя).  
5. **Поддельный браслет** — штамп не совпал с секретом клуба → **401**.

Пароль после входа в обычных запросах **больше не нужен** — только браслет.

### Зачем два пропуска (access + refresh)

| | Access (браслет) | Refresh (карточка) |
|--|------------------|---------------------|
| Как часто светится | Почти в каждом запросе | Редко — только «обновить» |
| Срок | Короткий (`15m`) | Длинный (`7d`) |
| Если украли | Через 15 мин бесполезен | Опаснее → хранят осторожнее, другой секрет |
| Аналогия | Бейдж на шее на вечеринке | Ключ от камеры хранения бейджей |

Разные секреты в `.env` = **две разные печати**. Подделали одну — вторая ещё своя.

### 401 vs 403 (путают все)

| Код | Смысл по-человечески | Пример |
|-----|----------------------|--------|
| **401** Unauthorized | «Кто ты? Не представился / браслет фейк / протух» | Нет Header, битый JWT |
| **403** Forbidden | «Знаем кто ты, но **сюда** нельзя» | CLIENT на `expert-only` |

Запомнить: **401 = нет/плохой пропуск**, **403 = пропуск ок, роль не та**.

### Почему при login «Неверный email или пароль», а не «пользователя нет»

Если честно писать «такого email нет» / «пароль неверный», злоумышленник узнаёт, какие email уже в клубе.  
Одинаковая фраза в обоих случаях — **не светим** наличие аккаунта. Внутри кода мы знаем причину; наружу — одна маска.

### Кто за что отвечает (кто на ресепшене)

```
Клиент (браузер / Swagger)
        │  HTTP
        ▼
AuthController     ← окошко: принять body, отдать JSON
        │
        ▼
AuthService        ← мозг: БД, bcrypt, выдача JWT
        │
        ├── PrismaService  ← склад анкет (Postgres)
        ├── JwtService     ← печать браслетов
        └── ConfigService  ← секреты из .env

Защищённый запрос (/auth/me):
  JwtAuthGuard → JwtStrategy читает Bearer → request.user
  RolesGuard (если есть @Roles) → проверка роли
  @CurrentUser() → достать user из request в параметр метода
```

### Поток одной картинкой

```
register / login
    → bcrypt.hash  /  bcrypt.compare
    → buildAuthResponse → access + refresh
    → клиент сохраняет токены (пока в Swagger / потом в web)

запрос к защищённому API
    → Header: Authorization: Bearer <access>
    → JwtStrategy: подпись + срок (ACCESS_SECRET)
    → request.user = { userId, email, role }
    → RolesGuard (если @Roles) проверяет роль
    → контроллер отвечает
```

### Секреты в `.env` (уже с урока 2)

- `JWT_ACCESS_SECRET` — печать для браслета  
- `JWT_REFRESH_SECRET` — печать для карточки  
- `JWT_ACCESS_EXPIRES` — обычно `15m`  
- `JWT_REFRESH_EXPIRES` — обычно `7d`  

Без секретов браслеты нельзя ни выдать, ни проверить.

### Учись блоками (не глотай урок целиком)

| Блок | Сделай в коде | Понял, если… |
|------|---------------|--------------|
| A | Пакеты + DTO + `register` | В Adminer User с `$2b$…`, есть профиль |
| B | `login` + `buildAuthResponse` | Те же токены без новой строки User |
| C | Strategy + Guard + `/auth/me` | Authorize в Swagger → 200; без токена → 401 |
| D | `@Roles` + `expert-only` | EXPERT → 200, CLIENT → 403 |
| E | `refresh` | Новая пара токенов по карточке |

Между блоками **остановись** и проверь в Swagger / Adminer.

---

## Структура файлов, которые создашь

```
src/
  auth/
    auth.module.ts
    auth.service.ts
    auth.controller.ts
    jwt.strategy.ts
    dto/
      auth.dto.ts
  common/
    decorators/
      current-user.decorator.ts
      roles.decorator.ts
    guards/
      jwt-auth.guard.ts
      roles.guard.ts
```

---

## Шаг 1. Пакеты

```powershell
cd C:\AutoFact\autofact-solo\apps\api

npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/bcrypt @types/passport-jwt
```

| Пакет | Зачем |
|-------|--------|
| `@nestjs/jwt` | Подпись и проверка JWT |
| `passport` + `@nestjs/passport` + `passport-jwt` | Стандартный способ «достать Bearer и проверить» |
| `bcrypt` | Хеш пароля |

---

## Шаг 2. DTO — `src/auth/dto/auth.dto.ts`

**Аналогия:** бланк анкеты — какие поля заполнять и какие правила (email настоящий, пароль не короче 6).  
DTO = форма; ValidationPipe (урок 2) = вахтёр, который проверяет бланк и режет лишние поля (`whitelist` / `forbidNonWhitelisted`).

DTO = форма входящих данных + правила валидации (ValidationPipe из урока 2 их применит).

```typescript
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ enum: Role, example: 'CLIENT' })
  @IsEnum(Role)
  role!: Role;

  // Для EXPERT — удобно сразу заполнить профиль
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}
```

---

## Шаг 3. AuthService — `src/auth/auth.service.ts`

**Аналогия:** сотрудник ресепшена. Сюда не «приходят HTTP-запросы напрямую» — их принимает окошко (Controller), а ресепшен делает работу: проверить анкету, положить в сейф, выдать браслет.

Здесь вся логика. Набери внимательно.  
Файл должен лежать в `src/auth/auth.service.ts` (**не** внутри `dto/`).

```typescript
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Админов через публичную регистрацию не создаём
    if (dto.role === Role.ADMIN) {
      throw new BadRequestException('Регистрация ADMIN запрещена');
    }

    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email уже занят');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: dto.role,
        ...(dto.role === Role.EXPERT
          ? {
              expert: {
                create: {
                  fullName: dto.fullName ?? 'Эксперт',
                  region: dto.region ?? 'Москва',
                  city: dto.city ?? 'Москва',
                  specializations: ['общая диагностика'],
                },
              },
            }
          : {
              client: {
                create: {},
              },
            }),
      },
      include: { expert: true, client: true },
    });

    return this.buildAuthResponse(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.buildAuthResponse(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<{
        sub: string;
        email: string;
        role: Role;
      }>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      return this.buildAuthResponse(payload.sub, payload.email, payload.role);
    } catch {
      throw new UnauthorizedException('Недействительный refresh token');
    }
  }

  private async buildAuthResponse(
    userId: string,
    email: string,
    role: Role,
  ) {
    const accessExpires =
      this.config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m';
    const refreshExpires =
      this.config.get<string>('JWT_REFRESH_EXPIRES') ?? '7d';

    const payload = { sub: userId, email, role };

    // ВАЖНО: signAsync = ВЫДАТЬ браслет. verifyAsync = ПРОВЕРИТЬ браслет.
    // При выдаче используй именно signAsync!
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessExpires,
    } as Parameters<JwtService['signAsync']>[1]);

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpires,
    } as Parameters<JwtService['signAsync']>[1]);

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, role },
    };
  }
}
```

### Разбор AuthService «из жизни»

#### Constructor — инструменты на столе ресепшена

| Зависимость | Аналогия |
|-------------|----------|
| `PrismaService` | Картотека / склад анкет |
| `JwtService` | Аппарат печати браслетов |
| `ConfigService` | Сейф с печатями (секреты `.env`) |

Nest сам кладёт их в `constructor` (DI).

#### `register` — новая анкета

| Строка кода | Из жизни |
|-------------|----------|
| Запрет `ADMIN` | С улицы нельзя записаться директором клуба |
| `email.toLowerCase()` | `Ivan@Mail.ru` и `ivan@mail.ru` — один человек |
| `findUnique` + `ConflictException` | «Этот телефон уже в базе» — **409**, тут можно честно сказать |
| `bcrypt.hash(password, 10)` | В сейф кладём **отпечаток**, не листочек с паролем. `10` = «насколько сложно подобрать» |
| `expert.create` / `client.create` | Вместе с анкетой сразу заводим личное дело (профиль) |
| `?? 'Эксперт'` | Если имя не указали — подставить «Эксперт» |
| `buildAuthResponse` | Сразу выдать браслет + карточку (уже «вошёл») |

Тернарник `role === EXPERT ? … : …` — развилка: сотрудник клуба или гость.

#### `login` — «назовите код»

1. Найти анкету по email.  
2. Сверить пароль с отпечатком (`bcrypt.compare`) — **хеш обратно в пароль не превращается**.  
3. Выдать новую пару пропусков.

Одинаковый текст ошибки, если нет user **или** пароль неверный — см. выше про безопасность.  
HTTP: **`UnauthorizedException` (401)**, не `BadRequestException` (400).

#### `refresh` — «браслет протух, вот карточка»

1. `verifyAsync` refresh-токена с **REFRESH**-секретом (не access!).  
2. Если ок — снова `buildAuthResponse` (новые браслет + карточка).  
3. Если карточка битая/просрочена — 401.

#### `buildAuthResponse` — печать пропусков

```
payload = { sub: userId, email, role }   // что написано на браслете
access  = sign(payload, ACCESS_SECRET,  15m)
refresh = sign(payload, REFRESH_SECRET, 7d)
вернуть { accessToken, refreshToken, user }
```

`sub` = subject = «о ком этот токен» (id пользователя) — стандарт JWT.

**Частая ошибка:** вызвать `jwt.verifyAsync` при **выдаче** токена.  
- `signAsync` = напечатать браслет  
- `verifyAsync` = проверить уже существующий  

При выдаче — только **`signAsync`**.

Если TypeScript ругается на `expiresIn`, альтернатива (значения захардкожены):

```typescript
await this.jwt.signAsync(payload, {
  secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
  expiresIn: '15m',
});
```

(лучше брать сроки из `.env`, как в основном примере.)

---

## Шаг 4. JwtStrategy — `src/auth/jwt.strategy.ts`

**Аналогия:** инструкция для охранника: «браслет бери из кармана `Authorization: Bearer …`, проверяй печать ACCESS, смотри срок. Если ок — запиши на бейдж у двери: userId, email, role».

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';

type JwtPayload = { sub: string; email: string; role: Role };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  /** Результат попадёт в request.user */
  validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

| Кусок | Из жизни |
|-------|----------|
| `fromAuthHeaderAsBearerToken` | Смотри браслет на руке, не спрашивай пароль снова |
| `ignoreExpiration: false` | Просроченный браслет не пускаем |
| `secretOrKey: ACCESS_SECRET` | Сверяем с печатью для **коротких** браслетов |
| `validate` → `request.user` | На бейдже у двери написали «кто прошёл» |

Стратегия сама по себе дверь не закрывает — её вызывает **JwtAuthGuard**.

---

## Шаг 5. Декораторы и гварды (`src/common/...`)

**Аналогия:**  
- Guard = охранник у конкретной двери  
- `@Roles(EXPERT)` = табличка на двери  
- `@CurrentUser()` = «дай мне бейдж того, кто уже прошёл»

### `decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class AuthUser {
  userId!: string;
  email!: string;
  role!: 'CLIENT' | 'EXPERT' | 'ADMIN';
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
```

Вместо `req.user` руками пишешь `me(@CurrentUser() user: AuthUser)`.

### `decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

`@Roles(Role.EXPERT)` клеит на метод «метаданные» — RolesGuard потом их читает. Как повесить табличку «только эксперты».

### `guards/jwt-auth.guard.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Требуется авторизация');
    }
    return user;
  }
}
```

Без валидного access → **401**. Имя `'jwt'` стыкуется со Strategy.

### `guards/roles.guard.ts`

```typescript
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Нет @Roles — пускаем любого авторизованного (если рядом стоит JwtAuthGuard)
    if (!roles?.length) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role: Role } }>();
    const user = request.user;
    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenException('Недостаточно прав');
    }
    return true;
  }
}
```

Порядок на двери важен: сначала **JwtAuthGuard** (есть ли браслет?), потом **RolesGuard** (подходящая ли роль?).

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.EXPERT)
```

---

## Шаг 6. AuthController — `src/auth/auth.controller.ts`

**Аналогия:** окошко ресепшена. Человек подходит с JSON → окошко зовёт сотрудника (`AuthService`) → отдаёт ответ. Само окошко пароли не хеширует.

```typescript
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  /** Заглушка: на клиенте просто удаляем токены (выкинули браслет из кармана) */
  @Post('logout')
  logout() {
    return { ok: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  /** Пример роли: только EXPERT (для проверки RolesGuard) */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EXPERT)
  @Get('expert-only')
  expertOnly(@CurrentUser() user: AuthUser) {
    return { ok: true, message: 'Ты эксперт', user };
  }
}
```

Итоговые URL (с префиксом из урока 2):

| Метод | Путь | Auth | Аналогия |
|-------|------|------|----------|
| POST | `/api/v1/auth/register` | нет | Новая анкета |
| POST | `/api/v1/auth/login` | нет | Назвать пароль |
| POST | `/api/v1/auth/refresh` | body: refreshToken | Обменять карточку на новый браслет |
| GET | `/api/v1/auth/me` | Bearer access | «Кто я по браслету?» |
| GET | `/api/v1/auth/expert-only` | Bearer + роль EXPERT | Дверь «только сотрудники» |

---

## Шаг 7. AuthModule — `src/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

`JwtModule.register({})` — пустой конфиг ок: секреты и expires передаём в `signAsync` / strategy вручную.

---

## Шаг 8. Подключи в AppModule

В `src/app.module.ts` добавь импорт:

```typescript
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
  ],
  // ...
})
```

---

## Шаг 9. Проверка вручную

Запуск:

```powershell
cd C:\AutoFact\autofact-solo\apps\api
npm run start:dev
```

### A. Swagger (удобнее)

1. http://localhost:3011/api/docs  
2. `POST /api/v1/auth/register` — body:

```json
{
  "email": "client@solo.local",
  "password": "password123",
  "role": "CLIENT"
}
```

3. Скопируй `accessToken`  
4. Нажми **Authorize** → вставь токен (без слова Bearer, Swagger сам добавит)  
5. `GET /api/v1/auth/me` → должен вернуть `userId`, `email`, `role`

### B. Эксперт + RolesGuard

Зарегистрируй эксперта:

```json
{
  "email": "expert@solo.local",
  "password": "password123",
  "role": "EXPERT",
  "fullName": "Иван Тестов",
  "region": "Москва",
  "city": "Москва"
}
```

- Под его токеном `GET /auth/expert-only` → **200**  
- Под токеном клиента → **403** Недостаточно прав  
- Без токена на `/auth/me` → **401**

### C. Adminer

В таблице `User` — строка с `passwordHash` (длинная строка `$2b$...`), **не** `password123`.  
У CLIENT — запись в `ClientProfile`, у EXPERT — в `ExpertProfile`.

### D. Refresh

`POST /auth/refresh` с телом `{ "refreshToken": "..." }` → новая пара токенов.

---

## Частые ошибки

| Симптом | Причина | Что сделать |
|---------|---------|-------------|
| `Cannot find module 'bcrypt'` | Не установил пакет | Шаг 1 |
| `JWT_ACCESS_SECRET` missing | Нет в `.env` / опечатка | Сверь `.env` |
| Validation 400 на register | Неверный `role` / короткий пароль | `role`: `CLIENT` \| `EXPERT`, пароль ≥ 6 |
| 401 на `/me` | Не тот токен / забыли Authorize | Access, не refresh; Bearer |
| 403 на expert-only | Зашёл клиентом | Ок — так и должно |
| Nest не видит Auth роуты | AuthModule не в AppModule | Шаг 8 |
| TS error Role / Prisma | Client не сгенерен | `npx prisma generate` |
| Токены не выдаются / странная ошибка в `buildAuthResponse` | Написали `verifyAsync` вместо `signAsync` | При **выдаче** — только `signAsync` |
| `Cannot find module '../prisma/...'` | `auth.service` лежит в `dto/` | Перенеси в `src/auth/auth.service.ts` |
| login даёт 400 вместо 401 | `BadRequestException` | Замени на `UnauthorizedException` |

---

## FAQ — если снова «плывёт»

**Q: Зачем JWT, если есть сессии на сервере?**  
A: JWT удобен для API + web/mobile: сервер не хранит «кто залогинен» в памяти на каждый браслет — браслет сам несёт данные (подписанные секретом).

**Q: Можно ли один токен вместо двух?**  
A: Можно, но хуже: длинный access чаще светится. Два токена = короткий «рабочий» + длинный «обновить».

**Q: Где хранить токены на фронте?**  
A: Позже в уроках web. Пока — Swagger Authorize / память. (В проде осторожно с `localStorage` vs httpOnly cookie — обсудим отдельно.)

**Q: Почему logout почти пустой?**  
A: Клиент просто забывает токены. Полноценный logout с «чёрным списком» refresh — усложнение на потом.

**Q: Guard и Strategy — это одно и то же?**  
A: Нет. Strategy = *как* читать браслет. Guard = *пускать ли* без браслета. Guard вызывает Strategy.

---

## Чеклист

- [ ] Пакеты jwt / passport / bcrypt установлены  
- [ ] DTO + AuthService + Controller + JwtStrategy  
- [ ] common: CurrentUser, Roles, JwtAuthGuard, RolesGuard  
- [ ] AuthModule в AppModule  
- [ ] register CLIENT и EXPERT работают  
- [ ] В БД хеш, не пароль; профили созданы  
- [ ] `/auth/me` с Bearer → 200  
- [ ] `/auth/expert-only` у клиента → 403, у эксперта → 200  
- [ ] refresh выдаёт новые токены  

---

## Как сдаёшь

1. «Урок 4 готов»  
2. Пример ответа register/login (можно без полного токена — обрежь середину)  
3. Ответ `/auth/me`  
4. Что вернул `expert-only` для клиента (ожидаем 403)  

Я проверю файлы в `autofact-solo/apps/api/src/auth` и `common`.

---

## Дальше

**Урок 5 — Users / профили:** `GET /users/me` с полным профилем из БД, список экспертов.
