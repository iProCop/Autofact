# AutoInspect / AutoFact

Маркетплейс отчётов автоэкспертов по осмотру подержанных авто.

## Три папки — три роли (как в NetoDip)

| Папка | Роль | Кто трогает |
|-------|------|-------------|
| **`autofact-learn/`** | **Эталон** — готовая сборка (уже собрана агентом) | Смотреть / запускать. Код ради учёбы **не меняем** |
| **`autofact-solo/`** | **Твоя сборка** — с нуля по урокам | **Только ты** пишешь код |
| **`discussion/`** | Контекст, стек, **уроки** | Агент пишет уроки; ты читаешь |

```
C:\AutoFact\
├── README.md                 ← ты здесь
├── discussion/
│   ├── 1_PROJECT_CONTEXT.md  ← суть продукта и ТЗ-логика
│   ├── 2_FINAL_STACK.md      ← стек
│   ├── 3_DEVICES_AND_OFFLINE.md
│   ├── 4_LEARN_PLAN.md       ← краткий маршрут
│   └── lessons/              ← подробные уроки
│       ├── 00_START_HERE.md
│       ├── CURRICULUM.md     ← все уроки: название + содержание
│       └── 01_…md
├── autofact-learn/           ← эталон (Nest + Next + Prisma)
└── autofact-solo/            ← твоя реализация
```

## Как учимся (формат)

1. Агент пишет урок в `discussion/lessons/…` (объяснение + код).
2. **Ты** делаешь то же в **`autofact-solo/`**.
3. Пишешь **«урок N готов»** / вопрос / ошибку.
4. Агент **проверяет** solo, не пишет код за тебя (пока сам не попросишь).

Подглядывать в `autofact-learn` можно. Копировать проект целиком — нельзя.

## С чего начать

1. Открой в Cursor папку **`C:\AutoFact`** (`File → Open Folder`).
2. Новый чат в этом workspace.
3. Прочитай: [`discussion/lessons/00_START_HERE.md`](discussion/lessons/00_START_HERE.md)
4. План уроков: [`discussion/lessons/CURRICULUM.md`](discussion/lessons/CURRICULUM.md)
5. Начни **урок 0**: [`discussion/lessons/01_LESSON_0_ENV.md`](discussion/lessons/01_LESSON_0_ENV.md)

## Запуск эталона (подсмотреть)

```powershell
cd C:\AutoFact\autofact-learn
docker compose up -d
cd apps\api
npm install
npx prisma migrate deploy
npm run start:dev
# другой терминал
cd C:\AutoFact\autofact-learn\apps\web
npm install
npm run dev
```

Порты learn не должны совпадать с solo (см. урок про Docker).

## Стек (кратко)

- **API:** NestJS + Prisma + PostgreSQL + JWT  
- **Web:** Next.js (App Router), mobile-first для клиента  
- **Дальше:** Redis/BullMQ, YooKassa, S3, Expo — после MVP  

Подробности: `discussion/2_FINAL_STACK.md`.
