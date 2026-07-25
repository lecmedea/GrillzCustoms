# Grillz Customs Telegram bot

This folder contains a Yandex Cloud Functions handler for `https://t.me/Grillz_Customs_bot`.

The bot token must be stored only in Yandex Cloud environment variables. Do not commit it to GitHub.

## Current deployment

- Yandex Cloud function: `grillzcustoms-telegram-bot`
- Function ID: `d4e1e154aq9us864hggr`
- Public invoke URL: `https://functions.yandexcloud.net/d4e1e154aq9us864hggr`
- Runtime: `nodejs22`
- Entrypoint: `index.handler`
- Telegram mode: polling is preferred if Telegram -> Yandex webhook delivery times out. Invoke `https://functions.yandexcloud.net/d4e1e154aq9us864hggr?poll=1` or attach a Yandex Cloud timer trigger.
- Timer trigger: `grillzcustoms-bot-polling` (`a1sufdn6u3imkns2g3n6`), cron `* * ? * * *`
- Trigger service account: `grillzcustoms-bot-invoker`
- Bot interface setup: invoke `https://functions.yandexcloud.net/d4e1e154aq9us864hggr?setup=commands` after deployment to refresh Telegram commands, description and the game menu button.

## Function settings

- Runtime: `nodejs22`
- Entry point: `index.handler`
- Memory: `128 MB` is enough for the current handler
- Timeout: `30s` for polling mode, because Telegram API calls can exceed a short 5 second function timeout
- Environment variables:
  - `TELEGRAM_BOT_TOKEN`
  - `SITE_URL=https://grillzcustoms.ru`
  - `TELEGRAM_FETCH_TIMEOUT_MS=25000` optional
  - `START_PHOTO_URL` optional, defaults to `https://grillzcustoms.ru/assets/bot/start-grillz-customs-moscow.jpg`
  - `ADMIN_CHAT_ID` optional, for owner notifications
  - **iVasya (free LLM, pick one):**
    - `GROQ_API_KEY` — recommended free tier (https://console.groq.com)
    - or `OPENROUTER_API_KEY` + optional `OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free`
    - or `GEMINI_API_KEY` from Google AI Studio
  - Image gen uses **Pollinations** (no key): `https://image.pollinations.ai/...`

## Grillz Game / iVasya / Generator

- **Grillz Game** in-bot: tap for Gold Dust (energy), Tinder-like swipes, streak, discount codes at Dust milestones.
- **iVasya**: street-slang AI seller grounded on site FAQ; needs one free LLM key above (else local FAQ wit).
- **Генератор Grillz**: Pollinations Flux image refs; buttons or message `ген 6 upper yellow gold`.

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

The current implementation has no external dependencies. It supports both webhook-style responses and polling mode. Polling mode is used when Telegram cannot reliably deliver webhook requests to Yandex Cloud Functions.

The live bot has an emoji-first interface, inline callback sections, Telegram commands, a WebApp button for `gsb.index.html`, daily mini quests, quick price/order/care/materials answers and links to the constructor, portfolio, stars page, forum, contacts and Grillz Tamagotchi. The `/start` command sends a branded photo from `assets/bot/start-grillz-customs-moscow.jpg` with the main menu caption.
