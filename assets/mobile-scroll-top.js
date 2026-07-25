(() => {
  if (window.__grillzMobileScrollTopReady) return;
  window.__grillzMobileScrollTopReady = true;

  const style = document.createElement('style');
  style.textContent = `
    .mobile-scroll-top {
      position: fixed;
      right: max(14px, env(safe-area-inset-right));
      bottom: calc(var(--mobile-scroll-bottom-offset, 18px) + env(safe-area-inset-bottom));
      z-index: 160;
      width: 56px;
      height: 56px;
      display: none;
      place-items: center;
      border: 2px solid #050505;
      border-radius: 50%;
      background: linear-gradient(180deg, #fff08a 0%, #ffd000 48%, #bd8a00 100%);
      box-shadow: 4px 4px 0 #050505, 0 12px 28px rgba(0, 0, 0, .42), 0 0 0 1px rgba(255, 208, 0, .46);
      opacity: 0;
      visibility: hidden;
      transform: translate3d(0, 14px, 0) scale(.88);
      transition: opacity .22s ease, transform .22s ease, visibility .22s ease;
      pointer-events: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .mobile-scroll-top::before,
    .mobile-scroll-top span {
      content: "";
      position: absolute;
      top: 24px;
      width: 19px;
      height: 5px;
      border-radius: 999px;
      background: #050505;
    }

    .mobile-scroll-top::before {
      left: 9px;
      transform: rotate(-42deg);
      transform-origin: right center;
    }

    .mobile-scroll-top span {
      right: 9px;
      transform: rotate(42deg);
      transform-origin: left center;
    }

    @media (max-width: 920px) {
      .mobile-scroll-top {
        display: grid;
      }

      .mobile-scroll-top.is-visible {
        opacity: 1;
        visibility: visible;
        transform: translate3d(0, 0, 0) scale(1);
        pointer-events: auto;
      }

      .mobile-scroll-top:active {
        transform: translate3d(2px, 2px, 0) scale(.98);
        box-shadow: 2px 2px 0 #050505, 0 8px 20px rgba(0, 0, 0, .34);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .mobile-scroll-top {
        transition: none;
      }
    }
  `;
  document.head.appendChild(style);

  function init() {
    if (document.querySelector('.mobile-scroll-top')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-scroll-top';
    button.setAttribute('aria-label', 'Вернуться наверх');
    button.innerHTML = '<span aria-hidden="true"></span>';
    document.body.appendChild(button);

    const mobileQuery = window.matchMedia('(max-width: 920px)');
    let frame = null;

    function render() {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      const cookie = document.querySelector('.cookie-consent');
      let bottomOffset = 18;

      if (cookie) {
        const rect = cookie.getBoundingClientRect();
        const style = getComputedStyle(cookie);
        const isCookieVisible = style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.height > 10 && rect.bottom > 0;
        if (isCookieVisible) bottomOffset = Math.ceil(window.innerHeight - rect.top + 14);
      }

      button.style.setProperty('--mobile-scroll-bottom-offset', bottomOffset + 'px');
      button.classList.toggle('is-visible', mobileQuery.matches && progress >= 0.3);
      frame = null;
    }

    function requestRender() {
      if (frame === null) frame = requestAnimationFrame(render);
    }

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.GrillzAnalytics?.track('mobile_scroll_top');
    });

    render();
    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', requestRender);
    mobileQuery.addEventListener?.('change', render);

    const observer = new MutationObserver(requestRender);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'class', 'hidden', 'style'],
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
