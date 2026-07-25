#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="${1:-$ROOT/grillzcustoms-auth.zip}"
cd "$ROOT"
rm -f "$OUT"
zip -q -r "$OUT" index.js package.json schema.sql README.md
echo "Packed $OUT"
unzip -l "$OUT"
