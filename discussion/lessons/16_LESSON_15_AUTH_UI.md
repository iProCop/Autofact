# Урок 15 — Auth UI + навигация

**Где работаешь:** `C:\AutoFact\autofact-solo\apps\web`  
**Эталон:** `app/login/page.tsx`, `app/register/page.tsx`, `components/bottom-nav.tsx`  
**Статус:** [ ] не начат  

**Предусловие:** Урок 13–14.

---

## Карта шагов (что / зачем)

| Шаг | Что | Зачем |
|-----|-----|--------|
| **1** | `/login` | Вход → JWT в localStorage |
| **2** | `/register` | Регистрация CLIENT/EXPERT |
| **3** | Сохранение session | `setSession` после login |
| **4** | Bottom nav / header | Каталог, кабинет, профиль, выход |
| **5** | Редиректы | Незалогиненный → login на защищённых страницах |

---

## Куда писать

| Файл | Что |
|------|-----|
| `src/app/login/page.tsx` | форма email/password → `POST /auth/login` |
| `src/app/register/page.tsx` | форма + role → `POST /auth/register` |
| `src/components/bottom-nav.tsx` | ссылки |
| `src/lib/api.ts` | уже есть session helpers |

---

## Поток

1. Register/Login → ответ с `accessToken`, `refreshToken`, `user`  
2. `setSession(...)`  
3. Дальнейшие `api(..., { auth: true })` сами подставят Bearer  

Refresh token (ротация) — по желанию упростить: пока достаточно access до истечения.

---

## Навигация по ролям

| Роль | Пункты |
|------|--------|
| Гость | Каталог, Войти |
| CLIENT | Каталог, Покупки, Профиль |
| EXPERT | Каталог, Кабинет, Профиль |

---

## Чеклист

- [ ] Login/register работают против solo API
- [ ] После входа видна смена nav
- [ ] Logout чистит session

## Как сдаёшь

«Урок 15 готов».

## Дальше

[`16_LESSON_15_REPORT_PAGE.md`](./16_LESSON_15_REPORT_PAGE.md).
