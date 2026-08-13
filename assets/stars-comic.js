(() => {
  const cards = [...document.querySelectorAll('[data-reveal]')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) cards.forEach(card => card.classList.add('is-visible'));
  else {
    const observer = new IntersectionObserver((entries) => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
      if (innerWidth > 720 && window.WebSlinger && !document.body.dataset.slingerStarted) {
        document.body.dataset.slingerStarted = 'true';
        window.WebSlinger.fire();
      }
    }), { rootMargin: '0px 0px -12% 0px', threshold: .08 });
    cards.forEach(card => observer.observe(card));
  }

  const audio = document.getElementById('starsSoundtrack');
  const toggle = document.querySelector('.comic-audio-toggle');
  if (!audio || !toggle) return;
  const label = playing => {
    toggle.textContent = playing ? 'Выключить саундтрек' : 'Включить саундтрек';
    toggle.setAttribute('aria-pressed', String(playing));
  };
  toggle.addEventListener('click', async () => {
    if (audio.paused) {
      try { audio.currentTime = 0; await audio.play(); label(true); }
      catch (_) { label(false); }
    } else { audio.pause(); label(false); }
  });
  audio.addEventListener('ended', () => label(false));
})();
