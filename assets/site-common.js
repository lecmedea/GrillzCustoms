(() => {
  if (!window.__grillzMobileScrollTopLoading && !window.__grillzMobileScrollTopReady) {
    window.__grillzMobileScrollTopLoading = true;
    const script = document.createElement('script');
    script.src = 'assets/mobile-scroll-top.js';
    script.defer = true;
    document.head.appendChild(script);
  }

  const root = document.documentElement;
  let latestScrollY = window.scrollY;
  let frame = null;

  function renderBackground() {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(latestScrollY / maxScroll, 0), 1);
    root.style.setProperty('--bg-shift', (-progress * window.innerHeight * 2.6) + 'px');
    frame = null;
  }

  function requestBackgroundMove() {
    latestScrollY = window.scrollY;
    if (frame === null) frame = requestAnimationFrame(renderBackground);
  }

  requestBackgroundMove();
  window.addEventListener('scroll', requestBackgroundMove, { passive: true });
  window.addEventListener('resize', requestBackgroundMove);

  function initMagazineIndicator() {
    if (window.matchMedia('(max-width: 720px)').matches) return;
    let indicator = document.querySelector('.magazine-scroll-indicator');
    if (!indicator) {
      indicator = document.createElement('aside');
      indicator.className = 'magazine-scroll-indicator';
      indicator.setAttribute('aria-label', 'Визуальный индикатор прокрутки сайта');
      indicator.innerHTML = '<div class="magazine-body"><div class="ammo-track" id="ammoTrack"></div><div class="magazine-percent" id="magazinePercent">0%</div></div>';
      document.body.prepend(indicator);
    }

    const track = indicator.querySelector('#ammoTrack');
    const percent = indicator.querySelector('#magazinePercent');
    const sections = [...document.querySelectorAll('main > section')];
    const total = Math.max(sections.length * 8, 16);
    track.innerHTML = '';

    for (let index = 0; index < total; index += 1) {
      const slot = document.createElement('button');
      const section = sections[Math.min(sections.length - 1, Math.floor((index / total) * sections.length))];
      slot.className = 'ammo-slot';
      slot.type = 'button';
      slot.setAttribute('aria-label', 'Перейти к части страницы');
      slot.addEventListener('click', () => section?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      track.appendChild(slot);
    }

    const slots = [...track.querySelectorAll('.ammo-slot')];
    let progressFrame = null;
    function renderProgress() {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      const loaded = Math.round(progress * total);
      slots.forEach((slot, index) => {
        slot.classList.toggle('loaded', index < loaded);
        slot.classList.toggle('active', index === Math.max(0, loaded - 1));
      });
      if (percent) percent.textContent = Math.round(progress * 100) + '%';
      progressFrame = null;
    }

    function requestProgress() {
      if (progressFrame === null) progressFrame = requestAnimationFrame(renderProgress);
    }

    renderProgress();
    window.addEventListener('scroll', requestProgress, { passive: true });
    window.addEventListener('resize', requestProgress);
  }

  initMagazineIndicator();

  document.querySelectorAll('.nav-more').forEach((details) => {
    document.addEventListener('click', (event) => {
      if (!details.contains(event.target)) details.removeAttribute('open');
    });
  });

  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');
  let lastFocused = null;

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImage) return;
    lastFocused = document.activeElement;
    lightboxImage.src = src;
    lightboxImage.alt = alt || 'Изображение Grillz Customs';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose?.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImage) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  galleryItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      const image = item.querySelector('img');
      openLightbox(item.getAttribute('href'), image ? image.alt : 'Работа Grillz Customs');
      window.GrillzAnalytics?.track('gallery_open', { href: item.getAttribute('href') });
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
  });

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-analytics]');
    if (!target) return;
    window.GrillzAnalytics?.track(target.dataset.analytics, {
      href: target.getAttribute('href') || '',
      text: target.textContent.trim().slice(0, 80)
    });
  });

  // Prefill order form from Grillz Studio reference (if present)
  try {
    const params = new URLSearchParams(window.location.search);
    const fromStudio = params.get('from') === 'studio' || window.location.hash === '#order';
    const studioText = sessionStorage.getItem('gc_grillz_order_payload');
    if (fromStudio && studioText) {
      const comment = document.querySelector('#order textarea[name="comment"], form textarea[name="comment"]');
      if (comment && !comment.value.trim()) {
        comment.value = studioText;
        comment.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  } catch (_) { /* ignore storage / SSR quirks */ }
})();
