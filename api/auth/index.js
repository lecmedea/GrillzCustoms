'use strict';

/**
 * Grillz Customs Auth API — Yandex Cloud Functions
 *
 * Routes (POST JSON or form, GET for me/health):
 *   ?action=register | login | reset-request | reset-confirm | me | logout | health
 *
 * Security:
 *   - scrypt password hashes (never plaintext)
 *   - JWT HS256 sessions (Bearer)
 *   - input validation + rate limit (in-memory)
 *   - CORS restricted to SITE_URL
 *
 * Storage (pick via env):
 *   AUTH_STORAGE=memory  (default; lost on cold start — demo only)
 *   AUTH_STORAGE=s3      Yandex Object Storage (persistent)
 *     S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION
 *
 * Required env:
 *   AUTH_JWT_SECRET  — long random string
 * Optional:
 *   SITE_URL=https://grillzcustoms.ru
 *   AUTH_TOKEN_TTL_SEC=604800
 */

const crypto = require('crypto');

const SITE_URL = (process.env.SITE_URL || 'https://grillzcustoms.ru').replace(/\/$/, '');
const JWT_SECRET = process.env.AUTH_JWT_SECRET || '';
const TOKEN_TTL = Number(process.env.AUTH_TOKEN_TTL_SEC || 60 * 60 * 24 * 7);
const STORAGE = (process.env.AUTH_STORAGE || 'memory').toLowerCase();
const USERS_KEY = process.env.AUTH_USERS_KEY || 'auth/users.json';

const store = globalThis.__gcAuthStore || (globalThis.__gcAuthStore = {
  users: null,
  rate: new Map()
});

/* ---------- HTTP helpers ---------- */
function json(statusCode, body, extraHeaders = {}) {
  const origin = SITE_URL;
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization',
      'access-control-allow-credentials': 'false',
      'x-content-type-options': 'nosniff',
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

function parseBody(event) {
  if (!event || event.body == null) return {};
  let raw = event.body;
  if (event.isBase64Encoded) raw = Buffer.from(raw, 'base64').toString('utf8');
  if (typeof raw === 'object') return raw;
  const ct = String(event.headers?.['Content-Type'] || event.headers?.['content-type'] || '');
  try {
    if (ct.includes('application/json') || String(raw).trim().startsWith('{')) {
      return JSON.parse(raw);
    }
  } catch { /* fallthrough */ }
  // form-urlencoded
  try {
    const params = new URLSearchParams(String(raw));
    const out = {};
    for (const [k, v] of params.entries()) out[k] = v;
    return out;
  } catch {
    return {};
  }
}

function query(event) {
  const q = event?.queryStringParameters || {};
  return q;
}

function clientIp(event) {
  return (
    event?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
    event?.requestContext?.identity?.sourceIp ||
    '0.0.0.0'
  );
}

function rateLimit(key, limit = 20, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  let bucket = store.rate.get(key);
  if (!bucket || now - bucket.start > windowMs) {
    bucket = { start: now, count: 0 };
    store.rate.set(key, bucket);
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

/* ---------- validation ---------- */
function clean(str, max = 200) {
  return String(str || '')
    .normalize('NFKC')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email) && email.length <= 191;
}

function isUsername(u) {
  return /^[a-zA-Z0-9_]{3,50}$/.test(u);
}

function passwordOk(pw) {
  // min 8, at least one letter and one digit
  return typeof pw === 'string' && pw.length >= 8 && pw.length <= 128 && /[A-Za-zА-Яа-я]/.test(pw) && /\d/.test(pw);
}

/* ---------- password hashing (scrypt) ---------- */
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

function verifyPassword(password, stored) {
  try {
    const [algo, saltB64, hashB64] = String(stored).split('$');
    if (algo !== 'scrypt' || !saltB64 || !hashB64) return false;
    const salt = Buffer.from(saltB64, 'base64');
    const expected = Buffer.from(hashB64, 'base64');
    const actual = crypto.scryptSync(password, salt, expected.length, { N: 16384, r: 8, p: 1 });
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/* ---------- JWT (HS256, no deps) ---------- */
function b64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function b64urlJson(obj) {
  return b64url(JSON.stringify(obj));
}

function signJwt(payload) {
  if (!JWT_SECRET || JWT_SECRET.length < 16) {
    throw new Error('AUTH_JWT_SECRET missing or too short');
  }
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL
  };
  const h = b64urlJson(header);
  const p = b64urlJson(body);
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${p}`).digest('base64url');
  return `${h}.${p}.${sig}`;
}

function verifyJwt(token) {
  if (!token || !JWT_SECRET) return null;
  const parts = String(token).split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${p}`).digest('base64url');
  const a = Buffer.from(s);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function bearer(event) {
  const h = event?.headers?.Authorization || event?.headers?.authorization || '';
  const m = String(h).match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : '';
}

/* ---------- public user DTO (never password) ---------- */
function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    display_name: u.display_name || u.username,
    telegram: u.telegram || '',
    role: u.role || 'user',
    created_at: u.created_at,
    last_login_at: u.last_login_at || null
  };
}

/* ---------- S3-compatible storage (Yandex Object Storage) ---------- */
async function s3Request(method, key, bodyBuf = null) {
  const endpoint = (process.env.S3_ENDPOINT || 'https://storage.yandexcloud.net').replace(/\/$/, '');
  const bucket = process.env.S3_BUCKET;
  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;
  const region = process.env.S3_REGION || 'ru-central1';
  if (!bucket || !accessKey || !secretKey) {
    throw new Error('S3 credentials missing');
  }

  const host = endpoint.replace(/^https?:\/\//, '');
  const urlPath = `/${bucket}/${key}`;
  const url = `${endpoint}${urlPath}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = crypto.createHash('sha256').update(bodyBuf || '').digest('hex');
  const canonicalHeaders =
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = [
    method,
    urlPath,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');
  const kDate = crypto.createHmac('sha256', 'AWS4' + secretKey).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update('s3').digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(url, {
    method,
    headers: {
      host,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      authorization,
      ...(bodyBuf ? { 'content-type': 'application/json' } : {})
    },
    body: bodyBuf || undefined
  });
  return res;
}

async function loadUsers() {
  if (STORAGE === 's3') {
    try {
      const res = await s3Request('GET', USERS_KEY);
      if (res.status === 404) return [];
      if (!res.ok) throw new Error(`S3 GET ${res.status}`);
      const text = await res.text();
      const data = JSON.parse(text);
      return Array.isArray(data.users) ? data.users : [];
    } catch (e) {
      if (String(e.message || e).includes('404')) return [];
      console.error('loadUsers s3', e);
      // fall through to memory if already warmed
      if (Array.isArray(store.users)) return store.users;
      throw e;
    }
  }
  if (!Array.isArray(store.users)) store.users = [];
  return store.users;
}

async function saveUsers(users) {
  store.users = users;
  if (STORAGE === 's3') {
    const body = Buffer.from(JSON.stringify({ users, updated_at: new Date().toISOString() }), 'utf8');
    const res = await s3Request('PUT', USERS_KEY, body);
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`S3 PUT ${res.status} ${t.slice(0, 200)}`);
    }
  }
}

function nextId(users) {
  return users.reduce((m, u) => Math.max(m, Number(u.id) || 0), 0) + 1;
}

/* ---------- actions ---------- */
async function register(body, event) {
  const username = clean(body.username, 50).toLowerCase();
  const email = clean(body.email, 191).toLowerCase();
  const password = String(body.password || '');
  const display_name = clean(body.display_name || body.name || username, 100);
  const telegram = clean(body.telegram || '', 64);

  if (!isUsername(username)) {
    return json(400, { ok: false, error: 'Логин: 3–50 символов, латиница, цифры, _' });
  }
  if (!isEmail(email)) {
    return json(400, { ok: false, error: 'Некорректный email' });
  }
  if (!passwordOk(password)) {
    return json(400, { ok: false, error: 'Пароль: минимум 8 символов, буква и цифра' });
  }

  const ip = clientIp(event);
  if (!rateLimit(`reg:${ip}`, 8)) {
    return json(429, { ok: false, error: 'Слишком много попыток. Подождите.' });
  }

  const users = await loadUsers();
  if (users.some((u) => u.username === username)) {
    return json(409, { ok: false, error: 'Такой логин уже занят' });
  }
  if (users.some((u) => u.email === email)) {
    return json(409, { ok: false, error: 'Email уже зарегистрирован' });
  }

  const user = {
    id: nextId(users),
    username,
    email,
    password_hash: hashPassword(password),
    display_name,
    telegram,
    role: 'user',
    reset_token_hash: null,
    reset_token_expires_at: null,
    created_at: new Date().toISOString(),
    last_login_at: null
  };
  users.push(user);
  await saveUsers(users);

  const token = signJwt({ sub: user.id, username: user.username, role: user.role });
  return json(201, { ok: true, token, user: publicUser(user), message: 'Аккаунт создан' });
}

async function login(body, event) {
  const loginId = clean(body.login || body.username || body.email, 191).toLowerCase();
  const password = String(body.password || '');
  const ip = clientIp(event);
  if (!rateLimit(`login:${ip}`, 30)) {
    return json(429, { ok: false, error: 'Слишком много попыток входа' });
  }
  if (!loginId || !password) {
    return json(400, { ok: false, error: 'Укажите логин/email и пароль' });
  }

  const users = await loadUsers();
  const user = users.find((u) => u.username === loginId || u.email === loginId);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return json(401, { ok: false, error: 'Неверный логин или пароль' });
  }

  user.last_login_at = new Date().toISOString();
  await saveUsers(users);

  const token = signJwt({ sub: user.id, username: user.username, role: user.role });
  return json(200, { ok: true, token, user: publicUser(user), message: 'Вход выполнен' });
}

async function resetRequest(body, event) {
  const email = clean(body.email, 191).toLowerCase();
  const ip = clientIp(event);
  if (!rateLimit(`reset:${ip}`, 10)) {
    return json(429, { ok: false, error: 'Слишком много запросов' });
  }
  // Always same response (no email enumeration)
  const generic = {
    ok: true,
    message: 'Если email найден, ссылка для сброса будет действительна 1 час. (В демо-режиме токен возвращается в ответе для теста.)'
  };
  if (!isEmail(email)) return json(200, generic);

  const users = await loadUsers();
  const user = users.find((u) => u.email === email);
  if (!user) return json(200, generic);

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.reset_token_hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.reset_token_expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  await saveUsers(users);

  // Production: send email. Demo: return token once (disable via AUTH_HIDE_RESET_TOKEN=1)
  const payload = { ...generic };
  if (process.env.AUTH_HIDE_RESET_TOKEN !== '1') {
    payload.reset_token = rawToken;
    payload.reset_hint = 'Только для теста API. В проде отправляйте письмом.';
  }
  return json(200, payload);
}

async function resetConfirm(body, event) {
  const token = clean(body.token || body.reset_token, 128);
  const password = String(body.password || '');
  const ip = clientIp(event);
  if (!rateLimit(`resetc:${ip}`, 15)) {
    return json(429, { ok: false, error: 'Слишком много попыток' });
  }
  if (!token || !passwordOk(password)) {
    return json(400, { ok: false, error: 'Нужен токен и новый пароль (8+ симв., буква и цифра)' });
  }
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const users = await loadUsers();
  const user = users.find((u) => u.reset_token_hash === tokenHash);
  if (!user) return json(400, { ok: false, error: 'Токен недействителен' });
  if (!user.reset_token_expires_at || new Date(user.reset_token_expires_at) < new Date()) {
    return json(400, { ok: false, error: 'Срок токена истёк' });
  }
  user.password_hash = hashPassword(password);
  user.reset_token_hash = null;
  user.reset_token_expires_at = null;
  await saveUsers(users);
  return json(200, { ok: true, message: 'Пароль обновлён. Войдите с новым паролем.' });
}

async function me(event) {
  const payload = verifyJwt(bearer(event));
  if (!payload?.sub) return json(401, { ok: false, error: 'Требуется вход' });
  const users = await loadUsers();
  const user = users.find((u) => Number(u.id) === Number(payload.sub));
  if (!user) return json(401, { ok: false, error: 'Сессия недействительна' });
  return json(200, { ok: true, user: publicUser(user) });
}

function logout() {
  // JWT is client-held; client deletes token. Server acknowledges.
  return json(200, { ok: true, message: 'Выход выполнен (токен удалите на клиенте)' });
}

function health() {
  return json(200, {
    ok: true,
    service: 'grillzcustoms-auth',
    storage: STORAGE,
    jwt_configured: Boolean(JWT_SECRET && JWT_SECRET.length >= 16),
    site: SITE_URL
  });
}

/* ---------- handler ---------- */
module.exports.handler = async function handler(event = {}) {
  const method = (event.httpMethod || event.requestContext?.http?.method || 'GET').toUpperCase();
  if (method === 'OPTIONS') {
    return json(204, {});
  }

  const q = query(event);
  const action = clean(q.action || q.a || 'health', 40).toLowerCase();
  const body = method === 'GET' || method === 'HEAD' ? {} : parseBody(event);

  try {
    if (!JWT_SECRET || JWT_SECRET.length < 16) {
      if (action !== 'health') {
        return json(503, {
          ok: false,
          error: 'Сервер не настроен: задайте AUTH_JWT_SECRET (мин. 16 символов) в env функции'
        });
      }
    }

    switch (action) {
      case 'health':
        return health();
      case 'register':
        if (method !== 'POST') return json(405, { ok: false, error: 'POST only' });
        return await register(body, event);
      case 'login':
        if (method !== 'POST') return json(405, { ok: false, error: 'POST only' });
        return await login(body, event);
      case 'reset-request':
      case 'reset_request':
        if (method !== 'POST') return json(405, { ok: false, error: 'POST only' });
        return await resetRequest(body, event);
      case 'reset-confirm':
      case 'reset_confirm':
        if (method !== 'POST') return json(405, { ok: false, error: 'POST only' });
        return await resetConfirm(body, event);
      case 'me':
        return await me(event);
      case 'logout':
        return logout();
      default:
        return json(404, { ok: false, error: 'Unknown action' });
    }
  } catch (err) {
    console.error('auth error', err);
    return json(500, { ok: false, error: 'Внутренняя ошибка сервера' });
  }
};
