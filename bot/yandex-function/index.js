'use strict';

const siteUrl = process.env.SITE_URL || 'https://grillzcustoms.ru';
const adminChatId = process.env.ADMIN_CHAT_ID || '';
const telegramFetchTimeoutMs = Number(process.env.TELEGRAM_FETCH_TIMEOUT_MS || 25000);
const telegramSetupTimeoutMs = Number(process.env.TELEGRAM_SETUP_TIMEOUT_MS || 15000);
const defaultStartPhotoPath = 'assets/bot/start-grillz-customs-moscow.jpg';

const gcx = require('./game-ivasya');

function response(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...headers
    },
    body: JSON.stringify(body)
  };
}

function parseBody(event) {
  if (!event || !event.body) return {};
  if (typeof event.body === 'object') return event.body;
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function compactText(text) {
  return String(text || '').trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function page(path) {
  return `${siteUrl.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
}

function startPhotoUrl() {
  return process.env.START_PHOTO_URL || page(defaultStartPhotoPath);
}

function displayNameFromSender(sender = {}) {
  const fullName = [sender.first_name, sender.last_name].filter(Boolean).join(' ').trim();
  const displayName = fullName || (sender.username ? `@${sender.username}` : 'друг');
  return displayName.slice(0, 48);
}

function keyboard(view = 'main') {
  const menuButton = { text: '🏠 Меню', callback_data: 'gc:menu' };
  const rows = {
    main: [
      [
        { text: '🎮 Grillz Game', callback_data: 'gc:game' },
        { text: '🦷 Конструктор', url: page('constructor.html') }
      ],
      [
        { text: '🧢 iVasya', callback_data: 'gc:ivasya' },
        { text: '🖼 Генератор Grillz', callback_data: 'gc:gen' }
      ],
      [
        { text: '⚡ Мини-квест', callback_data: 'gc:quest' },
        { text: '💰 Рассчитать', callback_data: 'gc:price' }
      ],
      [
        { text: '📦 Заказ', callback_data: 'gc:order' },
        { text: '🧬 Материалы', callback_data: 'gc:materials' }
      ],
      [
        { text: '💎 Работы', url: page('works.html') },
        { text: '⭐ Звёзды', url: page('stars.html') }
      ],
      [
        { text: '🧼 Уход', callback_data: 'gc:care' },
        { text: '🎁 Сертификат', url: page('gift.html') }
      ],
      [
        { text: '💬 Форум', url: page('forum.html') },
        { text: '📍 Контакты', callback_data: 'gc:contacts' }
      ]
    ],
    game: (gcx.gameKeyboard().inline_keyboard),
    price: [
      [
        { text: '🦷 Собрать сет', url: page('constructor.html') },
        { text: '📦 Оформить заказ', url: page('order.html') }
      ],
      [
        { text: '🧬 Материалы', callback_data: 'gc:materials' },
        { text: '📍 Контакты', callback_data: 'gc:contacts' }
      ],
      [menuButton]
    ],
    order: [
      [
        { text: '📦 Страница заказа', url: page('order.html') },
        { text: '🦷 Конструктор', url: page('constructor.html') }
      ],
      [
        { text: '🧼 Уход', callback_data: 'gc:care' },
        { text: '💎 Работы', url: page('works.html') }
      ],
      [menuButton]
    ],
    contact: [
      [
        { text: '✈️ Написать в Telegram', url: 'https://t.me/Grillz_Customs_bot' },
        { text: '🖤 VK', url: 'https://vk.com/grillz_customs' }
      ],
      [
        { text: '📦 Заказ', url: page('order.html') },
        { text: '💬 Форум', url: page('forum.html') }
      ],
      [menuButton]
    ],
    back: [[menuButton]]
  };

  return {
    inline_keyboard: rows[view] || rows.main
  };
}

function commandRoute(text) {
  const t = compactText(text);
  if (text === 'gc:menu' || text.startsWith('/start') || text.startsWith('/menu')) return 'menu';
  if (text === 'gc:game' || text.startsWith('/game') || t.includes('игр') || t.includes('combat') || t.includes('tamagotchi') || t.includes('тамагочи')) return 'game';
  if (text === 'gc:gtap') return 'gtap';
  if (text === 'gc:gswipe') return 'gswipe';
  if (text === 'gc:gstat') return 'gstat';
  if (text === 'gc:greward') return 'greward';
  if (text === 'gc:gstreak') return 'gstreak';
  if (text === 'gc:ivasya' || text.startsWith('/ivasya') || t.includes('ivasya') || t.includes('ивася') || t.includes('вася')) return 'ivasya';
  if (text === 'gc:gen' || text.startsWith('/gen') || t.includes('генератор')) return 'gen';
  if (text.startsWith('gc:gen:')) return 'gen_run';
  if (text === 'gc:quest' || t.includes('квест') || t.includes('dust')) return 'quest';
  if (text === 'gc:price' || text.startsWith('/price') || t.includes('цена') || t.includes('стоим') || t.includes('прайс')) return 'price';
  if (text === 'gc:order' || text.startsWith('/order') || t.includes('заказ') || t.includes('слеп') || t.includes('скан')) return 'order';
  if (text === 'gc:materials' || t.includes('материал') || t.includes('золото') || t.includes('серебро') || t.includes('камн')) return 'materials';
  if (text === 'gc:care' || text.startsWith('/care') || t.includes('уход') || t.includes('чист')) return 'care';
  if (text === 'gc:vip' || t.includes('vip') || t.includes('премиум')) return 'vip';
  if (text === 'gc:contacts' || t.includes('контакт') || t.includes('адрес') || t.includes('связ')) return 'contacts';
  if (t.includes('звезд') || t.includes('звёзд') || t.includes('селеб')) return 'stars';
  return 'fallback';
}

function hashText(value) {
  let hash = 0;
  for (const char of String(value)) {
    hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash);
}

function dailyQuest(chatId = '') {
  const day = new Date().toISOString().slice(0, 10);
  const quests = [
    {
      title: 'Слепок без пузырей',
      task: 'Открой игру, сделай серию тапов и доведи форму до первой фазы.',
      reward: '+15 Gold Dust к настроению'
    },
    {
      title: 'Полировка перед выходом',
      task: 'Проверь уход и выбери, чем чистить сет без абразивов.',
      reward: '+1 уровень аккуратности'
    },
    {
      title: 'Iced-out референс',
      task: 'Собери в конструкторе сет с камнями и сохрани идею для заявки.',
      reward: '+20 к стилю'
    },
    {
      title: 'Золотая фаза',
      task: 'Выбери материал для будущего сета: серебро, золото, белое золото или камни.',
      reward: '+10 к мастерству'
    },
    {
      title: 'Гриндер-матч',
      task: 'Зайди в старую игру и пролистай пару карточек в режиме знакомств.',
      reward: '+1 шанс на матч'
    }
  ];
  return quests[hashText(`${day}:${chatId}`) % quests.length];
}

async function answerFor(text, firstName = '', chatId = '', userId = '') {
  const route = commandRoute(text);
  const name = firstName ? `${escapeHtml(firstName)}, ` : '';
  const uid = userId || chatId;

  // leave iVasya mode on menu
  if (route === 'menu') gcx.setIvasyaMode(uid, false);

  if (route === 'menu') {
    return {
      photo: text.startsWith('/start') ? startPhotoUrl() : '',
      text: [
        '⚡️ <b>GRILLZ CUSTOMS MOSCOW — ИСКУССТВО, КОТОРОЕ НОСЯТ НА ЗУБАХ</b> ⚡️',
        '',
        '👍 Добро пожаловать в официальный бот @Grillz_Customs_bot!',
        '',
        `${name}меню прокачано:`,
        '🎮 <b>Grillz Game</b> — Combat-тапы + Tinder-свайпы → Dust → скидки / free-cap коды',
        '🧢 <b>iVasya</b> — уличный AI-консультант: металл, посадка, уход, цена. Говорит как свой, продаёт без занудства.',
        '🖼 <b>Генератор Grillz</b> — бесплатная генерация референсов (Pollinations)',
        '🦷 <b>Конструктор</b> на сайте — собери сет по зубам',
        '',
        '👇 Жми кнопки:'
      ].join('\n'),
      reply_markup: keyboard('main')
    };
  }

  if (route === 'game') {
    gcx.setIvasyaMode(uid, false);
    return {
      text: [
        gcx.gameStatusText(uid, firstName),
        '',
        '<b>Как фармить:</b>',
        '🦷 Тап — Gold Dust (энергия)',
        '❤️ Свайп — матчи + бонус Dust',
        '🎁 Награды — коды на скидку / free consult',
        '',
        'Цель: набить Dust, пока улыбка не попросит золото 😎'
      ].join('\n'),
      reply_markup: gcx.gameKeyboard()
    };
  }

  if (route === 'gtap') {
    const r = gcx.doTap(uid);
    return { text: r.text, reply_markup: r.markup };
  }
  if (route === 'gswipe') {
    const r = gcx.doSwipe(uid);
    return { text: r.text, reply_markup: r.markup };
  }
  if (route === 'gstat' || route === 'gstreak') {
    return { text: gcx.gameStatusText(uid, firstName), reply_markup: gcx.gameKeyboard() };
  }
  if (route === 'greward') {
    return { text: gcx.rewardsText(uid), reply_markup: gcx.gameKeyboard() };
  }

  if (route === 'ivasya') {
    gcx.setIvasyaMode(uid, true);
    return {
      text: [
        '🧢 <b>iVasya в мастерской</b>',
        '',
        'Йо, залетай. Я тот самый тип у верстака: шарю за металл, посадку, уход и цену, но разговариваю по-человечески, без белого халата и кислого лица.',
        'Хочешь золото — разложу по пробам. Хочешь камни — скажу, где будет стиль, а где уже новогодняя гирлянда. Хочешь сэкономить — тоже поговорим, но красоту не обижаем.',
        'Пиши вопрос обычным текстом. Я отвечу дерзко, коротко и по делу. Чтобы выйти — /menu.',
        '',
        'Примеры: «сколько стоит 6 зубов?», «можно есть?», «что лучше золото или серебро?»'
      ].join('\n'),
      reply_markup: gcx.ivasyaKeyboard()
    };
  }

  if (route === 'gen') {
    gcx.setIvasyaMode(uid, false);
    return {
      text: [
        '🖼 <b>Генератор Grillz</b>',
        '',
        'Бесплатная генерация референсов через Pollinations (Flux). Выбери стиль или пришли текст: «6 верхних yellow gold open face».',
        '',
        '⚠️ Это вайб-референс, не финальный CAD. Для посадки — слепок + мастерская.'
      ].join('\n'),
      reply_markup: gcx.generatorKeyboard()
    };
  }

  if (route === 'gen_run') {
    const key = String(text).split(':').pop();
    const prompt = gcx.GEN_PROMPTS[key] || gcx.GEN_PROMPTS.gold;
    const url = gcx.grillzImageUrl(prompt);
    return {
      photo: url,
      text: `🖼 Референс: <b>${escapeHtml(prompt)}</b>\n\nСгенерировано бесплатно · Pollinations/Flux\nСобрать похожее → конструктор на сайте.`,
      reply_markup: gcx.generatorKeyboard()
    };
  }

  if (route === 'quest') {
    const quest = dailyQuest(chatId);
    return {
      text: [
        '⚡ <b>Квест дня</b>',
        '',
        `🏷 <b>${quest.title}</b>`,
        `🎯 ${quest.task}`,
        `🏆 Награда: ${quest.reward}`,
        '',
        'Сейчас квест живёт в боте как ежедневный игровой сценарий, а прогресс игры сохраняется в браузере/Telegram WebApp.'
      ].join('\n'),
      reply_markup: keyboard('game')
    };
  }

  if (route === 'price') {
    return {
      text: [
        '💰 <b>Быстрый расчёт grillz</b>',
        '',
        'Цена зависит от количества зубов, материала, пробы, камней, сложности посадки и уровня детализации.',
        '',
        'Чтобы я не гадал по воздуху, лучше собрать референс в конструкторе или прислать:',
        '• сколько зубов закрываем',
        '• материал: серебро, золото, белое золото, камни',
        '• стиль: гладкие, клыки, надписи, паве, custom shape',
        '• город и сроки'
      ].join('\n'),
      reply_markup: keyboard('price')
    };
  }

  if (route === 'order') {
    return {
      text: [
        '📦 <b>Как заказать</b>',
        '',
        '1. Кидаете идею или собираете сет в конструкторе.',
        '2. Уточняем материал, количество зубов, форму и бюджет.',
        '3. Делаем слепок или 3D-скан.',
        '4. Готовим модель, согласуем дизайн и запускаем производство.',
        '5. Проверяем посадку, полируем и отдаём готовый сет.'
      ].join('\n'),
      reply_markup: keyboard('order')
    };
  }

  if (route === 'materials') {
    return {
      text: [
        '🧬 <b>Материалы и стиль</b>',
        '',
        '🥈 <b>Серебро</b>: холодный блеск, хороший старт для первого сета.',
        '🟡 <b>Золото</b>: классика grillz, тёплый премиальный цвет.',
        '⚪ <b>Белое золото</b>: более чистый high-end визуал под камни.',
        '💎 <b>Камни</b>: акценты, паве, клыки, сияние под съёмки и сцену.',
        '',
        'Самый сильный результат получается, когда материал выбирается не отдельно, а под лицо, стиль одежды, музыку, съёмки и то, как человек улыбается.'
      ].join('\n'),
      reply_markup: keyboard('price')
    };
  }

  if (route === 'care') {
    return {
      text: [
        '🧼 <b>Уход за grillz</b>',
        '',
        '• Снимать перед едой и сном.',
        '• Промывать после носки тёплой водой.',
        '• Хранить в боксе, а не в кармане.',
        '• Не чистить абразивами и жёсткой щёткой.',
        '• При потере блеска приносить на полировку.',
        '',
        'Grillz - это украшение, а не стоматологическая коронка. Чем аккуратнее носка, тем дольше живёт посадка и блеск.'
      ].join('\n'),
      reply_markup: keyboard('order')
    };
  }

  if (route === 'vip') {
    return {
      text: [
        '💎 <b>VIP-режим</b>',
        '',
        'В старой игре VIP давал x2 к Gold Dust и статус ICED-OUT VIP. Эту механику можно вернуть как бонус для клиентов Grillz Customs после проверки заказа.',
        '',
        'Следующий шаг: привязать Telegram ID к профилю на сайте, чтобы бонусы, игра и заявки жили в одном аккаунте.'
      ].join('\n'),
      reply_markup: keyboard('game')
    };
  }

  if (route === 'contacts') {
    return {
      text: [
        '📍 <b>Контакты Grillz Customs</b>',
        '',
        'Лучший быстрый сценарий: открой конструктор, собери идею и отправь заявку. Если нужно живое обсуждение, пиши в Telegram или VK.',
        '',
        'Email: grillzcustoms@yandex.ru'
      ].join('\n'),
      reply_markup: keyboard('contact')
    };
  }

  if (route === 'stars') {
    return {
      text: [
        '⭐ <b>Звёзды в grillz</b>',
        '',
        'Мы собрали отдельную страницу про артистов, актёров и персонажей с grillz. Это хороший раздел для вдохновения перед собственным сетом.'
      ].join('\n'),
      reply_markup: {
        inline_keyboard: [
          [{ text: '⭐ Открыть страницу звёзд', url: page('stars.html') }],
          [{ text: '🦷 Собрать похожий стиль', url: page('constructor.html') }],
          [{ text: '🏠 Меню', callback_data: 'gc:menu' }]
        ]
      }
    };
  }

  return {
    text: [
      '🖤 <b>Я на связи</b>',
      '',
      'Могу быстро открыть конструктор, игру, расчёт, заказ, уход, материалы, работы или контакты.',
      '',
      'Напиши, например: <b>цена</b>, <b>заказ</b>, <b>игра</b>, <b>уход</b>, <b>материалы</b>.'
    ].join('\n'),
    reply_markup: keyboard('main')
  };
}

async function telegram(method, payload = {}, options = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured');

  const timeoutMs = Number(options.timeoutMs || telegramFetchTimeoutMs);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();

  try {
    const baseUrl = `https://api.telegram.org/bot${token}/${method}`;
    const tgResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const data = await tgResponse.json();
    console.log(JSON.stringify({ scope: 'telegram', method, status: tgResponse.status, durationMs: Date.now() - started }));
    if (!tgResponse.ok || !data.ok) {
      throw new Error(`Telegram ${method} failed: ${JSON.stringify(data).slice(0, 400)}`);
    }
    return data;
  } catch (error) {
    const errorName = error?.name || 'Error';
    const errorMessage = error?.message || String(error);
    console.error(JSON.stringify({ scope: 'telegram', method, errorName, errorMessage, durationMs: Date.now() - started }));
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isFetchFailure(error) {
  return error?.name === 'TypeError' && String(error?.message || '').includes('fetch failed');
}

async function getUpdates(payload) {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await telegram('getUpdates', payload);
    } catch (error) {
      lastError = error;
      if (!isFetchFailure(error) || attempt === 3) break;
      await wait(600 * attempt);
    }
  }
  throw lastError;
}

function messageFromUpdate(update) {
  return update.message || update.edited_message || update.callback_query?.message || null;
}

function senderFromUpdate(update) {
  return update.callback_query?.from || update.message?.from || update.edited_message?.from || {};
}

function inputFromUpdate(update) {
  return update.callback_query?.data || update.message?.text || update.edited_message?.text || '';
}

async function notifyAdmin(message, chatId, firstName) {
  if (!adminChatId || String(chatId) === String(adminChatId) || !message.text) return;
  try {
    await telegram('sendMessage', {
      chat_id: adminChatId,
      text: [
        'Новый диалог Grillz Customs bot',
        `От: ${firstName || 'без имени'} (${chatId})`,
        `Сообщение: ${message.text.slice(0, 800)}`
      ].join('\n')
    });
  } catch (error) {
    console.error(JSON.stringify({ scope: 'adminNotify', errorName: error?.name, errorMessage: error?.message }));
  }
}

async function replyByEditingOrSending(update, chatId, answer) {
  const callbackQuery = update.callback_query;
  const messageId = callbackQuery?.message?.message_id;

  if (callbackQuery?.id) {
    try {
      await telegram('answerCallbackQuery', {
        callback_query_id: callbackQuery.id,
        text: '✨ Grillz Customs',
        show_alert: false
      });
    } catch (error) {
      console.error(JSON.stringify({ scope: 'answerCallbackQuery', errorName: error?.name, errorMessage: error?.message }));
    }
  }

  if (callbackQuery && messageId) {
    try {
      await telegram('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: answer.text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: answer.reply_markup
      });
      return true;
    } catch (error) {
      if (String(error?.message || '').includes('message is not modified')) return true;
      console.error(JSON.stringify({ scope: 'editMessageText', errorName: error?.name, errorMessage: error?.message }));
    }
  }

  if (answer.photo) {
    if (callbackQuery && messageId && callbackQuery.message?.photo) {
      try {
        await telegram('editMessageCaption', {
          chat_id: chatId,
          message_id: messageId,
          caption: answer.text,
          parse_mode: 'HTML',
          reply_markup: answer.reply_markup
        });
        return true;
      } catch (error) {
        if (String(error?.message || '').includes('message is not modified')) return true;
        console.error(JSON.stringify({ scope: 'editMessageCaption', errorName: error?.name, errorMessage: error?.message }));
      }
    }

    await telegram('sendPhoto', {
      chat_id: chatId,
      photo: answer.photo,
      caption: answer.text,
      parse_mode: 'HTML',
      reply_markup: answer.reply_markup
    });
    return true;
  }

  await telegram('sendMessage', {
    chat_id: chatId,
    text: answer.text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: answer.reply_markup
  });
  return true;
}

async function replyToUpdate(update) {
  const message = messageFromUpdate(update);
  if (!message || !message.chat) return false;

  const chatId = message.chat.id;
  const sender = senderFromUpdate(update);
  const rawInput = inputFromUpdate(update);
  const text = compactText(rawInput);
  const firstName = displayNameFromSender(sender);
  const userId = sender.id || chatId;

  let answer;
  // free-text to iVasya when mode on and not a command/callback
  const isCommand = text.startsWith('/') || text.startsWith('gc:');
  if (gcx.isIvasyaMode(userId) && !isCommand && rawInput && String(rawInput).trim()) {
    const r = await gcx.ivasyaReply(userId, String(rawInput).trim(), firstName);
    answer = {
      text: `🧢 <b>iVasya</b>\n\n${escapeHtml(r.rawAnswer || '').replace(/\n/g, '\n')}`,
      reply_markup: r.reply_markup
    };
  } else {
    answer = await answerFor(text, firstName, chatId, userId);
  }

  // free-form image gen: "ген ..." / "gen ..."
  if (!isCommand && (text.startsWith('ген ') || text.startsWith('gen '))) {
    const prompt = String(rawInput).replace(/^(ген|gen)\s+/i, '').trim() || 'custom gold grillz';
    answer = {
      photo: gcx.grillzImageUrl(prompt),
      text: `🖼 <b>Генератор</b>\n${escapeHtml(prompt)}`,
      reply_markup: gcx.generatorKeyboard()
    };
  }

  await replyByEditingOrSending(update, chatId, answer);
  await notifyAdmin(message, chatId, firstName);
  return true;
}

async function pollUpdates() {
  console.log(JSON.stringify({ scope: 'polling', stage: 'start' }));
  let updates;
  try {
    updates = await getUpdates({
      timeout: 0,
      limit: 20,
      allowed_updates: ['message', 'callback_query']
    });
  } catch (error) {
    console.error(JSON.stringify({ scope: 'polling', stage: 'getUpdatesFailed', errorName: error?.name, errorMessage: error?.message }));
    return {
      ok: false,
      mode: 'polling',
      received: 0,
      processed: 0,
      failed: 1,
      lastUpdateId: null,
      error: 'getUpdates failed'
    };
  }
  let lastUpdateId = null;
  let processed = 0;
  let failed = 0;

  for (const update of updates.result || []) {
    lastUpdateId = Math.max(lastUpdateId || update.update_id, update.update_id);
    try {
      if (await replyToUpdate(update)) processed += 1;
    } catch (error) {
      failed += 1;
      console.error(JSON.stringify({ scope: 'polling', stage: 'updateFailed', updateId: update.update_id, errorName: error?.name, errorMessage: error?.message }));
    }
  }

  if (lastUpdateId !== null) {
    try {
      await getUpdates({
        offset: lastUpdateId + 1,
        timeout: 0,
        limit: 1,
        allowed_updates: ['message', 'callback_query']
      });
    } catch (error) {
      failed += 1;
      console.error(JSON.stringify({ scope: 'polling', stage: 'offsetConfirmFailed', errorName: error?.name, errorMessage: error?.message }));
    }
  }

  return {
    ok: true,
    mode: 'polling',
    received: (updates.result || []).length,
    processed,
    failed,
    lastUpdateId
  };
}

function shouldPoll(event) {
  const body = parseBody(event);
  return event?.queryStringParameters?.poll === '1'
    || event?.params?.poll === '1'
    || event?.poll === true
    || body?.poll === true
    || Array.isArray(event?.messages);
}

function shouldSetup(event) {
  const body = parseBody(event);
  return event?.queryStringParameters?.setup === 'commands'
    || event?.params?.setup === 'commands'
    || event?.setup === 'commands'
    || body?.setup === 'commands'
    || body?.queryStringParameters?.setup === 'commands';
}

async function setupBotInterface() {
  const steps = [];
  const runStep = async (name, method, payload) => {
    try {
      await telegram(method, payload, { timeoutMs: telegramSetupTimeoutMs });
      steps.push({ name, ok: true });
    } catch (error) {
      steps.push({ name, ok: false, error: error?.message || String(error) });
    }
  };

  await Promise.all([
    runStep('commands', 'setMyCommands', {
      commands: [
        { command: 'start', description: '✨ Главное меню Grillz Customs' },
        { command: 'game', description: '🎮 Grillz Combat — Dust, свайпы, скидки' },
        { command: 'ivasya', description: '🧢 iVasya — ИИ-консультант' },
        { command: 'gen', description: '🖼 Генератор Grillz' },
        { command: 'price', description: '💰 Быстрый расчёт grillz' },
        { command: 'order', description: '📦 Как заказать' },
        { command: 'care', description: '🧼 Уход за grillz' },
        { command: 'menu', description: '🏠 Открыть меню' }
      ]
    }),
    runStep('description', 'setMyDescription', {
      description: 'Grillz Customs Bot: конструктор grillz, расчёт, заказ, уход, портфолио, игра Grillz Game и ежедневные квесты.'
    }),
    runStep('shortDescription', 'setMyShortDescription', {
      short_description: 'Grillz Customs: конструктор, расчёт, заказ и Grillz Game.'
    }),
    runStep('menuButton', 'setChatMenuButton', {
      menu_button: {
        type: 'web_app',
        text: '🎮 Grillz Game',
        web_app: { url: page('gsb.index.html') }
      }
    })
  ]);

  return { ok: steps.every((step) => step.ok), mode: 'setup', steps };
}

module.exports.handler = async function handler(event) {
  if (shouldSetup(event)) {
    return response(200, await setupBotInterface());
  }

  if (shouldPoll(event)) {
    return response(200, await pollUpdates());
  }

  if (event && event.httpMethod === 'GET') {
    return response(200, { ok: true, service: 'Grillz Customs Telegram bot' });
  }

  const update = parseBody(event);
  const message = update.message || update.edited_message || update.callback_query?.message;
  if (!message || !message.chat) {
    return response(200, { ok: true, skipped: true });
  }

  // Preferred path: call Telegram API from function (async-safe for iVasya / photos)
  try {
    await replyToUpdate(update);
    return response(200, { ok: true, mode: 'api' });
  } catch (error) {
    console.error(JSON.stringify({ scope: 'handler', errorName: error?.name, errorMessage: error?.message }));
  }

  // Fallback webhook-style response body
  const chatId = message.chat.id;
  const text = compactText(inputFromUpdate(update));
  const firstName = displayNameFromSender(senderFromUpdate(update));
  const sender = senderFromUpdate(update);
  const reply = await answerFor(text, firstName, chatId, sender.id || chatId);

  if (reply.photo) {
    return response(200, {
      method: 'sendPhoto',
      chat_id: chatId,
      photo: reply.photo,
      caption: reply.text,
      parse_mode: 'HTML',
      reply_markup: reply.reply_markup
    });
  }

  return response(200, {
    method: 'sendMessage',
    chat_id: chatId,
    text: reply.text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: reply.reply_markup
  });
};
