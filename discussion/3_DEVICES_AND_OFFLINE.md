# 3. Устройства и офлайн-работа

**Версия:** 1.0  
**Дата:** 22 июля 2026  
**Статус:** Согласовано для learn-ветки

---

## 1. Будет ли всё работать на всех устройствах?

Краткий ответ: **да для пользователя продукта (через браузер)**, **разработка — в основном на Windows/Mac с Docker**.

### 1.1. Кто чем пользуется

| Роль | Устройство | Как открывает | Ожидание |
|------|------------|---------------|----------|
| **Клиент** | Телефон iOS / Android | Браузер (Safari, Chrome) | Каталог, отчёт, покупка — **mobile-first** |
| **Клиент** | Планшет | Браузер | То же, шире экран |
| **Эксперт** | Windows / Mac ноутбук | Браузер (Chrome/Edge) | Кабинет, загрузка фото/видео, длинные формы |
| **Эксперт** | Планшет | Браузер | Можно, но десктоп удобнее для медиа |
| **Админ** | Десктоп | Браузер | Позже |

### 1.2. Платформы — честная матрица

| Платформа | Клиентский web (Next.js) | Кабинет эксперта | Разработка (Nest+Docker) | Native-приложение (Expo) |
|-----------|--------------------------|------------------|---------------------------|---------------------------|
| **Windows 10/11** | ✅ | ✅ лучше всего | ✅ основной вариант | ❌ не нужно для MVP |
| **macOS** | ✅ | ✅ | ✅ | позже |
| **Linux** | ✅ | ✅ | ✅ | позже |
| **iPhone (iOS)** | ✅ браузер | ⚠️ тесно | ❌ | этап после MVP |
| **Android phone** | ✅ браузер | ⚠️ тесно | ❌ | этап после MVP |
| **iPad / Android tablet** | ✅ | ✅ приемлемо | ❌ | опционально |

### 1.3. Что это значит на практике

1. **Один web (Next.js)** обслуживает телефон и десктоп — адаптивная вёрстка.
2. **Отдельные приложения из Store (App Store / Google Play)** — не обязательны для MVP; это React Native / Expo позже.
3. **iOS и Android** для клиента = современный мобильный браузер. PWA («добавить на экран») можно добавить отдельно.
4. **Сборка и запуск бэкенда** (Postgres, Redis, Nest) — на машине разработчика с Docker, не на телефоне.

### 1.4. Ограничения без «магии»

- Камера телефона для эксперта в поле — в web работает, но хуже нативного приложения.
- Большие видео на слабом мобильном интернете — нужна сжатие/очередь (BullMQ) позже.
- Push-уведомления в браузере ограничены; полноценные пуши — в Expo.

**Итог для продукта:** клиент на iPhone/Android и эксперт на Windows — покрываем web’ом. Native — усиление, не блокер старта.

---

## 2. Работа на компьютере без интернета

Ты хочешь: собрать всё на флешку → принести на ПК **без сети** → поднять проект и кодить.

Это возможно для **локальной разработки** (Docker + Node + код), но с важными оговорками.

### 2.1. Что будет работать офлайн

| Компонент | Офлайн |
|-----------|--------|
| Docker (Postgres, Redis, Adminer) | ✅ если образы заранее на флешке |
| NestJS API | ✅ если `node_modules` уже установлены |
| Next.js web | ✅ то же |
| Prisma migrate / seed | ✅ (БД локальная) |
| Cursor / VS Code редактор | ✅ открытие файлов |
| AI-чат Cursor (я в чате) | ❌ нужен интернет |
| `npm install` новых пакетов | ❌ без сети или без локального npm-кэша |
| `docker pull` | ❌ без заранее сохранённых образов |

### 2.2. Cursor без обязательного логина

**Честно:**

- Cursor — продукт с аккаунтом и облачным AI. Политика входа **меняется**; гарантировать «вечную версию без логина» нельзя.
- На офлайн-ПК Cursor как **редактор кода** часто открывается, но **Agent / Chat без интернета не работают**.
- Для полностью офлайн-учёбы надёжнее положить на флешку ещё:
  - **VS Code** (System Installer / User Installer, offline),
  - или работать в Cursor только когда есть сеть, а офлайн — править код в VS Code по урокам из `lessons/`.

**Рекомендация:** на флешке держать **и Cursor, и VS Code**. Уроки в `discussion/lessons/` читаются без сети.

Скачивать установщики **только с официальных сайтов** на онлайн-машине:

- Cursor: https://cursor.com  
- VS Code: https://code.visualstudio.com  

*(Конкретный «crack / пиратский Cursor без логина» мы не используем и не рекомендуем.)*

---

## 3. Как выгрузить всё на флешку (пошагово)

Делай это на компьютере **С интернетом**. Флешка желательно **64+ ГБ**, USB 3.0.

### 3.1. Структура флешки

```
USB_AutoFact/
├── 00_README.txt                 ← краткая шпаргалка запуска
├── installers/
│   ├── node-v20-x64.msi          ← Node.js 20 LTS Windows
│   ├── Git-64-bit.exe            ← опционально
│   ├── Docker Desktop Installer.exe
│   ├── CursorSetup.exe
│   └── VSCodeSetup.exe
├── docker-images/
│   ├── postgres-16-alpine.tar
│   ├── redis-7-alpine.tar
│   └── adminer-4.tar
├── project/
│   └── AutoFact/                 ← весь репозиторий
│       ├── discussion/
│       ├── autofact-solo/        ← можно как эталон
│       └── autofact-learn/       ← твоя учебная копия (создадим)
├── npm-cache/                    ← опционально: кэш npm
└── docs/
    └── 3_DEVICES_AND_OFFLINE.md  ← эта инструкция (копия)
```

### 3.2. Что скачать (онлайн-машина)

1. **Node.js 20 LTS** — Windows 64-bit `.msi`  
   https://nodejs.org/
2. **Docker Desktop for Windows**  
   https://www.docker.com/products/docker-desktop/
3. **Git for Windows** (удобно, но не обязательно для старта)
4. **Cursor** + **VS Code** installers
5. Образы Docker (после установки Docker на онлайн-ПК):

```powershell
docker pull postgres:16-alpine
docker pull redis:7-alpine
docker pull adminer:4

docker save -o postgres-16-alpine.tar postgres:16-alpine
docker save -o redis-7-alpine.tar redis:7-alpine
docker save -o adminer-4.tar adminer:4
```

Скопируй `.tar` в `USB/docker-images/`.

6. **Проект**

```powershell
# из корня, где лежит AutoFact
xcopy C:\AutoFact E:\USB_AutoFact\project\AutoFact\ /E /I /H
```

Лучше **вместе с `node_modules`**, если уже ставил зависимости в `autofact-solo` / `autofact-learn` — тогда на офлайн-ПК не нужен `npm install`.

Если `node_modules` ещё нет — на онлайн-ПК:

```powershell
cd autofact-solo\apps\api
npm install
cd ..\web
npm install
```

И только потом копируй на флешку.

### 3.3. Установка на офлайн-компьютере

**Требования к ПК:** Windows 10/11, ~8+ ГБ RAM, виртуализация включена в BIOS (для Docker), права администратора.

1. Установи **Node.js** из `installers\`.
2. Установи **Docker Desktop**, перезагрузись, дождись статуса Running.
3. Установи **VS Code** и/или **Cursor**.
4. Загрузи образы:

```powershell
cd E:\USB_AutoFact\docker-images
docker load -i postgres-16-alpine.tar
docker load -i redis-7-alpine.tar
docker load -i adminer-4.tar
```

5. Скопируй проект на диск (не запускай с флешки постоянно — медленно):

```powershell
xcopy E:\USB_AutoFact\project\AutoFact C:\AutoFact\ /E /I /H
```

6. Подними инфру и приложения (пример для solo-эталона):

```powershell
cd C:\AutoFact\autofact-solo
docker compose up -d

cd apps\api
npm run start:dev

# второй терминал
cd C:\AutoFact\autofact-solo\apps\web
npm run dev
```

Если Postgres на хосте занял 5432 — у нас уже порт **5433** в `docker-compose.yml`.

### 3.4. Шпаргалка `00_README.txt` (положи на флешку)

```
1. Install Node + Docker + VS Code from installers\
2. docker load all *.tar from docker-images\
3. Copy project to C:\AutoFact
4. cd C:\AutoFact\autofact-solo && docker compose up -d
5. API: apps\api → npm run start:dev
6. Web: apps\web → npm run dev
7. Open http://localhost:3000 (or 3005)
8. Lessons: discussion\lessons\ (read offline)
```

### 3.5. Типичные проблемы офлайн

| Проблема | Что делать |
|----------|------------|
| Docker не стартует | WSL2 / виртуализация в BIOS; установка WSL могла потребовать интернет — поставь WSL **заранее** на онлайн-ПК или возьми ПК, где Docker уже работал |
| `npm` ругается на сеть | Не вызывай `npm install`; бери готовый `node_modules` с флешки |
| Порт 5432 / 3000 занят | Смени порты в compose / `next dev -p 3005` |
| Prisma не видит БД | `docker compose ps`, проверь `DATABASE_URL` и порт 5433 |
| Cursor просит логин | Работай в VS Code офлайн; уроки в `lessons/` |

### 3.6. Минимальный чеклист «флешка готова»

- [ ] Node 20 installer  
- [ ] Docker Desktop installer  
- [ ] VS Code installer (+ Cursor по желанию)  
- [ ] 3 docker image `.tar`  
- [ ] Проект AutoFact с `node_modules` (api + web)  
- [ ] `discussion/lessons/` на месте  
- [ ] Проверил запуск **один раз на онлайн-ПК** до поездки офлайн  

---

## 4. Связь с учёбой

План уроков: [`4_LEARN_PLAN.md`](./4_LEARN_PLAN.md)  
Материалы уроков: [`lessons/`](./lessons/)

На офлайн-ПК ты проходишь уроки по файлам в `lessons/`, сверяешься с эталоном `autofact-solo/`, пишешь свой код в `autofact-learn/` (создадим на старте learn-ветки).
