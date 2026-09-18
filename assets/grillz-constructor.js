/**
 * Grillz Customs Studio — original configurator engine.
 * PNG tooth layers + own GLB (model-viewer/AR) + GC price list + hash share state.
 */
(() => {
  'use strict';

  const STORAGE_KEY = 'gc_grillz_studio_v3';
  const ORDER_KEY = 'gc_grillz_order_payload';
  const HASH_PREFIX = 'gc3';
  const PRICES_URL = 'data/gc-prices.json';
  const ASSET = {
    teeth: (kind, mat) => `assets/studio/teeth/${kind}_${mat}.png`,
    overlay: (style) => `assets/studio/overlays/${style}.png`,
    /** Independent photoreal caps (not a continuous bridge): material × style × slot */
    piece: (mat, style, index) => `assets/studio/photo/pieces/${mat}_${style}_${index}.png`,
    mouthBg: 'assets/studio/mouth-bg.jpg'
  };

  /** Sprite bank index for each FDI (separate cap asset, not shared bridge mesh) */
  const PIECE_INDEX = {
    '13': 0, '12': 1, '11': 2, '21': 3, '22': 4, '23': 5,
    '14': 0, '15': 0, '24': 5, '25': 5,
    '43': 0, '42': 1, '41': 2, '31': 3, '32': 4, '33': 5,
    '44': 0, '45': 0, '34': 5, '35': 5
  };

  /** Transparent padding in the render sprites, measured once from their alpha bounds. */
  const PIECE_CROP = {
    0: [0.378, 0.056, 0.250, 0.891],
    1: [0.303, 0.053, 0.394, 0.897],
    2: [0.247, 0.050, 0.506, 0.900],
    3: [0.253, 0.050, 0.494, 0.900],
    4: [0.303, 0.053, 0.391, 0.900],
    5: [0.366, 0.056, 0.256, 0.894]
  };

  /**
   * Default anchors on stock smile photo (normalized 0..1).
   * Each grillz is independent — own nx/ny/scaleX/scaleY/rot.
   * Calibrated for assets/studio/mouth-bg.jpg frontal smile.
   */
  // Width is relative to photograph width; height to photograph height. No magic aspect multiplier.
  const DEFAULT_ANCHORS = {
    '15': { nx:0.146, ny:0.348, scaleX:0.039, scaleY:0.126, rot:0.08 },
    '14': { nx:0.184, ny:0.35, scaleX:0.053, scaleY:0.156, rot:0.07 },
    '13': { nx:0.242, ny:0.354, scaleX:0.075, scaleY:0.185, rot:-0.08 },
    '12': { nx:0.323, ny:0.371, scaleX:0.09, scaleY:0.17, rot:-0.035 },
    '11': { nx:0.435, ny:0.378, scaleX:0.136, scaleY:0.205, rot:-0.015 },
    '21': { nx:0.574, ny:0.379, scaleX:0.14, scaleY:0.209, rot:0.015 },
    '22': { nx:0.691, ny:0.373, scaleX:0.092, scaleY:0.17, rot:0.035 },
    '23': { nx:0.773, ny:0.36, scaleX:0.077, scaleY:0.182, rot:0.08 },
    '24': { nx:0.835, ny:0.351, scaleX:0.051, scaleY:0.155, rot:-0.07 },
    '25': { nx:0.872, ny:0.352, scaleX:0.038, scaleY:0.128, rot:-0.08 },
    '45': { nx:0.183, ny:0.515, scaleX:0.044, scaleY:0.095, rot:0.12 },
    '44': { nx:0.237, ny:0.567, scaleX:0.067, scaleY:0.148, rot:0.15 },
    '43': { nx:0.306, ny:0.59, scaleX:0.068, scaleY:0.159, rot:0.09 },
    '42': { nx:0.379, ny:0.607, scaleX:0.079, scaleY:0.148, rot:0.06 },
    '41': { nx:0.462, ny:0.61, scaleX:0.082, scaleY:0.151, rot:0.02 },
    '31': { nx:0.544, ny:0.61, scaleX:0.082, scaleY:0.151, rot:-0.02 },
    '32': { nx:0.628, ny:0.607, scaleX:0.083, scaleY:0.147, rot:-0.06 },
    '33': { nx:0.707, ny:0.594, scaleX:0.069, scaleY:0.164, rot:-0.09 },
    '34': { nx:0.775, ny:0.567, scaleX:0.068, scaleY:0.153, rot:-0.15 },
    '35': { nx:0.824, ny:0.516, scaleX:0.041, scaleY:0.098, rot:-0.12 }
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
    stones: 'none', density: 3, finish: 'mirror', tone: 'clear', border: 3, engraving: ''
  };


  const LOOKS = [
    {id:'classic',title:'Classic six',subtitle:'6 верхних · золото',teeth:['13','12','11','21','22','23'],material:'yellow-gold',style:'polished'},
    {id:'silver',title:'Silver four',subtitle:'4 верхних · серебро',teeth:['12','11','21','22'],material:'silver',style:'polished'},
    {id:'duo',title:'Rose duo',subtitle:'2 передних · красное золото',teeth:['11','21'],material:'rose-gold',style:'polished'},
    {id:'frames',title:'Open frames',subtitle:'6 верхних · открытый контур',teeth:['13','12','11','21','22','23'],material:'yellow-gold',style:'open-face'},
    {id:'cut',title:'Ice cut',subtitle:'6 верхних · гранёный узор',teeth:['13','12','11','21','22','23'],material:'white-gold',style:'pineapple'},
    {id:'initials',title:'Monogram',subtitle:'2 передних · гравировка',teeth:['11','21'],material:'yellow-gold',style:'laser',engraving:'GC'},
    {id:'dust',title:'Diamond dust',subtitle:'4 верхних · мелкая россыпь',teeth:['12','11','21','22'],material:'silver',style:'diamond-dust'},
    {id:'pave',title:'Full ice',subtitle:'6 верхних · паве',teeth:['13','12','11','21','22','23'],material:'premium',style:'moissanite'},
    {id:'noir',title:'Black ice',subtitle:'6 нижних · тёмное паве',teeth:['43','42','41','31','32','33'],material:'premium',style:'diamond',tone:'black'},
    {id:'mixed',title:'Two tone',subtitle:'6 верхних · два металла',teeth:['13','12','11','21','22','23'],material:'yellow-gold',style:'polished',alternate:'white-gold'}
  ];
  function designDescription(t) {
    const finish={mirror:'полировка',satin:'сатин',matte:'матовый'}[t.finish];
    const tone={clear:'светлый',black:'чёрный',pink:'розовый',blue:'голубой'}[t.tone];
    return [finish, t.style==='open-face'?'контур '+t.border:null,
      t.style!=='polished'?'плотность '+t.density:null,
      ['moissanite','diamond','diamond-dust'].includes(t.style)?'оттенок '+tone:null,
      t.style==='laser'&&t.engraving?'гравировка '+t.engraving:null].filter(Boolean).join(', ');
  }
  function applyLook(id) {
    const look=LOOKS.find(l=>l.id===id);if(!look)return;
    ALL_TEETH.forEach(tid=>{
      const index=look.teeth.indexOf(tid),fit=state.teeth[tid].fit;
      state.teeth[tid]={...normalizeSpec({...DEFAULT_SPEC,...look,material:look.alternate&&index%2?look.alternate:look.material}),on:index>=0,fit};
    });
    state.scope='all';state.focus=look.teeth.includes('11')?'11':look.teeth[0];
  }
  function renderDesignUi() {
    const root=byId('lookChoices');
    if(root && !root.childElementCount) LOOKS.forEach(look=>{
      const btn=document.createElement('button');btn.type='button';btn.className='look-card';btn.dataset.look=look.id;
      const sample=window.GrillzDesign.surface(normalizeSpec({...DEFAULT_SPEC,...look}),true).color.toDataURL();
      const swatch=document.createElement('span');swatch.className='look-sample';swatch.style.backgroundImage='url('+sample+')';swatch.setAttribute('aria-hidden','true');
      const text=document.createElement('span');text.innerHTML='<strong>'+look.title+'</strong><small>'+look.subtitle+'</small>';
      btn.append(swatch,text);btn.addEventListener('click',()=>{applyLook(look.id);commit();});root.append(btn);
    });
    const spec=focusedSpec();
    ['density','finish','tone','border','engraving'].forEach(key=>{const el=byId('design-'+key);if(el && document.activeElement!==el)el.value=spec[key];});
    byId('densityField')?.classList.toggle('is-hidden',['polished','open-face'].includes(spec.style));
    byId('borderField')?.classList.toggle('is-hidden',spec.style!=='open-face');
    byId('engravingField')?.classList.toggle('is-hidden',spec.style!=='laser');
    byId('toneField')?.classList.toggle('is-hidden',!['moissanite','diamond','diamond-dust'].includes(spec.style));
    byId('designEmpty').hidden=activeTeeth().length>0;
  }
  function bindDesignUi() {
    ['density','finish','tone','border','engraving'].forEach(key=>{
      byId('design-'+key)?.addEventListener('input',e=>{applySpec({[key]:e.target.value});commit();});
    });
    byId('btnFitMode')?.addEventListener('click',()=>{
      state.tool=state.tool==='move'?'select':'move';commit();
    });
    const fitFields={fitX:'nx',fitY:'ny',fitWidth:'scaleX',fitHeight:'scaleY',fitRotate:'rot'};
    Object.entries(fitFields).forEach(([id,key])=>byId(id)?.addEventListener('input',e=>{
      if(!state.teeth[state.focus]?.on)return;
      const value=Number(e.target.value),fit=state.teeth[state.focus].fit;
      fit[key]=key==='rot'?value*Math.PI/180:value/100;
      state.teeth[state.focus].fit=normalizeFit(fit,state.focus);
      renderFitSliders();requestDraw();
    }));
    Object.keys(fitFields).forEach(id=>byId(id)?.addEventListener('change',()=>commit()));
    byId('btnFitReset')?.addEventListener('click',()=>{
      state.teeth[state.focus].fit=normalizeFit(state._detectedAnchors?.[state.focus]||defaultFit(state.focus),state.focus);commit();
    });
  }

  const money = new Intl.NumberFormat('ru-RU');
  const byId = (id) => document.getElementById(id);

  let prices = FALLBACK_PRICES;
  let state = createInitialState();
  let viewMode = 'layers'; // layers | model
  let toastTimer = null;
  let renderRevision = 0;
  let drawQueued = false;
  const capCache = new Map();
  let hitMap = [];
  let pointer = {
    down: false,
    x: 0,
    y: 0,
    moved: false,
    lastTap: 0,
    lastId: null,
    mode: null,
    startFit: null,
    grabId: null
  };
  let hashSyncLock = false;
  let canvasSpace = { W: 960, H: 720, ox: 0, oy: 0, dw: 960, dh: 720 };

  const imgCache = new Map();
  let mouthBg = null;
  let stockMouthBg = null;
  let customMouthObjectUrl = null;
  let photoRequest = 0;

  function kindFor(id) {
    const n = id[1];
    if (n === '1') return 'incisor';
    if (n === '2') return 'lateral';
    if (n === '3') return 'canine';
    return 'premolar';
  }

  function matMeta(id) {
    return Object.hasOwn(prices.material,id) ? prices.material[id] : (Object.hasOwn(FALLBACK_PRICES.material,id) ? FALLBACK_PRICES.material[id] : null);
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
    let style = Object.hasOwn(styles,spec.style) ? spec.style : Object.keys(styles)[0];
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
    return { material: mat, style, purity, stones,
      density: Math.round(finiteClamp(spec.density, 1, 5, 3)),
      border: Math.round(finiteClamp(spec.border, 1, 5, 3)),
      finish: ['mirror','satin','matte'].includes(spec.finish) ? spec.finish : 'mirror',
      tone: ['clear','black','pink','blue'].includes(spec.tone) ? spec.tone : 'clear',
      engraving: String(spec.engraving || '').toUpperCase().replace(/[^A-ZА-ЯЁ0-9]/g,'').slice(0,3)
    };
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

  function defaultFit(id) {
    const a = DEFAULT_ANCHORS[id] || { nx: 0.5, ny: 0.5, scaleX: 0.08, scaleY: 0.08, rot: 0 };
    // migrate legacy `scale` → scaleX/scaleY
    const sx = a.scaleX ?? a.scale ?? 0.08;
    const sy = a.scaleY ?? a.scale ?? sx;
    return { nx: a.nx, ny: a.ny, scaleX: sx, scaleY: sy, rot: a.rot || 0 };
  }

  function finiteClamp(value, min, max, fallback) {
    const n=Number(value); return Number.isFinite(n) ? Math.max(min, Math.min(max,n)) : fallback;
  }
  function normalizeFit(raw, id) {
    const d=defaultFit(id);
    if(!raw || typeof raw!=='object') return {...d};
    return {nx:finiteClamp(raw.nx,0,1,d.nx),ny:finiteClamp(raw.ny,0,1,d.ny),
      scaleX:finiteClamp(raw.scaleX ?? raw.scale,.012,.4,d.scaleX),
      scaleY:finiteClamp(raw.scaleY ?? raw.scale,.012,.5,d.scaleY),
      rot:finiteClamp(raw.rot,-Math.PI/2,Math.PI/2,0)};
  }

  function defaultTooth(id, overrides = {}) {
    const spec = normalizeSpec({ ...DEFAULT_SPEC, ...overrides });
    return {
      on: !!overrides.on,
      ...spec,
      fit: { ...defaultFit(id), ...(overrides.fit || {}) }
    };
  }

  function createInitialState() {
    const teeth = {};
    ALL_TEETH.forEach((id) => { teeth[id] = defaultTooth(id); });
    teeth['11'] = defaultTooth('11', { on: true });
    teeth['21'] = defaultTooth('21', { on: true });
    return {
      version: 3,
      mould: 'studio',
      scope: 'all',
      focus: '11',
      tool: 'select', // select | move | scale | scaleX | scaleY | rotate
      view: { yaw: 0, pitch: 0 },
      photoZoom: 1, // only for custom uploaded photo; controlled by UI slider, not wheel
      customPhoto: false,
      teeth
    };
  }

  function ensureFit(id) {
    const t = state.teeth[id];
    if (!t.fit) t.fit = defaultFit(id);
    return t.fit;
  }

  function applyAnchorsMap(anchors, { enableDetected = false } = {}) {
    if (!anchors) return;
    ALL_TEETH.forEach((id) => {
      const a = anchors[id];
      if (!a) return;
      const t = state.teeth[id];
      t.fit = normalizeFit({
        nx: a.nx,
        ny: a.ny,
        scaleX: a.scaleX ?? a.scale,
        scaleY: a.scaleY ?? a.scale,
        rot: a.rot
      }, id);
      if (enableDetected) t.on = true;
    });
  }

  function ensureFitMigrated(id) {
    const fit = ensureFit(id);
    if (fit.scale != null && (fit.scaleX == null || fit.scaleY == null)) {
      fit.scaleX = fit.scaleX ?? fit.scale;
      fit.scaleY = fit.scaleY ?? fit.scale;
      delete fit.scale;
    }
    if (fit.scaleX == null) fit.scaleX = 0.08;
    if (fit.scaleY == null) fit.scaleY = fit.scaleX;
    return fit;
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
    try {
      const persisted = JSON.parse(JSON.stringify(state));
      // A photo is session-only; never reload its coordinates onto somebody else's stock smile.
      if (persisted.customPhoto) ALL_TEETH.forEach(id => {persisted.teeth[id].fit=defaultFit(id);});
      persisted.customPhoto=false; persisted.photoZoom=1; delete persisted._detectedAnchors;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch (_) { /* storage may be unavailable */ }
    syncHash();
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('gc_grillz_studio_v2');
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || ![1,2,3].includes(data.version) || !data.teeth) return false;
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
    next.tool = ['select', 'move', 'scale', 'rotate'].includes(data.tool) ? data.tool : 'select';
    next.customPhoto = false;
    if (data.view) {
      next.view.yaw = finiteClamp(data.view.yaw,-1,1,0);
      next.view.pitch = finiteClamp(data.view.pitch,-1,1,0);
    }
    ALL_TEETH.forEach((id) => {
      const t = data.teeth?.[id];
      if (!t) {next.teeth[id].on=false;return;}
      next.teeth[id] = { ...normalizeSpec(t), on: !!t.on, fit: data.version === 3 && !data.customPhoto ? normalizeFit(t.fit, id) : defaultFit(id) };
    });
    if (typeof data.photoZoom === 'number') {
      next.photoZoom = Math.max(0.5, Math.min(3, data.photoZoom));
    }
    state = next;
  }

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
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
    // Share design only, never a personal photo or its coordinates.
    const design={v:3,m:state.mould,s:state.scope,f:state.focus,t:activeTeeth().map(id=>{
      const t=normalizeSpec(state.teeth[id]);
      return [id,t.material,t.style,t.purity,t.stones,t.finish,t.density,t.tone,t.border,t.engraving];
    })};
    const bytes=new TextEncoder().encode(JSON.stringify(design));
    return HASH_PREFIX+'.'+btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }

  function decodeHash(hash) {
    const raw = (hash || '').replace(/^#/, '');
    if (raw.startsWith('gc3.')) {
      if(raw.length>18000) return false;
      try {
        const str=atob(raw.slice(4).replace(/-/g,'+').replace(/_/g,'/'));
        const data=JSON.parse(new TextDecoder().decode(Uint8Array.from(str,c=>c.charCodeAt(0))));
        if(data.v!==3 || !Array.isArray(data.t) || data.t.length>20) return false;
        const teeth={};
        for(const row of data.t) {
          if(!Array.isArray(row) || !ALL_TEETH.includes(row[0])) return false;
          const [id,material,style,purity,stones,finish,density,tone,border,engraving]=row;
          teeth[id]={on:true,material,style,purity,stones,finish,density,tone,border,engraving};
        }
        applyStateData({version:3,mould:data.m,scope:data.s,focus:data.f,teeth});
        return true;
      } catch { return false; }
    }
    if (!raw.startsWith('gc1.') && !raw.startsWith('gc2.')) return false;
    const parts = raw.split('.');
    if (parts.length < 7) return false;
    const [, mould, scope, focus, yaw, pitch, teethPart] = parts;
    const data = createInitialState();
    if (prices.mould[mould] || FALLBACK_PRICES.mould[mould]) data.mould = mould;
    data.scope = scope === 'a' ? 'all' : 'focus';
    data.focus = ALL_TEETH.includes(focus) ? focus : '11';
    data.view.yaw = (Number(yaw) || 0) / 100;
    data.view.pitch = (Number(pitch) || 0) / 100;
    ALL_TEETH.forEach((id) => { data.teeth[id] = defaultTooth(id); });
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
        data.teeth[id] = {
          ...normalizeSpec({ material, style, purity, stones }),
          on: true,
          fit: defaultFit(id)
        };
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
      return `${id}: ${mat} · ${style} · ${purity} · ${stones} · ${designDescription(t)} → ${money.format(p)} ₽`;
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
        `*не оферта; оттенок, гравировка и параметры узора согласуются с мастером; финал после слепка/веса`
    };
  }

  /* ---------- mutations ---------- */
  function applySpecToTooth(id, partial) {
    const cur = state.teeth[id];
    const next = normalizeSpec({
      material: partial.material ?? cur.material,
      style: partial.style ?? cur.style,
      purity: partial.purity ?? cur.purity,
      stones: partial.stones ?? cur.stones,
      density: partial.density ?? cur.density, finish: partial.finish ?? cur.finish,
      tone: partial.tone ?? cur.tone, border: partial.border ?? cur.border, engraving: partial.engraving ?? cur.engraving
    });
    state.teeth[id] = { ...next, on: cur.on, fit: cur.fit ? { ...cur.fit } : defaultFit(id) };
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
    const cur = state.teeth[id];
    const fit = cur.fit ? { ...cur.fit } : defaultFit(id);
    state.teeth[id].on = on;
    if (on) {
      state.teeth[id] = { ...normalizeSpec(cur), on: true, fit };
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
      const fit = state.teeth[id].fit ? { ...state.teeth[id].fit } : defaultFit(id);
      state.teeth[id].on = set.has(id);
      if (set.has(id)) state.teeth[id] = { ...normalizeSpec(state.teeth[id]), on: true, fit };
      else state.teeth[id].fit = fit;
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
      focusBtn.setAttribute('aria-pressed',String(state.scope==='focus'));
      focusBtn.onclick = () => { state.scope = 'focus'; commit(); };
    }
    if (allBtn) {
      allBtn.classList.toggle('is-active', state.scope === 'all');
      allBtn.setAttribute('aria-pressed',String(state.scope==='all'));
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
      const thumb=document.createElement('span');thumb.className='style-sample';thumb.setAttribute('aria-hidden','true');
      thumb.style.backgroundImage='url('+window.GrillzDesign.surface({...spec,style:id},true).color.toDataURL()+')';
      const label=document.createElement('span');label.innerHTML='<strong>'+s.title+'</strong><small>'+(s.price?'+'+money.format(s.price)+' ₽':'в базе металла')+'</small>';
      btn.append(thumb,label);
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
    byId('stageQuote').textContent=q.teeth.length+' зуб. · '+money.format(q.total)+' ₽*';
    byId('btnSendOrder').disabled = !q.teeth.length;
    root.innerHTML = `
      <h3>Ориентировочная стоимость</h3>
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
    renderDesignUi();
    document.querySelectorAll('#studioForm button').forEach(btn=>{if(!btn.hasAttribute('aria-pressed') && /choice|swatch|style|pill|scope/.test(btn.className))btn.setAttribute('aria-pressed',String(btn.classList.contains('is-active')));});
    requestDraw();
    updateModelMaterials();
  }

  function commit() {
    // Rebuilt option groups retain keyboard focus.
    const active=document.activeElement,group=active?.parentElement?.id,index=active?.parentElement ? [...active.parentElement.children].indexOf(active) : -1;
    save();renderAllUi();renderFitSliders();
    if(active && !active.isConnected && group && index>=0) byId(group)?.children[index]?.focus({preventScroll:true});
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
    stockMouthBg = await loadImage(ASSET.mouthBg);
    mouthBg = stockMouthBg;
    await Promise.all([
      loadImage(ASSET.piece('yellow-gold', 'polished', 2)),
      loadImage(ASSET.piece('yellow-gold', 'polished', 3))
    ]);
  }

  /* ---------- Anchored, on-demand preview ---------- */
  function layoutTooth(id) {
    const fit=normalizeFit(state.teeth[id].fit,id);
    const {ox,oy,dw,dh}=canvasSpace;
    return {id,x:ox+fit.nx*dw,y:oy+fit.ny*dh,rot:fit.rot,
      scaleX:fit.scaleX*dw,scaleY:fit.scaleY*dh,upper:UPPER.includes(id),fit};
  }
  function pieceSrc(id,t) { return t.on ? ASSET.piece(t.material,'polished',PIECE_INDEX[id] ?? 2) : null; }
  function capImage(id,t,images) {
    const src=pieceSrc(id,t),img=images.get(src);
    const key=window.GrillzDesign.key(t,true)+'|'+(PIECE_INDEX[id]??2);
    if(capCache.has(key)) return capCache.get(key);
    const c=Object.assign(document.createElement('canvas'),{width:256,height:256}),cx=c.getContext('2d');
    const surface=window.GrillzDesign.surface(t,true);
    if(t.style==='polished' && t.finish==='mirror' && img) {
      const [x,y,w,h]=PIECE_CROP[PIECE_INDEX[id]??2];
      cx.drawImage(img,x*img.naturalWidth,y*img.naturalHeight,w*img.naturalWidth,h*img.naturalHeight,0,0,256,256);
    } else {
      cx.drawImage(surface.color,0,0);
      if(img) {
        const [x,y,w,h]=PIECE_CROP[PIECE_INDEX[id]??2];
        cx.globalCompositeOperation='destination-in';
        cx.drawImage(img,x*img.naturalWidth,y*img.naturalHeight,w*img.naturalWidth,h*img.naturalHeight,0,0,256,256);
      }
    }
    capCache.set(key,c); if(capCache.size>100) capCache.delete(capCache.keys().next().value);
    return c;
  }
  function drawToothCap(ctx,L,t,images,clean) {
    const {id,x,y,rot,scaleX:w,scaleY:h,upper}=L;
    hitMap.push({id,x,y,w,h,rot});
    ctx.save();ctx.translate(x,y);ctx.rotate(rot);
    if(t.on) {
      if(!upper) ctx.scale(1,-1);
      ctx.drawImage(capImage(id,t,images),-w/2,-h/2,w,h);
      if(!upper) ctx.scale(1,-1);
    }
    if(!clean && state.tool==='move' && state.focus===id && t.on) {
      ctx.strokeStyle='#7ee0ff';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.strokeRect(-w/2,-h/2,w,h);
    }
    ctx.restore();
  }
  async function resolveImages() {
    const map=new Map(),srcs=new Set(activeTeeth().map(id=>pieceSrc(id,state.teeth[id])));
    await Promise.all([...srcs].map(async src=>map.set(src,await loadImage(src))));
    return map;
  }
  function updateCanvasSpace(W,H) {
    const iw=mouthBg?.naturalWidth||1200,ih=mouthBg?.naturalHeight||900;
    // contain keeps every tooth visible on portrait uploads; zoom follows photo + fitted caps together.
    const scale=Math.min(W/iw,H/ih)*(state.customPhoto ? state.photoZoom : 1);
    const dw=iw*scale,dh=ih*scale;
    canvasSpace={W,H,ox:(W-dw)/2,oy:(H-dh)/2,dw,dh};
  }
  async function drawScene({clean=false}={}) {
    const c=byId('mouthCanvas');
    if(!c || viewMode!=='layers') return;
    const version=renderRevision,images=await resolveImages();
    if(version!==renderRevision && !clean) return;
    const ctx=c.getContext('2d'),dpr=Math.min(window.devicePixelRatio||1,2),W=c.clientWidth||960;
    const H=Math.round(window.innerWidth<=540 ? Math.min(W*.75,window.innerHeight*.27) : W*.75);
    if(c.width!==Math.round(W*dpr)||c.height!==Math.round(H*dpr)) {c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);}
    c.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
    updateCanvasSpace(W,H);ctx.fillStyle='#0b0b0d';ctx.fillRect(0,0,W,H);
    if(mouthBg) ctx.drawImage(mouthBg,canvasSpace.ox,canvasSpace.oy,canvasSpace.dw,canvasSpace.dh);
    hitMap=[];
    ALL_TEETH.forEach(id=>drawToothCap(ctx,layoutTooth(id),state.teeth[id],images,clean));
  }
  function requestDraw() {
    renderRevision++;
    if(drawQueued) return;
    drawQueued=true;
    requestAnimationFrame(async()=>{
      const version=renderRevision;
      try { if(viewMode==='layers') await drawScene(); }
      catch(error) { console.warn('Preview unavailable',error);toast('Не удалось обновить превью'); }
      finally { drawQueued=false; if(version!==renderRevision) requestDraw(); }
    });
  }

  function clientToCanvas(clientX, clientY) {
    const c = byId('mouthCanvas');
    if (!c) return { x: 0, y: 0 };
    const rect = c.getBoundingClientRect();
    const W = c.clientWidth || rect.width;
    const H = c.clientHeight || rect.height;
    return {
      x: ((clientX - rect.left) / rect.width) * W,
      y: ((clientY - rect.top) / rect.height) * H
    };
  }

  function canvasToNorm(x, y) {
    const { ox, oy, dw, dh } = canvasSpace;
    return {
      nx: clamp01((x - ox) / (dw || 1)),
      ny: clamp01((y - oy) / (dh || 1))
    };
  }

  function hitTest(clientX,clientY) {
    const p=clientToCanvas(clientX,clientY);
    let best=null,bestD=Infinity;
    hitMap.forEach(h=>{
      const dx=p.x-h.x,dy=p.y-h.y,co=Math.cos(-h.rot),si=Math.sin(-h.rot);
      const x=dx*co-dy*si,y=dx*si+dy*co;
      const score=Math.hypot(x/(h.w/2),y/(h.h/2));
      if(Math.abs(x)<h.w*.55 && Math.abs(y)<h.h*.55 && score<bestD) {best=h.id;bestD=score;}
    });return best;
  }
  function bindCanvas() {
    const canvas=byId('mouthCanvas');
    if(!canvas) return;
    canvas.addEventListener('pointerdown',e=>{
      if(viewMode!=='layers') return;
      const id=hitTest(e.clientX,e.clientY);
      pointer={down:true,x:e.clientX,y:e.clientY,moved:false,grabId:id,startFit:id?{...state.teeth[id].fit}:null};
      if(state.tool==='move' && id && state.teeth[id].on) {state.focus=id;canvas.setPointerCapture(e.pointerId);renderFitSliders();requestDraw();}
    });
    canvas.addEventListener('pointermove',e=>{
      if(!pointer.down) return;
      const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
      if(Math.hypot(dx,dy)>4) pointer.moved=true;
      if(state.tool!=='move' || !pointer.grabId || !state.teeth[pointer.grabId].on) return;
      const a=clientToCanvas(pointer.x,pointer.y),b=clientToCanvas(e.clientX,e.clientY);
      state.teeth[pointer.grabId].fit=normalizeFit({...pointer.startFit,
        nx:pointer.startFit.nx+(b.x-a.x)/canvasSpace.dw,
        ny:pointer.startFit.ny+(b.y-a.y)/canvasSpace.dh},pointer.grabId);
      renderFitSliders();requestDraw();
    });
    const end=e=>{
      if(!pointer.down) return;pointer.down=false;
      if(canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      if(!pointer.moved && pointer.grabId) {
        const id=pointer.grabId;
        // Selecting an existing cap never removes it by accident. Explicit FDI toggle removes it.
        if(!state.teeth[id].on) setToothOn(id,true);
        state.focus=id;
      }
      commit();
    };
    canvas.addEventListener('pointerup',end);
    canvas.addEventListener('pointercancel',e=>{pointer.down=false;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);save();});
    canvas.addEventListener('pointerleave',()=>{if(state.tool!=='move')pointer.down=false;});
    canvas.addEventListener('keydown',e=>{
      if(state.tool!=='move'||!state.teeth[state.focus]?.on || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
      e.preventDefault();const fit=state.teeth[state.focus].fit,step=e.shiftKey?.01:.002;
      if(e.key==='ArrowLeft')fit.nx-=step;if(e.key==='ArrowRight')fit.nx+=step;
      if(e.key==='ArrowUp')fit.ny-=step;if(e.key==='ArrowDown')fit.ny+=step;
      state.teeth[state.focus].fit=normalizeFit(fit,state.focus);commit();
    });
    new ResizeObserver(requestDraw).observe(canvas);
    window.addEventListener('resize',requestDraw);
  }

  /* ---------- fit UI ---------- */
  function renderFitSliders() {
    const fit=normalizeFit(state.teeth[state.focus]?.fit,state.focus),editing=state.tool==='move',enabled=!!state.teeth[state.focus]?.on;
    byId('fitControls').hidden=!editing||viewMode!=='layers';
    byId('btnFitMode').setAttribute('aria-pressed',String(editing));
    byId('btnFitMode').disabled=viewMode!=='layers';
    byId('mouthCanvas').style.touchAction=editing?'none':'pan-y';
    byId('fitFocusLabel').textContent=state.focus;
    const values={fitX:fit.nx*100,fitY:fit.ny*100,fitWidth:fit.scaleX*100,fitHeight:fit.scaleY*100,fitRotate:fit.rot*180/Math.PI};
    Object.entries(values).forEach(([id,v])=>{byId(id).value=v.toFixed(1);byId(id).disabled=!enabled;byId(id+'Val').textContent=v.toFixed(1)+(id==='fitRotate'?'°':'%');});
    byId('stageHint').textContent=viewMode==='model'?'Вращайте модель. Зубы и дизайн меняются через панель параметров.':editing?'Перетащите активную накладку. Размер и поворот — ниже. Стрелки клавиатуры также меняют посадку.':'Нажмите на зуб для выбора. Убрать накладку можно кнопкой с номером зуба.';
    const pz = byId('photoZoom');
    const pzVal = byId('photoZoomVal');
    const pzBlock = byId('blockPhotoZoom');
    if (pzBlock) pzBlock.classList.toggle('is-hidden', !state.customPhoto);
    if (pz) pz.value = String(Math.round((state.photoZoom || 1) * 100));
    if (pzVal) pzVal.textContent = Math.round((state.photoZoom || 1) * 100) + '%';
  }

  function bindFitUi() {
    const pz = byId('photoZoom');
    pz?.addEventListener('input', () => {
      if (!state.customPhoto) return;
      state.photoZoom = Math.max(0.5, Math.min(3, Number(pz.value) / 100));
      renderFitSliders();
      requestDraw();
    });
    pz?.addEventListener('change', () => save());
    byId('btnPhotoZoomLock')?.addEventListener('click', () => {
      save();
      toast(`Масштаб фото закреплён: ${Math.round((state.photoZoom || 1) * 100)}%`);
    });

  }

  /* ---------- photo upload + detect ---------- */
  function bindPhotoUi() {
    const input = byId('mouthPhotoInput');
    const status = byId('photoDetectStatus');
    input?.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024) {
        status.textContent='Выберите JPG, PNG или WebP не больше 10 МБ.';input.value='';return;
      }
      const request=++photoRequest;
      if (status) status.textContent = 'Загрузка и анализ лица…';
      try {
        if (customMouthObjectUrl) { imgCache.delete(customMouthObjectUrl);URL.revokeObjectURL(customMouthObjectUrl); }
        customMouthObjectUrl = URL.createObjectURL(file);
        const img = await loadImage(customMouthObjectUrl);
        if (!img || img.naturalWidth*img.naturalHeight>24000000) throw new Error('bad or oversized image');
        if(request!==photoRequest)return;
        mouthBg = img;
        state.customPhoto = true;
        state.photoZoom = 1;
        ALL_TEETH.forEach(id=>state.teeth[id].fit=defaultFit(id));
        requestDraw();

        let result = null;
        if (window.GrillzMouthDetect?.detectToothAnchors) {
          if (status) status.textContent = 'Определяем область рта. Затем уточните сетку вручную…';
          let timer;
          try { result=await Promise.race([
            window.GrillzMouthDetect.detectToothAnchors(img),
            new Promise(resolve=>{timer=setTimeout(()=>resolve(null),15000);})
          ]); } finally {clearTimeout(timer);}
        } else {
          result = window.GrillzMouthDetect?.fallbackAnchors?.() || null;
        }

        if(request!==photoRequest)return;
        if (result?.anchors) {
          state._detectedAnchors = result.anchors;
          applyAnchorsMap(result.anchors);
          if(!activeTeeth().length) applyPreset('front6');
          if (status) {
            status.textContent = result.fallback
              ? 'Лицо не найдено — сетка по центру кадра. Подкрутите капы вручную.'
              : 'Область рта найдена. Это приблизительная сетка: проверьте каждый зуб и поправьте посадку.';
          }
          toast('Фото применено · проверьте посадку');
          window.GrillzAnalytics?.track('constructor_photo_detect', {
            confidence: result.confidence || 0,
            fallback: !!result.fallback
          });
        } else {
          if (status) status.textContent = 'Фото загружено. Расставьте капы вручную.';
        }
        state.focus = activeTeeth()[0] || '11';
        state.tool='move';
        commit();
        renderFitSliders();
      } catch (err) {
        if(request!==photoRequest)return;
        console.warn(err);
        if (status) status.textContent = 'Не удалось обработать фото. Попробуйте другое фронтальное изображение улыбки.';
        toast('Ошибка загрузки фото');
      }
      input.value = '';
    });

    byId('btnResetPhoto')?.addEventListener('click', () => {
      photoRequest++;
      if (customMouthObjectUrl) {
        imgCache.delete(customMouthObjectUrl);
        URL.revokeObjectURL(customMouthObjectUrl);
        customMouthObjectUrl = null;
      }
      mouthBg = stockMouthBg;
      state.customPhoto = false;
      state.photoZoom = 1;
      state._detectedAnchors = null;
      ALL_TEETH.forEach((id) => {
        state.teeth[id].fit = defaultFit(id);
      });
      if (status) {
        status.textContent = 'Исходная улыбка. Фото обрабатывается только в браузере. Автоматическая сетка приблизительна; доступна ручная посадка.';
      }
      commit();
      renderFitSliders();
      toast('Сток-фон восстановлен');
    });
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
    b2?.setAttribute('aria-pressed',String(viewMode==='layers'));
    b3?.setAttribute('aria-pressed',String(viewMode==='model'));
    renderFitSliders();
    if (viewMode === 'layers') requestDraw();
    else {
      byId('modelStatus').textContent='Загрузка 3D…';
      loadModelViewer().then(()=>{byId('grillzModel').src='assets/studio/models/gc-design-dental-arch.glb';updateModelMaterials();})
        .catch(()=>{byId('modelStatus').textContent='3D недоступно. 2D и расчёт продолжают работать.';});
    }
  }

  let modelLoader=null, modelRevision=0;
  const modelSurfaces=new Map();
  function loadModelViewer() {
    if(customElements.get('model-viewer')) return Promise.resolve();
    if(modelLoader) return modelLoader;
    modelLoader=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.type='module';
      script.src='https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
      script.onload=()=>customElements.whenDefined('model-viewer').then(resolve);
      script.onerror=()=>{script.remove();modelLoader=null;reject(Error('model-viewer unavailable'));};
      document.head.append(script);
    });
    return modelLoader;
  }
  async function updateModelMaterials() {
    const mv=byId('grillzModel');
    if(!mv?.model || viewMode!=='model') return;
    const version=++modelRevision,materials=Array.from(mv.model.materials||[]);
    const enamel=materials.find(m=>m.name==='anatomical-enamel');
    enamel?.pbrMetallicRoughness?.setRoughnessFactor(.36);
    try {
      // One mutable CanvasTexture pair per FDI: bounded GPU allocation across unlimited edits.
      await Promise.all(ALL_TEETH.map(async id=>{
        const t={...state.teeth[id]},mat=materials.find(m=>m.name==='grillz_'+id);
        if(!mat?.pbrMetallicRoughness)return;
        const pbr=mat.pbrMetallicRoughness;
        mat.setAlphaMode('MASK');mat.setAlphaCutoff(.45);
        pbr.setBaseColorFactor([1,1,1,t.on?1:0]);
        if(!t.on)return;
        let slots=modelSurfaces.get(id);
        if(!slots) {
          const colorTexture=mv.createCanvasTexture(),normalTexture=mv.createCanvasTexture();
          const color=colorTexture.source.element,normal=normalTexture.source.element;
          color.width=normal.width=256;color.height=normal.height=256;
          slots={color,normal,colorTexture,normalTexture,key:null,ready:Promise.resolve()};
          modelSurfaces.set(id,slots);
        }
        await slots.ready;
        if(version!==modelRevision)return;
        const surface=window.GrillzDesign.surface(t,true);
        if(slots.key!==surface.key) {
          for(const [canvas,source] of [[slots.color,surface.color],[slots.normal,surface.normal]]) {const ctx=canvas.getContext('2d');ctx.clearRect(0,0,256,256);ctx.drawImage(source,0,0);}
          slots.colorTexture.source.update();slots.normalTexture.source.update();slots.key=surface.key;
        }
        pbr.baseColorTexture.setTexture(slots.colorTexture);
        mat.normalTexture.setTexture(slots.normalTexture);
        pbr.setMetallicFactor(isStoneFamily(t.material)?.35:1);
        pbr.setRoughnessFactor(t.finish==='matte'?.65:t.finish==='satin'?.4:t.style==='polished'?.17:.28);
      }));
      if(version===modelRevision)byId('modelStatus').textContent='';
    } catch(error) {console.warn('3D surface',error);byId('modelStatus').textContent='Не удалось обновить 3D. Используйте 2D-превью.';}
  }

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
    if(!q.teeth.length) {toast('Выберите хотя бы один зуб'); return;}
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
    photoRequest++;
    state = createInitialState();
    mouthBg=stockMouthBg;
    if(customMouthObjectUrl) URL.revokeObjectURL(customMouthObjectUrl);
    customMouthObjectUrl=null;
    commit();
    toast('Сборка сброшена');
  }

  function resetView() {
    state.view = { yaw: 0, pitch: 0 };
    const mv = byId('grillzModel');
    if (mv) {
      mv.cameraOrbit = '0deg 82deg 90%';
      mv.jumpCameraToGoal?.();
    }
    requestDraw();
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
          setTimeout(()=>URL.revokeObjectURL(a.href),1000);
          toast('3D-снимок сохранён');
          return;
        }
      } catch (_) { /* report without substituting a different view */ }
      toast('Дождитесь загрузки 3D или переключитесь в 2D');return;
    }
    requestDraw();
    await drawScene({clean:true});
    const c = byId('mouthCanvas');
    if (!c) return;
    try {
      const a = document.createElement('a');
      a.download = `grillz-studio-${Date.now()}.png`;
      a.href = c.toDataURL('image/png');
      a.click();
      toast('Снимок сохранён');
      requestDraw();
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
    requestDraw();
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
    // The URL contains shareable design, local storage additionally contains stock-photo fit.
    // Do not erase that fit when reloading the exact same design.
    const fromLocal = loadLocal();
    if (!fromLocal || location.hash.slice(1) !== encodeHash()) decodeHash(location.hash);
    hashSyncLock = false;

    await preloadAssets();
    // ensure every tooth has independent fit
    ALL_TEETH.forEach((id) => ensureFit(id));
    renderAllUi();
    renderFitSliders();
    bindCanvas();
    bindFitUi();
    bindDesignUi();
    bindPhotoUi();
    setViewMode('layers');
    // sync tool buttons
    document.querySelectorAll('#fitToolGroup .stage-btn').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.tool === (state.tool || 'select'));
    });

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
    mv?.addEventListener('error',()=>{byId('modelStatus').textContent='Модель не загрузилась. Можно продолжить в 2D.';});

    requestDraw();
    syncHash();
    requestAnimationFrame(() => { requestDraw(); });
  }

  // Pure-engine exports for regression tests; not exposed to the web page.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports={normalizeFit,defaultFit,normalizeSpec,createInitialState,applyStateData,applyLook,
      toothPrice,setDiscount,encodeHash,decodeHash,buildQuote,applySpec,activeTeeth,
      getState:()=>state,LOOKS,ALL_TEETH};
    return;
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
