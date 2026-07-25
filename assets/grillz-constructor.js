(() => {
  const upper = ['15', '14', '13', '12', '11', '21', '22', '23', '24', '25'];
  const lower = ['45', '44', '43', '42', '41', '31', '32', '33', '34', '35'];
  const options = {
    material: [
      ['yellow-gold', 'Yellow Gold', 9000],
      ['white-gold', 'White Gold', 11000],
      ['rose-gold', 'Rose Gold', 10500],
      ['silver', 'Silver', 5200],
      ['chrome', 'Chrome', 4600],
      ['faux-gold', 'Faux Gold', 2900]
    ],
    style: [
      ['polished', 'Polished', 0],
      ['pineapple', 'Pineapple', 1800],
      ['open-face', 'Open Face', 1400],
      ['laser', 'Laser', 2500],
      ['diamond-dust', 'Diamond Dust', 3200]
    ],
    purity: [
      ['10k', '10K', 0],
      ['14k', '14K', 2200],
      ['18k', '18K', 5200]
    ],
    stones: [
      ['none', 'Без камней', 0],
      ['moissanite', 'Moissanite', 7200],
      ['diamond-si', 'Diamond SI', 14000],
      ['diamond-vvs', 'Diamond VVS', 26000]
    ]
  };

  const state = {
    selected: new Set(['11', '21']),
    material: 'yellow-gold',
    style: 'polished',
    purity: '14k',
    stones: 'none'
  };

  const labelFor = (group, key) => options[group].find((item) => item[0] === key)?.[1] || key;
  const priceFor = (group, key) => options[group].find((item) => item[0] === key)?.[2] || 0;
  const format = (value) => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';

  function renderTeeth(targetId, teeth) {
    const target = document.getElementById(targetId);
    target.innerHTML = '';
    teeth.forEach((tooth) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tooth-button';
      button.textContent = tooth;
      button.setAttribute('aria-pressed', state.selected.has(tooth) ? 'true' : 'false');
      button.classList.toggle('is-selected', state.selected.has(tooth));
      button.addEventListener('click', () => {
        if (state.selected.has(tooth)) state.selected.delete(tooth);
        else state.selected.add(tooth);
        render();
      });
      target.appendChild(button);
    });
  }

  function renderOptions() {
    Object.entries(options).forEach(([group, items]) => {
      const holder = document.querySelector(`[data-option-group="${group}"]`);
      holder.innerHTML = '';
      items.forEach(([key, label]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.classList.toggle('is-active', state[group] === key);
        button.addEventListener('click', () => {
          state[group] = key;
          render();
        });
        holder.appendChild(button);
      });
    });
  }

  function buildSummary() {
    const teeth = [...state.selected].sort((a, b) => Number(a) - Number(b));
    const perTooth = priceFor('material', state.material) + priceFor('style', state.style) + priceFor('purity', state.purity) + priceFor('stones', state.stones);
    const total = teeth.length ? perTooth * teeth.length : 0;
    return {
      teeth,
      total,
      text: `Зубы: ${teeth.join(', ') || 'не выбраны'}\nМатериал: ${labelFor('material', state.material)}\nСтиль: ${labelFor('style', state.style)}\nПроба: ${labelFor('purity', state.purity)}\nКамни: ${labelFor('stones', state.stones)}\nОриентир: ${format(total)}`
    };
  }

  function renderSummary() {
    const summary = buildSummary();
    document.getElementById('constructorSummary').innerHTML = `
      <p><strong>Выбрано зубов:</strong> ${summary.teeth.length}</p>
      <p><strong>Материал:</strong> ${labelFor('material', state.material)}</p>
      <p><strong>Стиль:</strong> ${labelFor('style', state.style)}</p>
      <p><strong>Ориентировочно:</strong> ${format(summary.total)}</p>
      <p class="source-line">Цена не является офертой. Финальная стоимость зависит от слепка, посадки, веса и ювелирной работы.</p>
    `;
  }

  function render() {
    renderTeeth('upperTeeth', upper);
    renderTeeth('lowerTeeth', lower);
    renderOptions();
    renderSummary();
  }

  document.getElementById('copyConstructor')?.addEventListener('click', async () => {
    const summary = buildSummary();
    await navigator.clipboard?.writeText(summary.text);
    window.GrillzAnalytics?.track('constructor_copy', { teeth: summary.teeth.length });
  });

  render();
})();
