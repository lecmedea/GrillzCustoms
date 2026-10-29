(() => {
  const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwq13gghfM7DnnltyU1v80VwU7RVE9-DnlTppEas_Zw4s1eh0ecr45dCNZA0ioXbyFu5g/exec';
  const REQUEST_TIMEOUT_MS = 15000;

  const normalizePhone = (value) => String(value || '').replace(/[^0-9+]/g, '').trim();
  const createSubmissionId = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `gc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  document.querySelectorAll('[data-lead-form]').forEach((form) => {
    const status = form.querySelector('[data-lead-status]');
    const submitButton = form.querySelector('button[type="submit"]');
    if (!status || !submitButton || form.dataset.leadReady === 'true') return;

    form.dataset.leadReady = 'true';
    const defaultButtonText = submitButton.textContent || 'Отправить заявку';

    const setStatus = (message, type = '') => {
      status.textContent = message;
      status.className = 'lead-form-status full' + (type ? ` ${type}` : '');
      status.setAttribute('role', type === 'error' ? 'alert' : 'status');
    };

    const setLoading = (isLoading) => {
      form.classList.toggle('is-loading', isLoading);
      form.setAttribute('aria-busy', String(isLoading));
      submitButton.disabled = isLoading;
      submitButton.textContent = isLoading ? 'Отправляем…' : defaultButtonText;
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      setStatus('');

      if (!form.checkValidity()) {
        form.reportValidity();
        setStatus('Проверьте обязательные поля и согласие на обработку данных.', 'error');
        return;
      }

      const formData = new FormData(form);
      if (String(formData.get('website') || '').trim()) return;

      const payload = {
        name: String(formData.get('name') || '').trim(),
        phone: normalizePhone(formData.get('phone')),
        email: String(formData.get('email') || '').trim(),
        comment: String(formData.get('comment') || '').trim(),
        consent: formData.get('consent') ? 'yes' : 'no',
        page: window.location.href,
        source: document.referrer || 'direct',
        userAgent: navigator.userAgent,
        createdAt: new Date().toISOString(),
        submissionId: createSubmissionId(),
        schemaVersion: 3
      };

      if (payload.phone.replace(/\D/g, '').length < 10) {
        setStatus('Проверьте номер телефона — он выглядит слишком коротким.', 'error');
        form.elements.phone?.focus();
        return;
      }

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      setLoading(true);
      setStatus('Отправляем заявку напрямую в Google-таблицу…');
      window.GrillzAnalytics?.track('lead_submit_attempt', { form: form.dataset.formLocation || 'site' });

      try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          redirect: 'follow',
          signal: controller.signal
        });
        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.ok) {
          throw new Error(`Lead endpoint rejected request (${response.status})`);
        }

        form.reset();
        setStatus('Готово! Заявка записана в Google-таблицу. Мы свяжемся с вами в ближайшее время.', 'success');
        window.GrillzAnalytics?.track('request-form-submit', { form: form.dataset.formLocation || 'site' });
      } catch (error) {
        const timedOut = error?.name === 'AbortError';
        setStatus(
          timedOut
            ? 'Сервер отвечает слишком долго. Данные остались в форме — попробуйте ещё раз или напишите нам во VK.'
            : 'Не удалось подтвердить запись в Google-таблицу. Данные остались в форме — попробуйте ещё раз или напишите нам во VK.',
          'error'
        );
        window.GrillzAnalytics?.track('lead_submit_error', { form: form.dataset.formLocation || 'site' });
        console.error('Lead submission failed', error);
      } finally {
        window.clearTimeout(timeout);
        setLoading(false);
      }
    });
  });
})();
