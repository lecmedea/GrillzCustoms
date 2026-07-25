(() => {
  const storageKey = 'grillzCookieConsent';
  if (localStorage.getItem(storageKey)) return;

  const banner = document.createElement('section');
  banner.className = 'cookie-consent';
  banner.setAttribute('aria-label', 'Уведомление об использовании cookies');
  banner.innerHTML = `
    <div class="cookie-plate" aria-hidden="true">
      <span class="oat-cookie"></span>
      <span class="oat-cookie"></span>
    </div>
    <div class="cookie-copy">
      <strong>Cookies</strong>
      <p>Сайт использует cookies для аналитики, сохранения игровых настроек и улучшения работы интерфейса. Вы можете принять все cookies или оставить только необходимые.</p>
    </div>
    <div class="cookie-actions">
      <button type="button" data-cookie-choice="all">Принять</button>
      <button type="button" data-cookie-choice="necessary">Только необходимые</button>
    </div>
  `;

  banner.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cookie-choice]');
    if (!button) return;
    localStorage.setItem(storageKey, button.dataset.cookieChoice);
    banner.hidden = true;
    window.GrillzAnalytics?.track('cookie_consent', { choice: button.dataset.cookieChoice });
  });

  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(banner);
  });
})();
