# Урок 1 — Docker Compose

**Где работаешь:** `C:\AutoFact\autofact-solo\`  
**Что создаёшь:** файл `docker-compose.yml` (в корне solo)  
**Эталон смотреть (не копировать слепо):** `autofact-learn/docker-compose.yml`  
**Эталон не трогаем.**  
**Статус:** [ ] не начат  

---

## Цель урока

Поднять у себя три контейнера:

1. **PostgreSQL** — база данных  
2. **Redis** — быстрая память / очереди (понадобится позже)  
3. **Adminer** — веб-окошко, чтобы глазами видеть БД  

После урока у тебя в solo своя инфраструктура, **отдельная** от эталона.

---

## Зачем это нужно (простыми словами)

Без Docker пришлось бы ставить Postgres и Redis руками на Windows — долго и «у каждого по-своему».

Docker Compose = один файл → одна команда → три сервиса как у всех.

| Сервис | Аналогия | Зачем AutoFact |
|--------|----------|----------------|
| Postgres | Склад / Excel для программы | Юзеры, отчёты, покупки |
| Redis | Быстрый блокнот | Очереди (сжатие видео и т.п.) позже |
| Adminer | «Проводник» к БД в браузере | Проверить, что таблицы появились |

---

## Теория: слова, которые встретишь в файле

| Слово | Что значит |
|-------|------------|
| `image` | Шаблон образа с Docker Hub (например postgres 16) |
| `container` | Запущенный экземпляр этого образа |
| `container_name` | Имя контейнера на твоём ПК (должно быть **уникальным**) |
| `ports: "HOST:CONTAINER"` | Слева порт на **твоём** Windows, справа — внутри контейнера |
| `environment` | Переменные окружения (логин/пароль БД) |
| `volumes` | Папка-«диск», данные не пропадут после `docker compose down` |
| `healthcheck` | Проверка «сервис реально готов», не только «контейнер запущен» |
| `depends_on` | Adminer ждёт, пока Postgres станет healthy |

### Важно про порты (конфликт с эталоном)

Эталон (`autofact-learn`) уже может занимать:

| Сервис | Порт эталона |
|--------|--------------|
| Postgres | **5433** |
| Redis | **6379** |
| Adminer | **8080** |

В **solo** возьми другие порты на хосте, например:

| Сервис | Твой порт (рекомендация) | Внутри контейнера |
|--------|--------------------------|-------------------|
| Postgres | **5434** | 5432 (всегда у Postgres) |
| Redis | **6380** | 6379 |
| Adminer | **8081** | 8080 |

Имена контейнеров тоже свои, например: `solo-postgres`, `solo-redis`, `solo-adminer`.  
Имена volumes тоже свои: `solo_pg_data`, `solo_redis_data`.

---

## Что сделать по шагам

### Шаг 0. Убедись, что Docker Desktop запущен

Иконка кита в трее. Потом:

```powershell
docker version
docker compose version
```

### Шаг 1. Открой папку solo

```powershell
cd C:\AutoFact\autofact-solo
```

Должны быть `apps\api`, `apps\web`, `README.md` (из урока 0).

### Шаг 2. Создай файл `docker-compose.yml`

Создай **новый файл** в корне:

`C:\AutoFact\autofact-solo\docker-compose.yml`

Ниже — **готовый образец для solo**. Перепиши его **сам** (можно с экрана), не копируй файл из learn кнопкой. Цель — понять каждую строку.

```yaml
# autofact-solo — учебная инфра (не трогай autofact-learn)
services:
  postgres:
    image: postgres:16-alpine
    container_name: solo-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: autofact
      POSTGRES_PASSWORD: autofact
      POSTGRES_DB: autofact_solo
    ports:
      - "5434:5432"
    volumes:
      - solo_pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U autofact -d autofact_solo"]
      interval: 5s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: solo-redis
    restart: unless-stopped
    ports:
      - "6380:6379"
    volumes:
      - solo_redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10

  adminer:
    image: adminer:4
    container_name: solo-adminer
    restart: unless-stopped
    ports:
      - "8081:8080"
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  solo_pg_data:
  solo_redis_data:
```

### Шаг 3. Разбери файл по кускам (прочитай вслух себе)

**`postgres`**

- `image: postgres:16-alpine` — лёгкий Postgres 16  
- `POSTGRES_USER / PASSWORD / DB` — логин, пароль, имя базы при первом старте  
- `"5434:5432"` — с хоста заходишь на `localhost:5434`, внутри контейнера Postgres слушает 5432  
- `solo_pg_data:/var/lib/postgresql/data` — данные БД живут в Docker volume  
- `pg_isready` — healthcheck: «БД принимает соединения?»

**`redis`**

- Порт хоста `6380`, чтобы не драться с эталоном на `6379`  
- `redis-cli ping` → ответ `PONG` = жив

**`adminer`**

- Браузер: `http://localhost:8081`  
- Ждёт healthy Postgres

**`volumes:` внизу файла**

Объявляет именованные тома `solo_pg_data` и `solo_redis_data`. Без этого блока Compose может ругаться или создать анонимные тома.

### Шаг 4. Запусти

```powershell
cd C:\AutoFact\autofact-solo
docker compose up -d
docker compose ps
```

Ожидание: три сервиса, у postgres и redis статус **healthy** (или running + healthy чуть позже).

Полезные команды:

```powershell
docker compose logs postgres
docker compose logs redis
docker compose down          # остановить контейнеры (данные в volume останутся)
# docker compose down -v     # ОСТОРОЖНО: сотрёт и данные БД
```

### Шаг 5. Открой Adminer

1. Браузер: http://localhost:8081  
2. Заполни форму:

| Поле | Значение |
|------|----------|
| Система | PostgreSQL |
| Сервер | `postgres` ← **имя сервиса** из compose (не localhost!) |
| Пользователь | `autofact` |
| Пароль | `autofact` |
| База данных | `autofact_solo` |

Почему сервер = `postgres`, а не `localhost`?  
Adminer живёт **внутри Docker-сети**. Имя сервиса из `docker-compose.yml` — это DNS-имя соседа. С твоего Windows к БД идёшь на `localhost:5434`; из Adminer — на `postgres:5432`.

Таблиц пока **нет** — это нормально. Таблицы появятся на уроке Prisma.

### Шаг 6. (Опционально) Сверка с эталоном

Открой `autofact-learn/docker-compose.yml` **только для чтения**.  
Сравни: те же три сервиса, но другие `container_name`, порты и имена volume.  
**Не сохраняй и не правь** файлы в learn.

---

## Частые ошибки

| Симптом | Причина | Что сделать |
|---------|---------|-------------|
| `port is already allocated` | Порт занят (часто эталоном) | Смени левую часть `ports` (5435, 6381, 8082…) |
| `container name already in use` | Имя как у эталона | Смени `container_name` на `solo-…` |
| Adminer: «Unable to connect» | Сервер = localhost | Поставь сервер = `postgres` |
| Docker Desktop не отвечает | Демон не запущен | Запусти Docker Desktop, подожди зелёный статус |
| YAML ошибка отступов | Пробелы vs табы | Только пробелы, как в образце (2 пробела) |

---

## Чеклист (отметь сам)

- [ ] Файл `autofact-solo/docker-compose.yml` написан **мной**  
- [ ] Порты/имена **не** совпадают с эталоном  
- [ ] `docker compose up -d` и `docker compose ps` — три сервиса ок  
- [ ] Adminer открывается на моём порту, логин в БД проходит  
- [ ] Понимаю: HOST:CONTAINER, volume, healthcheck, зачем разные порты  

---

## Как сдаёшь урок

В чат напиши примерно так:

1. «Урок 1 готов»  
2. Какие порты выбрал (Postgres / Redis / Adminer)  
3. Скрин или текст `docker compose ps`  
4. Получилось ли зайти в Adminer  

Я **проверю** твой `autofact-solo/docker-compose.yml` и вывод команд. Код за тебя править не буду — подскажу, что поменять.

---

## Дальше

После «готово» → полный [`03_LESSON_2_NEST.md`](./03_LESSON_2_NEST.md) (NestJS каркас в `apps/api`).
