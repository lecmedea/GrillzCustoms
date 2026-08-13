(() => {
  if (!window.__grillzI18nLoading && !window.__grillzI18nReady) {
    window.__grillzI18nLoading = true;
    const i18nScript = document.createElement('script');
    i18nScript.src = 'assets/i18n.js?v=20260725-i18n5';
    i18nScript.defer = true;
    document.head.appendChild(i18nScript);
  }

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

  // Smooth magazine / progress indicator (GPU fill + lerp) — single shared module
  if (!window.__grillzScrollIndicatorLoading && !window.__grillzScrollIndicatorReady) {
    window.__grillzScrollIndicatorLoading = true;
    const scrollInd = document.createElement('script');
    scrollInd.src = 'assets/scroll-indicator.js?v=20260725-smooth1';
    scrollInd.defer = true;
    document.head.appendChild(scrollInd);
  }

  document.querySelectorAll('.nav-more').forEach((details) => {
    const menu = details.querySelector('.nav-more-menu');
    if (menu && !menu.querySelector('.mobile-stars-link')) {
      const starsLink = document.createElement('a');
      starsLink.href = 'stars.html';
      starsLink.textContent = 'Звёзды';
      starsLink.className = 'mobile-stars-link';
      if (location.pathname.endsWith('/stars.html')) starsLink.setAttribute('aria-current', 'page');
      menu.prepend(starsLink);
    }
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

  if (!window.__webSlingerLoading && !window.__webSlingerMounted) {
    window.__webSlingerLoading = true;
    const webSlinger = document.createElement('script');
    webSlinger.src = 'assets/web-slinger.js?v=20260813-sergey12s2';
    webSlinger.dataset.brand = 'grillz';
    document.body.appendChild(webSlinger);
  }
})();
