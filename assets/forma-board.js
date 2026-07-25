/**
 * Forma board — client-side index for Grillz Customs community.
 * Architecture inspired by classic board indexes (categories → forums → last post / stats),
 * implemented originally for GC without third-party forum engine code.
 */
(() => {
  'use strict';

  const STORAGE_TOPICS = 'gc_forma_topics_v1';
  const STORAGE_COLLAPSE = 'gc_forma_collapse_v1';

  /** Seed structure mirrors massovki-style category → forum → subforums */
  const BOARD = [
    {
      id: 'start',
      title: 'Старт и правила',
      note: 'Как зайти в комьюнити и не потеряться',
      forums: [
        {
          id: 'guide',
          icon: '✦',
          title: 'Полезная информация',
          desc: 'Как оформить анкету, что писать в заказе, как работать со слепком и конструктором.',
          subs: ['Правила', 'Для новичков', 'Безопасность'],
          topics: 12,
          posts: 48,
          last: { title: 'Чек-лист перед первым заказом', author: 'GC Team', at: '2026-07-22T14:10:00' }
        },
        {
          id: 'faq-board',
          icon: '?',
          title: 'F.A.Q. комьюнити',
          desc: 'Частые вопросы: материалы, проба, уход, сроки, посадка, камни.',
          subs: ['Материалы', 'Уход', 'Сроки'],
          topics: 28,
          posts: 163,
          last: { title: 'Open face vs polished — что выбрать', author: 'goldtooth', at: '2026-07-24T19:40:00' }
        }
      ]
    },
    {
      id: 'profiles',
      title: 'Анкеты и образы',
      note: 'Люди, лица, стили — база для кастов и коллабов',
      forums: [
        {
          id: 'profiles-m',
          icon: '♂',
          title: 'Анкеты · мужчины',
          desc: 'Портфолио, рост, стиль, есть ли grillz / готовность к съёмке.',
          subs: ['15–25', '26–35', '36+'],
          topics: 64,
          posts: 211,
          last: { title: 'Макс, 24, street / gold set', author: 'max_g', at: '2026-07-24T21:05:00' }
        },
        {
          id: 'profiles-w',
          icon: '♀',
          title: 'Анкеты · женщины',
          desc: 'Образы для клипов, рекламы, сцены и fashion-кастов.',
          subs: ['15–25', '26–35', '36+'],
          topics: 71,
          posts: 240,
          last: { title: 'Алина, 26 — white gold + stones', author: 'alinav', at: '2026-07-23T11:22:00' }
        },
        {
          id: 'profiles-other',
          icon: '◎',
          title: 'Другие анкеты',
          desc: 'Регионы, дуэты, неформальный look, character-типажи.',
          subs: ['Регионы', 'Дуэты', 'Character'],
          topics: 33,
          posts: 97,
          last: { title: 'Пара для клипа, Мск', author: 'duo_cast', at: '2026-07-20T16:00:00' }
        }
      ]
    },
    {
      id: 'jobs',
      title: 'Съёмки, касты, коллабы',
      note: 'Оплачиваемые и творческие приглашения (grillz / smile content)',
      forums: [
        {
          id: 'paid-shoot',
          icon: '🎬',
          title: 'Оплачиваемые съёмки',
          desc: 'Клипы, реклама, сериалы, бренд-кампании — с датой, локацией и гонораром.',
          subs: ['Клипы', 'Реклама', 'Сериалы'],
          topics: 118,
          posts: 842,
          last: { title: '25 июля · клип · gold smile close-up', author: 'prod_north', at: '2026-07-24T18:30:00' }
        },
        {
          id: 'castings',
          icon: '📷',
          title: 'Кастинги по фото',
          desc: 'Первичный отбор: отправь фото улыбки / портрет / grillz set.',
          subs: ['Москва', 'Онлайн'],
          topics: 56,
          posts: 190,
          last: { title: 'Кастинг улыбок 20–30 · бренд', author: 'cast_lab', at: '2026-07-22T09:15:00' }
        },
        {
          id: 'collab',
          icon: '🤝',
          title: 'Коллабы и бартер',
          desc: 'Музыканты, барберы, тату, фотографы, клипмейкеры — обмен аудиторией и контентом.',
          subs: ['Музыка', 'Фото', 'Барбершопы'],
          topics: 41,
          posts: 155,
          last: { title: 'Ищу модель с open-face set', author: 'shotby', at: '2026-07-21T20:44:00' }
        },
        {
          id: 'hot-reserve',
          icon: '⚡',
          title: 'Горячий резерв',
          desc: 'Срочно на завтра / сегодня: кто готов выйти на съёмку с готовыми grillz.',
          subs: [],
          topics: 9,
          posts: 420,
          last: { title: 'Резерв на утро · 2 человека', author: 'GC Desk', at: '2026-07-25T07:50:00' }
        }
      ]
    },
    {
      id: 'craft',
      title: 'Мастерство и B2B',
      note: 'Мастерские, клиники, лаборатории',
      forums: [
        {
          id: 'labs',
          icon: '◇',
          title: 'Мастерским и лабораториям',
          desc: 'Заказы, посадка, файлы, CAD, сроки, партнёрские условия.',
          subs: ['CAD', 'Слепки', 'Партнёрка'],
          topics: 22,
          posts: 87,
          last: { title: 'Обмен STL / протокол посадки', author: 'lab_msk', at: '2026-07-18T13:00:00' }
        },
        {
          id: 'clinics',
          icon: '✚',
          title: 'Клиникам',
          desc: 'Совместные кейсы, направление пациентов, документация.',
          subs: ['Протокол', 'Маркетинг'],
          topics: 15,
          posts: 61,
          last: { title: 'Как упаковать совместный кейс', author: 'clinic_pr', at: '2026-07-15T10:20:00' }
        },
        {
          id: 'props',
          icon: '◆',
          title: 'Реквизит и образы',
          desc: 'Съёмочный реквизит, временные сеты, сценические grillz.',
          subs: ['Сцена', 'Клип', 'Аренда'],
          topics: 19,
          posts: 54,
          last: { title: 'Временный set на 1 смену', author: 'propdesk', at: '2026-07-12T17:33:00' }
        }
      ]
    },
    {
      id: 'talk',
      title: 'Обсуждения и отзывы',
      note: 'Живой разговор комьюнити',
      forums: [
        {
          id: 'refs',
          icon: '★',
          title: 'Референсы и стиль',
          desc: 'Звёзды, эпохи, street, luxury, character — что носить и как собрать.',
          subs: ['Звёзды', 'Улица', 'Luxury'],
          topics: 88,
          posts: 512,
          last: { title: 'Pineapple cut — лучшие ракурсы', author: 'frameup', at: '2026-07-24T12:08:00' }
        },
        {
          id: 'reviews',
          icon: '✎',
          title: 'Отзывы и разбор',
          desc: 'Личный опыт заказа, посадки, ухода. Только свой опыт.',
          subs: [],
          topics: 47,
          posts: 306,
          last: { title: '6 верхних 14K — через 3 месяца', author: 'owner6', at: '2026-07-19T22:11:00' }
        },
        {
          id: 'game',
          icon: '🎮',
          title: 'Grillz Tamagotchi & fun',
          desc: 'Идеи, ивенты, мемы, мини-игры на сайте.',
          subs: ['Идеи', 'Ивенты'],
          topics: 36,
          posts: 178,
          last: { title: 'Новый питомец-зуб — скины', author: 'playgc', at: '2026-07-17T15:45:00' }
        },
        {
          id: 'site',
          icon: '⚙',
          title: 'О работе сайта',
          desc: 'Баги, идеи по конструктору, Форме, аккаунту.',
          subs: [],
          topics: 14,
          posts: 92,
          last: { title: 'Конструктор: пресеты зубов', author: 'GC Team', at: '2026-07-25T03:15:00' }
        }
      ]
    }
  ];

  const ONLINE_SEED = ['GC Team', 'goldtooth', 'alinav', 'prod_north', 'cast_lab', 'max_g', 'lab_msk', 'frameup'];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const fmtDate = (iso) => {
    try {
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const moneyish = (n) => new Intl.NumberFormat('ru-RU').format(n);

  function loadTopics() {
    try {
      const raw = localStorage.getItem(STORAGE_TOPICS);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function saveTopics(list) {
    try {
      localStorage.setItem(STORAGE_TOPICS, JSON.stringify(list.slice(0, 80)));
    } catch { /* ignore */ }
  }

  function loadCollapse() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_COLLAPSE) || '{}') || {};
    } catch {
      return {};
    }
  }

  function saveCollapse(map) {
    try {
      localStorage.setItem(STORAGE_COLLAPSE, JSON.stringify(map));
    } catch { /* ignore */ }
  }

  function allForums() {
    return BOARD.flatMap((c) => c.forums.map((f) => ({ ...f, catId: c.id, catTitle: c.title })));
  }

  function stats() {
    const forums = allForums();
    const userTopics = loadTopics();
    const topics = forums.reduce((s, f) => s + f.topics, 0) + userTopics.length;
    const posts = forums.reduce((s, f) => s + f.posts, 0) + userTopics.length;
    return {
      topics,
      posts,
      forums: forums.length,
      users: 1280 + userTopics.length * 3,
      newest: userTopics[0]?.author || 'guest_smile'
    };
  }

  function recentFeed() {
    const seeded = allForums()
      .filter((f) => f.last)
      .map((f) => ({
        title: f.last.title,
        author: f.last.author,
        at: f.last.at,
        forum: f.title,
        forumId: f.id
      }));
    const user = loadTopics().map((t) => ({
      title: t.title,
      author: t.author || 'вы',
      at: t.createdAt,
      forum: t.forumTitle || t.forum,
      forumId: t.forum
    }));
    return [...user, ...seeded]
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 12);
  }

  function renderBoard(filter = '') {
    const root = $('#boardList');
    if (!root) return;
    const q = filter.trim().toLowerCase();
    const collapse = loadCollapse();
    root.innerHTML = '';

    BOARD.forEach((cat) => {
      const forums = cat.forums.filter((f) => {
        if (!q) return true;
        const blob = [f.title, f.desc, ...(f.subs || []), cat.title].join(' ').toLowerCase();
        return blob.includes(q);
      });
      if (!forums.length) return;

      const section = document.createElement('section');
      section.className = 'board-cat' + (collapse[cat.id] ? ' is-collapsed' : '');
      section.dataset.cat = cat.id;

      const head = document.createElement('button');
      head.type = 'button';
      head.className = 'board-cat-head';
      head.setAttribute('aria-expanded', collapse[cat.id] ? 'false' : 'true');
      head.innerHTML = `
        <div>
          <h2>${cat.title}</h2>
          <p>${cat.note}</p>
        </div>
        <span class="board-cat-toggle" aria-hidden="true">▾</span>
      `;
      head.addEventListener('click', () => {
        const map = loadCollapse();
        map[cat.id] = !section.classList.contains('is-collapsed') ? true : false;
        // toggle: if currently open, collapse=true
        const willCollapse = !section.classList.contains('is-collapsed');
        map[cat.id] = willCollapse;
        saveCollapse(map);
        section.classList.toggle('is-collapsed', willCollapse);
        head.setAttribute('aria-expanded', willCollapse ? 'false' : 'true');
      });

      const body = document.createElement('div');
      body.className = 'board-cat-body';

      const thead = document.createElement('div');
      thead.className = 'board-table-head';
      thead.innerHTML = `
        <span></span>
        <span>Раздел</span>
        <span style="text-align:center">Темы</span>
        <span style="text-align:center">Сообщения</span>
        <span>Последнее</span>
      `;
      body.appendChild(thead);

      forums.forEach((f) => {
        // bump counts if user posted here
        const userCount = loadTopics().filter((t) => t.forum === f.id).length;
        const topics = f.topics + userCount;
        const posts = f.posts + userCount;
        const userLast = loadTopics().find((t) => t.forum === f.id);
        const last = userLast
          ? { title: userLast.title, author: userLast.author || 'вы', at: userLast.createdAt }
          : f.last;

        const row = document.createElement('article');
        row.className = 'board-row';
        row.dataset.forum = f.id;
        row.innerHTML = `
          <div class="board-icon" aria-hidden="true">${f.icon}</div>
          <div class="board-main">
            <h3><a href="#composer" data-forum-pick="${f.id}">${f.title}</a></h3>
            <p class="desc">${f.desc}</p>
            ${f.subs?.length ? `<div class="board-subs">${f.subs.map((s) => `<span class="board-sub">${s}</span>`).join('')}</div>` : ''}
            <div class="board-stat-mobile" hidden>
              <span>Темы: ${moneyish(topics)}</span>
              <span>Сообщ.: ${moneyish(posts)}</span>
            </div>
          </div>
          <div class="board-stat">${moneyish(topics)}<small>темы</small></div>
          <div class="board-stat">${moneyish(posts)}<small>сообщ.</small></div>
          <div class="board-last">
            ${last
              ? `<a href="#feed" title="${last.title}">${last.title}</a>
                 <div class="meta">${last.author} · ${fmtDate(last.at)}</div>`
              : `<span class="empty">Нет сообщений</span>`}
          </div>
        `;
        // show mobile stats via CSS; unhide helper for a11y tree
        const mob = row.querySelector('.board-stat-mobile');
        if (mob) mob.hidden = false;
        body.appendChild(row);
      });

      section.append(head, body);
      root.appendChild(section);
    });

    if (!root.children.length) {
      root.innerHTML = `<div class="feed-empty">Ничего не найдено по запросу «${filter}»</div>`;
    }

    // wire forum picks
    $$('[data-forum-pick]').forEach((a) => {
      a.addEventListener('click', () => {
        const sel = $('#topicForum');
        if (sel) sel.value = a.getAttribute('data-forum-pick');
      });
    });
  }

  function renderStats() {
    const s = stats();
    const box = $('#formaStats');
    if (box) {
      box.innerHTML = `
        <div class="forma-stat-line"><span>Всего тем</span><strong>${moneyish(s.topics)}</strong></div>
        <div class="forma-stat-line"><span>Всего сообщений</span><strong>${moneyish(s.posts)}</strong></div>
        <div class="forma-stat-line"><span>Разделов</span><strong>${moneyish(s.forums)}</strong></div>
        <div class="forma-stat-line"><span>Участников (ориентир)</span><strong>${moneyish(s.users)}</strong></div>
        <div class="forma-stat-line"><span>Новый участник</span><strong>${s.newest}</strong></div>
      `;
    }
    const online = $('#formaOnline');
    if (online) {
      const extra = loadTopics().slice(0, 3).map((t) => t.author || 'гость');
      const names = [...new Set([...extra, ...ONLINE_SEED])].slice(0, 10);
      online.innerHTML = `
        <p>Сейчас на «Форме»: <strong>${names.length + 4}</strong> · ${names.length} в ленте, остальные гости.</p>
        <div class="online-dots">
          ${names.map((n) => `<span class="online-dot"><i></i>${n}</span>`).join('')}
        </div>
      `;
    }
  }

  function renderFeed() {
    const list = $('#feedList');
    if (!list) return;
    const items = recentFeed();
    if (!items.length) {
      list.innerHTML = `<div class="feed-empty">Пока тихо — создайте первую тему ниже.</div>`;
      return;
    }
    list.innerHTML = items.map((it) => `
      <article class="feed-item">
        <div>
          <h3>${escapeHtml(it.title)}</h3>
          <p>${escapeHtml(it.author)} · ${escapeHtml(it.forum || '')}</p>
          <span class="tag">${escapeHtml(it.forumId || 'board')}</span>
        </div>
        <div class="when">${fmtDate(it.at)}</div>
      </article>
    `).join('');
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fillForumSelect() {
    const sel = $('#topicForum');
    if (!sel) return;
    sel.innerHTML = allForums().map((f) =>
      `<option value="${f.id}">${f.catTitle} → ${f.title}</option>`
    ).join('');
  }

  function bindComposer() {
    const form = $('#formaTopicForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const title = String(data.title || '').trim();
      const message = String(data.message || '').trim();
      const forum = String(data.forum || '');
      const author = String(data.author || '').trim() || 'гость';
      const status = $('#formaFormStatus');
      if (title.length < 4 || message.length < 10) {
        if (status) {
          status.textContent = 'Заголовок от 4 символов, текст от 10.';
          status.classList.remove('is-ok');
        }
        return;
      }
      const forumMeta = allForums().find((f) => f.id === forum);
      const topic = {
        id: 't_' + Date.now(),
        title,
        message,
        forum,
        forumTitle: forumMeta?.title || forum,
        author,
        createdAt: new Date().toISOString()
      };
      const list = loadTopics();
      list.unshift(topic);
      saveTopics(list);
      form.reset();
      fillForumSelect();
      if (forum) $('#topicForum').value = forum;
      if (status) {
        status.textContent = 'Черновик темы сохранён локально. После backend появится в общем потоке.';
        status.classList.add('is-ok');
      }
      renderBoard($('#formaSearch')?.value || '');
      renderStats();
      renderFeed();
      window.GrillzAnalytics?.track('forma_topic_draft', { forum });
      $('#feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function bindToolbar() {
    const search = $('#formaSearch');
    search?.addEventListener('input', () => {
      renderBoard(search.value);
    });

    $('#btnActiveTopics')?.addEventListener('click', () => {
      renderFeed();
      $('#feed')?.scrollIntoView({ behavior: 'smooth' });
      setActiveTool('btnActiveTopics');
    });
    $('#btnExpandAll')?.addEventListener('click', () => {
      saveCollapse({});
      renderBoard(search?.value || '');
      setActiveTool('btnExpandAll');
    });
    $('#btnCollapseAll')?.addEventListener('click', () => {
      const map = {};
      BOARD.forEach((c) => { map[c.id] = true; });
      saveCollapse(map);
      renderBoard(search?.value || '');
      setActiveTool('btnCollapseAll');
    });
    $('#btnNewTopic')?.addEventListener('click', () => {
      $('#composer')?.scrollIntoView({ behavior: 'smooth' });
      $('#topicTitle')?.focus();
      setActiveTool('btnNewTopic');
    });
  }

  function setActiveTool(id) {
    $$('.forma-tool').forEach((el) => el.classList.toggle('is-active', el.id === id));
  }

  function tickClock() {
    const el = $('#formaClock');
    if (!el) return;
    const now = new Date();
    el.textContent = new Intl.DateTimeFormat('ru-RU', {
      weekday: 'short', day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'Europe/Moscow'
    }).format(now) + ' · МСК';
  }

  function boot() {
    if (!$('#boardList')) return;
    fillForumSelect();
    renderBoard();
    renderStats();
    renderFeed();
    bindComposer();
    bindToolbar();
    tickClock();
    setInterval(tickClock, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
