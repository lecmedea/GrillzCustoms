(() => {
  const materials = [
    { name: 'Слепок', need: 0, image: 'assets/optimized/game-slepok.jpg' },
    { name: 'Бронза', need: 25, image: 'assets/optimized/game-bronze.jpg' },
    { name: 'КХС', need: 60, image: 'assets/optimized/game-khs.jpg' },
    { name: 'Золото', need: 110, image: 'assets/optimized/game-gold.jpg' },
    { name: 'White Gold', need: 180, image: 'assets/optimized/game-WhiteGold.jpg' }
  ];
  const forgeButton = document.getElementById('forgeButton');
  const forgeDust = document.getElementById('forgeDust');
  const forgeLevel = document.getElementById('forgeLevel');
  const forgeMaterial = document.getElementById('forgeMaterial');
  const forgeProgress = document.getElementById('forgeProgress');
  const forgeReset = document.getElementById('forgeReset');
  const savedDust = Number(localStorage.getItem('grillzForgeDust') || '0');
  let dust = Number.isFinite(savedDust) ? savedDust : 0;

  function currentMaterial() {
    return materials.reduce((current, item) => dust >= item.need ? item : current, materials[0]);
  }

  function renderForge() {
    const material = currentMaterial();
    const next = materials.find((item) => item.need > dust) || materials[materials.length - 1];
    const level = materials.indexOf(material) + 1;
    forgeDust.textContent = new Intl.NumberFormat('ru-RU').format(dust);
    forgeLevel.textContent = 'Уровень ' + level;
    forgeMaterial.textContent = material.name;
    forgeButton.querySelector('img').src = material.image;
    const prevNeed = material.need;
    const span = Math.max(next.need - prevNeed, 1);
    const value = material === next ? 100 : Math.min(((dust - prevNeed) / span) * 100, 100);
    forgeProgress.style.width = value + '%';
  }

  forgeButton?.addEventListener('click', () => {
    dust += 1;
    localStorage.setItem('grillzForgeDust', String(dust));
    renderForge();
    window.GrillzAnalytics?.track('forge_tap', { dust });
  });

  forgeReset?.addEventListener('click', () => {
    dust = 0;
    localStorage.setItem('grillzForgeDust', '0');
    renderForge();
  });

  renderForge();

  const matchItems = ['Золото', 'Серебро', 'КХС', 'Эмаль', 'Камни', 'Слепок'];
  const matchBoard = document.getElementById('matchBoard');
  const matchMoves = document.getElementById('matchMoves');
  const matchStatus = document.getElementById('matchStatus');
  const matchRestart = document.getElementById('matchRestart');
  let openCards = [];
  let found = 0;
  let moves = 0;

  function shuffle(items) {
    return items
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((item) => item.value);
  }

  function renderMatch() {
    openCards = [];
    found = 0;
    moves = 0;
    matchMoves.textContent = '0 ходов';
    matchStatus.textContent = 'Найдите пары материалов.';
    matchBoard.innerHTML = '';
    shuffle([...matchItems, ...matchItems]).forEach((name, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'match-card';
      button.dataset.name = name;
      button.dataset.index = String(index);
      button.textContent = '?';
      button.setAttribute('aria-label', 'Закрытая карточка материала');
      button.addEventListener('click', () => openMatchCard(button));
      matchBoard.appendChild(button);
    });
  }

  function openMatchCard(button) {
    if (button.classList.contains('is-found') || button.classList.contains('is-open') || openCards.length >= 2) return;
    button.classList.add('is-open');
    button.textContent = button.dataset.name;
    button.setAttribute('aria-label', 'Материал ' + button.dataset.name);
    openCards.push(button);
    if (openCards.length !== 2) return;
    moves += 1;
    matchMoves.textContent = new Intl.NumberFormat('ru-RU').format(moves) + ' ходов';
    const [first, second] = openCards;
    if (first.dataset.name === second.dataset.name) {
      first.classList.add('is-found');
      second.classList.add('is-found');
      found += 1;
      openCards = [];
      matchStatus.textContent = found === matchItems.length ? 'Все пары найдены.' : 'Пара найдена.';
      if (found === matchItems.length) window.GrillzAnalytics?.track('match_complete', { moves });
    } else {
      matchStatus.textContent = 'Попробуйте другую пару.';
      setTimeout(() => {
        first.classList.remove('is-open');
        second.classList.remove('is-open');
        first.textContent = '?';
        second.textContent = '?';
        first.setAttribute('aria-label', 'Закрытая карточка материала');
        second.setAttribute('aria-label', 'Закрытая карточка материала');
        openCards = [];
      }, 650);
    }
  }

  matchRestart?.addEventListener('click', renderMatch);
  renderMatch();

  const ideas = {
    clean: 'Чистое направление: один или два зуба, спокойная полировка, минимальный контур, акцент на посадке.',
    stage: 'Сценическое направление: верхний ряд, камни, эмаль или клыки, чтобы образ читался издалека.',
    luxury: 'Люксовое направление: золото, аккуратный блеск, сложная форма без перегруза и точная финишная обработка.',
    sport: 'Спортивное направление: отдельно обсудить каппу для защиты, а grillz оставить для образа вне тренировки.'
  };
  const styleResult = document.getElementById('styleResult');
  document.querySelectorAll('#styleOptions button').forEach((button) => {
    button.addEventListener('click', () => {
      styleResult.textContent = ideas[button.dataset.style] || ideas.clean;
      window.GrillzAnalytics?.track('style_picker', { style: button.dataset.style });
    });
  });
})();
