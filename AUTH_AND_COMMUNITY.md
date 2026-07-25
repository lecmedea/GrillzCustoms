# Grillz Customs accounts, forum and game persistence

GitHub Pages publishes the static frontend. **Real auth** is implemented as:

| Layer | Path |
|---|---|
| UI | `account.html` + `assets/auth.js` + `assets/auth-config.js` |
| Node API (Yandex CF) | `api/auth/index.js` — scrypt + JWT |
| MySQL schema | `api/auth/schema.sql` |
| PHP + PDO (alt host) | `api/php-auth/` |

## Five required pieces (done)

1. **Database** — MySQL table `users` (id, username, email, password_hash, …) or JSON store on Object Storage / demo memory.
2. **Forms** — register / login / password reset on `account.html`.
3. **Handler** — Node `?action=register|login|…` or PHP `auth.php`.
4. **Sessions** — JWT HS256 (`Authorization: Bearer`), client stores token; `?action=me` validates.
5. **Security** — no plaintext passwords, validation, rate limit, CORS, PDO prepared statements (PHP).

## Safe account model

- Store users with `id`, `username`, `email`, `password_hash`, `display_name`, `telegram`, `role`, `created_at`, `last_login_at`.
- Store passwords only as slow salted hashes (`scrypt` Node / `password_hash` PHP).
- Never store or show raw passwords to admins.
- Reset tokens: SHA-256 of one-time secret, short TTL.
- Frontend without API URL runs **local demo only** (PBKDF2 in browser) — not for production.

## Forum model

- `forum_topics`: title, category, author_id, status, created_at, updated_at.
- `forum_posts`: topic_id, author_id, body, status, created_at.
- `forum_reports`: post_id, reporter_id, reason, status.
- Admin tools: approve, hide, lock, pin, ban user, export report.

## Tamagotchi model

- `game_saves`: user_id, level, xp, coins, stats_json, furniture_json, active_job_json, last_tick.
- Server recalculates real-time progress on every load/save.
- Client localStorage can be used only as a guest preview and migration source after login.

## Recommended launch sequence

1. Deploy Telegram bot on Yandex Cloud Functions.
2. Add a small API Gateway + Cloud Functions backend for auth/forum/game saves.
3. Use Managed PostgreSQL or YDB for persistence.
4. Add admin role and audit log before opening forum posting publicly.
5. Add moderation policy, terms, privacy policy and cookie details.
