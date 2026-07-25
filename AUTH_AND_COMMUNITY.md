# Grillz Customs accounts, forum and game persistence

GitHub Pages can publish the static website, but real accounts, email login, forum posts, admin moderation and Tamagotchi cloud saves require a backend and database.

## Safe account model

- Store users with `id`, `email`, `display_name`, `telegram_id`, `photo_url`, `role`, `created_at`, `last_login_at`.
- Store passwords only as slow salted hashes, for example `argon2id` or `scrypt`.
- Never store or show raw passwords to admins. Admin control should use password reset, session revoke and audit logs.
- Confirm email through a one-time signed link.
- Support Telegram login by validating Telegram's signed login payload server-side.

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
