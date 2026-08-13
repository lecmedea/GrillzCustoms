(() => {
  const cards = [...document.querySelectorAll('[data-reveal]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) cards.forEach(card => card.classList.add('is-visible'));
  else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }), { rootMargin: '0px 0px -10% 0px', threshold: .06 });
    cards.forEach(card => observer.observe(card));
  }

  const status = document.querySelector('.comic-flight-status');
  window.addEventListener('webslinger:start', () => {
    document.body.classList.add('comic-flight-active');
    if (status) status.textContent = 'Сергей в полёте · саундтрек запущен · 12 секунд';
  });
  window.addEventListener('webslinger:stop', () => {
    document.body.classList.remove('comic-flight-active');
    if (status) status.textContent = 'Красная кнопка внизу запускает полёт Сергея и музыку';
  });
})();
