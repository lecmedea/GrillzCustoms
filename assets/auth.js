/**
 * Grillz Customs — client auth (JWT)
 * Talks to GRILLZ_AUTH_API; falls back to local demo store only if API empty (dev).
 */
(() => {
  'use strict';

  const TOKEN_KEY = 'gc_auth_jwt_v1';
  const USER_KEY = 'gc_auth_user_v1';
  const DEMO_USERS_KEY = 'gc_auth_demo_users_v1';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function apiBase() {
    return String(window.GRILLZ_AUTH_API || '').replace(/\/$/, '');
  }

  function getToken() {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '';
    } catch {
      return '';
    }
  }

  function setSession(token, user, remember) {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      if (remember) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    } catch { /* private mode */ }
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch { /* */ }
  }

  function cachedUser() {
    try {
      return JSON.parse(sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  /* ---------- demo backend (only when API not configured) ---------- */
  function demoUsers() {
    try {
      return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
    } catch {
      return [];
    }
  }
  function saveDemoUsers(list) {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(list));
  }

  async function scryptHash(password, saltB64) {
    // Web Crypto PBKDF2 as demo stand-in (NOT same as server scrypt — demo only)
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const salt = saltB64
      ? Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0))
      : crypto.getRandomValues(new Uint8Array(16));
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    const hash = btoa(String.fromCharCode(...new Uint8Array(bits)));
    const saltOut = btoa(String.fromCharCode(...salt));
    return `pbkdf2$${saltOut}$${hash}`;
  }

  async function scryptVerify(password, stored) {
    const [, saltB64, hash] = String(stored).split('$');
    if (!saltB64 || !hash) return false;
    const next = await scryptHash(password, saltB64);
    return next === stored;
  }

  function demoToken(user) {
    // Not a real JWT — marked for client demo only
    return 'demo.' + btoa(JSON.stringify({ sub: user.id, username: user.username, exp: Date.now() + 7 * 864e5 }));
  }

  async function demoApi(action, body = {}) {
    const users = demoUsers();
    if (action === 'health') {
      return { ok: true, service: 'demo-local', warning: 'Локальный демо-режим без сервера' };
    }
    if (action === 'register') {
      const username = String(body.username || '').trim().toLowerCase();
      const email = String(body.email || '').trim().toLowerCase();
      if (users.some((u) => u.username === username || u.email === email)) {
        return { ok: false, error: 'Логин или email занят', status: 409 };
      }
      const user = {
        id: users.length + 1,
        username,
        email,
        display_name: body.display_name || body.name || username,
        telegram: body.telegram || '',
        role: 'user',
        password_hash: await scryptHash(body.password),
        created_at: new Date().toISOString(),
        last_login_at: null
      };
      users.push(user);
      saveDemoUsers(users);
      const pub = { ...user };
      delete pub.password_hash;
      return { ok: true, token: demoToken(user), user: pub, message: 'Аккаунт создан (демо)' };
    }
    if (action === 'login') {
      const login = String(body.login || body.username || body.email || '').trim().toLowerCase();
      const user = users.find((u) => u.username === login || u.email === login);
      if (!user || !(await scryptVerify(body.password, user.password_hash))) {
        return { ok: false, error: 'Неверный логин или пароль', status: 401 };
      }
      user.last_login_at = new Date().toISOString();
      saveDemoUsers(users);
      const pub = { ...user };
      delete pub.password_hash;
      return { ok: true, token: demoToken(user), user: pub, message: 'Вход выполнен (демо)' };
    }
    if (action === 'reset-request') {
      const email = String(body.email || '').trim().toLowerCase();
      const user = users.find((u) => u.email === email);
      const out = { ok: true, message: 'Если email найден — используйте токен ниже (демо).' };
      if (user) {
        const raw = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
        user.reset_token = raw;
        user.reset_exp = Date.now() + 3600e3;
        saveDemoUsers(users);
        out.reset_token = raw;
      }
      return out;
    }
    if (action === 'reset-confirm') {
      const user = users.find((u) => u.reset_token === body.token);
      if (!user || (user.reset_exp && user.reset_exp < Date.now())) {
        return { ok: false, error: 'Токен недействителен', status: 400 };
      }
      user.password_hash = await scryptHash(body.password);
      user.reset_token = null;
      user.reset_exp = null;
      saveDemoUsers(users);
      return { ok: true, message: 'Пароль обновлён (демо)' };
    }
    if (action === 'me') {
      const token = getToken();
      if (!token.startsWith('demo.')) return { ok: false, error: 'Требуется вход', status: 401 };
      try {
        const payload = JSON.parse(atob(token.slice(5)));
        const user = users.find((u) => u.id === payload.sub);
        if (!user) return { ok: false, error: 'Сессия недействительна', status: 401 };
        const pub = { ...user };
        delete pub.password_hash;
        return { ok: true, user: pub };
      } catch {
        return { ok: false, error: 'Сессия недействительна', status: 401 };
      }
    }
    if (action === 'logout') return { ok: true, message: 'Выход' };
    return { ok: false, error: 'Unknown', status: 404 };
  }

  async function api(action, { method = 'GET', body = null, auth = false } = {}) {
    const base = apiBase();
    if (!base) {
      return demoApi(action, body || {});
    }
    const url = `${base}?action=${encodeURIComponent(action)}`;
    const headers = { Accept: 'application/json' };
    if (body) headers['Content-Type'] = 'application/json';
    if (auth) {
      const t = getToken();
      if (t) headers.Authorization = `Bearer ${t}`;
    }
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'omit'
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = { ok: false, error: 'Некорректный ответ сервера' };
    }
    data.status = res.status;
    return data;
  }

  /* ---------- UI ---------- */
  function setStatus(el, text, ok) {
    if (!el) return;
    el.textContent = text || '';
    el.classList.toggle('is-ok', !!ok);
    el.classList.toggle('is-err', text && !ok);
  }

  function showPanel(name) {
    $$('[data-auth-panel]').forEach((p) => {
      p.hidden = p.getAttribute('data-auth-panel') !== name;
    });
    $$('[data-auth-tab]').forEach((t) => {
      t.classList.toggle('is-active', t.getAttribute('data-auth-tab') === name);
      t.setAttribute('aria-selected', t.getAttribute('data-auth-tab') === name ? 'true' : 'false');
    });
  }

  function renderProfile(user) {
    const box = $('#authProfileCard');
    if (!box || !user) return;
    box.innerHTML = `
      <div class="profile-head">
        <div class="profile-avatar" aria-hidden="true">${(user.display_name || user.username || '?').slice(0, 1).toUpperCase()}</div>
        <div>
          <h2>${escapeHtml(user.display_name || user.username)}</h2>
          <p class="profile-meta">@${escapeHtml(user.username)} · ${escapeHtml(user.email)}</p>
        </div>
      </div>
      <div class="detail-list">
        <div><strong>ID</strong><span>${user.id}</span></div>
        <div><strong>Telegram</strong><span>${escapeHtml(user.telegram || '—')}</span></div>
        <div><strong>Роль</strong><span>${escapeHtml(user.role || 'user')}</span></div>
        <div><strong>Создан</strong><span>${escapeHtml(formatDate(user.created_at))}</span></div>
        <div><strong>Последний вход</strong><span>${escapeHtml(formatDate(user.last_login_at))}</span></div>
      </div>
      <div class="hero-actions" style="margin-top:16px">
        <a class="btn secondary" href="constructor.html">Конструктор</a>
        <a class="btn secondary" href="entertainment.html">Tamagotchi</a>
        <button type="button" class="btn ghost" id="authLogoutBtn">Выйти</button>
      </div>
    `;
    $('#authLogoutBtn')?.addEventListener('click', onLogout);
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(iso) {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
    } catch {
      return String(iso);
    }
  }

  function validateRegister(data) {
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(data.username || '')) return 'Логин: 3–50, латиница/цифры/_';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) return 'Некорректный email';
    if ((data.password || '').length < 8) return 'Пароль минимум 8 символов';
    if (!/[A-Za-zА-Яа-я]/.test(data.password) || !/\d/.test(data.password)) return 'Пароль: буква и цифра';
    if (data.password !== data.password2) return 'Пароли не совпадают';
    return '';
  }

  async function refreshSession() {
    const token = getToken();
    const guest = $('#authGuest');
    const authed = $('#authAuthed');
    const badge = $('#authModeBadge');
    const base = apiBase();
    if (badge) {
      badge.textContent = base ? 'API: сервер' : 'Демо: localStorage (не для продакшена)';
      badge.classList.toggle('is-demo', !base);
    }
    if (!token) {
      if (guest) guest.hidden = false;
      if (authed) authed.hidden = true;
      return null;
    }
    const res = await api('me', { method: 'GET', auth: true });
    if (!res.ok || !res.user) {
      clearSession();
      if (guest) guest.hidden = false;
      if (authed) authed.hidden = true;
      return null;
    }
    setSession(token, res.user, Boolean(localStorage.getItem(TOKEN_KEY)));
    if (guest) guest.hidden = true;
    if (authed) authed.hidden = false;
    renderProfile(res.user);
    // migrate tamagotchi hint
    const gamePreview = $('#gameSavePreview');
    if (gamePreview) {
      try {
        const state = JSON.parse(localStorage.getItem('grillzTamagotchiStateV1') || 'null');
        if (state) {
          gamePreview.textContent = `Tamagotchi в браузере: ур. ${state.level || 1}, ${Math.floor(state.coins || 0)} coins — после cloud-API можно синхронизировать.`;
        }
      } catch { /* */ }
    }
    return res.user;
  }

  async function onRegister(e) {
    e.preventDefault();
    const form = e.target;
    const status = $('#registerStatus');
    const data = Object.fromEntries(new FormData(form).entries());
    const err = validateRegister(data);
    if (err) {
      setStatus(status, err, false);
      return;
    }
    setStatus(status, 'Регистрация…', true);
    const res = await api('register', {
      method: 'POST',
      body: {
        username: data.username,
        email: data.email,
        password: data.password,
        display_name: data.display_name || data.name || data.username,
        telegram: data.telegram || ''
      }
    });
    if (!res.ok) {
      setStatus(status, res.error || 'Ошибка регистрации', false);
      return;
    }
    setSession(res.token, res.user, true);
    setStatus(status, res.message || 'Готово', true);
    window.GrillzAnalytics?.track('auth_register');
    await refreshSession();
    showPanel('profile');
  }

  async function onLogin(e) {
    e.preventDefault();
    const form = e.target;
    const status = $('#loginStatus');
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus(status, 'Вход…', true);
    const res = await api('login', {
      method: 'POST',
      body: { login: data.login, password: data.password }
    });
    if (!res.ok) {
      setStatus(status, res.error || 'Ошибка входа', false);
      return;
    }
    setSession(res.token, res.user, form.remember?.checked);
    setStatus(status, res.message || 'Вход выполнен', true);
    window.GrillzAnalytics?.track('auth_login');
    await refreshSession();
    showPanel('profile');
  }

  async function onResetRequest(e) {
    e.preventDefault();
    const form = e.target;
    const status = $('#resetStatus');
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus(status, 'Отправка…', true);
    const res = await api('reset-request', { method: 'POST', body: { email: data.email } });
    if (!res.ok) {
      setStatus(status, res.error || 'Ошибка', false);
      return;
    }
    let msg = res.message || 'Готово';
    if (res.reset_token) {
      msg += ` Токен (тест): ${res.reset_token}`;
      const tokenField = $('#resetTokenField');
      if (tokenField) tokenField.value = res.reset_token;
    }
    setStatus(status, msg, true);
  }

  async function onResetConfirm(e) {
    e.preventDefault();
    const form = e.target;
    const status = $('#resetConfirmStatus');
    const data = Object.fromEntries(new FormData(form).entries());
    if ((data.password || '').length < 8 || data.password !== data.password2) {
      setStatus(status, 'Проверьте пароль (8+ и совпадение)', false);
      return;
    }
    setStatus(status, 'Сохранение…', true);
    const res = await api('reset-confirm', {
      method: 'POST',
      body: { token: data.token, password: data.password }
    });
    if (!res.ok) {
      setStatus(status, res.error || 'Ошибка', false);
      return;
    }
    setStatus(status, res.message || 'Пароль обновлён', true);
    showPanel('login');
  }

  async function onLogout() {
    await api('logout', { method: 'POST', auth: true });
    clearSession();
    window.GrillzAnalytics?.track('auth_logout');
    await refreshSession();
    showPanel('login');
  }

  function bindTabs() {
    $$('[data-auth-tab]').forEach((btn) => {
      btn.addEventListener('click', () => showPanel(btn.getAttribute('data-auth-tab')));
    });
  }

  function boot() {
    if (!$('#authRoot')) return;
    bindTabs();
    $('#formRegister')?.addEventListener('submit', onRegister);
    $('#formLogin')?.addEventListener('submit', onLogin);
    $('#formResetRequest')?.addEventListener('submit', onResetRequest);
    $('#formResetConfirm')?.addEventListener('submit', onResetConfirm);

    // deep links
    const hash = (location.hash || '').replace('#', '');
    if (['login', 'register', 'reset', 'profile'].includes(hash)) showPanel(hash);
    else showPanel(getToken() ? 'profile' : 'login');

    refreshSession().then((user) => {
      if (user && (!hash || hash === 'profile')) showPanel('profile');
    });
  }

  window.GrillzAuth = {
    api,
    getToken,
    clearSession,
    refreshSession,
    isLoggedIn: () => Boolean(getToken())
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
