/**
 * Spilled ice on a dark-blue floor: non-overlapping cubes + water drops.
 * “Clumsy waiter” scatter — clusters allowed, stacking forbidden.
 */
(() => {
  'use strict';

  const TYPES = [
    'assets/mobile/grillz-ice-gold.png',
    'assets/mobile/grillz-ice-silver.png',
    'assets/mobile/grillz-ice-diamond.png'
  ];

  const HERO_COUNT = 5;
  const CUBE_DESKTOP = 90;
  const CUBE_MOBILE = 55;
  const DROP_DESKTOP = 160;
  const DROP_MOBILE = 90;

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function next() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildIveLines(host) {
    if (!host || host.dataset.ready) return;
    host.dataset.ready = '1';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('viewBox', '0 0 100 400');
    svg.setAttribute('aria-hidden', 'true');
    const ns = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('fill', 'none');

    const lines = [
      [8, 0, 8, 400], [18, 0, 18, 400], [31, 0, 31, 400], [47, 0, 47, 400],
      [62, 0, 62, 400], [73, 0, 73, 400], [88, 0, 88, 400], [94, 0, 94, 400],
      [0, 12, 100, 12], [0, 28, 100, 28], [0, 41, 100, 41], [0, 55, 100, 55],
      [0, 72, 100, 72], [0, 88, 100, 88], [0, 105, 100, 105], [0, 124, 100, 124],
      [0, 148, 100, 148], [0, 170, 100, 170], [0, 195, 100, 195], [0, 220, 100, 220],
      [0, 248, 100, 248], [0, 275, 100, 275], [0, 302, 100, 302], [0, 330, 100, 330],
      [0, 358, 100, 358], [0, 385, 100, 385],
      [0, 20, 100, 95], [0, 140, 100, 60], [0, 200, 100, 280],
      [0, 310, 100, 250], [20, 0, 90, 400], [5, 400, 95, 0],
      [12, 50, 40, 50], [55, 90, 85, 90], [30, 160, 70, 160],
      [8, 210, 35, 210], [60, 260, 98, 260], [15, 340, 48, 340]
    ];
    lines.forEach(([x1, y1, x2, y2], i) => {
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', String(x1));
      line.setAttribute('y1', String(y1));
      line.setAttribute('x2', String(x2));
      line.setAttribute('y2', String(y2));
      line.setAttribute('stroke', i % 6 === 0 ? 'rgba(120,160,210,0.07)' : 'rgba(255,255,255,0.045)');
      line.setAttribute('stroke-width', i % 9 === 0 ? '0.1' : '0.07');
      g.appendChild(line);
    });
    svg.appendChild(g);
    host.appendChild(svg);
  }

  /**
   * Non-overlap packing on % canvas.
   * Ellipse collision: cubes rest on the floor side-by-side, never stacked.
   */
  function packItems(specs, vw, pageH, rand) {
    const placed = [];
    const margin = 0.55; // gap between cubes (%-ish via radii)

    function tryPlace(sizePx, preferNear) {
      const rx = Math.max(1.2, (sizePx * 0.46 / vw) * 100);
      const ry = Math.max(0.8, (sizePx * 0.46 / pageH) * 100);
      const maxTries = 80;

      for (let t = 0; t < maxTries; t += 1) {
        let x;
        let y;
        if (preferNear && placed.length && rand() < 0.55) {
          // spill cluster: near an existing cube, outside its radius
          const anchor = placed[Math.floor(rand() * placed.length)];
          const ang = rand() * Math.PI * 2;
          const dist = (anchor.rx + rx) * (1.05 + rand() * 0.85) + margin;
          // anisotropic: more horizontal scatter (tray tip)
          x = anchor.x + Math.cos(ang) * dist * (1.1 + rand() * 0.4);
          y = anchor.y + Math.sin(ang) * dist * (0.55 + rand() * 0.35);
        } else {
          // free scatter across the whole floor
          x = 4 + rand() * 92;
          y = 3 + rand() * 94;
        }
        x = Math.min(96, Math.max(4, x));
        y = Math.min(97, Math.max(3, y));

        const candidate = { x, y, rx, ry };
        let ok = true;
        for (let i = 0; i < placed.length; i += 1) {
          const p = placed[i];
          const dx = candidate.x - p.x;
          const dy = candidate.y - p.y;
          const nx = p.rx + candidate.rx + margin * 0.35;
          const ny = p.ry + candidate.ry + margin * 0.35;
          if ((dx * dx) / (nx * nx) + (dy * dy) / (ny * ny) < 1) {
            ok = false;
            break;
          }
        }
        if (ok) {
          placed.push(candidate);
          return candidate;
        }
      }
      return null;
    }

    const results = [];
    // largest first
    const sorted = specs.slice().sort((a, b) => b.size - a.size);
    sorted.forEach((spec) => {
      const pos = tryPlace(spec.size, spec.cluster !== false);
      if (pos) results.push({ ...spec, left: pos.x, top: pos.y });
    });
    return results;
  }

  function scatterCubes(host) {
    if (!host) return;
    host.innerHTML = '';

    const mobile = window.matchMedia('(max-width: 920px)').matches;
    const rand = mulberry32(0x5350494c); // SPIL
    const page = document.querySelector('.forma-page .page') || document.body;
    const vw = Math.max(window.innerWidth, 320);
    const pageH = Math.max(page.scrollHeight || 0, window.innerHeight, 900);

    TYPES.forEach((src) => {
      const pre = new Image();
      pre.src = src;
    });

    const specs = [];

    // 5 big cubes — still large but packable without stacking
    for (let h = 0; h < HERO_COUNT; h += 1) {
      specs.push({
        src: TYPES[h % 3],
        size: mobile ? 380 + rand() * 120 : 480 + rand() * 200,
        rot: -22 + rand() * 44,
        opacity: 0.72 + rand() * 0.18,
        hero: true,
        cluster: false,
        eager: true
      });
    }

    const n = mobile ? CUBE_MOBILE : CUBE_DESKTOP;
    for (let i = 0; i < n; i += 1) {
      // mix of sizes like real ice from a tray
      const roll = rand();
      let size;
      if (roll < 0.15) size = mobile ? 120 + rand() * 50 : 140 + rand() * 70;
      else if (roll < 0.55) size = mobile ? 70 + rand() * 40 : 80 + rand() * 50;
      else size = mobile ? 42 + rand() * 28 : 48 + rand() * 36;

      specs.push({
        src: TYPES[i % 3],
        size,
        rot: -35 + rand() * 70,
        opacity: 0.55 + rand() * 0.35,
        hero: false,
        cluster: true,
        eager: i < 24
      });
    }

    const packed = packItems(specs, vw, pageH, rand);
    const frag = document.createDocumentFragment();

    packed.forEach((item, i) => {
      const img = document.createElement('img');
      img.className = 'ice-cube' + (item.hero ? ' ice-cube--hero' : '');
      img.src = item.src;
      img.width = 420;
      img.height = 420;
      img.alt = '';
      img.decoding = 'async';
      img.loading = item.eager ? 'eager' : 'lazy';
      img.setAttribute('aria-hidden', 'true');
      // slight “lying on floor” squash
      const squash = 0.88 + rand() * 0.12;
      img.style.left = item.left + '%';
      img.style.top = item.top + '%';
      img.style.width = item.size + 'px';
      img.style.opacity = String(item.opacity);
      img.style.transform =
        `translate(-50%, -50%) rotate(${item.rot.toFixed(1)}deg) scaleY(${squash.toFixed(3)})`;
      img.style.zIndex = '1';
      frag.appendChild(img);
    });

    host.appendChild(frag);
  }

  function scatterDrops(host) {
    if (!host) return;
    host.innerHTML = '';
    const mobile = window.matchMedia('(max-width: 920px)').matches;
    const n = mobile ? DROP_MOBILE : DROP_DESKTOP;
    const rand = mulberry32(0x44524f50); // DROP
    const frag = document.createDocumentFragment();

    for (let i = 0; i < n; i += 1) {
      const drop = document.createElement('span');
      const kind = rand();
      // tiny beads, medium drops, elongated streaks, small puddles
      let cls = 'water-drop';
      if (kind < 0.12) cls += ' water-drop--puddle';
      else if (kind < 0.28) cls += ' water-drop--streak';
      else if (kind < 0.55) cls += ' water-drop--mid';
      else cls += ' water-drop--bead';

      const left = 1 + rand() * 98;
      const top = 1 + rand() * 98;
      const scale = 0.45 + rand() * 1.4;
      const rot = -40 + rand() * 80;
      const opacity = 0.25 + rand() * 0.55;

      drop.className = cls;
      drop.setAttribute('aria-hidden', 'true');
      drop.style.left = left + '%';
      drop.style.top = top + '%';
      drop.style.opacity = String(opacity);
      drop.style.transform = `translate(-50%, -50%) rotate(${rot.toFixed(1)}deg) scale(${scale.toFixed(2)})`;
      frag.appendChild(drop);
    }
    host.appendChild(frag);
  }

  function ensureLayer(className, beforeSelector) {
    let el = document.querySelector('.' + className);
    if (el) return el;
    el = document.createElement('div');
    el.className = className;
    el.setAttribute('aria-hidden', 'true');
    const page = document.querySelector('.forma-page .page');
    if (!page) return el;
    const ref = beforeSelector ? page.querySelector(beforeSelector) : page.firstChild;
    if (ref) page.insertBefore(el, ref);
    else page.appendChild(el);
    return el;
  }

  function boot() {
    if (!document.body.classList.contains('forma-page')) return;

    const lines = ensureLayer('forum-ive-lines');
    buildIveLines(lines);

    const drops = ensureLayer('forum-water-drops');
    scatterDrops(drops);

    const ice = ensureLayer('forum-ice-bg');
    scatterCubes(ice);

    let lastMobile = window.matchMedia('(max-width: 920px)').matches;
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const m = window.matchMedia('(max-width: 920px)').matches;
        // re-pack when layout size changes meaningfully
        scatterCubes(ice);
        if (m !== lastMobile) {
          lastMobile = m;
          scatterDrops(drops);
        }
      }, 180);
    }, { passive: true });

    // re-pack once after fonts/layout settle (accurate page height)
    requestAnimationFrame(() => {
      setTimeout(() => scatterCubes(ice), 120);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
