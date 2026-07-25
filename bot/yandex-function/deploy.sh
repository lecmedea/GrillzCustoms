#!/usr/bin/env bash
# Deploy Grillz Customs Telegram bot to Yandex Cloud Functions.
# Requires: yc CLI (https://yandex.cloud/docs/cli/quickstart), auth, zip.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
FUNCTION_NAME="${YC_FUNCTION_NAME:-grillzcustoms-telegram-bot}"
FUNCTION_ID="${YC_FUNCTION_ID:-d4e1e154aq9us864hggr}"
RUNTIME="${YC_RUNTIME:-nodejs22}"
ENTRYPOINT="${YC_ENTRYPOINT:-index.handler}"
MEMORY="${YC_MEMORY:-256m}"
TIMEOUT="${YC_TIMEOUT:-30s}"
ZIP="$ROOT/grillzcustoms-telegram-bot.zip"
INVOKE_URL="${YC_INVOKE_URL:-https://functions.yandexcloud.net/${FUNCTION_ID}}"

echo "==> Pack"
bash "$ROOT/pack.sh" "$ZIP"

if ! command -v yc >/dev/null 2>&1; then
  echo "ERROR: yc CLI not found."
  echo "Install: https://yandex.cloud/docs/cli/quickstart"
  echo "Then: yc init"
  echo "Zip is ready for Console upload: $ZIP"
  echo "Folder: https://console.yandex.cloud/folders/b1g4vg12cnanadnute6g"
  exit 2
fi

echo "==> Deploy function $FUNCTION_NAME ($FUNCTION_ID)"
# Prefer ID if set; else name
if [[ -n "$FUNCTION_ID" ]]; then
  yc serverless function version create \
    --function-id="$FUNCTION_ID" \
    --runtime="$RUNTIME" \
    --entrypoint="$ENTRYPOINT" \
    --memory="$MEMORY" \
    --execution-timeout="$TIMEOUT" \
    --source-path="$ZIP" \
    --environment "SITE_URL=${SITE_URL:-https://grillzcustoms.ru},TELEGRAM_FETCH_TIMEOUT_MS=${TELEGRAM_FETCH_TIMEOUT_MS:-25000}${TELEGRAM_BOT_TOKEN:+,TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN}${GROQ_API_KEY:+,GROQ_API_KEY=$GROQ_API_KEY}${GROQ_MODEL:+,GROQ_MODEL=$GROQ_MODEL}${OPENROUTER_API_KEY:+,OPENROUTER_API_KEY=$OPENROUTER_API_KEY}${OPENROUTER_MODEL:+,OPENROUTER_MODEL=$OPENROUTER_MODEL}${GEMINI_API_KEY:+,GEMINI_API_KEY=$GEMINI_API_KEY}${GEMINI_MODEL:+,GEMINI_MODEL=$GEMINI_MODEL}${MISTRAL_API_KEY:+,MISTRAL_API_KEY=$MISTRAL_API_KEY}${MISTRAL_MODEL:+,MISTRAL_MODEL=$MISTRAL_MODEL}${CEREBRAS_API_KEY:+,CEREBRAS_API_KEY=$CEREBRAS_API_KEY}${CEREBRAS_MODEL:+,CEREBRAS_MODEL=$CEREBRAS_MODEL}${CLOUDFLARE_API_TOKEN:+,CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN}${CLOUDFLARE_ACCOUNT_ID:+,CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID}${CLOUDFLARE_MODEL:+,CLOUDFLARE_MODEL=$CLOUDFLARE_MODEL}${HF_TOKEN:+,HF_TOKEN=$HF_TOKEN}${HF_MODEL:+,HF_MODEL=$HF_MODEL}${ADMIN_CHAT_ID:+,ADMIN_CHAT_ID=$ADMIN_CHAT_ID}${START_PHOTO_URL:+,START_PHOTO_URL=$START_PHOTO_URL}"
else
  yc serverless function version create \
    --function-name="$FUNCTION_NAME" \
    --runtime="$RUNTIME" \
    --entrypoint="$ENTRYPOINT" \
    --memory="$MEMORY" \
    --execution-timeout="$TIMEOUT" \
    --source-path="$ZIP" \
    --environment "SITE_URL=${SITE_URL:-https://grillzcustoms.ru}"
fi

echo "==> Setup Telegram commands / menu"
curl -sS "${INVOKE_URL}?setup=commands" | head -c 2000
echo

echo "==> Smoke poll (optional)"
curl -sS -o /dev/null -w "poll HTTP %{http_code}\n" "${INVOKE_URL}?poll=1" || true

echo "Done. Bot: https://t.me/Grillz_Customs_bot"
echo "If TELEGRAM_BOT_TOKEN was not passed, set it in Console env and re-deploy or only update env there."
