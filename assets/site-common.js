(() => {
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
})();
