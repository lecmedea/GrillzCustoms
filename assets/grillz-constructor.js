/**
 * Grillz Customs Studio — original configurator engine.
 * PNG tooth layers + own GLB (model-viewer/AR) + GC price list + hash share state.
 */
(() => {
  'use strict';

  const STORAGE_KEY = 'gc_grillz_studio_v1';
  const ORDER_KEY = 'gc_grillz_order_payload';
  const HASH_PREFIX = 'gc1';
  const PRICES_URL = 'data/gc-prices.json';
  const ASSET = {
    teeth: (kind, mat) => `assets/studio/teeth/${kind}_${mat}.png`,
    overlay: (style) => `assets/studio/overlays/${style}.png`,
    mouthBg: 'assets/studio/mouth-bg.jpg'
  };

  const UPPER = ['15', '14', '13', '12', '11', '21', '22', '23', '24', '25'];
  const LOWER = ['45', '44', '43', '42', '41', '31', '32', '33', '34', '35'];
  const ALL_TEETH = [...UPPER, ...LOWER];

  const MAT_COLORS = {
    'yellow-gold': ['#fff3b0', '#f0c43a', '#c48910', '#8a5a00'],
    'white-gold': ['#f7f8fc', '#d8dde8', '#9aa3b5', '#6b7384'],
    'rose-gold': ['#ffd4c8', '#e8a090', '#c46a58', '#8a3d32'],
    silver: ['#f4f6f8', '#c9d0d8', '#8e98a4', '#5c6570'],
    chrome: ['#eef2f6', '#b8c0ca', '#7a8490', '#3f4650'],
    'faux-gold': ['#ffe9a0', '#e0b84a', '#a87a10', '#6b4c00'],
    premium: ['#f8fbff', '#dce7ff', '#a8c0ff', '#6a7eb8']
  };

  const MAT_RGB = {
    'yellow-gold': [0.95, 0.76, 0.2],
    'white-gold': [0.86, 0.88, 0.92],
    'rose-gold': [0.9, 0.55, 0.48],
    silver: [0.78, 0.82, 0.86],
    chrome: [0.72, 0.76, 0.8],
    'faux-gold': [0.9, 0.72, 0.28],
    premium: [0.85, 0.9, 1.0]
  };

  /** Fallback if JSON fails to load — same numbers as data/gc-prices.json */
  const FALLBACK_PRICES = {
    mould: {
      studio: { title: 'Слепок в студии GC', price: 0 },
      mail: { title: 'Слепочный набор почтой', price: 3000 },
      clinic: { title: 'Слепок / 3D-скан из клиники', price: 0 }
    },
    material: {
      chrome: { title: 'КХС / сталь', price: 6500, family: 'metal' },
      'faux-gold': { title: 'Faux gold (покрытие)', price: 7500, family: 'metal' },
      silver: { title: 'Серебро 925', price: 12000, family: 'metal' },
      'yellow-gold': { title: 'Жёлтое золото', price: 32000, family: 'gold' },
      'white-gold': { title: 'Белое золото', price: 36000, family: 'gold' },
      'rose-gold': { title: 'Красное золото', price: 34000, family: 'gold' },
      premium: { title: 'Premium stone set', price: 48000, family: 'stone' }
    },
    styleMetal: {
      polished: { title: 'Polished', price: 0 },
      'open-face': { title: 'Open face', price: 2500 },
      pineapple: { title: 'Pineapple / ice cut', price: 4500 },
      laser: { title: 'Laser', price: 3500 },
      'diamond-dust': { title: 'Diamond dust', price: 6000 }
    },
    styleStone: {
      moissanite: { title: 'Moissanite pave', price: 18000 },
      diamond: { title: 'Diamond pave', price: 55000 }
    },
    purity: {
      '10k': { title: '10K', price: 0 },
      '14k': { title: '14K', price: 0 },
      '18k': { title: '18K', price: 12000 }
    },
    stones: {
      none: { title: 'Без доп. камней', price: 0 },
      si: { title: 'SI', price: 0 },
      vs: { title: 'VS', price: 8000 },
      vvs: { title: 'VVS', price: 18000 }
    },
    setDiscounts: [
      { minTeeth: 6, percent: 5 },
      { minTeeth: 10, percent: 8 },
      { minTeeth: 16, percent: 12 }
    ]
  };

  const PRESETS = [
    { id: 'front6', title: '6 верхних', teeth: ['13', '12', '11', '21', '22', '23'] },
    { id: 'front4', title: '4 верхних', teeth: ['12', '11', '21', '22'] },
    { id: 'upper', title: 'Весь верх', teeth: UPPER.slice() },
    { id: 'lower6', title: '6 нижних', teeth: ['33', '32', '31', '41', '42', '43'] },
    { id: 'clear', title: 'Очистить', teeth: [] }
  ];

  const DEFAULT_SPEC = {
    material: 'yellow-gold',
    style: 'polished',
    purity: '14k',
    stones: 'none'
  };

  const money = new Intl.NumberFormat('ru-RU');
  const byId = (id) => document.getElementById(id);

  let prices = FALLBACK_PRICES;
  let state = createInitialState();
  let viewMode = 'layers'; // layers | model
  let toastTimer = null;
  let needsDraw = true;
  let animFrame = 0;
  let hitMap = [];
  let pointer = { down: false, x: 0, y: 0, moved: false, lastTap: 0, lastId: null };
  let hashSyncLock = false;

  const imgCache = new Map();
  let mouthBg = null;

  function kindFor(id) {
    const n = id[1];
    if (n === '1') return 'incisor';
    if (n === '2') return 'lateral';
    if (n === '3') return 'canine';
    return 'premolar';
  }

  function matMeta(id) {
    return prices.material[id] || FALLBACK_PRICES.material[id];
  }
  function isGold(id) {
    return matMeta(id)?.family === 'gold';
  }
  function isStoneFamily(id) {
    return matMeta(id)?.family === 'stone';
  }
  function stylesFor(matId) {
    return isStoneFamily(matId) ? prices.styleStone : prices.styleMetal;
  }
  function styleMeta(matId, styleId) {
    return stylesFor(matId)[styleId];
  }

  function normalizeSpec(spec) {
    const mat = matMeta(spec.material) ? spec.material : DEFAULT_SPEC.material;
    const styles = stylesFor(mat);
    let style = styles[spec.style] ? spec.style : Object.keys(styles)[0];
    let purity = isGold(mat)
      ? (prices.purity[spec.purity] ? spec.purity : '14k')
      : 'none';
    let stones;
    if (isStoneFamily(mat)) {
      stones = ['si', 'vs', 'vvs'].includes(spec.stones) ? spec.stones : 'vs';
      if (!styles[style]) style = 'moissanite';
    } else if (style === 'diamond-dust' || style === 'pineapple') {
      stones = prices.stones[spec.stones] ? spec.stones : 'none';
    } else {
      stones = 'none';
    }
    return { material: mat, style, purity, stones };
  }

  function toothPrice(spec) {
    const s = normalizeSpec(spec);
    const m = matMeta(s.material)?.price || 0;
    const st = styleMeta(s.material, s.style)?.price || 0;
    const p = isGold(s.material) ? (prices.purity[s.purity]?.price || 0) : 0;
    const stones = prices.stones[s.stones]?.price || 0;
    return m + st + p + stones;
  }

  function setDiscount(count) {
    const list = prices.setDiscounts || [];
    let best = 0;
    list.forEach((d) => {
      if (count >= d.minTeeth) best = Math.max(best, d.percent);
    });
    return best;
  }

  function defaultTooth(overrides = {}) {
    return { on: false, ...normalizeSpec({ ...DEFAULT_SPEC, ...overrides }) };
  }

  function createInitialState() {
    const teeth = {};
    ALL_TEETH.forEach((id) => { teeth[id] = defaultTooth(); });
    teeth['11'] = defaultTooth({ on: true });
    teeth['21'] = defaultTooth({ on: true });
    return {
      version: 1,
      mould: 'studio',
      scope: 'focus',
      focus: '11',
      view: { yaw: 0, pitch: 0 },
      teeth
    };
  }

  function activeTeeth() {
    return ALL_TEETH.filter((id) => state.teeth[id].on);
  }

  function focusedSpec() {
    const id = state.focus && state.teeth[state.focus]?.on ? state.focus : activeTeeth()[0];
    if (!id) return { ...DEFAULT_SPEC };
    return normalizeSpec(state.teeth[id]);
  }

  /* ---------- persistence ---------- */
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* */ }
    syncHash();
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || data.version !== 1 || !data.teeth) return false;
      applyStateData(data);
      return true;
    } catch {
      return false;
    }
  }

  function applyStateData(data) {
    const next = createInitialState();
    if (prices.mould[data.mould]) next.mould = data.mould;
    next.scope = data.scope === 'all' ? 'all' : 'focus';
    next.focus = ALL_TEETH.includes(data.focus) ? data.focus : '11';
    if (data.view) {
      next.view.yaw = Number(data.view.yaw) || 0;
      next.view.pitch = Number(data.view.pitch) || 0;
    }
    ALL_TEETH.forEach((id) => {
      const t = data.teeth?.[id];
      if (!t) return;
      next.teeth[id] = { ...normalizeSpec(t), on: !!t.on };
    });
    state = next;
  }

  /* ---------- hash share state ---------- */
  // Compact format: #gc1.<mould>.<scope>.<focus>.<yawx100>.<pitchx100>.<teeth>
  // tooth token: 11ygpol14n  (id + mat2 + style3 + purity1 + stones1)
  const MAT_CODE = {
    'yellow-gold': 'yg', 'white-gold': 'wg', 'rose-gold': 'rg',
    silver: 'ag', chrome: 'cr', 'faux-gold': 'fx', premium: 'pr'
  };
  const MAT_FROM = Object.fromEntries(Object.entries(MAT_CODE).map(([k, v]) => [v, k]));
  const STY_CODE = {
    polished: 'pol', pineapple: 'pin', 'open-face': 'opf', laser: 'las',
    'diamond-dust': 'ddt', moissanite: 'moi', diamond: 'dia'
  };
  const STY_FROM = Object.fromEntries(Object.entries(STY_CODE).map(([k, v]) => [v, k]));
  const PUR_CODE = { '10k': '0', '14k': '4', '18k': '8', none: 'n' };
  const PUR_FROM = { '0': '10k', '4': '14k', '8': '18k', n: 'none' };
  const STN_CODE = { none: 'n', si: 's', vs: 'v', vvs: 'x' };
  const STN_FROM = { n: 'none', s: 'si', v: 'vs', x: 'vvs' };

  function encodeHash() {
    const teeth = activeTeeth().map((id) => {
      const t = normalizeSpec(state.teeth[id]);
      return (
        id +
        (MAT_CODE[t.material] || 'yg') +
        (STY_CODE[t.style] || 'pol') +
        (PUR_CODE[t.purity] || 'n') +
        (STN_CODE[t.stones] || 'n')
      );
    }).join('_');
    const yaw = Math.round(state.view.yaw * 100);
    const pitch = Math.round(state.view.pitch * 100);
    return [
      HASH_PREFIX,
      state.mould,
      state.scope === 'all' ? 'a' : 'f',
      state.focus || '11',
      yaw,
      pitch,
      teeth || '-'
    ].join('.');
  }

  function decodeHash(hash) {
    const raw = (hash || '').replace(/^#/, '');
    if (!raw.startsWith(HASH_PREFIX + '.')) return false;
    const parts = raw.split('.');
    if (parts.length < 7) return false;
    const [, mould, scope, focus, yaw, pitch, teethPart] = parts;
    const data = createInitialState();
    if (prices.mould[mould] || FALLBACK_PRICES.mould[mould]) data.mould = mould;
    data.scope = scope === 'a' ? 'all' : 'focus';
    data.focus = ALL_TEETH.includes(focus) ? focus : '11';
    data.view.yaw = (Number(yaw) || 0) / 100;
    data.view.pitch = (Number(pitch) || 0) / 100;
    ALL_TEETH.forEach((id) => { data.teeth[id] = defaultTooth(); });
    if (teethPart && teethPart !== '-') {
      teethPart.split('_').forEach((tok) => {
        const m = tok.match(/^(\d{2})([a-z]{2})([a-z]{3})([0-9nx])([nsvx])$/i);
        if (!m) return;
        const id = m[1];
        if (!ALL_TEETH.includes(id)) return;
        const material = MAT_FROM[m[2]] || 'yellow-gold';
        const style = STY_FROM[m[3]] || 'polished';
        const purity = PUR_FROM[m[4]] || '14k';
        const stones = STN_FROM[m[5]] || 'none';
        data.teeth[id] = { ...normalizeSpec({ material, style, purity, stones }), on: true };
      });
    }
    state = data;
    return true;
  }

  function syncHash() {
    if (hashSyncLock) return;
    const next = '#' + encodeHash();
    if (location.hash === next) return;
    history.replaceState(null, '', next);
  }

  function shareUrl() {
    return `${location.origin}${location.pathname}${location.search}#${encodeHash()}`;
  }

  /* ---------- quote ---------- */
  function buildQuote() {
    const teeth = activeTeeth();
    const mould = prices.mould[state.mould] || FALLBACK_PRICES.mould[state.mould];
    let teethTotal = 0;
    const lines = teeth.map((id) => {
      const t = normalizeSpec(state.teeth[id]);
      const p = toothPrice(t);
      teethTotal += p;
      const mat = matMeta(t.material)?.title || t.material;
      const style = styleMeta(t.material, t.style)?.title || t.style;
      const purity = isGold(t.material) ? (prices.purity[t.purity]?.title || '') : '—';
      const stones = prices.stones[t.stones]?.title || '—';
      return `${id}: ${mat} · ${style} · ${purity} · ${stones} → ${money.format(p)} ₽`;
    });
    const disc = setDiscount(teeth.length);
    const afterDisc = Math.round(teethTotal * (1 - disc / 100));
    const total = afterDisc + (mould?.price || 0);
    return {
      teeth,
      teethTotal,
      disc,
      afterDisc,
      mouldPrice: mould?.price || 0,
      total,
      mouldTitle: mould?.title || state.mould,
      lines,
      text:
        `Grillz Customs · прайс-референс\n` +
        `Слепок: ${mould?.title || state.mould}\n` +
        `Зубы (${teeth.length}): ${teeth.join(', ') || '—'}\n` +
        (lines.length ? lines.join('\n') + '\n' : '') +
        (disc ? `Скидка за сет: −${disc}%\n` : '') +
        `Прайс GC: ${money.format(total)} ₽\n` +
        `Share: ${shareUrl()}\n` +
        `*не оферта; финал после слепка/веса`
    };
  }

  /* ---------- mutations ---------- */
  function applySpecToTooth(id, partial) {
    const cur = state.teeth[id];
    const next = normalizeSpec({
      material: partial.material ?? cur.material,
      style: partial.style ?? cur.style,
      purity: partial.purity ?? cur.purity,
      stones: partial.stones ?? cur.stones
    });
    state.teeth[id] = { ...next, on: cur.on };
  }

  function applySpec(partial) {
    if (state.scope === 'all') {
      activeTeeth().forEach((id) => applySpecToTooth(id, partial));
    } else {
      const id = state.focus && state.teeth[state.focus] ? state.focus : null;
      if (id && state.teeth[id].on) applySpecToTooth(id, partial);
      else activeTeeth().forEach((tid) => applySpecToTooth(tid, partial));
    }
  }

  function setToothOn(id, on, { focus = true } = {}) {
    state.teeth[id].on = on;
    if (on) {
      state.teeth[id] = { ...normalizeSpec(state.teeth[id]), on: true };
      if (focus) state.focus = id;
    } else if (state.focus === id) {
      state.focus = activeTeeth()[0] || id;
    }
  }

  function toggleTooth(id) {
    setToothOn(id, !state.teeth[id].on);
  }

  function applyPreset(presetId) {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const set = new Set(preset.teeth);
    ALL_TEETH.forEach((id) => {
      state.teeth[id].on = set.has(id);
      if (set.has(id)) state.teeth[id] = { ...normalizeSpec(state.teeth[id]), on: true };
    });
    state.focus = preset.teeth[0] || state.focus;
  }

  /* ---------- UI ---------- */
  function toast(msg) {
    let el = document.querySelector('.studio-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'studio-toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2200);
  }

  function renderMould() {
    const root = byId('mouldChoices');
    if (!root) return;
    root.innerHTML = '';
    Object.entries(prices.mould).forEach(([id, m]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-card' + (state.mould === id ? ' is-active' : '');
      btn.innerHTML = `<strong>${m.title}</strong><span>${m.price ? `+${money.format(m.price)} ₽` : 'входит в заказ'}</span>`;
      btn.addEventListener('click', () => { state.mould = id; commit(); });
      root.appendChild(btn);
    });
  }

  function renderPresets() {
    const root = byId('presetRow');
    if (!root) return;
    root.innerHTML = '';
    PRESETS.forEach((p) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'preset-chip';
      btn.textContent = p.title;
      btn.addEventListener('click', () => {
        applyPreset(p.id);
        commit();
        window.GrillzAnalytics?.track('constructor_preset', { id: p.id });
      });
      root.appendChild(btn);
    });
  }

  function renderFdiRow(el, list) {
    if (!el) return;
    el.innerHTML = '';
    list.forEach((id) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fdi-chip'
        + (state.teeth[id].on ? ' is-on' : '')
        + (state.focus === id ? ' is-focus' : '');
      btn.textContent = id;
      btn.setAttribute('aria-pressed', state.teeth[id].on ? 'true' : 'false');
      btn.addEventListener('click', () => {
        if (state.teeth[id].on && state.focus === id) toggleTooth(id);
        else if (state.teeth[id].on) state.focus = id;
        else setToothOn(id, true);
        commit();
      });
      el.appendChild(btn);
    });
  }

  function renderScope() {
    const label = byId('focusLabel');
    if (label) label.textContent = state.focus || '—';
    const focusBtn = byId('scopeFocus');
    const allBtn = byId('scopeAll');
    if (focusBtn) {
      focusBtn.classList.toggle('is-active', state.scope === 'focus');
      focusBtn.onclick = () => { state.scope = 'focus'; commit(); };
    }
    if (allBtn) {
      allBtn.classList.toggle('is-active', state.scope === 'all');
      allBtn.onclick = () => { state.scope = 'all'; commit(); };
    }
  }

  function renderMaterials() {
    const root = byId('materialChoices');
    if (!root) return;
    const spec = focusedSpec();
    root.innerHTML = '';
    Object.entries(prices.material).forEach(([id, m]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch-card' + (spec.material === id ? ' is-active' : '');
      const orb = document.createElement('span');
      orb.className = 'swatch-orb';
      const c = MAT_COLORS[id] || MAT_COLORS['yellow-gold'];
      orb.style.background = `radial-gradient(circle at 30% 28%, ${c[0]}, ${c[1]} 42%, ${c[2]} 72%, ${c[3]})`;
      const text = document.createElement('span');
      text.innerHTML = `${m.title}<small>${money.format(m.price)} ₽ / зуб</small>`;
      btn.append(orb, text);
      btn.addEventListener('click', () => { applySpec({ material: id }); commit(); });
      root.appendChild(btn);
    });
  }

  function renderStyles() {
    const root = byId('styleChoices');
    if (!root) return;
    const spec = focusedSpec();
    const list = stylesFor(spec.material);
    root.innerHTML = '';
    Object.entries(list).forEach(([id, s]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'style-card' + (spec.style === id ? ' is-active' : '');
      btn.innerHTML = `<strong>${s.title}</strong><span>${s.price ? `+${money.format(s.price)} ₽` : 'в базе металла'}</span>`;
      btn.addEventListener('click', () => { applySpec({ style: id }); commit(); });
      root.appendChild(btn);
    });
  }

  function renderPurity() {
    const block = byId('blockPurity');
    const root = byId('purityChoices');
    const spec = focusedSpec();
    const show = isGold(spec.material) && activeTeeth().length > 0;
    if (block) block.classList.toggle('is-hidden', !show);
    if (!root || !show) return;
    root.innerHTML = '';
    Object.entries(prices.purity).forEach(([id, p]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pill-chip' + (spec.purity === id ? ' is-active' : '');
      btn.textContent = p.title + (p.price ? ` +${money.format(p.price)}` : '');
      btn.addEventListener('click', () => { applySpec({ purity: id }); commit(); });
      root.appendChild(btn);
    });
  }

  function renderStones() {
    const block = byId('blockStones');
    const root = byId('stonesChoices');
    const spec = focusedSpec();
    const show = (isStoneFamily(spec.material) || spec.style === 'diamond-dust' || spec.style === 'pineapple')
      && activeTeeth().length > 0;
    if (block) block.classList.toggle('is-hidden', !show);
    if (!root || !show) return;
    root.innerHTML = '';
    const entries = Object.entries(prices.stones).filter(([id]) =>
      isStoneFamily(spec.material) ? id !== 'none' : true
    );
    entries.forEach(([id, s]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pill-chip' + (spec.stones === id ? ' is-active' : '');
      btn.textContent = s.title + (s.price ? ` +${money.format(s.price)}` : '');
      btn.addEventListener('click', () => { applySpec({ stones: id }); commit(); });
      root.appendChild(btn);
    });
  }

  function renderSummary() {
    const root = byId('studioSummary');
    if (!root) return;
    const q = buildQuote();
    root.innerHTML = `
      <h3>Прайс GC</h3>
      <div class="sum-grid">
        <div>Слепок: <strong>${q.mouldTitle}</strong>${q.mouldPrice ? ` (+${money.format(q.mouldPrice)} ₽)` : ''}</div>
        <div>Зубов: <strong>${q.teeth.length}</strong>${q.disc ? ` · скидка сета −${q.disc}%` : ''}</div>
      </div>
      <div class="sum-price">${money.format(q.total)} ₽</div>
      <div class="sum-teeth">${q.lines.slice(0, 8).join('<br>')}${q.lines.length > 8 ? '<br>…' : ''}</div>
    `;
  }

  function renderAllUi() {
    renderMould();
    renderPresets();
    renderFdiRow(byId('fdiUpper'), UPPER);
    renderFdiRow(byId('fdiLower'), LOWER);
    renderScope();
    renderMaterials();
    renderStyles();
    renderPurity();
    renderStones();
    renderSummary();
    needsDraw = true;
    updateModelMaterials();
  }

  function commit() {
    save();
    renderAllUi();
  }

  /* ---------- image loading ---------- */
  function loadImage(src) {
    if (imgCache.has(src)) return imgCache.get(src);
    const p = new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => resolve(null);
      im.src = src;
    });
    imgCache.set(src, p);
    return p;
  }

  async function preloadAssets() {
    mouthBg = await loadImage(ASSET.mouthBg);
    const kinds = ['incisor', 'lateral', 'canine', 'premolar'];
    const mats = Object.keys(prices.material).concat(['enamel']);
    const styles = ['polished', 'pineapple', 'open-face', 'laser', 'diamond-dust', 'moissanite', 'diamond'];
    const jobs = [];
    kinds.forEach((k) => mats.forEach((m) => jobs.push(loadImage(ASSET.teeth(k, m === 'enamel' ? 'enamel' : m)))));
    styles.forEach((s) => jobs.push(loadImage(ASSET.overlay(s))));
    await Promise.all(jobs);
  }

  /* ---------- canvas 2D with PNG layers ---------- */
  function archLayout(list, cx, cy, radiusX, radiusY, size, isUpper) {
    const n = list.length;
    return list.map((id, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const ang = Math.PI * (0.18 + t * 0.64);
      const x = cx + Math.cos(ang) * radiusX;
      const y = cy + Math.sin(ang) * radiusY * 0.55;
      const rot = (t - 0.5) * (isUpper ? 0.45 : -0.45);
      const scale = size * (0.92 + Math.sin(ang) * 0.1);
      return { id, x, y, rot, scale, upper: isUpper };
    });
  }

  function drawToothLayer(ctx, layout, toothState, images) {
    const { id, x, y, rot, scale, upper } = layout;
    const kind = kindFor(id);
    const on = toothState.on;
    const mat = on ? toothState.material : 'enamel';
    const base = images.get(ASSET.teeth(kind, mat));
    const overlay = on ? images.get(ASSET.overlay(toothState.style)) : null;
    const s = scale * 1.35;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    if (!upper) ctx.scale(1, -1);

    if (base) {
      ctx.drawImage(base, -s / 2, -s / 2, s, s);
    } else {
      // fallback rect
      ctx.fillStyle = on ? '#e0b020' : '#e8e0d0';
      ctx.fillRect(-s * 0.3, -s * 0.4, s * 0.6, s * 0.8);
    }

    if (overlay && on && toothState.style !== 'polished') {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = toothState.style === 'open-face' ? 0.95 : 0.75;
      ctx.drawImage(overlay, -s / 2, -s / 2, s, s);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    if (state.focus === id) {
      ctx.strokeStyle = 'rgba(126,224,255,0.95)';
      ctx.lineWidth = Math.max(2, s * 0.035);
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(-s / 2, -s / 2, s, s);
      ctx.setLineDash([]);
    }

    ctx.restore();

    // label
    ctx.save();
    ctx.font = `700 ${Math.max(10, scale * 0.22)}px system-ui,sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = on ? 'rgba(20,12,0,0.85)' : 'rgba(40,30,20,0.55)';
    ctx.fillText(id, x, y + (upper ? scale * 0.22 : -scale * 0.22));
    ctx.restore();

    hitMap.push({ id, x, y, r: scale * 0.62 });
  }

  async function resolveImages() {
    const map = new Map();
    const srcs = new Set();
    ALL_TEETH.forEach((id) => {
      const t = state.teeth[id];
      const kind = kindFor(id);
      srcs.add(ASSET.teeth(kind, t.on ? t.material : 'enamel'));
      if (t.on) srcs.add(ASSET.overlay(t.style));
    });
    await Promise.all([...srcs].map(async (s) => {
      map.set(s, await loadImage(s));
    }));
    return map;
  }

  async function drawScene() {
    const c = byId('mouthCanvas');
    if (!c || viewMode !== 'layers') return;
    const ctx = c.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = c.clientWidth || 960;
    const cssH = Math.round(cssW * 0.75);
    const w = Math.round(cssW * dpr);
    const h = Math.round(cssH * dpr);
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    c.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = cssW;
    const H = cssH;

    if (mouthBg) {
      ctx.drawImage(mouthBg, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#0a0406';
      ctx.fillRect(0, 0, W, H);
    }

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(state.view.yaw * 0.35);
    ctx.scale(1 + state.view.pitch * 0.02, 1 - Math.abs(state.view.yaw) * 0.04);
    ctx.translate(-W / 2, -H / 2);

    hitMap = [];
    const images = await resolveImages();
    const base = Math.min(W, H) * 0.078;
    const upperLayout = archLayout(UPPER, W * 0.5, H * 0.34, W * 0.34, H * 0.16, base, true);
    const lowerLayout = archLayout(LOWER, W * 0.5, H * 0.64, W * 0.32, H * 0.14, base * 0.95, false);

    upperLayout.forEach((L) => {
      L.y -= H * 0.015;
      drawToothLayer(ctx, L, state.teeth[L.id], images);
    });
    lowerLayout.forEach((L) => {
      L.y += H * 0.015;
      drawToothLayer(ctx, L, state.teeth[L.id], images);
    });
    ctx.restore();

    if (!activeTeeth().length) {
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = '700 16px system-ui,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Выберите зубы для сета', W / 2, H * 0.5);
    }
    needsDraw = false;
  }

  function loop() {
    if (needsDraw && viewMode === 'layers') {
      drawScene();
    }
    animFrame = requestAnimationFrame(loop);
  }

  function hitTest(clientX, clientY) {
    const c = byId('mouthCanvas');
    if (!c) return null;
    const rect = c.getBoundingClientRect();
    const W = c.clientWidth || rect.width;
    const H = c.clientHeight || rect.height;
    let x = ((clientX - rect.left) / rect.width) * W;
    let y = ((clientY - rect.top) / rect.height) * H;
    const cx = W / 2;
    const cy = H / 2;
    const yaw = state.view.yaw * 0.35;
    const sx = 1 + state.view.pitch * 0.02;
    const sy = 1 - Math.abs(state.view.yaw) * 0.04;
    let lx = (x - cx) / (sx || 1);
    let ly = (y - cy) / (sy || 1);
    const cos = Math.cos(-yaw);
    const sin = Math.sin(-yaw);
    x = cx + lx * cos - ly * sin;
    y = cy + lx * sin + ly * cos;
    let best = null;
    let bestD = Infinity;
    hitMap.forEach((h) => {
      const d = Math.hypot(x - h.x, y - h.y);
      if (d < h.r && d < bestD) {
        bestD = d;
        best = h.id;
      }
    });
    return best;
  }

  function bindCanvas() {
    const vp = byId('stageViewport');
    if (!vp) return;
    const onDown = (e) => {
      if (viewMode !== 'layers') return;
      const pt = e.touches ? e.touches[0] : e;
      pointer.down = true;
      pointer.moved = false;
      pointer.x = pt.clientX;
      pointer.y = pt.clientY;
      vp.classList.add('is-dragging');
    };
    const onMove = (e) => {
      if (!pointer.down || viewMode !== 'layers') return;
      const pt = e.touches ? e.touches[0] : e;
      const dx = pt.clientX - pointer.x;
      const dy = pt.clientY - pointer.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) pointer.moved = true;
      if (pointer.moved) {
        state.view.yaw = Math.max(-0.55, Math.min(0.55, state.view.yaw + dx * 0.004));
        state.view.pitch = Math.max(-0.35, Math.min(0.35, state.view.pitch + dy * 0.004));
        pointer.x = pt.clientX;
        pointer.y = pt.clientY;
        needsDraw = true;
        e.preventDefault();
      }
    };
    const onUp = (e) => {
      if (!pointer.down) return;
      pointer.down = false;
      vp.classList.remove('is-dragging');
      if (viewMode !== 'layers') return;
      if (pointer.moved) { save(); return; }
      const pt = e.changedTouches ? e.changedTouches[0] : e;
      const id = hitTest(pt.clientX, pt.clientY);
      if (!id) return;
      const now = Date.now();
      const dbl = pointer.lastId === id && now - pointer.lastTap < 320;
      pointer.lastTap = now;
      pointer.lastId = id;
      if (dbl) {
        if (!state.teeth[id].on) setToothOn(id, true);
        else state.focus = id;
      } else toggleTooth(id);
      commit();
      window.GrillzAnalytics?.track('constructor_tooth', { id, on: state.teeth[id].on });
    };
    vp.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    vp.addEventListener('touchstart', onDown, { passive: true });
    vp.addEventListener('touchmove', onMove, { passive: false });
    vp.addEventListener('touchend', onUp);
    window.addEventListener('resize', () => { needsDraw = true; });
  }

  /* ---------- 3D model-viewer ---------- */
  function setViewMode(mode) {
    viewMode = mode === 'model' ? 'model' : 'layers';
    const vp = byId('stageViewport');
    const canvas = byId('mouthCanvas');
    const model = byId('grillzModel');
    const b2 = byId('btnView2d');
    const b3 = byId('btnView3d');
    vp?.setAttribute('data-mode', viewMode);
    if (canvas) canvas.hidden = viewMode !== 'layers';
    if (model) {
      if (viewMode === 'model') {
        model.removeAttribute('hidden');
        model.style.display = 'block';
      } else {
        model.setAttribute('hidden', '');
        model.style.display = 'none';
      }
    }
    b2?.classList.toggle('is-active', viewMode === 'layers');
    b3?.classList.toggle('is-active', viewMode === 'model');
    if (viewMode === 'layers') needsDraw = true;
    else updateModelMaterials();
  }

  function updateModelMaterials() {
    const mv = byId('grillzModel');
    if (!mv || viewMode !== 'model') return;
    const apply = () => {
      try {
        const model = mv.model;
        if (!model) return;
        // Material 0 = metal default; recolor by majority / focus tooth
        const focus = state.focus && state.teeth[state.focus]?.on
          ? state.teeth[state.focus]
          : activeTeeth()[0] && state.teeth[activeTeeth()[0]];
        const matId = focus ? focus.material : 'yellow-gold';
        const rgb = MAT_RGB[matId] || MAT_RGB['yellow-gold'];
        const mat0 = model.materials?.[0];
        if (mat0?.pbrMetallicRoughness) {
          mat0.pbrMetallicRoughness.setBaseColorFactor([rgb[0], rgb[1], rgb[2], 1]);
          mat0.pbrMetallicRoughness.setMetallicFactor(isStoneFamily(matId) ? 0.35 : 1);
          mat0.pbrMetallicRoughness.setRoughnessFactor(
            focus?.style === 'polished' ? 0.22 : focus?.style === 'pineapple' ? 0.45 : 0.32
          );
        }
        // Toggle tooth nodes visibility via scene graph
        const scene = mv.model?.scene || mv.model;
        const walk = (node) => {
          if (!node) return;
          const name = node.name || '';
          if (name.startsWith('tooth_')) {
            const id = name.replace('tooth_', '');
            const on = !!state.teeth[id]?.on;
            // model-viewer scene graph
            if (node.visible !== undefined) node.visible = on;
            if (node.scale) {
              // hide by scale if no visible flag
              const s = on ? 1 : 0.001;
              if (typeof node.scale.set === 'function') node.scale.set(s, s, s);
            }
          }
          const children = node.children || [];
          children.forEach(walk);
        };
        // three.js scene behind model-viewer
        const symbolScene = mv[Object.getOwnPropertySymbols(mv).find(() => false)]
          || mv.model?.scene;
        if (mv.model?.materials) {
          // try scene from modelViewer internals
          const root = mv.modelScene || mv[_mvSceneKey(mv)];
          if (root) walk(root);
        }
        // Official-ish approach: iterate model.materials only for color;
        // for nodes use updateComplete + symbol tree
        try {
          // eslint-disable-next-line no-underscore-dangle
          const scene = mv.modelScene || (mv.shadowRoot && null);
          void scene;
        } catch (_) { /* */ }

        // Use model-viewer variant-less approach: CSS filter on viewer as backup
        mv.style.filter = isGold(matId)
          ? 'saturate(1.15) contrast(1.05)'
          : matId === 'chrome' || matId === 'silver'
            ? 'saturate(0.35) brightness(1.08)'
            : 'none';
      } catch (err) {
        console.warn('model materials', err);
      }
    };

    if (mv.loaded) apply();
    else mv.addEventListener('load', apply, { once: true });

    // Also try scene-graph API when available (model-viewer 3+)
    mv.updateComplete?.then?.(() => {
      try {
        // Hide inactive teeth via transform if we can find nodes
        const names = ALL_TEETH.map((id) => `tooth_${id}`);
        names.forEach((name) => {
          const id = name.replace('tooth_', '');
          const on = !!state.teeth[id]?.on;
          // model-viewer experimental: getAvailableVariants etc. — fallback scale via CSS not possible per-node
          void on;
        });
        apply();
      } catch (_) { /* */ }
    });
  }

  function _mvSceneKey() { return null; }

  /* ---------- actions ---------- */
  async function copyRef() {
    const q = buildQuote();
    try {
      await navigator.clipboard.writeText(q.text);
      toast('Референс + прайс скопированы');
    } catch {
      toast('Не удалось скопировать');
    }
    window.GrillzAnalytics?.track('constructor_copy', { teeth: q.teeth.length, total: q.total });
  }

  async function copyShare() {
    syncHash();
    const url = shareUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast('Share-link скопирован');
    } catch {
      toast(url);
    }
    window.GrillzAnalytics?.track('constructor_share', { teeth: activeTeeth().length });
  }

  function sendOrder() {
    const q = buildQuote();
    const payload = {
      createdAt: new Date().toISOString(),
      mould: state.mould,
      teeth: q.teeth.map((id) => ({ id, ...normalizeSpec(state.teeth[id]), price: toothPrice(state.teeth[id]) })),
      total: q.total,
      share: shareUrl(),
      text: q.text
    };
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(payload));
      sessionStorage.setItem(ORDER_KEY, q.text);
    } catch (_) { /* */ }
    window.GrillzAnalytics?.track('constructor_order', { teeth: q.teeth.length, total: q.total });
    window.location.href = 'index.html?from=studio#order';
  }

  function resetBuild() {
    if (!window.confirm('Сбросить сборку?')) return;
    state = createInitialState();
    commit();
    toast('Сборка сброшена');
  }

  function resetView() {
    state.view = { yaw: 0, pitch: 0 };
    const mv = byId('grillzModel');
    if (mv) {
      mv.cameraOrbit = '0deg 75deg 105%';
      mv.jumpCameraToGoal?.();
    }
    needsDraw = true;
    save();
    toast('Ракурс сброшен');
  }

  async function capturePng() {
    if (viewMode === 'model') {
      const mv = byId('grillzModel');
      try {
        const blob = await mv?.toBlob?.({ idealAspect: true });
        if (blob) {
          const a = document.createElement('a');
          a.download = `grillz-3d-${Date.now()}.png`;
          a.href = URL.createObjectURL(blob);
          a.click();
          toast('3D-снимок сохранён');
          return;
        }
      } catch (_) { /* fallthrough */ }
    }
    needsDraw = true;
    await drawScene();
    const c = byId('mouthCanvas');
    if (!c) return;
    try {
      const a = document.createElement('a');
      a.download = `grillz-studio-${Date.now()}.png`;
      a.href = c.toDataURL('image/png');
      a.click();
      toast('Снимок сохранён');
    } catch {
      toast('Снимок недоступен');
    }
  }

  function toggleFullscreen() {
    const stage = byId('studioStage');
    if (!stage) return;
    const on = stage.classList.toggle('is-fs');
    document.body.classList.toggle('studio-fs-lock', on);
    byId('stageViewport')?.classList.toggle('is-fullscreen', on);
    needsDraw = true;
  }

  /* ---------- boot ---------- */
  async function loadPrices() {
    try {
      const res = await fetch(PRICES_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('prices http');
      const data = await res.json();
      if (data?.material) prices = data;
    } catch {
      prices = FALLBACK_PRICES;
    }
  }

  async function boot() {
    if (!byId('grillzStudio')) return;
    await loadPrices();

    hashSyncLock = true;
    const fromHash = decodeHash(location.hash);
    if (!fromHash) loadLocal();
    hashSyncLock = false;

    await preloadAssets();
    renderAllUi();
    bindCanvas();
    setViewMode('layers');

    byId('btnCopyRef')?.addEventListener('click', copyRef);
    byId('btnShare')?.addEventListener('click', copyShare);
    byId('btnSharePanel')?.addEventListener('click', copyShare);
    byId('btnSendOrder')?.addEventListener('click', sendOrder);
    byId('btnResetBuild')?.addEventListener('click', resetBuild);
    byId('btnResetView')?.addEventListener('click', resetView);
    byId('btnCapture')?.addEventListener('click', capturePng);
    byId('btnFullscreen')?.addEventListener('click', toggleFullscreen);
    byId('btnView2d')?.addEventListener('click', () => setViewMode('layers'));
    byId('btnView3d')?.addEventListener('click', () => setViewMode('model'));

    window.addEventListener('hashchange', () => {
      hashSyncLock = true;
      if (decodeHash(location.hash)) {
        renderAllUi();
        toast('Сборка из ссылки загружена');
      }
      hashSyncLock = false;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && byId('studioStage')?.classList.contains('is-fs')) {
        toggleFullscreen();
      }
    });

    const mv = byId('grillzModel');
    mv?.addEventListener('load', () => updateModelMaterials());

    loop();
    syncHash();
    requestAnimationFrame(() => { needsDraw = true; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
