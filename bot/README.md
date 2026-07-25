# Grillz Customs Telegram bot

This folder contains a Yandex Cloud Functions handler for `https://t.me/Grillz_Customs_bot`.

The bot token must be stored only in Yandex Cloud environment variables. Do not commit it to GitHub.

## Current deployment

- Yandex Cloud function: `grillzcustoms-telegram-bot`
- Function ID: `d4e1e154aq9us864hggr`
- Public invoke URL: `https://functions.yandexcloud.net/d4e1e154aq9us864hggr`
- Runtime: `nodejs22`
- Entrypoint: `index.handler`
- Telegram webhook: set to the public invoke URL on 2026-07-25

## Function settings

- Runtime: `nodejs22`
- Entry point: `index.handler`
- Memory: `128 MB` is enough for the current webhook handler
- Timeout: `5s`
- Environment variables:
  - `TELEGRAM_BOT_TOKEN`
  - `SITE_URL=https://grillzcustoms.ru`
  - `ADMIN_CHAT_ID` optional, for owner notifications

## Webhook

After Yandex Cloud gives the function an HTTPS invoke URL, set the Telegram webhook:

```bash
curl -sS -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "content-type: application/json" \
  -d "{\"url\":\"$YANDEX_FUNCTION_URL\"}"
```

Check the webhook:

```bash
curl -sS "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

## Notes

The current implementation has no external dependencies. For webhook reliability it returns a Telegram-compatible `sendMessage` payload directly in the HTTP response instead of making a second outbound request from the function to Telegram. It answers common questions and links to the constructor, order page, works, contacts and Grillz Tamagotchi.
