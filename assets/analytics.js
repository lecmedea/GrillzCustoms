(() => {
  const config = window.GRILLZ_ANALYTICS_CONFIG || {};
  const queue = [];

  function injectScript(src) {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }

  if (config.googleTagId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', config.googleTagId, { anonymize_ip: true });
    injectScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.googleTagId));
  }

  if (config.yandexMetrikaId) {
    window.ym = window.ym || function ym(){ (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    window.ym(config.yandexMetrikaId, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false
    });
    injectScript('https://mc.yandex.ru/metrika/tag.js');
  }

  function track(name, params = {}) {
    const safeName = String(name || '').replace(/[^a-zA-Z0-9_:-]/g, '_').slice(0, 80);
    if (!safeName) return;
    const payload = { page: location.pathname, ...params };
    if (config.googleTagId && typeof window.gtag === 'function') {
      window.gtag('event', safeName, payload);
    }
    if (config.yandexMetrikaId && typeof window.ym === 'function') {
      window.ym(config.yandexMetrikaId, 'reachGoal', safeName, payload);
    }
    if (!config.googleTagId && !config.yandexMetrikaId) queue.push({ name: safeName, params: payload });
  }

  window.GrillzAnalytics = { track, queue };
})();
