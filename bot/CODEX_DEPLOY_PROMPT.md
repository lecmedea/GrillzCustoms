# Промпт для Codex: полный деплой Grillz Customs bot + проверка

Скопируй блок ниже **целиком** в Codex (в репозитории `GrillzCustoms` / workspace `/Users/polzovatel/GrillzCustoms`).

---

## PROMPT (copy from here)

```
Ты — senior DevOps + Node.js engineer. Рабочая директория: репозиторий Grillz Customs
(/Users/polzovatel/GrillzCustoms или корень git remote lecmedea/GrillzCustoms).

## Цель
Полностью задеплоить обновлённый Telegram-бот @Grillz_Customs_bot в Yandex Cloud Functions
и проверить, что работают:
1) Grillz Game (Combat: тап / свайп / Dust / награды)
2) iVasya (ИИ-консультант)
3) Генератор Grillz (Pollinations, без ключа)
4) Команды /menu, /game, /ivasya, /gen
5) Сайт-конструктор на https://grillzcustoms.ru/constructor.html (уже в git; hard-refresh)

## Контекст (уже в git, не выдумывай заново)
- Код функции: bot/yandex-function/index.js + bot/yandex-function/game-ivasya.js
- pack: bot/yandex-function/pack.sh → zip
- deploy helper: bot/yandex-function/deploy.sh
- Function name: grillzcustoms-telegram-bot
- Function ID: d4e1e154aq9us864hggr
- Invoke URL: https://functions.yandexcloud.net/d4e1e154aq9us864hggr
- Folder console: https://console.yandex.cloud/folders/b1g4vg12cnanadnute6g
- Runtime: nodejs22, entrypoint: index.handler
- Timeout: 30s, memory: 256m (iVasya + photo)
- Polling trigger уже есть: grillzcustoms-bot-polling — оставь/проверь
- Secrets НЕ коммитить в git

## Env (обязательно сохранить существующие + добавить LLM)
Обязательные (уже должны быть в Cloud):
- TELEGRAM_BOT_TOKEN
- SITE_URL=https://grillzcustoms.ru

Опциональные:
- TELEGRAM_FETCH_TIMEOUT_MS=25000
- START_PHOTO_URL
- ADMIN_CHAT_ID

iVasya — нужен ХОТЯ БЫ ОДИН free LLM ключ (предпочтительно Groq):
- GROQ_API_KEY  (https://console.groq.com — free, без карты обычно)
  optional GROQ_MODEL=llama-3.3-70b-versatile
ИЛИ
- GEMINI_API_KEY (Google AI Studio)
  optional GEMINI_MODEL=gemini-2.5-flash-lite
ИЛИ
- OPENROUTER_API_KEY
  optional OPENROUTER_MODEL=openrouter/free
ИЛИ
- MISTRAL_API_KEY
  optional MISTRAL_MODEL=mistral-small-latest
ИЛИ
- CEREBRAS_API_KEY
  optional CEREBRAS_MODEL=gpt-oss-120b
ИЛИ
- CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
  optional CLOUDFLARE_MODEL=@cf/meta/llama-3.1-8b-instruct
ИЛИ
- HF_TOKEN
  optional HF_MODEL=deepseek-ai/DeepSeek-V3-0324

Генератор картинок: Pollinations, API-ключ НЕ нужен.

## Пошаговый план (выполни всё сам, где возможно)

### A. Подготовка кода
1. cd в корень репо GrillzCustoms
2. git status; убедись что main содержит bot/yandex-function/game-ivasya.js и index.js
3. chmod +x bot/yandex-function/pack.sh bot/yandex-function/deploy.sh
4. bash bot/yandex-function/pack.sh
5. unzip -l bot/yandex-function/grillzcustoms-telegram-bot.zip
   — внутри ОБЯЗАТЕЛЬНО: index.js, game-ivasya.js, package.json

### B. Yandex Cloud CLI
1. Если нет yc: установи (brew или curl install script из docs Yandex Cloud CLI) и `yc init`
2. Проверь: yc config list ; yc serverless function get --id d4e1e154aq9us864hggr
3. Прочитай ТЕКУЩИЕ env функции (не логируй секреты целиком в чат):
   yc serverless function version list --function-id d4e1e154aq9us864hggr --limit 1
   или get latest version metadata
4. Собери environment для новой версии: сохрани старые TELEGRAM_BOT_TOKEN/SITE_URL,
   добавь хотя бы один LLM-ключ (GROQ/GEMINI/OPENROUTER/MISTRAL/CEREBRAS/CLOUDFLARE/HF),
   если пользователь дал / если уже есть в env / если лежит в
   безопасном месте (macOS Keychain, .env локально НЕ в git — ищи .env* и bot/.env*).
5. Если TELEGRAM_BOT_TOKEN нигде нет — ОСТАНОВИСЬ и попроси пользователя вставить токен
   в env Console или в shell export, не выдумывай.

### C. Деплой версии
1. yc serverless function version create \
   --function-id=d4e1e154aq9us864hggr \
   --runtime=nodejs22 \
   --entrypoint=index.handler \
   --memory=256m \
   --execution-timeout=30s \
   --source-path=bot/yandex-function/grillzcustoms-telegram-bot.zip \
   --environment 'SITE_URL=https://grillzcustoms.ru,TELEGRAM_FETCH_TIMEOUT_MS=25000,TELEGRAM_BOT_TOKEN=...,GEMINI_API_KEY=...'
   (подставь реальные значения; не печатай полные секреты в итоговый отчёт)

2. Альтернатива без yc: загрузи zip вручную через Console → Function → Create version
   (runtime nodejs22, entry index.handler, 256m, 30s, те же env).

### D. Post-deploy setup
1. curl -sS "https://functions.yandexcloud.net/d4e1e154aq9us864hggr?setup=commands"
   — команды /game /ivasya /gen /price /order /care /menu должны обновиться
2. curl -sS "https://functions.yandexcloud.net/d4e1e154aq9us864hggr?poll=1" | head
   — polling отвечает ok
3. Убедись что timer trigger grillzcustoms-bot-polling всё ещё вызывает функцию раз в минуту
4. Webhook: если используется polling — webhook можно не трогать / очистить.
   Если webhook нужен: setWebhook на invoke URL функции.

### E. Функциональная проверка (Telegram API или бот)
Через Bot API (с TELEGRAM_BOT_TOKEN) или попроси оператора кликнуть в @Grillz_Customs_bot:
1. /start → меню с кнопками Grillz Game, iVasya, Генератор Grillz
2. Grillz Game → Тап +Dust → число Dust растёт; Свайп → match/reject
3. /ivasya → режим чата; вопрос «можно есть в гриллзах?» → ответ в сленге + FAQ
4. /gen → кнопки стилей; или сообщение «ген 6 upper yellow gold» → фото
5. /menu → выход из iVasya

### F. Конструктор сайта (регресс)
1. curl -sI https://grillzcustoms.ru/constructor.html
2. Проверь raw/js: нет drawChip labels; есть photoZoom, scaleX/scaleY
3. Если GH Pages кэш старый — подожди/cache-bust

### G. Документация
Обнови bot/README.md если фактический deploy path/timeout/env изменились.
Не коммить .env, токены, zip с секретами.

## Критерии done
- [ ] Zip содержит game-ivasya.js
- [ ] Новая version функции active в Yandex
- [ ] setup=commands → 200 / ok
- [ ] /start меню с 3 новыми фичами
- [ ] Тап Dust работает
- [ ] iVasya отвечает (с ключом LLM или local fallback)
- [ ] Генератор отдаёт image URL / photo
- [ ] Секреты не в git

## Отчёт пользователю (на русском)
Кратко: что задеплоено, version id, что проверено, какие env выставлены (имена без значений),
что осталось (если нет ни одного LLM-ключа — явно сказать «iVasya на local FAQ fallback»).
```

---

## Короткий промпт (если контекст уже открыт)

```
Задеплой bot/yandex-function в Yandex Cloud function d4e1e154aq9us864hggr:
pack.sh → zip (index.js + game-ivasya.js), yc version create nodejs22 index.handler 256m 30s,
сохрани TELEGRAM_BOT_TOKEN/SITE_URL, добавь хотя бы один LLM-ключ если есть,
curl ?setup=commands и ?poll=1, проверь /start /game /ivasya /gen.
Секреты в git не коммить. Отчёт по-русски.
```

## Что сделать тебе одной командой (если yc уже настроен)

```bash
cd /Users/polzovatel/GrillzCustoms
export TELEGRAM_BOT_TOKEN='…'   # если не сохранён в yc env
export GEMINI_API_KEY='…'       # Google AI Studio, или другой LLM-ключ из списка выше
bash bot/yandex-function/deploy.sh
```

Без `yc` — только упаковка для Console:

```bash
bash bot/yandex-function/pack.sh
# загрузи bot/yandex-function/grillzcustoms-telegram-bot.zip в
# https://console.yandex.cloud/folders/b1g4vg12cnanadnute6g
# → Functions → grillzcustoms-telegram-bot → Создать версию
# затем открой: https://functions.yandexcloud.net/d4e1e154aq9us864hggr?setup=commands
```
