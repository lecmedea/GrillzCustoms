/**
 * Grillz Customs — smooth scroll progress indicator
 * GPU-friendly fill + soft lerp. No per-slot class thrashing on scroll.
 */
(() => {
  'use strict';

  if (window.__grillzScrollIndicatorReady) return;
  window.__grillzScrollIndicatorReady = true;

  const MQ = window.matchMedia('(max-width: 720px), (prefers-reduced-motion: reduce)');
  let disposed = false;
  let target = 0;
  let current = 0;
  let frame = null;
  let lastPct = -1;
  let sections = [];
  let fill = null;
  let head = null;
  let percentEl = null;
  let indicator = null;

  function maxScroll() {
    return Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  }

  function readTarget() {
    return Math.min(Math.max(window.scrollY / maxScroll(), 0), 1);
  }

  function paint(p) {
    if (!fill) return;
    // transform only — compositor thread
    fill.style.transform = `scaleY(${p})`;
    if (head) {
      // head rides the top of the fill (from bottom)
      const rail = fill.parentElement;
      if (rail) {
        const h = rail.clientHeight || 1;
        head.style.transform = `translate3d(-50%, ${-(p * h)}px, 0)`;
      }
    }
    const pct = Math.round(p * 100);
    if (percentEl && pct !== lastPct) {
      lastPct = pct;
      percentEl.textContent = pct + '%';
    }
  }

  function tick() {
    if (disposed) return;
    const delta = target - current;
    // critically damped-ish ease
    current += delta * 0.14;
    if (Math.abs(delta) < 0.0006) {
      current = target;
      paint(current);
      frame = null;
      return;
    }
    paint(current);
    frame = requestAnimationFrame(tick);
  }

  function requestTick() {
    target = readTarget();
    if (frame === null) frame = requestAnimationFrame(tick);
  }

  function rebuildSections() {
    sections = [...document.querySelectorAll('main > section[id], main > section, #top')].filter(Boolean);
    if (!sections.length) {
      sections = [...document.querySelectorAll('main > section')];
    }
  }

  function jumpToRatio(ratio) {
    const y = ratio * maxScroll();
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  function onRailClick(event) {
    const rail = event.currentTarget;
    const rect = rail.getBoundingClientRect();
    if (rect.height < 1) return;
    // rail fills bottom→top visually; click y from bottom
    const fromBottom = 1 - (event.clientY - rect.top) / rect.height;
    const ratio = Math.min(Math.max(fromBottom, 0), 1);

    if (sections.length) {
      const idx = Math.min(sections.length - 1, Math.floor(ratio * sections.length));
      const el = sections[idx];
      if (el && el.id) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    jumpToRatio(ratio);
  }

  function ensureDom() {
    indicator = document.querySelector('.magazine-scroll-indicator');
    if (!indicator) {
      indicator = document.createElement('aside');
      indicator.className = 'magazine-scroll-indicator';
      indicator.setAttribute('aria-label', 'Прогресс прокрутки');
      document.body.prepend(indicator);
    }

    // Replace heavy ammo markup with lean structure once
    if (!indicator.querySelector('.mag-rail')) {
      indicator.innerHTML = `
        <div class="magazine-body mag-body-smooth" role="presentation">
          <button type="button" class="mag-rail" aria-label="Перейти по странице">
            <span class="mag-track" aria-hidden="true"></span>
            <span class="mag-fill" aria-hidden="true"></span>
            <span class="mag-head" aria-hidden="true"></span>
            <span class="mag-ticks" aria-hidden="true"></span>
          </button>
          <div class="magazine-percent" id="magazinePercent">0%</div>
        </div>
      `;
    }

    fill = indicator.querySelector('.mag-fill');
    head = indicator.querySelector('.mag-head');
    percentEl = indicator.querySelector('.magazine-percent') || document.getElementById('magazinePercent');

    const rail = indicator.querySelector('.mag-rail');
    if (rail && !rail.dataset.bound) {
      rail.dataset.bound = '1';
      rail.addEventListener('click', onRailClick);
    }

    // static ticks (no JS updates)
    const ticks = indicator.querySelector('.mag-ticks');
    if (ticks && !ticks.childElementCount) {
      const n = 12;
      for (let i = 0; i < n; i += 1) {
        const t = document.createElement('i');
        ticks.appendChild(t);
      }
    }
  }

  function show(on) {
    if (!indicator) return;
    indicator.style.display = on ? '' : 'none';
    indicator.setAttribute('aria-hidden', on ? 'false' : 'true');
  }

  function mount() {
    if (MQ.matches) {
      show(false);
      return;
    }
    ensureDom();
    show(true);
    rebuildSections();
    current = readTarget();
    target = current;
    paint(current);
  }

  function onScroll() {
    if (MQ.matches || disposed) return;
    requestTick();
  }

  function onResize() {
    if (MQ.matches) {
      show(false);
      if (frame) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      return;
    }
    mount();
    requestTick();
  }

  // Public: allow pages to re-init after heavy DOM changes
  window.GrillzScrollIndicator = {
    refresh() {
      rebuildSections();
      requestTick();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  if (typeof MQ.addEventListener === 'function') {
    MQ.addEventListener('change', onResize);
  } else if (typeof MQ.addListener === 'function') {
    MQ.addListener(onResize);
  }
})();
