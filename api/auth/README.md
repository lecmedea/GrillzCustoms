# Grillz Customs Auth API

Полноценный личный кабинет для статического сайта на GitHub Pages.

## Компоненты (ваши 5 требований)

| # | Требование | Реализация |
|---|---|---|
| 1 | БД: id, login, hash, email | `schema.sql` (MySQL) **или** JSON в Object Storage / memory (Node) |
| 2 | Формы register / login / reset | `account.html` |
| 3 | Обработчик | `api/auth/index.js` (Yandex CF) **или** `api/php-auth/auth.php` |
| 4 | Сессии / JWT | JWT HS256 (`Authorization: Bearer …`) |
| 5 | Защита | scrypt / `password_hash`, prepared statements, rate limit, CORS, валидация |

> GitHub Pages **не** выполняет PHP. PHP-пакет — для хостинга с MySQL.  
> Для текущего стека GC: **Node-функция в Yandex Cloud** + фронт на Pages.

## Env (Yandex Function)

| Переменная | Описание |
|---|---|
| `AUTH_JWT_SECRET` | Обязательно, ≥16 символов |
| `SITE_URL` | `https://grillzcustoms.ru` |
| `AUTH_STORAGE` | `memory` (демо) или `s3` |
| `S3_*` | Для `s3`: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION` |
| `AUTH_TOKEN_TTL_SEC` | По умолчанию 7 дней |
| `AUTH_HIDE_RESET_TOKEN` | `1` — не отдавать reset_token в JSON (прод) |

## Actions

```
GET  ?action=health
POST ?action=register   { username, email, password, display_name?, telegram? }
POST ?action=login      { login, password }
POST ?action=reset-request { email }
POST ?action=reset-confirm { token, password }
GET  ?action=me         Authorization: Bearer <jwt>
POST ?action=logout
```

## Frontend

`account.html` + `assets/auth.js`  
API URL задаётся в `assets/auth-config.js` (`window.GRILLZ_AUTH_API`).

## Deploy (Yandex)

1. Создать функцию (nodejs18/22), entrypoint `index.handler`, zip: `index.js` + `package.json`.
2. Env: `AUTH_JWT_SECRET`, `SITE_URL`, ideally `AUTH_STORAGE=s3` + ключи Object Storage.
3. Публичный HTTPS URL → прописать в `assets/auth-config.js`.
4. CORS уже ограничен `SITE_URL`.

## PHP + MySQL

1. Импорт `schema.sql`.
2. `cp config.sample.php config.php` — заполнить.
3. `auth.php?action=login` и т.д.
4. Указать URL PHP в `auth-config.js`.
