'use strict';

/**
 * Grillz Game (Hamster Combat × Tinder mechanics) + iVasya AI + Grillz image generator.
 * Free LLM: Groq / OpenRouter / Gemini via env. Image: Pollinations (no key).
 */

const FAQ_KB = `
Гриллзы — съёмное украшение на зубы, не коронка, зубы не обтачивают.
Нужен слепок или 3D-скан. Можно 1 зуб, пару, клыки, full set.
Есть/спать в гриллзах нельзя. Перед едой снимать.
Уход: промыть, высушить, бокс, без абразивов.
Материалы: серебро, золото, белое золото, КХС, камни, open-face, pineapple, polished.
Цена зависит от зубов, металла, пробы, камней, посадки — ориентир в конструкторе на сайте.
Дистанционный заказ возможен при хорошем слепке/скане.
Если давит — снять, не разнашивать, корректировка.
Сайт: https://grillzcustoms.ru конструктор /constructor.html заказ /order.html
`.trim();

const store = globalThis.__gcStore || (globalThis.__gcStore = {
  game: new Map(),
  ivasya: new Map()
});

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getGame(userId) {
  const id = String(userId);
  let g = store.game.get(id);
  const day = dayKey();
  if (!g || g.day !== day) {
    g = {
      day,
      dust: g?.dust || 0,
      energy: 100,
      taps: 0,
      streak: g?.day ? (g.day === prevDay() ? (g.streak || 0) + 1 : 1) : 1,
      matches: 0,
      likes: 0,
      lastTap: 0,
      discountCode: g?.discountCode || null,
      freeClaim: g?.freeClaim || false
    };
    store.game.set(id, g);
  }
  // regen energy: +1 per 30s offline approx using lastTap
  const now = Date.now();
  if (g.lastTap) {
    const gained = Math.floor((now - g.lastTap) / 30000);
    if (gained > 0) g.energy = Math.min(100, g.energy + gained);
  }
  return g;
}

function prevDay() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function levelFromDust(dust) {
  if (dust >= 5000) return { lvl: 6, name: 'Белое золото + ice', next: null };
  if (dust >= 2500) return { lvl: 5, name: 'Золото 585', next: 5000 };
  if (dust >= 1200) return { lvl: 4, name: 'Бронза', next: 2500 };
  if (dust >= 500) return { lvl: 3, name: 'КХС заливка', next: 1200 };
  if (dust >= 150) return { lvl: 2, name: 'Восковая форма', next: 500 };
  return { lvl: 1, name: 'Слепок', next: 150 };
}

function rewardProgress(g) {
  // free grillz path (1 tooth silver fantasy) or discount codes
  if (g.dust >= 8000 && !g.freeClaim) {
    g.freeClaim = true;
    g.discountCode = `FREE1-${String(g.day).replace(/-/g, '').slice(2)}`;
    return { type: 'free', code: g.discountCode, text: '1 зуб silver (условно) — код на консультацию' };
  }
  if (g.dust >= 3000 && !g.discountCode) {
    g.discountCode = `GC15-${hash(g.day + g.dust) % 9000 + 1000}`;
    return { type: 'discount', code: g.discountCode, pct: 15 };
  }
  if (g.dust >= 1000 && !g.discountCode) {
    g.discountCode = `GC7-${hash(g.day + g.dust) % 9000 + 1000}`;
    return { type: 'discount', code: g.discountCode, pct: 7 };
  }
  return null;
}

function hash(s) {
  let h = 0;
  for (const c of String(s)) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

const MATCH_CARDS = [
  { name: 'Mira', vibe: 'night rave · open-face', bio: 'Ищу сет, который горит в стробоскопе' },
  { name: 'Khan', vibe: 'street · yellow gold', bio: '6 верхних, без камней, чистое золото' },
  { name: 'Luna', vibe: 'vip · diamond dust', bio: 'Хочу блеск, но не цирк' },
  { name: 'Rico', vibe: 'stage · fangs', bio: 'Клыки + laser, клип на выходных' },
  { name: 'Asha', vibe: 'soft · rose gold', bio: 'Нежный вайб, 4 зуба, 14K' },
  { name: 'Neo', vibe: 'chrome · industrial', bio: 'Холодный металл, minimal' }
];

function gameKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🦷 Тап +Dust', callback_data: 'gc:gtap' },
        { text: '❤️ Свайп', callback_data: 'gc:gswipe' }
      ],
      [
        { text: '📊 Статус', callback_data: 'gc:gstat' },
        { text: '🎁 Награды', callback_data: 'gc:greward' }
      ],
      [
        { text: '🔥 Серия дня', callback_data: 'gc:gstreak' },
        { text: '💎 VIP dust', callback_data: 'gc:vip' }
      ],
      [
        { text: '🕹️ Старая WebApp', url: `${(process.env.SITE_URL || 'https://grillzcustoms.ru').replace(/\/$/, '')}/gsb.index.html` }
      ],
      [{ text: '🏠 Меню', callback_data: 'gc:menu' }]
    ]
  };
}

function gameStatusText(userId, firstName) {
  const g = getGame(userId);
  const lv = levelFromDust(g.dust);
  const barNext = lv.next ? `${g.dust}/${lv.next}` : `${g.dust} MAX`;
  return [
    `🎮 <b>GRILLZ COMBAT</b> · ${escape(firstName || 'bro')}`,
    '',
    `🟡 Gold Dust: <b>${g.dust}</b>`,
    `⚡ Energy: <b>${g.energy}/100</b>`,
    `📈 Фаза ${lv.lvl}: <b>${lv.name}</b> (${barNext})`,
    `🔥 Streak: <b>${g.streak}</b> дн · ❤️ matches: <b>${g.matches}</b>`,
    g.discountCode ? `🎟 Код: <code>${g.discountCode}</code>` : '🎟 Код скидки откроется от Dust',
    '',
    'Тапай — копи Dust. Свайпай — матчи. Dust = скидка / шанс на free cap.',
    'Энергия регенится со временем. Без энергии — заходи завтра или шли референс в заказ 😉'
  ].join('\n');
}

function doTap(userId) {
  const g = getGame(userId);
  const now = Date.now();
  if (g.energy <= 0) {
    return { text: '⚡ Энергия на нуле, чемпион. Подыши, вернись через пару минут — или закрой заказ, пока Dust греется 😏', markup: gameKeyboard() };
  }
  // anti-spam: min 80ms between taps in same instance
  if (now - g.lastTap < 80) {
    return { text: 'Слишком быстро, палец дымится. Чуть медленнее — Dust любит стиль, не спам.', markup: gameKeyboard() };
  }
  g.energy -= 1;
  const gain = 1 + (g.streak > 3 ? 1 : 0) + (g.matches > 5 ? 1 : 0);
  g.dust += gain;
  g.taps += 1;
  g.lastTap = now;
  const reward = rewardProgress(g);
  const lv = levelFromDust(g.dust);
  let extra = '';
  if (reward?.type === 'discount') {
    extra = `\n\n🎉 Ап! Код на −${reward.pct}%: <code>${reward.code}</code> — кинь в заявку.`;
  }
  if (reward?.type === 'free') {
    extra = `\n\n👑 LEGENDARY: код free-консультации на 1 cap: <code>${reward.code}</code>`;
  }
  return {
    text: [
      `💥 <b>+${gain} Dust</b> · всего <b>${g.dust}</b>`,
      `⚡ ${g.energy}/100 · фаза ${lv.lvl} «${lv.name}»`,
      extra
    ].filter(Boolean).join('\n'),
    markup: gameKeyboard()
  };
}

function doSwipe(userId) {
  const g = getGame(userId);
  const card = MATCH_CARDS[hash(`${dayKey()}:${userId}:${g.likes}`) % MATCH_CARDS.length];
  g.likes += 1;
  const matched = hash(`${userId}:${card.name}:${g.likes}`) % 3 !== 0;
  if (matched) {
    g.matches += 1;
    g.dust += 12;
    return {
      text: [
        `❤️ <b>MATCH · ${card.name}</b>`,
        `Вайб: ${card.vibe}`,
        `«${card.bio}»`,
        '',
        `+12 Dust за химию. Матчей: ${g.matches}. Иди собирай сет в конструкторе, пока муза не ушла 🔥`
      ].join('\n'),
      markup: gameKeyboard()
    };
  }
  return {
    text: [
      `👎 ${card.name} · ${card.vibe}`,
      `«${card.bio}»`,
      '',
      'Не зашло. Бывает. Следующий свайп — может, твой iced-out soulmate.'
    ].join('\n'),
    markup: gameKeyboard()
  };
}

function rewardsText(userId) {
  const g = getGame(userId);
  return [
    '🎁 <b>Награды Grillz Combat</b>',
    '',
    '· 1000 Dust → код −7%',
    '· 3000 Dust → код −15%',
    '· 8000 Dust → free-консультация 1 cap (silver tier fantasy)',
    '· Streak 3+ дня → +1 Dust за тап',
    '· 5+ матчей → +1 Dust за тап',
    '',
    g.discountCode ? `Твой код: <code>${g.discountCode}</code>` : 'Кода пока нет — тапай и свайпай.',
    '',
    'Коды не оферта: менеджер подтверждает при заказе. Но без Dust даже скидку не выбьешь 😎'
  ].join('\n');
}

function escape(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ---------- iVasya LLM ---------- */
async function callFreeLLM(userMessage, history = []) {
  const system = `Ты — iVasya, ИИ-консультант бренда Grillz Customs (Москва). 
Ты дерзкий уличный пацан-продавец с юмором: говоришь на смеси русского уличного сленга и нормального русского, 
постоянно шутишь (коротко, без токсичности и оскорблений), льстишь клиенту по делу, но честно по технике.
Знания FAQ:
${FAQ_KB}
Правила: не обещай медицину; гриллзы не коронки; не едят в них; цена — ориентир, финал после слепка.
Всегда в каждом ответе минимум 1 шутка/подкол + 1 чёткий next step (конструктор, заказ, слепок).
Ответ 2–6 коротких абзацев, можно эмодзи. Не матерись жёстко.`;

  const messages = [
    { role: 'system', content: system },
    ...history.slice(-6),
    { role: 'user', content: userMessage }
  ];

  // 1) Groq free
  if (process.env.GROQ_API_KEY) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.85,
          max_tokens: 500
        })
      });
      const data = await r.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (e) {
      console.error('groq', e?.message || e);
    }
  }

  // 2) OpenRouter free models
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'content-type': 'application/json',
          'HTTP-Referer': process.env.SITE_URL || 'https://grillzcustoms.ru',
          'X-Title': 'GrillzCustoms-iVasya'
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
          messages,
          temperature: 0.85
        })
      });
      const data = await r.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (e) {
      console.error('openrouter', e?.message || e);
    }
  }

  // 3) Gemini free
  if (process.env.GEMINI_API_KEY) {
    try {
      const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: system + '\n\nКлиент: ' + userMessage }] }
            ]
          })
        }
      );
      const data = await r.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n');
      if (text) return text;
    } catch (e) {
      console.error('gemini', e?.message || e);
    }
  }

  return localVasya(userMessage);
}

function localVasya(msg) {
  const t = String(msg || '').toLowerCase();
  if (t.includes('цена') || t.includes('стоим') || t.includes('прайс')) {
    return 'Слушай, прайс — как рэп-баттл: зависит от раунда. Сколько зубов, какой металл, камни или pure polished — и уже другая сумма. 😄\n\nСобери сет в конструкторе на сайте, там прайс GC по зубам, а финал после слепка. Я б на твоём месте уже кликал «Конструктор», пока золото не подорожало от твоего вайба.';
  }
  if (t.includes('есть') || t.includes('еда')) {
    return 'Есть в гриллзах? Брат, это украшение, не кастрюля. 🍲 Снял — поел — надел. Иначе металл скажет тебе «пока» раньше, чем ты скажешь «вкусно».';
  }
  if (t.includes('уход') || t.includes('чист')) {
    return 'Уход простой, как чистые кроссы: снял, промыл, высушил, в бокс. Без абразивов и «я потрё скипидаром». 😎 Блеск любит нежность, а не хардкор.';
  }
  if (t.includes('слеп') || t.includes('скан')) {
    return 'Слепок/3D-скан — это фундамент. Без него мы как ювелир без размера пальца: красиво, но мимо. 📸 Пришли скан или запишись на слепок — и полетели.';
  }
  return 'Йо, я iVasya — твой уличный консультант по grillz. 🔥 Спрашивай про металл, зубы, уход, заказ. Шутки бесплатно, посадка — только точная.\n\nКинь вопрос или жми Конструктор — соберём сет, от которого зеркало попросит автограф.';
}

function ivasyaKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🦷 Конструктор', url: `${(process.env.SITE_URL || 'https://grillzcustoms.ru').replace(/\/$/, '')}/constructor.html` },
        { text: '📦 Заказ', callback_data: 'gc:order' }
      ],
      [
        { text: '💰 Прайс', callback_data: 'gc:price' },
        { text: '🧼 Уход', callback_data: 'gc:care' }
      ],
      [{ text: '🏠 Меню', callback_data: 'gc:menu' }]
    ]
  };
}

function setIvasyaMode(userId, on) {
  store.ivasya.set(String(userId), { on: !!on, history: store.ivasya.get(String(userId))?.history || [] });
}

function isIvasyaMode(userId) {
  return !!store.ivasya.get(String(userId))?.on;
}

async function ivasyaReply(userId, text, firstName) {
  const key = String(userId);
  let session = store.ivasya.get(key) || { on: true, history: [] };
  session.on = true;
  const answer = await callFreeLLM(text, session.history);
  session.history.push({ role: 'user', content: text });
  session.history.push({ role: 'assistant', content: answer });
  if (session.history.length > 12) session.history = session.history.slice(-12);
  store.ivasya.set(key, session);
  return {
    text: `🧢 <b>iVasya</b> · ${escape(firstName || '')}\n\n${escape(answer).replace(/\n/g, '\n')}`,
    // don't double-escape AI content if it has no HTML — send as plain with minimal escape
    reply_markup: ivasyaKeyboard(),
    parse_mode_note: true,
    rawAnswer: answer
  };
}

/* ---------- image generator (Pollinations free) ---------- */
function grillzImageUrl(prompt) {
  const full = `photorealistic custom gold dental grillz jewelry, ${prompt}, product photo, black background, studio lighting, high detail metal`;
  const seed = hash(prompt + Date.now()) % 999999;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(full)}?width=768&height=768&nologo=true&seed=${seed}&model=flux`;
}

function generatorKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🟡 Gold polished', callback_data: 'gc:gen:gold' },
        { text: '⚪ White gold ice', callback_data: 'gc:gen:white' }
      ],
      [
        { text: '🌹 Rose gold', callback_data: 'gc:gen:rose' },
        { text: '💎 Diamond pave', callback_data: 'gc:gen:diamond' }
      ],
      [
        { text: '🦷 Open face', callback_data: 'gc:gen:open' },
        { text: '🍍 Pineapple cut', callback_data: 'gc:gen:pine' }
      ],
      [{ text: '🏠 Меню', callback_data: 'gc:menu' }]
    ]
  };
}

const GEN_PROMPTS = {
  gold: 'six upper teeth yellow gold polished grillz bridge',
  white: 'six upper teeth white gold grillz with light diamond dust',
  rose: 'rose gold custom grillz four front teeth',
  diamond: 'yellow gold grillz fully iced diamond pave',
  open: 'open face gold grillz showing tooth windows',
  pine: 'pineapple cut iced gold grillz textured facets'
};

module.exports = {
  getGame,
  gameKeyboard,
  gameStatusText,
  doTap,
  doSwipe,
  rewardsText,
  ivasyaKeyboard,
  setIvasyaMode,
  isIvasyaMode,
  ivasyaReply,
  grillzImageUrl,
  generatorKeyboard,
  GEN_PROMPTS,
  callFreeLLM
};
