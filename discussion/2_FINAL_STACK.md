# AutoInspect — Финальный стек сборки

**Версия:** 1.1  
**Дата:** 22 июля 2026  
**Статус:** Согласовано

---

## Принцип

MVP сначала: **API (NestJS) + Web (Next.js)**.  
Native: **React Native / Expo** — после стабильного ядра.  
**Flutter не используем.**

UX:
- **Клиент** — mobile-first (телефон, как Avito / Дром)
- **Эксперт** — desktop-кабинет (удобная загрузка медиа и длинные формы)

Инфраструктура локально через **Docker Compose** (Postgres + Redis).

---

## Backend

| Слой | Технология |
|------|------------|
| Runtime | Node.js 20 LTS |
| Framework | NestJS |
| Язык | TypeScript (`strict: true`) |
| ORM | Prisma |
| БД | PostgreSQL 16 |
| Кэш / очереди | Redis 7 + BullMQ |
| Auth | JWT (access + refresh) |
| Валидация | `class-validator` + `class-transformer` |
| Документация API | Swagger (`/api/docs`), префикс `/api/v1` |
| Тесты | Jest (unit: Pricing, PlatformScore) |

---

## Frontend

| Слой | Технология | Когда |
|------|------------|-------|
| Web | Next.js (App Router) + TypeScript + React | MVP |
| Native | React Native + Expo + Expo Router | После MVP |
| Стили | Tailwind или CSS Modules — на старте web | MVP |
| API-клиент | `fetch` / тонкая обёртка | MVP |

---

## Инфраструктура (локально)

| Сервис | Как |
|--------|-----|
| PostgreSQL 16 | Docker Compose |
| Redis 7 | Docker Compose |
| (опционально) Adminer | Docker Compose |
| API / Web | На хосте (`npm run start:dev`) |

---

## Внешние сервисы

| Сервис | Стратегия |
|--------|-----------|
| Платежи (YooKassa) | Интерфейс + **mock** → реальные вебхуки позже |
| Файлы (Yandex Object Storage) | Сначала **`uploads/`** → S3 позже |
| CDN | После S3 |

---

## Структура репозитория

```
AutoFact/
├── discussion/          # контекст, стек, уроки (lessons/)
├── autofact-learn/      # ЭТАЛОН — собрал агент (смотреть / запускать)
└── autofact-solo/       # ТЫ собираешь с нуля по урокам → свой готовый проект
```

Внутри каждой кодовой папки:

```
apps/
  api/          # NestJS
  web/          # Next.js
docker-compose.yml
```

---

## MVP-границы

**Входит:** Auth, Reports, Pricing, Platform Score, покупка (mock), Docker, Next.js (mobile client + desktop expert).

**Не входит:** Expo, реальная YooKassa, S3, B2B, выводы средств, полный цикл выездов (2-я очередь).

---

## Порядок разработки

1. Docker Compose (Postgres + Redis)
2. NestJS + Prisma schema + миграция
3. Auth + Users + Guards
4. Pricing + PlatformScore (+ unit-тесты)
5. Reports (+ локальные медиа)
6. Purchases + Payments (mock)
7. Next.js: каталог, отчёт, покупка, кабинет эксперта
8. Далее: Orders, YooKassa, S3, Expo
