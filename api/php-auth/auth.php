<?php
/**
 * Grillz Customs Auth handler (PHP + MySQL PDO)
 * actions: register | login | reset-request | reset-confirm | me | logout | health
 */
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$action = clean((string)($_GET['action'] ?? $_POST['action'] ?? 'health'), 40);
$body = body_json();
$secret = (string)($config['jwt_secret'] ?? '');
$ttl = (int)($config['token_ttl'] ?? 604800);

if ($action === 'health') {
    json_out(200, ['ok' => true, 'service' => 'grillzcustoms-auth-php', 'db' => true]);
}

if (strlen($secret) < 16) {
    json_out(503, ['ok' => false, 'error' => 'jwt_secret too short in config.php']);
}

try {
    $db = pdo($config);
} catch (Throwable $e) {
    json_out(503, ['ok' => false, 'error' => 'Database connection failed']);
}

if ($action === 'register') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_out(405, ['ok' => false, 'error' => 'POST only']);
    }
    $username = strtolower(clean((string)($body['username'] ?? ''), 50));
    $email = strtolower(clean((string)($body['email'] ?? ''), 191));
    $password = (string)($body['password'] ?? '');
    $display = clean((string)($body['display_name'] ?? $body['name'] ?? $username), 100);
    $telegram = clean((string)($body['telegram'] ?? ''), 64);

    if (!preg_match('/^[a-z0-9_]{3,50}$/', $username)) {
        json_out(400, ['ok' => false, 'error' => 'Логин: 3–50, латиница/цифры/_']);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_out(400, ['ok' => false, 'error' => 'Некорректный email']);
    }
    if (strlen($password) < 8 || !preg_match('/[A-Za-zА-Яа-я]/u', $password) || !preg_match('/\d/', $password)) {
        json_out(400, ['ok' => false, 'error' => 'Пароль: мин. 8, буква и цифра']);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    try {
        $stmt = $db->prepare(
            'INSERT INTO users (username, email, password_hash, display_name, telegram) VALUES (?,?,?,?,?)'
        );
        $stmt->execute([$username, $email, $hash, $display, $telegram]);
    } catch (PDOException $e) {
        json_out(409, ['ok' => false, 'error' => 'Логин или email уже занят']);
    }

    $id = (int)$db->lastInsertId();
    $user = [
        'id' => $id,
        'username' => $username,
        'email' => $email,
        'display_name' => $display,
        'telegram' => $telegram,
        'role' => 'user',
        'created_at' => date('c'),
        'last_login_at' => null,
    ];
    $token = jwt_sign(['sub' => $id, 'username' => $username, 'role' => 'user'], $secret, $ttl);
    json_out(201, ['ok' => true, 'token' => $token, 'user' => public_user($user), 'message' => 'Аккаунт создан']);
}

if ($action === 'login') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_out(405, ['ok' => false, 'error' => 'POST only']);
    }
    $login = strtolower(clean((string)($body['login'] ?? $body['username'] ?? $body['email'] ?? ''), 191));
    $password = (string)($body['password'] ?? '');
    $stmt = $db->prepare('SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1');
    $stmt->execute([$login, $login]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, $user['password_hash'])) {
        json_out(401, ['ok' => false, 'error' => 'Неверный логин или пароль']);
    }
    $db->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?')->execute([(int)$user['id']]);
    $token = jwt_sign(
        ['sub' => (int)$user['id'], 'username' => $user['username'], 'role' => $user['role'] ?? 'user'],
        $secret,
        $ttl
    );
    json_out(200, ['ok' => true, 'token' => $token, 'user' => public_user($user), 'message' => 'Вход выполнен']);
}

if ($action === 'reset-request') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_out(405, ['ok' => false, 'error' => 'POST only']);
    }
    $email = strtolower(clean((string)($body['email'] ?? ''), 191));
    $generic = [
        'ok' => true,
        'message' => 'Если email найден, ссылка для сброса активна 1 час.',
    ];
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_out(200, $generic);
    }
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if ($user) {
        $raw = bin2hex(random_bytes(32));
        $hash = hash('sha256', $raw);
        $db->prepare(
            'UPDATE users SET reset_token_hash = ?, reset_token_expires_at = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?'
        )->execute([$hash, (int)$user['id']]);
        // Production: mail the link. Demo token:
        $generic['reset_token'] = $raw;
        $generic['reset_hint'] = 'Только для теста; в проде — письмо.';
    }
    json_out(200, $generic);
}

if ($action === 'reset-confirm') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_out(405, ['ok' => false, 'error' => 'POST only']);
    }
    $token = clean((string)($body['token'] ?? $body['reset_token'] ?? ''), 128);
    $password = (string)($body['password'] ?? '');
    if ($token === '' || strlen($password) < 8) {
        json_out(400, ['ok' => false, 'error' => 'Нужен токен и новый пароль']);
    }
    $hash = hash('sha256', $token);
    $stmt = $db->prepare(
        'SELECT id FROM users WHERE reset_token_hash = ? AND reset_token_expires_at > NOW() LIMIT 1'
    );
    $stmt->execute([$hash]);
    $user = $stmt->fetch();
    if (!$user) {
        json_out(400, ['ok' => false, 'error' => 'Токен недействителен или истёк']);
    }
    $ph = password_hash($password, PASSWORD_DEFAULT);
    $db->prepare(
        'UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?'
    )->execute([$ph, (int)$user['id']]);
    json_out(200, ['ok' => true, 'message' => 'Пароль обновлён']);
}

if ($action === 'me') {
    $payload = jwt_verify(bearer_token(), $secret);
    if (!$payload || empty($payload['sub'])) {
        json_out(401, ['ok' => false, 'error' => 'Требуется вход']);
    }
    $stmt = $db->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([(int)$payload['sub']]);
    $user = $stmt->fetch();
    if (!$user) {
        json_out(401, ['ok' => false, 'error' => 'Сессия недействительна']);
    }
    json_out(200, ['ok' => true, 'user' => public_user($user)]);
}

if ($action === 'logout') {
    json_out(200, ['ok' => true, 'message' => 'Выход выполнен (удалите токен на клиенте)']);
}

json_out(404, ['ok' => false, 'error' => 'Unknown action']);
