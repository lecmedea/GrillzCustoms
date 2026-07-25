/**
 * Dense chaotic ice scatter + Ive-style geometric line field for Forma page.
 * 3 cube types × many instances across the full layout (center + edges).
 */
(() => {
  'use strict';

  const TYPES = [
    'assets/mobile/grillz-ice-gold.png',
    'assets/mobile/grillz-ice-silver.png',
    'assets/mobile/grillz-ice-diamond.png'
  ];

  // ~10× previous 24 ≈ 240; mobile slightly fewer for perf
  const COUNT_DESKTOP = 240;
  const COUNT_MOBILE = 140;

  /** Mulberry32 — deterministic chaos (stable layout, no flicker) */
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
    // Large SVG with abstract industrial hairlines (Ive precision + quiet luxury)
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('viewBox', '0 0 100 400');
    svg.setAttribute('aria-hidden', 'true');

    const ns = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('stroke', 'rgba(255,255,255,0.065)');
    g.setAttribute('stroke-width', '0.08');
    g.setAttribute('fill', 'none');

    const lines = [
      // vertical hairlines (asymmetric columns)
      [8, 0, 8, 400], [18, 0, 18, 400], [31, 0, 31, 400], [47, 0, 47, 400],
      [62, 0, 62, 400], [73, 0, 73, 400], [88, 0, 88, 400], [94, 0, 94, 400],
      // horizontals — irregular spacing (not a dull grid)
      [0, 12, 100, 12], [0, 28, 100, 28], [0, 41, 100, 41], [0, 55, 100, 55],
      [0, 72, 100, 72], [0, 88, 100, 88], [0, 105, 100, 105], [0, 124, 100, 124],
      [0, 148, 100, 148], [0, 170, 100, 170], [0, 195, 100, 195], [0, 220, 100, 220],
      [0, 248, 100, 248], [0, 275, 100, 275], [0, 302, 100, 302], [0, 330, 100, 330],
      [0, 358, 100, 358], [0, 385, 100, 385],
      // long diagonals (industrial plane cuts)
      [0, 20, 100, 95], [0, 140, 100, 60], [0, 200, 100, 280],
      [0, 310, 100, 250], [20, 0, 90, 400], [5, 400, 95, 0],
      // short segments (fragmented structure)
      [12, 50, 40, 50], [55, 90, 85, 90], [30, 160, 70, 160],
      [8, 210, 35, 210], [60, 260, 98, 260], [15, 340, 48, 340],
      [50, 15, 50, 55], [25, 100, 25, 145], [80, 180, 80, 240],
      [40, 300, 40, 360], [70, 50, 70, 110]
    ];

    lines.forEach(([x1, y1, x2, y2], i) => {
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', String(x1));
      line.setAttribute('y1', String(y1));
      line.setAttribute('x2', String(x2));
      line.setAttribute('y2', String(y2));
      // alternate cool silver / gold whisper (Ive mono + Audigier gold hair)
      if (i % 7 === 0) {
        line.setAttribute('stroke', 'rgba(255,208,0,0.055)');
        line.setAttribute('stroke-width', '0.1');
      } else if (i % 5 === 0) {
        line.setAttribute('stroke', 'rgba(200,210,220,0.08)');
      }
      g.appendChild(line);
    });

    // soft arcs (Ive product silhouette energy)
    const arcs = [
      [20, 40, 35], [70, 120, 28], [40, 220, 42], [80, 300, 30], [25, 360, 38]
    ];
    arcs.forEach(([cx, cy, r]) => {
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', String(cx));
      c.setAttribute('cy', String(cy));
      c.setAttribute('r', String(r));
      c.setAttribute('stroke', 'rgba(255,255,255,0.04)');
      c.setAttribute('stroke-width', '0.07');
      c.setAttribute('fill', 'none');
      g.appendChild(c);
    });

    svg.appendChild(g);
    host.appendChild(svg);
  }

  function scatterCubes(host) {
    if (!host) return;
    host.innerHTML = '';

    const mobile = window.matchMedia('(max-width: 920px)').matches;
    const count = mobile ? COUNT_MOBILE : COUNT_DESKTOP;
    const rand = mulberry32(0x6f72756d); // 'forum'

    // Preload once
    TYPES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i += 1) {
      const img = document.createElement('img');
      img.className = 'ice-cube';
      img.src = TYPES[i % 3];
      img.width = 420;
      img.height = 420;
      img.alt = '';
      img.decoding = 'async';
      img.loading = i < 36 ? 'eager' : 'lazy';
      img.setAttribute('aria-hidden', 'true');

      // Full plane scatter — not edge-biased
      // Use jittered grid + random offset so center is filled too
      const cols = mobile ? 8 : 12;
      const rows = Math.ceil(count / cols);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cellW = 100 / cols;
      const cellH = 100 / Math.max(rows, 1);
      const jx = (rand() - 0.5) * cellW * 1.35;
      const jy = (rand() - 0.5) * cellH * 1.35;
      let left = col * cellW + cellW * 0.5 + jx;
      let top = row * cellH + cellH * 0.5 + jy;
      // wrap into page
      left = ((left % 100) + 100) % 100;
      top = ((top % 100) + 100) % 100;
      // allow slight overflow off edges for chaos
      left = left - 4 + rand() * 8;
      top = top - 2 + rand() * 4;

      const size = mobile
        ? 70 + rand() * 100
        : 48 + rand() * 110;
      const rot = -40 + rand() * 80;
      const opacity = 0.28 + rand() * 0.42;
      const z = Math.floor(rand() * 3);

      img.style.left = left + '%';
      img.style.top = top + '%';
      img.style.width = size + 'px';
      img.style.opacity = String(opacity);
      img.style.transform = `translate(-50%, -50%) rotate(${rot.toFixed(1)}deg)`;
      img.style.zIndex = String(z);

      frag.appendChild(img);
    }
    host.appendChild(frag);
  }

  function boot() {
    if (!document.body.classList.contains('forma-page')) return;

    let lines = document.querySelector('.forum-ive-lines');
    if (!lines) {
      lines = document.createElement('div');
      lines.className = 'forum-ive-lines';
      lines.setAttribute('aria-hidden', 'true');
      const page = document.querySelector('.forma-page .page');
      if (page) page.insertBefore(lines, page.firstChild);
      else document.body.prepend(lines);
    }
    buildIveLines(lines);

    let ice = document.querySelector('.forum-ice-bg');
    if (!ice) {
      ice = document.createElement('div');
      ice.className = 'forum-ice-bg';
      ice.setAttribute('aria-hidden', 'true');
      const page = document.querySelector('.forma-page .page');
      if (page) page.insertBefore(ice, page.firstChild);
    }
    scatterCubes(ice);

    // Rebuild on resize breakpoint change
    let lastMobile = window.matchMedia('(max-width: 920px)').matches;
    window.addEventListener('resize', () => {
      const m = window.matchMedia('(max-width: 920px)').matches;
      if (m !== lastMobile) {
        lastMobile = m;
        scatterCubes(ice);
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
