# Урок 13 — Next.js каркас (apps/web)

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\web`  
**Эталон:** `autofact-learn/apps/web/`  
**Статус:** [ ] не начат  

**Предусловие:** API уроки 9–12 (хотя бы Reports) работают на порту **3011**.

---

## Карта шагов (что / зачем)

| Шаг | Что | Зачем |
|-----|-----|--------|
| **1** | `create-next-app` в `apps/web` | Фронт отдельно от API |
| **2** | `.env.local` | URL API solo (3011), не learn (3010) |
| **3** | `src/lib/api.ts` | Единый fetch + JWT из localStorage |
| **4** | `layout.tsx` + shell | Общий каркас страниц |
| **5** | Заглушка home | Проверка, что web поднимается |

---

## Куда писать

| Шаг | Путь |
|-----|------|
| 1 | `autofact-solo/apps/web/` (новый проект) |
| 2 | `apps/web/.env.local` |
| 3 | `apps/web/src/lib/api.ts` |
| 4 | `apps/web/src/app/layout.tsx`, `components/` |
| 5 | `apps/web/src/app/page.tsx` |

---

## Шаг 1. Создать Next.js

```powershell
cd C:\AutoFact\autofact-solo
npx create-next-app@latest apps/web --typescript --eslint --app --src-dir --no-tailwind --import-alias "@/*"
```

(Если хочешь Tailwind — как в эталоне; сверься с `autofact-learn/apps/web/package.json`.)

Порт web: **3000** (или 3001, если занят). В `package.json` scripts можно `"dev": "next dev -p 3000"`.

---

## Шаг 2. Env

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3011/api/v1
NEXT_PUBLIC_FILES_URL=http://localhost:3011
```

CORS в API solo уже должен разрешать origin web.

---

## Шаг 3. API-клиент

Сверяйся с эталоном `src/lib/api.ts`:

- `getSession` / `setSession` (localStorage)
- `api<T>(path, { auth, method, body })`
- `fileUrl(path)` для `/uploads/...`

Не копируй demo-data как основной источник — для MVP ходи в реальный API.

---

## Шаг 4–5. Layout

Минимум: layout с названием AutoInspect, ссылка «Каталог» → `/reports`.  
Bottom nav — можно упростить сейчас, доработать на уроке 15.

---

## Чеклист

- [ ] `npm run dev` в web открывает страницу
- [ ] `api.ts` умеет дернуть `GET /reports` (можно временно с console)
- [ ] env указывает на **3011**

## Как сдаёшь

«Урок 13 готов».

## Дальше

[`14_LESSON_13_CATALOG.md`](./14_LESSON_13_CATALOG.md).
