/**
 * Auth API base URL (no trailing slash).
 * After deploying api/auth to Yandex Cloud, set full invoke URL here, e.g.:
 *   https://functions.yandexcloud.net/<function-id>
 * Or PHP: https://your-host.example/api/php-auth/auth.php
 *
 * Leave empty to use local demo mode (client-side only mock — not production secure).
 */
window.GRILLZ_AUTH_API = window.GRILLZ_AUTH_API || '';
// Example after deploy:
// window.GRILLZ_AUTH_API = 'https://functions.yandexcloud.net/XXXXXXXX';
