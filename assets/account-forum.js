(() => {
  const draftAccountKey = 'grillzAccountDraftV1';
  const draftForumKey = 'grillzForumDraftsV1';
  const gameKey = 'grillzTamagotchiStateV1';

  function fillForm(form, data) {
    if (!form || !data) return;
    [...form.elements].forEach((field) => {
      if (field.name && Object.prototype.hasOwnProperty.call(data, field.name)) {
        field.value = data[field.name];
      }
    });
  }

  function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  const accountForm = document.getElementById('accountDraftForm');
  const accountStatus = document.getElementById('accountDraftStatus');
  if (accountForm) {
    try {
      fillForm(accountForm, JSON.parse(localStorage.getItem(draftAccountKey) || 'null'));
    } catch {
      localStorage.removeItem(draftAccountKey);
    }

    accountForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = formData(accountForm);
      data.updatedAt = new Date().toISOString();
      localStorage.setItem(draftAccountKey, JSON.stringify(data));
      if (accountStatus) accountStatus.textContent = 'Черновик профиля сохранён в этом браузере. После подключения API его можно будет перенести в реальный аккаунт.';
      window.GrillzAnalytics?.track('account_draft_saved');
    });
  }

  const forumForm = document.getElementById('forumDraftForm');
  const forumStatus = document.getElementById('forumDraftStatus');
  if (forumForm) {
    forumForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const drafts = JSON.parse(localStorage.getItem(draftForumKey) || '[]');
      drafts.unshift({ ...formData(forumForm), createdAt: new Date().toISOString() });
      localStorage.setItem(draftForumKey, JSON.stringify(drafts.slice(0, 10)));
      forumForm.reset();
      if (forumStatus) forumStatus.textContent = 'Черновик темы сохранён в этом браузере. Публикация станет доступна после подключения серверной модерации.';
      window.GrillzAnalytics?.track('forum_draft_saved');
    });
  }

  const gamePreview = document.getElementById('gameSavePreview');
  if (gamePreview) {
    try {
      const state = JSON.parse(localStorage.getItem(gameKey) || 'null');
      if (state) {
        gamePreview.textContent = `В этом браузере найден Tamagotchi: уровень ${state.level || 1}, ${Math.floor(state.coins || 0)} coins, ${Math.floor(state.xp || 0)} XP.`;
      } else {
        gamePreview.textContent = 'Прогресс Tamagotchi пока не найден. Начните игру, а после подключения аккаунтов его можно будет привязать к профилю.';
      }
    } catch {
      gamePreview.textContent = 'Прогресс Tamagotchi пока не найден.';
    }
  }
})();
