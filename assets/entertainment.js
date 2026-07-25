(() => {
  const saveKey = 'grillzTamagotchiStateV1';
  const now = () => Date.now();
  const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);
  const formatNumber = (value) => new Intl.NumberFormat('ru-RU').format(Math.floor(value));
  const formatDuration = (ms) => {
    if (ms <= 0) return 'готово';
    const totalMinutes = Math.ceil(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours ? `${hours} ч ${minutes} мин` : `${minutes} мин`;
  };

  const jobs = {
    polish: { label: 'микрополировка', duration: 10 * 60 * 1000, coins: 36, xp: 22, shine: 16 },
    cast: { label: 'отливка', duration: 45 * 60 * 1000, coins: 96, xp: 70, shine: 8 },
    fit: { label: 'примерка', duration: 2 * 60 * 60 * 1000, coins: 210, xp: 150, comfort: 18 },
    stones: { label: 'закрепка камней', duration: 6 * 60 * 60 * 1000, coins: 620, xp: 420, mood: 16 }
  };

  const furniture = {
    mirror: { label: 'Зеркало', cost: 120, comfort: 6 },
    lamp: { label: 'Лампа', cost: 260, comfort: 10 },
    sofa: { label: 'Диван', cost: 520, comfort: 16 },
    speaker: { label: 'Колонка', cost: 900, comfort: 22 }
  };

  const defaultState = {
    name: 'Зубик GC',
    level: 1,
    xp: 0,
    coins: 40,
    hunger: 78,
    shine: 68,
    mood: 74,
    comfort: 58,
    lastTick: now(),
    activeJob: null,
    furniture: []
  };

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(saveKey) || 'null');
      return parsed ? { ...defaultState, ...parsed } : { ...defaultState };
    } catch {
      return { ...defaultState };
    }
  }

  let state = loadState();

  function saveState() {
    localStorage.setItem(saveKey, JSON.stringify(state));
  }

  function applyOfflineProgress() {
    const elapsedHours = Math.max(0, (now() - state.lastTick) / 3600000);
    if (elapsedHours > 0) {
      state.hunger = clamp(state.hunger - elapsedHours * 4.2);
      state.shine = clamp(state.shine - elapsedHours * 3.4);
      state.mood = clamp(state.mood - elapsedHours * 2.6);
      state.comfort = clamp(state.comfort - elapsedHours * 1.4);
    }

    if (state.activeJob && now() >= state.activeJob.endsAt) {
      const job = jobs[state.activeJob.type];
      const condition = (state.hunger + state.shine + state.mood + state.comfort) / 400;
      const multiplier = 0.65 + condition * 0.7;
      state.coins += Math.round(job.coins * multiplier);
      state.xp += Math.round(job.xp * multiplier);
      state.shine = clamp(state.shine + (job.shine || 0));
      state.mood = clamp(state.mood + (job.mood || 0));
      state.comfort = clamp(state.comfort + (job.comfort || 0));
      state.activeJob = null;
      window.GrillzAnalytics?.track('tamagotchi_job_complete', { level: state.level });
    }

    while (state.xp >= state.level * 100) {
      state.xp -= state.level * 100;
      state.level += 1;
      state.coins += state.level * 20;
    }

    state.lastTick = now();
    saveState();
  }

  function setMeter(name, value) {
    const meter = document.getElementById(`${name}Meter`);
    const label = document.getElementById(`${name}Value`);
    if (meter) meter.value = value;
    if (label) label.textContent = Math.round(value) + '%';
  }

  function render() {
    applyOfflineProgress();
    document.getElementById('petName').textContent = state.name;
    document.getElementById('petLevel').textContent = `Уровень ${state.level}`;
    document.getElementById('petCoins').textContent = `${formatNumber(state.coins)} coins`;
    document.getElementById('petXp').textContent = formatNumber(state.xp);
    document.getElementById('nextLevel').textContent = formatNumber(state.level * 100);
    document.getElementById('lastVisit').textContent = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(state.lastTick));
    setMeter('hunger', state.hunger);
    setMeter('shine', state.shine);
    setMeter('mood', state.mood);
    setMeter('comfort', state.comfort);

    Object.keys(furniture).forEach((key) => {
      const item = document.querySelector(`.room-item[data-item="${key}"]`);
      if (item) item.hidden = !state.furniture.includes(key);
    });

    const jobPanel = document.getElementById('jobPanel');
    if (state.activeJob) {
      const job = jobs[state.activeJob.type];
      jobPanel.textContent = `Идёт ${job.label}. Осталось: ${formatDuration(state.activeJob.endsAt - now())}.`;
    } else {
      jobPanel.textContent = 'Свободен. Можно запустить долгую работу.';
    }

    document.querySelectorAll('[data-buy]').forEach((button) => {
      const key = button.dataset.buy;
      button.disabled = state.furniture.includes(key);
      if (state.furniture.includes(key)) button.textContent = `${furniture[key].label} · куплено`;
    });
  }

  function care(action) {
    const changes = {
      feed: { hunger: 18, mood: 2, coins: -4 },
      polish: { shine: 20, mood: 2, coins: -6 },
      play: { mood: 16, hunger: -4, shine: -2 },
      rest: { comfort: 14, mood: 5 }
    }[action];
    if (!changes) return;
    if (changes.coins && state.coins + changes.coins < 0) return;
    Object.entries(changes).forEach(([key, value]) => {
      if (key === 'coins') state.coins += value;
      else state[key] = clamp(state[key] + value);
    });
    state.xp += 2;
    saveState();
    render();
    window.GrillzAnalytics?.track('tamagotchi_care', { action });
  }

  function startJob(type) {
    if (state.activeJob || !jobs[type]) return;
    const job = jobs[type];
    state.activeJob = { type, startedAt: now(), endsAt: now() + job.duration };
    state.hunger = clamp(state.hunger - 3);
    state.mood = clamp(state.mood - 2);
    saveState();
    render();
    window.GrillzAnalytics?.track('tamagotchi_job_start', { type });
  }

  function buyFurniture(key) {
    const item = furniture[key];
    if (!item || state.furniture.includes(key) || state.coins < item.cost) return;
    state.coins -= item.cost;
    state.furniture.push(key);
    state.comfort = clamp(state.comfort + item.comfort);
    state.xp += Math.round(item.cost / 8);
    saveState();
    render();
    window.GrillzAnalytics?.track('tamagotchi_buy', { item: key });
  }

  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action) care(action);
    const job = event.target.closest('[data-job]')?.dataset.job;
    if (job) startJob(job);
    const item = event.target.closest('[data-buy]')?.dataset.buy;
    if (item) buyFurniture(item);
  });

  document.getElementById('forgeReset')?.addEventListener('click', () => {
    state = { ...defaultState, lastTick: now() };
    saveState();
    render();
  });

  render();
  setInterval(render, 30000);
})();
