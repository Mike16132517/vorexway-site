const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer"
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function clean(value, max = 200) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function validPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

async function verifyTurnstile(token, request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET_KEY);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form }
  );
  if (!response.ok) return { success: false };
  return response.json();
}

async function handleLead(request, env) {
  if (request.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID || !env.TURNSTILE_SECRET_KEY) {
    return json({ error: "Сервис формы временно не настроен." }, 503);
  }

  const origin = request.headers.get("Origin");
  const requestOrigin = new URL(request.url).origin;
  if (origin && origin !== requestOrigin) return json({ error: "Запрос отклонён." }, 403);

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ error: "Неверный формат запроса." }, 415);
  }

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > 12000) return json({ error: "Слишком большой запрос." }, 413);

  let payload;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return json({ error: "Слишком большой запрос." }, 413);
    payload = JSON.parse(raw);
  } catch {
    return json({ error: "Некорректные данные." }, 400);
  }

  if (clean(payload.company, 100)) return json({ ok: true });

  const name = clean(payload.name, 80);
  const phone = clean(payload.phone, 30);
  const area = clean(payload.area, 20);
  const objectType = clean(payload.objectType, 40);
  const comment = clean(payload.comment, 1000);
  const page = clean(payload.page, 120);
  const utmSource = clean(payload.utm_source, 100);
  const utmMedium = clean(payload.utm_medium, 100);
  const utmCampaign = clean(payload.utm_campaign, 100);
  const token = clean(payload.turnstileToken, 4096);

  if (!payload.consent) return json({ error: "Необходимо согласие на обработку данных." }, 400);
  if (name.length < 2) return json({ error: "Укажите имя." }, 400);
  if (!validPhone(phone)) return json({ error: "Проверьте номер телефона." }, 400);

  const allowedTypes = new Set(["Новостройка", "Вторичное жильё", "Частный дом", "Другое"]);
  if (!allowedTypes.has(objectType)) return json({ error: "Некорректный тип объекта." }, 400);
  if (!token) return json({ error: "Не пройдена проверка безопасности." }, 400);

  const turnstile = await verifyTurnstile(token, request, env);
  if (!turnstile.success) {
    return json({ error: "Проверка безопасности не пройдена. Обновите страницу и попробуйте ещё раз." }, 403);
  }

  if (env.ALLOWED_HOSTNAME && turnstile.hostname && turnstile.hostname !== env.ALLOWED_HOSTNAME) {
    return json({ error: "Проверка домена не пройдена." }, 403);
  }

  const rows = [
    "🏠 <b>Новая заявка VOREXWAY</b>",
    "",
    `👤 <b>Имя:</b> ${escapeHtml(name)}`,
    `📞 <b>Телефон:</b> ${escapeHtml(phone)}`,
    `📐 <b>Площадь:</b> ${escapeHtml(area || "не указана")}`,
    `🏗 <b>Объект:</b> ${escapeHtml(objectType)}`,
    `💬 <b>Комментарий:</b> ${escapeHtml(comment || "—")}`,
    "",
  ];if (utmSource || utmMedium || utmCampaign) {
    rows.push(`📊 <b>UTM:</b> ${escapeHtml([utmSource, utmMedium, utmCampaign].filter(Boolean).join(" / "))}`);
  }

  const tgResponse = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: rows.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    }
  );

  if (!tgResponse.ok) {
    console.error("Telegram sendMessage failed:", await tgResponse.text());
    return json({ error: "Не удалось отправить заявку. Попробуйте ещё раз." }, 502);
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/lead") {
      return handleLead(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};
