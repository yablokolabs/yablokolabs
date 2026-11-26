// Yabloko Labs cohort interest endpoint — Cloudflare Worker
//
// The /cohort page is part of a static Next.js export, so it POSTs the interest
// form (multipart/form-data) here. The worker validates the fields, keeps a
// backup in KV when a binding exists, and notifies the cohort inbox through the
// Cloudflare Email Service `send_email` binding, falling back to Telegram.
//
// Endpoints:
//   GET  /    service info (deployment sanity check)
//   POST /    register interest -> 200 { ok, id, delivered }
//
// Form fields: name, email, country, stage, link, built, hours, consent.
// `hp_check` is a honeypot — real visitors never fill it in.
//
// No CV is collected here on purpose. An interest form that asks for a file
// loses most of the people who are only curious; the CV belongs in a later
// application step, once a seat is being offered.

const MAX_NAME_CHARS = 120;
const MAX_COUNTRY_CHARS = 80;
const MAX_LINK_CHARS = 300;
const MAX_BUILT_CHARS = 1200;
const DEFAULT_RATE_LIMIT = 5; // submissions per IP per hour

const STAGES = new Set([
  "Final-year student",
  "Recent graduate",
  "Early-career developer",
  "Other",
]);

const HOURS = new Set(["Under 5 hours", "5–10 hours", "10–15 hours", "15+ hours"]);

const SERVICE = {
  name: "cohort-form",
  service: "Yabloko Labs cohort interest endpoint",
  description:
    "Accepts the /cohort interest form, validates it, and notifies the cohort inbox. No CV is collected at this stage.",
  endpoints: {
    info: "GET /",
    interest: "POST / (multipart/form-data: name, email, country, stage, link, built, hours, consent)",
  },
  limits: {
    submissions_per_ip_per_hour: DEFAULT_RATE_LIMIT,
    max_built_chars: MAX_BUILT_CHARS,
  },
};

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function corsFor(origin, allowedOrigins) {
  if (!origin) return {};
  if (!allowedOrigins.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });
}

function configFromEnv(env = {}) {
  const allowed = String(
    env.ALLOWED_ORIGINS ?? "https://yablokolabs.com,https://www.yablokolabs.com",
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    allowedOrigins: allowed,
    notifyTo: String(env.COHORT_NOTIFY_TO ?? "cohort@yablokolabs.com").trim(),
    from: String(env.COHORT_FROM ?? "cohort@yablokolabs.com").trim(),
    rateLimit: Number(env.RATE_LIMIT_PER_HOUR ?? DEFAULT_RATE_LIMIT),
  };
}

function field(form, key) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailBodies({ name, email, country, stage, link, built, hours, receivedAt }) {
  const rows = [
    ["Name", name],
    ["Email", email],
    ["Country", country],
    ["Stage", stage],
    ["Weekly time", hours],
    ["Link", link || "Not provided"],
    ["What they have built", built],
    ["Received", receivedAt],
  ];

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = [
    "<h2>New cohort interest</h2>",
    '<table cellpadding="6" style="border-collapse:collapse">',
    ...rows.map(
      ([label, value]) =>
        `<tr><td style="color:#64748b;vertical-align:top">${escapeHtml(label)}</td><td><strong>${escapeHtml(value)}</strong></td></tr>`,
    ),
    "</table>",
    "<p>No CV was collected. Reply to this email to answer the applicant directly.</p>",
  ].join("");

  return { text, html };
}

function telegramText({ name, email, country, stage, link, built, hours, id }) {
  return [
    "New cohort interest",
    `Name: ${name}`,
    `Email: ${email}`,
    `Country: ${country}`,
    `Stage: ${stage}`,
    `Weekly time: ${hours}`,
    `Link: ${link || "not provided"}`,
    `Built: ${built}`,
    `ID: ${id}`,
  ]
    .join("\n")
    .slice(0, 3900);
}

// deps: {
//   sendEmail?: (message) => Promise,
//   sendTelegram?: ({ text }) => Promise,
//   store?: { get, put } | null,
//   config,
// }
export function createHandler({ sendEmail, sendTelegram = null, store = null, config }) {
  return async function handle(request) {
    const origin = request.headers.get("Origin") ?? "";
    const cors = corsFor(origin, config.allowedOrigins);
    const path = new URL(request.url).pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      if (origin && !config.allowedOrigins.includes(origin)) {
        throw new ApiError(403, "origin not allowed");
      }
      if (path !== "/") throw new ApiError(404, "not found");

      if (request.method === "GET") {
        return json(SERVICE, 200, cors);
      }
      if (request.method !== "POST") {
        throw new ApiError(405, "method not allowed");
      }

      const contentType = request.headers.get("Content-Type") ?? "";
      if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
        throw new ApiError(415, "expected multipart/form-data");
      }

      let form;
      try {
        form = await request.formData();
      } catch {
        throw new ApiError(400, "could not read the form data");
      }

      // Bots fill every input they find; a browser user never sees this field.
      if (field(form, "hp_check")) {
        console.log("cohort-form: dropped honeypot submission", request.headers.get("CF-Connecting-IP") ?? "unknown");
        return json({ ok: true, id: null }, 200, cors);
      }

      const name = field(form, "name");
      const email = field(form, "email");
      const country = field(form, "country");
      const stage = field(form, "stage");
      const link = field(form, "link");
      const built = field(form, "built");
      const hours = field(form, "hours");
      const consent = field(form, "consent");

      if (name.length < 2 || name.length > MAX_NAME_CHARS) {
        throw new ApiError(400, "name must be between 2 and 120 characters");
      }
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        throw new ApiError(400, "email is not a valid address");
      }
      if (country.length < 2 || country.length > MAX_COUNTRY_CHARS) {
        throw new ApiError(400, "country must be between 2 and 80 characters");
      }
      if (!STAGES.has(stage)) {
        throw new ApiError(400, "stage must be one of the listed options");
      }
      if (!HOURS.has(hours)) {
        throw new ApiError(400, "hours must be one of the listed options");
      }
      if (link.length > MAX_LINK_CHARS) {
        throw new ApiError(400, "link is too long");
      }
      if (built.length < 10 || built.length > MAX_BUILT_CHARS) {
        throw new ApiError(400, `built must be between 10 and ${MAX_BUILT_CHARS} characters`);
      }
      if (consent !== "yes") {
        throw new ApiError(400, "consent to be contacted is required");
      }

      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      if (store && config.rateLimit > 0) {
        const hour = new Date().toISOString().slice(0, 13);
        const bucket = `rate:${ip}:${hour}`;
        const used = Number(await store.get(bucket)) || 0;
        if (used >= config.rateLimit) {
          throw new ApiError(429, "too many submissions from this address, try again later");
        }
        await store.put(bucket, String(used + 1));
      }

      const id = crypto.randomUUID();
      const receivedAt = new Date().toISOString();

      // Backup copy first: if delivery fails, the interest is still kept.
      if (store) {
        await store.put(
          `interest/${receivedAt}-${id}.json`,
          JSON.stringify({
            id,
            receivedAt,
            name,
            email,
            country,
            stage,
            link,
            built,
            hours,
            consent,
          }),
        );
      }

      const emailConfigured = Boolean(config.notifyTo);
      if (!emailConfigured && !sendTelegram) {
        throw new ApiError(503, "no delivery channel is configured");
      }
      if (emailConfigured && typeof sendEmail !== "function") {
        throw new ApiError(503, "email delivery is not configured");
      }

      const delivered = [];
      if (emailConfigured) {
        try {
          const { text, html } = emailBodies({
            name,
            email,
            country,
            stage,
            link,
            built,
            hours,
            receivedAt,
          });
          await sendEmail({
            to: config.notifyTo,
            from: config.from,
            replyTo: email,
            subject: `Cohort interest — ${stage} — ${name}`,
            text,
            html,
          });
          delivered.push("email");
        } catch (error) {
          console.error("cohort-form: email send failed", error && error.code, error && error.message);
        }
      }

      if (!delivered.length && sendTelegram) {
        try {
          await sendTelegram({
            text: telegramText({ name, email, country, stage, link, built, hours, id }),
          });
          delivered.push("telegram");
        } catch (error) {
          console.error("cohort-form: telegram delivery failed", error && error.message);
        }
      }

      console.log("cohort-form: interest accepted", id, delivered.join(",") || "none");

      if (!delivered.length) {
        throw new ApiError(
          502,
          "we could not notify the cohort team — please email cohort@yablokolabs.com",
        );
      }

      return json({ ok: true, id, delivered }, 200, cors);
    } catch (error) {
      if (error instanceof ApiError) {
        return json({ error: error.message }, error.status, cors);
      }
      console.error("cohort-form: unexpected error", error && error.message);
      return json({ error: "internal error" }, 500, cors);
    }
  };
}

// Memory store so `wrangler dev` and the smoke test behave like production
// when no KV binding is present.
class MemoryStore {
  constructor() {
    this.map = new Map();
  }
  async get(key) {
    return this.map.get(key) ?? null;
  }
  async put(key, value) {
    this.map.set(key, value);
  }
}

const devStore = new MemoryStore();

// Telegram Bot API sender: one sendMessage call per submission. Needs both
// secrets to be present.
function telegramSender(env) {
  const token = env && env.TELEGRAM_BOT_TOKEN;
  const chatId = env && env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;

  return async ({ text }) => {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ chat_id: chatId, text }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`telegram responded ${response.status}: ${detail.slice(0, 200)}`);
    }
    return response.json();
  };
}

// Interest records and rate-limit counters expire after 180 days, so personal
// details are not kept longer than a recruiting cycle needs them.
const STORE_TTL_SECONDS = 60 * 60 * 24 * 180;

export default {
  async fetch(request, env) {
    const store =
      env && env.SUBMISSIONS
        ? {
            get: (key) => env.SUBMISSIONS.get(key),
            put: (key, value) =>
              env.SUBMISSIONS.put(key, value, { expirationTtl: STORE_TTL_SECONDS }),
          }
        : devStore;
    return createHandler({
      sendEmail: env && env.EMAIL ? (message) => env.EMAIL.send(message) : null,
      sendTelegram: telegramSender(env),
      store,
      config: configFromEnv(env),
    })(request);
  },
};
