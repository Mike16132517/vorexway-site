VOREXWAY — PRODUCTION

Это финальный пакет на базе утверждённой версии v13.

ВАЖНО:
1. Не вставляйте Telegram Bot Token в index.html, script.js или config.js.
2. Не публикуйте токены в GitHub.
3. Для формы нужны серверные Cloudflare Functions, поэтому финальную публикацию нужно делать как проект Cloudflare Pages/Workers с поддержкой Functions, а не как обычную папку статических файлов без серверной функции.

Перед запуском нужно настроить в Cloudflare:
- TELEGRAM_BOT_TOKEN — Secret
- TELEGRAM_CHAT_ID — Secret/переменная
- TURNSTILE_SECRET_KEY — Secret
- ALLOWED_HOSTNAME — ваш домен, без https://

В config.js нужно вставить публичный TURNSTILE SITE KEY.

Перед публикацией заполните [ЗАПОЛНИТЬ] в privacy.html.

Главные файлы:
- index.html — сайт
- styles.css — стили
- script.js — интерфейс и отправка формы на /api/lead
- assets/ — все изображения, включая проекты и услуги
- functions/api/lead.js — защищённая серверная отправка заявок в Telegram
- _headers — security headers
- _routes.json — маршрутизация Functions
- privacy.html — политика обработки персональных данных
- DEPLOYMENT.md — подробная инструкция
