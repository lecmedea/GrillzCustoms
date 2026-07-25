<?php
/**
 * Copy to config.php and fill credentials. Never commit config.php.
 */
declare(strict_types=1);

return [
    'db' => [
        'dsn' => 'mysql:host=127.0.0.1;dbname=grillzcustoms;charset=utf8mb4',
        'user' => 'db_user',
        'pass' => 'db_password',
    ],
    'jwt_secret' => 'CHANGE_ME_TO_LONG_RANDOM_STRING_32plus',
    'token_ttl' => 604800,
    'cors_origin' => 'https://grillzcustoms.ru',
    'site_url' => 'https://grillzcustoms.ru',
];
