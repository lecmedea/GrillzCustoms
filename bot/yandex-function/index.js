'use strict';

const siteUrl = process.env.SITE_URL || 'https://grillzcustoms.ru';
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

function keyboard() {
  return {
    inline_keyboard: [
      [
        { text: 'Собрать grillz', url: `${siteUrl}/constructor.html` },
        { text: 'Tamagotchi', url: `${siteUrl}/entertainment.html` }
      ],
      [
        { text: 'Как заказать', url: `${siteUrl}/order.html` },
        { text: 'Работы', url: `${siteUrl}/works.html` }
      ],
      [
        { text: 'Контакты', url: `${siteUrl}/contacts.html` }
      ]
    ]
  };
}

function answerFor(text, firstName = '') {
  const name = firstName ? `${firstName}, ` : '';
  if (text.startsWith('/start')) {
    return `${name}это бот Grillz Customs. Могу быстро дать ссылки на конструктор, заказ, уход и игру Grillz Tamagotchi.`;
  }
  if (text.includes('цена') || text.startsWith('/price')) {
    return 'Цена зависит от количества зубов, материала, пробы, камней и сложности посадки. Соберите референс в конструкторе, затем отправьте заявку: ' + `${siteUrl}/constructor.html`;
  }
  if (text.includes('заказ') || text.startsWith('/order')) {
    return 'Заказ начинается с консультации и слепка/скана. Дальше делаем 3D-модель, согласуем дизайн и запускаем изготовление: ' + `${siteUrl}/order.html`;
  }
  if (text.includes('уход') || text.startsWith('/care')) {
    return 'Уход: снимайте grillz перед едой и сном, промывайте после носки, храните в боксе, не чистите абразивами и приносите на полировку при потере блеска.';
  }
  if (text.includes('игр') || text.includes('tamagotchi') || text.startsWith('/game')) {
    return 'Grillz Tamagotchi уже живёт на сайте: ухаживайте за зубиком, запускайте задания по реальному времени и открывайте мебель для комнаты.';
  }
  return 'Я понял сообщение. Для быстрого старта откройте конструктор, страницу заказа или контакты. Если нужен индивидуальный расчёт, напишите количество зубов, материал и город.';
}

async function telegram(method, payload = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), telegramFetchTimeoutMs);
  const started = Date.now();

  try {
    const baseUrl = `https://api.telegram.org/bot${token}/${method}`;
    const isReadOnly = method === 'getUpdates' || method === 'getWebhookInfo';
    const url = isReadOnly ? `${baseUrl}?${new URLSearchParams(compactPayload(payload))}` : baseUrl;
    const tgResponse = await fetch(url, {
      method: isReadOnly ? 'GET' : 'POST',
      headers: isReadOnly ? undefined : { 'content-type': 'application/json' },
      body: isReadOnly ? undefined : JSON.stringify(payload),
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

function compactPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload || {}).filter(([, value]) => value !== undefined && value !== null).map(([key, value]) => [
      key,
      Array.isArray(value) ? JSON.stringify(value) : String(value)
    ])
  );
}

function messageFromUpdate(update) {
  return update.message || update.edited_message || update.callback_query?.message || null;
}

async function replyToUpdate(update) {
  const message = messageFromUpdate(update);
  if (!message || !message.chat) return false;

  const chatId = message.chat.id;
  const text = compactText(update.callback_query?.data || message.text || '');
  const firstName = message.from?.first_name || update.callback_query?.from?.first_name || '';
  await telegram('sendMessage', {
    chat_id: chatId,
    text: answerFor(text, firstName),
    disable_web_page_preview: true,
    reply_markup: keyboard()
  });
  return true;
}

async function pollUpdates() {
  console.log(JSON.stringify({ scope: 'polling', stage: 'start' }));
  const updates = await telegram('getUpdates', {
    timeout: 0,
    limit: 20,
    allowed_updates: ['message', 'callback_query']
  });
  let lastUpdateId = null;
  let processed = 0;

  for (const update of updates.result || []) {
    lastUpdateId = Math.max(lastUpdateId || update.update_id, update.update_id);
    if (await replyToUpdate(update)) processed += 1;
  }

  if (lastUpdateId !== null) {
    await telegram('getUpdates', {
      offset: lastUpdateId + 1,
      timeout: 0,
      limit: 1,
      allowed_updates: ['message', 'callback_query']
    });
  }

  return {
    ok: true,
    mode: 'polling',
    received: (updates.result || []).length,
    processed,
    lastUpdateId
  };
}

function shouldPoll(event) {
  return event?.queryStringParameters?.poll === '1' || event?.params?.poll === '1' || Array.isArray(event?.messages);
}

module.exports.handler = async function handler(event) {
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
  const text = compactText(update.callback_query?.data || message.text || '');
  const firstName = message.from?.first_name || update.callback_query?.from?.first_name || '';
  const reply = answerFor(text, firstName);

  return response(200, {
    method: 'sendMessage',
    chat_id: chatId,
    text: reply,
    disable_web_page_preview: true,
    reply_markup: keyboard()
  });
};
