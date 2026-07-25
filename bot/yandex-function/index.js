'use strict';

const siteUrl = process.env.SITE_URL || 'https://grillzcustoms.ru';
const adminChatId = process.env.ADMIN_CHAT_ID || '';
const telegramFetchTimeoutMs = Number(process.env.TELEGRAM_FETCH_TIMEOUT_MS || 25000);

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

function keyboard(view = 'main') {
  const menuButton = { text: '🏠 Меню', callback_data: 'gc:menu' };
  const rows = {
    main: [
      [
        { text: '🎮 Grillz Game', url: page('gsb.index.html') },
        { text: '🦷 Конструктор', url: page('constructor.html') }
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
    game: [
      [{ text: '🎮 Открыть старую игру', url: page('gsb.index.html') }],
      [{ text: '🕹️ Tamagotchi на сайте', url: page('entertainment.html') }],
      [
        { text: '⚡ Квест дня', callback_data: 'gc:quest' },
        { text: '💎 VIP-режим', callback_data: 'gc:vip' }
      ],
      [menuButton]
    ],
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
  if (text === 'gc:menu' || text.startsWith('/start') || text.startsWith('/menu')) return 'menu';
  if (text === 'gc:game' || text.startsWith('/game') || text.includes('игр') || text.includes('tamagotchi') || text.includes('тамагочи')) return 'game';
  if (text === 'gc:quest' || text.includes('квест') || text.includes('dust')) return 'quest';
  if (text === 'gc:price' || text.startsWith('/price') || text.includes('цена') || text.includes('стоим') || text.includes('прайс')) return 'price';
  if (text === 'gc:order' || text.startsWith('/order') || text.includes('заказ') || text.includes('слеп') || text.includes('скан')) return 'order';
  if (text === 'gc:materials' || text.includes('материал') || text.includes('золото') || text.includes('серебро') || text.includes('камн')) return 'materials';
  if (text === 'gc:care' || text.startsWith('/care') || text.includes('уход') || text.includes('чист')) return 'care';
  if (text === 'gc:vip' || text.includes('vip') || text.includes('премиум')) return 'vip';
  if (text === 'gc:contacts' || text.includes('контакт') || text.includes('адрес') || text.includes('связ')) return 'contacts';
  if (text.includes('звезд') || text.includes('звёзд') || text.includes('селеб')) return 'stars';
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

function answerFor(text, firstName = '', chatId = '') {
  const route = commandRoute(text);
  const name = firstName ? `${escapeHtml(firstName)}, ` : '';

  if (route === 'menu') {
    return {
      text: [
        `✨ <b>Grillz Customs Bot</b>`,
        '',
        `${name}я снова в режиме мастерской: конструктор, прайс, уход, заказ, портфолио и игра в одном меню.`,
        '',
        '🎮 <b>Grillz Game</b>: старый фан-режим с Gold Dust, фазами зубчика, VIP-бустом и гриндер-механикой.',
        '🦷 <b>Конструктор</b>: можно собрать сет по зубам и отправить референс.',
        '💎 <b>Мастерская</b>: материалы, посадка, полировка и кастом под образ.'
      ].join('\n'),
      reply_markup: keyboard('main')
    };
  }

  if (route === 'game') {
    return {
      text: [
        '🎮 <b>Grillz Game возвращается</b>',
        '',
        'Там есть старый вайб: тап по зубчику, Gold Dust, прокачка от слепка до белого золота и бриллиантов, VIP x2 и карточки знакомств.',
        '',
        'Фазы:',
        '1. 🦷 Форма для слепка',
        '2. 🧱 Восковая форма',
        '3. 🏭 Заливка металлом КХС',
        '4. 🟤 Бронзовое литьё',
        '5. 🟡 Золото 585',
        '6. 💎 Белое золото и бриллианты'
      ].join('\n'),
      reply_markup: keyboard('game')
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

async function telegram(method, payload = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), telegramFetchTimeoutMs);
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
  const text = compactText(inputFromUpdate(update));
  const firstName = sender.first_name || '';
  const answer = answerFor(text, firstName, chatId);

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
      await telegram(method, payload);
      steps.push({ name, ok: true });
    } catch (error) {
      steps.push({ name, ok: false, error: error?.message || String(error) });
    }
  };

  await runStep('commands', 'setMyCommands', {
    commands: [
      { command: 'start', description: '✨ Главное меню Grillz Customs' },
      { command: 'game', description: '🎮 Grillz Game и квест дня' },
      { command: 'price', description: '💰 Быстрый расчёт grillz' },
      { command: 'order', description: '📦 Как заказать' },
      { command: 'care', description: '🧼 Уход за grillz' },
      { command: 'menu', description: '🏠 Открыть меню' }
    ]
  });
  await runStep('description', 'setMyDescription', {
    description: 'Grillz Customs Bot: конструктор grillz, расчёт, заказ, уход, портфолио, игра Grillz Game и ежедневные квесты.'
  });
  await runStep('shortDescription', 'setMyShortDescription', {
    short_description: 'Grillz Customs: конструктор, расчёт, заказ и Grillz Game.'
  });
  await runStep('menuButton', 'setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: '🎮 Grillz Game',
      web_app: { url: page('gsb.index.html') }
    }
  });

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

  const chatId = message.chat.id;
  const text = compactText(inputFromUpdate(update));
  const firstName = senderFromUpdate(update).first_name || '';
  const reply = answerFor(text, firstName, chatId);

  return response(200, {
    method: 'sendMessage',
    chat_id: chatId,
    text: reply.text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: reply.reply_markup
  });
};
