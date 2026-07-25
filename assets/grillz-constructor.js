/**
 * Grillz Customs — Studio configurator
 * Original client-side engine: per-tooth FDI state, live canvas preview, pricing.
 * Not derived from third-party configurator plugins or vendor assets.
 */
(() => {
  'use strict';

  const STORAGE_KEY = 'gc_grillz_studio_v1';
  const ORDER_KEY = 'gc_grillz_order_payload';

  const UPPER = ['15', '14', '13', '12', '11', '21', '22', '23', '24', '25'];
  const LOWER = ['45', '44', '43', '42', '41', '31', '32', '33', '34', '35'];
  const ALL_TEETH = [...UPPER, ...LOWER];

  const TOOTH_LABEL = {
    '11': 'Верх. центр. 11', '12': 'Верх. лат. 12', '13': 'Верх. клык 13',
    '14': 'Верх. премол. 14', '15': 'Верх. премол. 15',
    '21': 'Верх. центр. 21', '22': 'Верх. лат. 22', '23': 'Верх. клык 23',
    '24': 'Верх. премол. 24', '25': 'Верх. премол. 25',
    '31': 'Ниж. центр. 31', '32': 'Ниж. лат. 32', '33': 'Ниж. клык 33',
    '34': 'Ниж. премол. 34', '35': 'Ниж. премол. 35',
    '41': 'Ниж. центр. 41', '42': 'Ниж. лат. 42', '43': 'Ниж. клык 43',
    '44': 'Ниж. премол. 44', '45': 'Ниж. премол. 45'
  };

  /** Catalog — keys and copy are GC-owned product language */
  const CATALOG = {
    mould: [
      { id: 'studio', title: 'В студии', note: 'Слепок у нас, точнее посадка', price: 0 },
      { id: 'mail', title: 'Набор почтой', note: 'Слепочная масса + инструкция', price: 2500 },
      { id: 'clinic', title: 'Через клинику', note: 'Работаем со слепком вашей клиники', price: 0 }
    ],
    material: [
      { id: 'yellow-gold', title: 'Жёлтое золото', short: 'YG', price: 9000, family: 'gold',
        colors: ['#fff3b0', '#f0c43a', '#c48910', '#8a5a00'] },
      { id: 'white-gold', title: 'Белое золото', short: 'WG', price: 11000, family: 'gold',
        colors: ['#f7f8fc', '#d8dde8', '#9aa3b5', '#6b7384'] },
      { id: 'rose-gold', title: 'Красное золото', short: 'RG', price: 10500, family: 'gold',
        colors: ['#ffd4c8', '#e8a090', '#c46a58', '#8a3d32'] },
      { id: 'silver', title: 'Серебро 925', short: 'Ag', price: 5200, family: 'metal',
        colors: ['#f4f6f8', '#c9d0d8', '#8e98a4', '#5c6570'] },
      { id: 'chrome', title: 'Хром / сталь', short: 'Cr', price: 4600, family: 'metal',
        colors: ['#eef2f6', '#b8c0ca', '#7a8490', '#3f4650'] },
      { id: 'faux-gold', title: 'Faux gold', short: 'FX', price: 2900, family: 'metal',
        colors: ['#ffe9a0', '#e0b84a', '#a87a10', '#6b4c00'] },
      { id: 'premium', title: 'Premium stone set', short: 'PR', price: 16000, family: 'stone',
        colors: ['#f8fbff', '#dce7ff', '#a8c0ff', '#6a7eb8'] }
    ],
    styleMetal: [
      { id: 'polished', title: 'Polished', note: 'Зеркальная полировка', price: 0 },
      { id: 'pineapple', title: 'Pineapple', note: 'Рельеф «ананас» / ice cut', price: 1800 },
      { id: 'open-face', title: 'Open face', note: 'Открытое окошко по эмали', price: 1400 },
      { id: 'laser', title: 'Laser', note: 'Лазерная гравировка', price: 2500 },
      { id: 'diamond-dust', title: 'Diamond dust', note: 'Алмазная пыль по плоскости', price: 3200 }
    ],
    styleStone: [
      { id: 'moissanite', title: 'Moissanite pave', note: 'Полная укладка муассанита', price: 7200 },
      { id: 'diamond', title: 'Diamond pave', note: 'Бриллиантовая укладка', price: 14000 }
    ],
    purity: [
      { id: '10k', title: '10K', price: 0 },
      { id: '14k', title: '14K', price: 2200 },
      { id: '18k', title: '18K', price: 5200 }
    ],
    stones: [
      { id: 'none', title: 'Без камней', price: 0 },
      { id: 'si', title: 'SI', price: 0 },
      { id: 'vs', title: 'VS', price: 3500 },
      { id: 'vvs', title: 'VVS', price: 7800 }
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

  /* ---------- helpers ---------- */
  const byId = (id) => document.getElementById(id);
  const catalogItem = (group, id) => CATALOG[group].find((x) => x.id === id);
  const materialOf = (id) => catalogItem('material', id);
  const isGold = (matId) => materialOf(matId)?.family === 'gold';
  const isStoneFamily = (matId) => materialOf(matId)?.family === 'stone';

  function stylesFor(matId) {
    return isStoneFamily(matId) ? CATALOG.styleStone : CATALOG.styleMetal;
  }

  function normalizeSpec(spec) {
    const mat = materialOf(spec.material) ? spec.material : DEFAULT_SPEC.material;
    const styles = stylesFor(mat);
    let style = styles.some((s) => s.id === spec.style) ? spec.style : styles[0].id;
    let purity = isGold(mat)
      ? (catalogItem('purity', spec.purity) ? spec.purity : '14k')
      : 'none';
    let stones;
    if (isStoneFamily(mat)) {
      stones = ['si', 'vs', 'vvs'].includes(spec.stones) ? spec.stones : 'vs';
      if (style !== 'moissanite' && style !== 'diamond') style = 'moissanite';
    } else if (style === 'diamond-dust' || style === 'pineapple') {
      stones = catalogItem('stones', spec.stones) && spec.stones !== 'none' ? spec.stones : 'none';
    } else {
      stones = 'none';
    }
    return { material: mat, style, purity, stones };
  }

  function toothPrice(spec) {
    const s = normalizeSpec(spec);
    const mat = materialOf(s.material);
    const style = stylesFor(s.material).find((x) => x.id === s.style);
    const purity = isGold(s.material) ? catalogItem('purity', s.purity) : null;
    const stones = catalogItem('stones', s.stones);
    return (mat?.price || 0) + (style?.price || 0) + (purity?.price || 0) + (stones?.price || 0);
  }

  function defaultTooth(overrides = {}) {
    return { on: false, ...normalizeSpec({ ...DEFAULT_SPEC, ...overrides }) };
  }

  function createInitialState() {
    const teeth = {};
    ALL_TEETH.forEach((id) => {
      teeth[id] = defaultTooth();
    });
    // starter set: classic two fronts
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

  /* ---------- state + persistence ---------- */
  let state = createInitialState();
  let toastTimer = null;
  let needsDraw = true;
  let animFrame = 0;

  function activeTeeth() {
    return ALL_TEETH.filter((id) => state.teeth[id].on);
  }

  function focusedSpec() {
    const id = state.focus && state.teeth[state.focus]?.on ? state.focus : activeTeeth()[0];
    if (!id) return { ...DEFAULT_SPEC };
    return normalizeSpec(state.teeth[id]);
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { /* ignore quota */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || data.version !== 1 || !data.teeth) return;
      const next = createInitialState();
      next.mould = CATALOG.mould.some((m) => m.id === data.mould) ? data.mould : 'studio';
      next.scope = data.scope === 'all' ? 'all' : 'focus';
      next.focus = ALL_TEETH.includes(data.focus) ? data.focus : '11';
      if (data.view) {
        next.view.yaw = Number(data.view.yaw) || 0;
        next.view.pitch = Number(data.view.pitch) || 0;
      }
      ALL_TEETH.forEach((id) => {
        const t = data.teeth[id];
        if (!t) return;
        next.teeth[id] = normalizeSpec({
          material: t.material,
          style: t.style,
          purity: t.purity,
          stones: t.stones
        });
        next.teeth[id].on = !!t.on;
      });
      state = next;
    } catch (_) { /* ignore corrupt */ }
  }

  /* ---------- pricing / summary text ---------- */
  function buildQuote() {
    const teeth = activeTeeth();
    const mould = catalogItem('mould', state.mould);
    let teethTotal = 0;
    const lines = teeth.map((id) => {
      const t = normalizeSpec(state.teeth[id]);
      const p = toothPrice(t);
      teethTotal += p;
      const mat = materialOf(t.material)?.title || t.material;
      const style = stylesFor(t.material).find((s) => s.id === t.style)?.title || t.style;
      const purity = isGold(t.material) ? (catalogItem('purity', t.purity)?.title || '') : '—';
      const stones = catalogItem('stones', t.stones)?.title || '—';
      return `${id}: ${mat} · ${style} · ${purity} · ${stones} → ${money.format(p)} ₽`;
    });
    const total = teethTotal + (mould?.price || 0);
    return {
      teeth,
      teethTotal,
      mouldPrice: mould?.price || 0,
      total,
      mouldTitle: mould?.title || state.mould,
      lines,
      text:
        `Grillz Customs · референс\n` +
        `Слепок: ${mould?.title || state.mould}\n` +
        `Зубы (${teeth.length}): ${teeth.join(', ') || '—'}\n` +
        (lines.length ? lines.join('\n') + '\n' : '') +
        `Ориентир: ${money.format(total)} ₽\n` +
        `*не оферта, финал после слепка/веса`
    };
  }

  /* ---------- toast ---------- */
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

  /* ---------- apply mutations ---------- */
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

  /* ---------- UI render ---------- */
  function renderMould() {
    const root = byId('mouldChoices');
    if (!root) return;
    root.innerHTML = '';
    CATALOG.mould.forEach((m) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-card' + (state.mould === m.id ? ' is-active' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', state.mould === m.id ? 'true' : 'false');
      btn.innerHTML = `<strong>${m.title}</strong><span>${m.note}${m.price ? ` · +${money.format(m.price)} ₽` : ''}</span>`;
      btn.addEventListener('click', () => {
        state.mould = m.id;
        commit();
      });
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
      btn.title = TOOTH_LABEL[id] || id;
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
    const focusBtn = byId('scopeFocus');
    const allBtn = byId('scopeAll');
    const label = byId('focusLabel');
    if (label) label.textContent = state.focus || '—';
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
    CATALOG.material.forEach((m) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch-card' + (spec.material === m.id ? ' is-active' : '');
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', spec.material === m.id ? 'true' : 'false');
      const orb = document.createElement('span');
      orb.className = 'swatch-orb';
      orb.style.background = `radial-gradient(circle at 30% 28%, ${m.colors[0]}, ${m.colors[1]} 42%, ${m.colors[2]} 72%, ${m.colors[3]})`;
      const text = document.createElement('span');
      text.innerHTML = `${m.title}<small>+${money.format(m.price)} ₽ / зуб</small>`;
      btn.append(orb, text);
      btn.addEventListener('click', () => {
        applySpec({ material: m.id });
        commit();
      });
      root.appendChild(btn);
    });
  }

  function renderStyles() {
    const root = byId('styleChoices');
    if (!root) return;
    const spec = focusedSpec();
    const list = stylesFor(spec.material);
    root.innerHTML = '';
    list.forEach((s) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'style-card' + (spec.style === s.id ? ' is-active' : '');
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', spec.style === s.id ? 'true' : 'false');
      btn.innerHTML = `<strong>${s.title}</strong><span>${s.note}${s.price ? ` · +${money.format(s.price)} ₽` : ''}</span>`;
      btn.addEventListener('click', () => {
        applySpec({ style: s.id });
        commit();
      });
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
    CATALOG.purity.forEach((p) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pill-chip' + (spec.purity === p.id ? ' is-active' : '');
      btn.textContent = p.title + (p.price ? ` +${money.format(p.price)}` : '');
      btn.addEventListener('click', () => {
        applySpec({ purity: p.id });
        commit();
      });
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
    const options = isStoneFamily(spec.material)
      ? CATALOG.stones.filter((s) => s.id !== 'none')
      : CATALOG.stones;
    options.forEach((s) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pill-chip' + (spec.stones === s.id ? ' is-active' : '');
      btn.textContent = s.title + (s.price ? ` +${money.format(s.price)}` : '');
      btn.addEventListener('click', () => {
        applySpec({ stones: s.id });
        commit();
      });
      root.appendChild(btn);
    });
  }

  function renderSummary() {
    const root = byId('studioSummary');
    if (!root) return;
    const q = buildQuote();
    root.innerHTML = `
      <h3>Смета-ориентир</h3>
      <div class="sum-grid">
        <div>Слепок: <strong>${q.mouldTitle}</strong>${q.mouldPrice ? ` (+${money.format(q.mouldPrice)} ₽)` : ''}</div>
        <div>Зубов в сете: <strong>${q.teeth.length}</strong></div>
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
  }

  function commit() {
    save();
    renderAllUi();
  }

  /* ---------- Canvas preview engine ---------- */
  const canvas = () => byId('mouthCanvas');
  let hitMap = []; // {id, path or bounds}
  let pointer = { down: false, x: 0, y: 0, moved: false, lastTap: 0, lastId: null };

  function toothShape(kind) {
    // relative unit shape centered at 0,0 ; width ~1, height ~1.35
    // kinds: incisor | lateral | canine | premolar
    if (kind === 'canine') {
      return [
        [-0.38, 0.55], [-0.42, 0.1], [-0.28, -0.45], [0, -0.68],
        [0.28, -0.45], [0.42, 0.1], [0.38, 0.55], [0.18, 0.62],
        [0, 0.58], [-0.18, 0.62]
      ];
    }
    if (kind === 'premolar') {
      return [
        [-0.46, 0.5], [-0.48, 0.05], [-0.36, -0.4], [-0.12, -0.52],
        [0.12, -0.52], [0.36, -0.4], [0.48, 0.05], [0.46, 0.5],
        [0.2, 0.58], [0, 0.52], [-0.2, 0.58]
      ];
    }
    if (kind === 'lateral') {
      return [
        [-0.34, 0.52], [-0.36, 0.05], [-0.28, -0.42], [0, -0.55],
        [0.28, -0.42], [0.36, 0.05], [0.34, 0.52], [0.14, 0.58],
        [0, 0.54], [-0.14, 0.58]
      ];
    }
    // incisor
    return [
      [-0.4, 0.52], [-0.42, 0.05], [-0.34, -0.42], [-0.12, -0.55],
      [0.12, -0.55], [0.34, -0.42], [0.42, 0.05], [0.4, 0.52],
      [0.16, 0.58], [0, 0.54], [-0.16, 0.58]
    ];
  }

  function kindFor(id) {
    const n = id[1];
    if (n === '1') return 'incisor';
    if (n === '2') return 'lateral';
    if (n === '3') return 'canine';
    return 'premolar';
  }

  function archLayout(list, cx, cy, radiusX, radiusY, size, isUpper) {
    const n = list.length;
    return list.map((id, i) => {
      // map across a gentle arc
      const t = n === 1 ? 0.5 : i / (n - 1);
      const ang = Math.PI * (0.18 + t * 0.64); // ~pi*0.18 .. pi*0.82
      const x = cx + Math.cos(ang) * radiusX * (isUpper ? 1 : 1);
      // upper arch opens downward visually (crowns down), lower crowns up
      const yBase = cy + Math.sin(ang) * radiusY * (isUpper ? 0.55 : 0.55);
      const y = isUpper ? yBase : yBase;
      const rot = (t - 0.5) * (isUpper ? 0.55 : -0.55);
      const scale = size * (0.9 + Math.sin(ang) * 0.12);
      return { id, x, y, rot, scale, upper: isUpper };
    });
  }

  function polyPath(ctx, pts, x, y, scale, rot, flipY) {
    ctx.beginPath();
    pts.forEach(([px, py], i) => {
      const yy = flipY ? -py : py;
      const xr = px * Math.cos(rot) - yy * Math.sin(rot);
      const yr = px * Math.sin(rot) + yy * Math.cos(rot);
      const X = x + xr * scale;
      const Y = y + yr * scale;
      if (i === 0) ctx.moveTo(X, Y);
      else ctx.lineTo(X, Y);
    });
    ctx.closePath();
  }

  function materialGradient(ctx, mat, x, y, scale) {
    const c = mat?.colors || ['#eee', '#bbb', '#888', '#555'];
    const g = ctx.createLinearGradient(x - scale * 0.5, y - scale * 0.7, x + scale * 0.5, y + scale * 0.6);
    g.addColorStop(0, c[0]);
    g.addColorStop(0.35, c[1]);
    g.addColorStop(0.7, c[2]);
    g.addColorStop(1, c[3]);
    return g;
  }

  function drawStyleOverlay(ctx, styleId, x, y, scale, rot, flipY, pts) {
    ctx.save();
    polyPath(ctx, pts, x, y, scale, rot, flipY);
    ctx.clip();

    if (styleId === 'pineapple') {
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = Math.max(1, scale * 0.03);
      for (let i = -6; i <= 6; i++) {
        ctx.beginPath();
        ctx.moveTo(x - scale + i * scale * 0.18, y - scale);
        ctx.lineTo(x - scale + i * scale * 0.18 + scale * 0.9, y + scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + scale - i * scale * 0.18, y - scale);
        ctx.lineTo(x + scale - i * scale * 0.18 - scale * 0.9, y + scale);
        ctx.stroke();
      }
      // facets
      for (let r = 0; r < 10; r++) {
        const fx = x + (Math.sin(r * 2.1) * 0.35) * scale;
        const fy = y + (Math.cos(r * 1.7) * 0.35) * scale;
        const rg = ctx.createRadialGradient(fx, fy, 0, fx, fy, scale * 0.12);
        rg.addColorStop(0, 'rgba(255,255,255,0.55)');
        rg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(fx, fy, scale * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (styleId === 'open-face') {
      ctx.fillStyle = 'rgba(40, 24, 20, 0.55)';
      ctx.beginPath();
      ctx.ellipse(x, y - scale * 0.05, scale * 0.22, scale * 0.28, rot, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = Math.max(1, scale * 0.04);
      ctx.stroke();
    } else if (styleId === 'laser') {
      ctx.strokeStyle = 'rgba(0,0,0,0.22)';
      ctx.lineWidth = Math.max(1, scale * 0.025);
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x - scale * 0.35, y + i * scale * 0.1);
        ctx.quadraticCurveTo(x, y + i * scale * 0.1 - scale * 0.04, x + scale * 0.35, y + i * scale * 0.1);
        ctx.stroke();
      }
    } else if (styleId === 'diamond-dust') {
      for (let i = 0; i < 28; i++) {
        const a = i * 2.4;
        const fx = x + Math.cos(a) * scale * (0.1 + (i % 5) * 0.06);
        const fy = y + Math.sin(a * 1.3) * scale * (0.1 + (i % 4) * 0.07);
        ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(200,230,255,0.55)';
        ctx.beginPath();
        ctx.arc(fx, fy, scale * (0.015 + (i % 3) * 0.01), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (styleId === 'moissanite' || styleId === 'diamond') {
      const cols = styleId === 'diamond'
        ? ['#ffffff', '#cfe8ff', '#9ec7ff']
        : ['#ffffff', '#e8fff8', '#b8ffe0'];
      let k = 0;
      for (let row = -2; row <= 2; row++) {
        for (let col = -2; col <= 2; col++) {
          const fx = x + col * scale * 0.14 + (row % 2 ? scale * 0.07 : 0);
          const fy = y + row * scale * 0.14;
          const rg = ctx.createRadialGradient(fx - 2, fy - 2, 0, fx, fy, scale * 0.07);
          rg.addColorStop(0, cols[0]);
          rg.addColorStop(0.45, cols[1]);
          rg.addColorStop(1, cols[2]);
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.moveTo(fx, fy - scale * 0.07);
          ctx.lineTo(fx + scale * 0.06, fy);
          ctx.lineTo(fx, fy + scale * 0.07);
          ctx.lineTo(fx - scale * 0.06, fy);
          ctx.closePath();
          ctx.fill();
          k++;
        }
      }
    } else {
      // polished specular
      const rg = ctx.createRadialGradient(x - scale * 0.15, y - scale * 0.25, 0, x, y, scale * 0.55);
      rg.addColorStop(0, 'rgba(255,255,255,0.55)');
      rg.addColorStop(0.35, 'rgba(255,255,255,0.12)');
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(x - scale, y - scale, scale * 2, scale * 2);
    }
    ctx.restore();
  }

  function drawTooth(ctx, layout, toothState) {
    const { id, x, y, rot, scale, upper } = layout;
    const on = toothState.on;
    const flipY = !upper;
    const pts = toothShape(kindFor(id));
    const mat = on ? materialOf(toothState.material) : null;

    // soft shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    polyPath(ctx, pts, x + 3, y + 5, scale, rot, flipY);
    ctx.fill();
    ctx.restore();

    // body
    polyPath(ctx, pts, x, y, scale, rot, flipY);
    if (on && mat) {
      ctx.fillStyle = materialGradient(ctx, mat, x, y, scale);
    } else {
      const g = ctx.createLinearGradient(x, y - scale, x, y + scale);
      g.addColorStop(0, '#fffdf6');
      g.addColorStop(0.55, '#e6dfcf');
      g.addColorStop(1, '#b7ae9a');
      ctx.fillStyle = g;
    }
    ctx.fill();

    // enamel edge
    ctx.strokeStyle = on ? 'rgba(255,255,255,0.35)' : 'rgba(80,60,40,0.25)';
    ctx.lineWidth = Math.max(1.2, scale * 0.04);
    ctx.stroke();

    if (on) {
      drawStyleOverlay(ctx, toothState.style, x, y, scale, rot, flipY, pts);
    }

    // focus ring
    if (state.focus === id) {
      ctx.save();
      polyPath(ctx, pts, x, y, scale * 1.06, rot, flipY);
      ctx.strokeStyle = 'rgba(126, 224, 255, 0.95)';
      ctx.lineWidth = Math.max(2, scale * 0.06);
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.restore();
    }

    // FDI label
    ctx.save();
    ctx.font = `700 ${Math.max(10, scale * 0.22)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = on ? 'rgba(20,12,0,0.78)' : 'rgba(40,30,20,0.55)';
    ctx.fillText(id, x, y + (upper ? scale * 0.18 : -scale * 0.18));
    ctx.restore();

    // hit region approximate
    hitMap.push({ id, x, y, r: scale * 0.55 });
  }

  function drawScene() {
    const c = canvas();
    if (!c) return;
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

    // background mouth cavity
    const bg = ctx.createRadialGradient(W * 0.5, H * 0.45, 20, W * 0.5, H * 0.5, W * 0.55);
    bg.addColorStop(0, '#3a1418');
    bg.addColorStop(0.45, '#1a080c');
    bg.addColorStop(1, '#070304');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // gums
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(state.view.yaw * 0.35);
    ctx.scale(1 + state.view.pitch * 0.02, 1 - Math.abs(state.view.yaw) * 0.04);
    ctx.translate(-W / 2, -H / 2);

    // upper gum
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * 0.30, W * 0.38, H * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#5a2030';
    ctx.fill();
    // lower gum
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * 0.70, W * 0.36, H * 0.11, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4a1a28';
    ctx.fill();

    // ambient rim light
    ctx.strokeStyle = 'rgba(255,180,120,0.08)';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * 0.5, W * 0.4, H * 0.34, 0, 0, Math.PI * 2);
    ctx.stroke();

    hitMap = [];
    const base = Math.min(W, H) * 0.075;
    const upperLayout = archLayout(UPPER, W * 0.5, H * 0.34, W * 0.34, H * 0.16, base, true);
    const lowerLayout = archLayout(LOWER, W * 0.5, H * 0.64, W * 0.32, H * 0.14, base * 0.95, false);

    // slight open bite
    upperLayout.forEach((L) => {
      L.y -= H * 0.02;
      drawTooth(ctx, L, state.teeth[L.id]);
    });
    lowerLayout.forEach((L) => {
      L.y += H * 0.02;
      drawTooth(ctx, L, state.teeth[L.id]);
    });

    ctx.restore();

    // vignette
    const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.7);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // empty state caption
    if (!activeTeeth().length) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '700 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Выберите зубы для сета', W / 2, H * 0.5);
    }

    needsDraw = false;
  }

  function loop() {
    if (needsDraw) drawScene();
    animFrame = requestAnimationFrame(loop);
  }

  function hitTest(clientX, clientY) {
    const c = canvas();
    if (!c) return null;
    const rect = c.getBoundingClientRect();
    const W = c.clientWidth || rect.width;
    const H = c.clientHeight || rect.height;
    let x = ((clientX - rect.left) / rect.width) * W;
    let y = ((clientY - rect.top) / rect.height) * H;

    // Inverse of view transform used in drawScene (rotate + non-uniform scale around center)
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
    const c = canvas();
    if (!vp || !c) return;

    const onDown = (e) => {
      const pt = e.touches ? e.touches[0] : e;
      pointer.down = true;
      pointer.moved = false;
      pointer.x = pt.clientX;
      pointer.y = pt.clientY;
      vp.classList.add('is-dragging');
    };

    const onMove = (e) => {
      if (!pointer.down) return;
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
      if (pointer.moved) {
        save();
        return;
      }
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
      } else {
        toggleTooth(id);
      }
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

  /* ---------- actions ---------- */
  async function copyRef() {
    const q = buildQuote();
    try {
      await navigator.clipboard.writeText(q.text);
      toast('Референс скопирован');
    } catch (_) {
      toast('Не удалось скопировать — выделите текст сметы');
    }
    window.GrillzAnalytics?.track('constructor_copy', { teeth: q.teeth.length, total: q.total });
  }

  function sendOrder() {
    const q = buildQuote();
    const payload = {
      createdAt: new Date().toISOString(),
      mould: state.mould,
      teeth: q.teeth.map((id) => ({ id, ...normalizeSpec(state.teeth[id]), price: toothPrice(state.teeth[id]) })),
      total: q.total,
      text: q.text
    };
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(payload));
      sessionStorage.setItem(ORDER_KEY, q.text);
    } catch (_) { /* ignore */ }
    window.GrillzAnalytics?.track('constructor_order', { teeth: q.teeth.length, total: q.total });
    // Main lead form lives on homepage
    window.location.href = 'index.html?from=studio#order';
  }

  function resetBuild() {
    if (!window.confirm('Сбросить сборку до стартовой?')) return;
    state = createInitialState();
    commit();
    toast('Сборка сброшена');
  }

  function resetView() {
    state.view = { yaw: 0, pitch: 0 };
    needsDraw = true;
    save();
    toast('Ракурс сброшен');
  }

  function capturePng() {
    const c = canvas();
    if (!c) return;
    needsDraw = true;
    drawScene();
    try {
      const a = document.createElement('a');
      a.download = `grillz-studio-${Date.now()}.png`;
      a.href = c.toDataURL('image/png');
      a.click();
      toast('Снимок сохранён');
      window.GrillzAnalytics?.track('constructor_capture', { teeth: activeTeeth().length });
    } catch (_) {
      toast('Снимок недоступен в этом браузере');
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
  function boot() {
    if (!byId('grillzStudio')) return;
    load();
    renderAllUi();
    bindCanvas();
    byId('btnCopyRef')?.addEventListener('click', copyRef);
    byId('btnSendOrder')?.addEventListener('click', sendOrder);
    byId('btnResetBuild')?.addEventListener('click', resetBuild);
    byId('btnResetView')?.addEventListener('click', resetView);
    byId('btnCapture')?.addEventListener('click', capturePng);
    byId('btnFullscreen')?.addEventListener('click', toggleFullscreen);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && byId('studioStage')?.classList.contains('is-fs')) {
        toggleFullscreen();
      }
    });
    loop();
    // first paint after layout
    requestAnimationFrame(() => { needsDraw = true; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
