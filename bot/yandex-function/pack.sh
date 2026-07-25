#!/usr/bin/env bash
# Pack Yandex Cloud Function zip for Grillz Customs Telegram bot.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="${1:-$ROOT/grillzcustoms-telegram-bot.zip}"

cd "$ROOT"
rm -f "$OUT"
# No node_modules: handler uses only Node built-ins + require('./game-ivasya')
zip -q -r "$OUT" index.js game-ivasya.js package.json
echo "Packed: $OUT"
ls -lh "$OUT"
echo "Contents:"
unzip -l "$OUT"
