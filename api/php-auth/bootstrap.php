<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'error' => 'config.php missing — copy config.sample.php']);
    exit;
}

/** @var array $config */
$config = require $configPath;
$origin = $config['cors_origin'] ?? 'https://grillzcustoms.ru';
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function json_out(int $code, array $payload): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function body_json(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    if (is_array($data)) {
        return $data;
    }
    return array_merge($_POST, $_GET);
}

function clean(string $s, int $max = 200): string
{
    $s = trim(preg_replace('/[\x00-\x1F\x7F]/u', '', $s) ?? '');
    return mb_substr($s, 0, $max);
}

function pdo(array $config): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $pdo = new PDO(
        $config['db']['dsn'],
        $config['db']['user'],
        $config['db']['pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
    return $pdo;
}

function b64url(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function jwt_sign(array $payload, string $secret, int $ttl): string
{
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $payload['iat'] = time();
    $payload['exp'] = time() + $ttl;
    $h = b64url(json_encode($header, JSON_THROW_ON_ERROR));
    $p = b64url(json_encode($payload, JSON_THROW_ON_ERROR));
    $sig = b64url(hash_hmac('sha256', $h . '.' . $p, $secret, true));
    return $h . '.' . $p . '.' . $sig;
}

function jwt_verify(string $token, string $secret): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    [$h, $p, $s] = $parts;
    $expected = b64url(hash_hmac('sha256', $h . '.' . $p, $secret, true));
    if (!hash_equals($expected, $s)) {
        return null;
    }
    $json = base64_decode(strtr($p, '-_', '+/'));
    $payload = json_decode($json ?: '', true);
    if (!is_array($payload) || empty($payload['exp']) || $payload['exp'] < time()) {
        return null;
    }
    return $payload;
}

function bearer_token(): string
{
    $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer\s+(\S+)/i', $hdr, $m)) {
        return $m[1];
    }
    return '';
}

function public_user(array $u): array
{
    return [
        'id' => (int)$u['id'],
        'username' => $u['username'],
        'email' => $u['email'],
        'display_name' => $u['display_name'] ?: $u['username'],
        'telegram' => $u['telegram'] ?? '',
        'role' => $u['role'] ?? 'user',
        'created_at' => $u['created_at'] ?? null,
        'last_login_at' => $u['last_login_at'] ?? null,
    ];
}
