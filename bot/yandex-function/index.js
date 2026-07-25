'use strict';

const siteUrl = process.env.SITE_URL || 'https://grillzcustoms.ru';
const adminChatId = process.env.ADMIN_CHAT_ID || '';

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

async function sendTelegram(method, payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  const tgResponse = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await tgResponse.json();
  if (!tgResponse.ok || !data.ok) {
    throw new Error(`Telegram ${method} failed`);
  }
  return data;
}

module.exports.handler = async function handler(event) {
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

  await sendTelegram('sendMessage', {
    chat_id: chatId,
    text: reply,
    disable_web_page_preview: true,
    reply_markup: keyboard()
  });

  if (adminChatId && String(chatId) !== String(adminChatId) && message.text) {
    await sendTelegram('sendMessage', {
      chat_id: adminChatId,
      text: `Новый диалог Grillz Customs bot\nОт: ${firstName || 'без имени'} (${chatId})\nСообщение: ${message.text.slice(0, 800)}`
    });
  }

  return response(200, { ok: true });
};
