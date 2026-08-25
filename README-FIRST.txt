VOREXWAY — Workers production layout

public/      = только файлы, которые разрешено отдавать посетителю
src/index.js = серверный Worker; /api/lead отправляет заявки в Telegram
wrangler.jsonc = конфигурация Cloudflare Workers Static Assets

Cloudflare secrets после деплоя:
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
TURNSTILE_SECRET_KEY

Переменная:
ALLOWED_HOSTNAME

В public/config.js позже вставляется только публичный Turnstile Site Key.
Секретные значения никогда не помещать в public/, HTML, JS или GitHub.
