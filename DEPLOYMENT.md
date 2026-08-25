# VOREXWAY — production deployment

База: утверждённая версия сайта VOREXWAY v13.

## Что уже подготовлено

- Статический сайт без CMS и открытой админ-панели.
- `/functions/api/lead.js` — серверная Cloudflare Pages Function.
- Отправка заявок в Telegram через Bot API.
- Telegram bot token не хранится в HTML/JS/GitHub.
- Cloudflare Turnstile для защиты формы от ботов.
- Серверная проверка всех полей.
- Honeypot-поле для примитивных ботов.
- Проверка Origin.
- Ограничение размера запроса.
- Security headers: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy.
- Собственная база заявок не создаётся.
- UTM-метки передаются вместе с заявкой.
- Шаблон `privacy.html`.

## Секреты Cloudflare

Создать как encrypted secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TURNSTILE_SECRET_KEY`

Обычная переменная:

- `ALLOWED_HOSTNAME` — домен без `https://`, например `vorexway.ru`

## Публичный ключ Turnstile

В `config.js` заменить:

`PASTE_TURNSTILE_SITE_KEY_HERE`

на Site Key из Cloudflare Turnstile.

Site Key публичный. Secret Key никогда не помещать в этот файл.

## Cloudflare Rate Limiting

Создать правило для пути:

`/api/lead`

Рекомендуемая отправная точка для формы:
- 5 запросов с одного IP за 1 минуту;
- действие: Block;
- при реальной необходимости лимит можно увеличить.

Turnstile остаётся основной защитой от автоматических заявок.

## Проверка перед публикацией

1. Заполнить данные оператора в `privacy.html`.
2. Создать Turnstile и вставить Site Key в `config.js`.
3. Добавить три секрета и `ALLOWED_HOSTNAME` в Cloudflare.
4. Сделать тестовую заявку.
5. Убедиться, что сообщение пришло в нужный Telegram-чат.
6. Проверить сайт с телефона и компьютера.
7. Только после этого подключить основной домен.

## Как редактировать сайт дальше

Главный источник — GitHub-репозиторий.

Обычный цикл:
1. Изменить файлы локально.
2. Проверить preview.
3. Сделать commit/push в GitHub.
4. Cloudflare Pages автоматически создаст новый deployment.
5. При необходимости откатиться на предыдущий deployment в Cloudflare.

Не редактировать опубликованные файлы вручную на сервере: иначе появятся разные версии сайта.
