// Yabloko Labs careers form endpoint — Cloudflare Worker
//
// The careers page is a static Next.js export, so it POSTs the application
// form (multipart/form-data) here. The worker validates the fields, keeps a
// copy in KV when a binding exists, and emails the team with the CV attached
// through the Cloudflare Email Service `send_email` binding.
//
// Endpoints:
//   GET  /    service info (deployment sanity check)
//   POST /    accept an application -> 200 { ok, id }
//
// Form fields: name, email, contact, role, cv (PDF/DOC/DOCX, max 5 MB).
// `hp_check` is a honeypot — real applicants never fill it in. The earlier
// `company_website` name is deliberately not checked: browsers autofilled it
// for real applicants, and a stale cached form must not be dropped as spam.
//
// Delivery: email is tried first when CAREERS_NOTIFY_TO is set (Cloudflare
// Email Sending — free only to verified Email Routing destinations, arbitrary
// recipients need Workers Paid). If email is not configured or fails, the
// application goes to Telegram instead, so the form keeps working.

const MAX_CV_BYTES = 5 * 1024 * 1024;
const MAX_NAME_CHARS = 120;
const MAX_CONTACT_CHARS = 40;
const MAX_ROLE_CHARS = 80;
const DEFAULT_RATE_LIMIT = 5; // applications per IP per hour

const CV_TYPES = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const SERVICE = {
  name: "careers-form",
  service: "Yabloko Labs careers form endpoint",
  description:
    "Accepts the careers page application form, emails it to the hiring inbox with the CV attached, and optionally keeps a backup copy in KV.",
  endpoints: {
    info: "GET /",
    apply: "POST / (multipart/form-data: name, email, contact, role, cv)",
  },
  limits: {
    max_cv_bytes: MAX_CV_BYTES,
    cv_types: Object.keys(CV_TYPES),
    applications_per_ip_per_hour: DEFAULT_RATE_LIMIT,
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

function telegramCaption({ name, email, contact, role, filename, id }) {
  return [
    "New careers application",
    `Name: ${name}`,
    `Email: ${email}`,
    `Contact: ${contact}`,
    `Role: ${role}`,
    `CV: ${filename}`,
    `ID: ${id}`,
  ]
    .join("\n")
    .slice(0, 1000);
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
    notifyTo: String(env.CAREERS_NOTIFY_TO ?? "").trim(),
    from: String(env.CAREERS_FROM ?? "careers@yablokolabs.com").trim(),
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

function safeFilename(name) {
  const base = String(name || "cv").replace(/[^\w.\- ]+/g, "_").trim() || "cv";
  return base.slice(-80);
}

// Base64 in chunks: a 5 MB file spread into String.fromCharCode overflows the
// call stack, and btoa only accepts binary strings.
function toBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

function emailBodies({ name, email, contact, role, cvName, cvSize, receivedAt }) {
  const rows = [
    ["Name", name],
    ["Email", email],
    ["Contact", contact],
    ["Role", role],
    ["CV", `${cvName} (${Math.round(cvSize / 1024)} KB)`],
    ["Received", receivedAt],
  ];

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = [
    "<h2>New careers application</h2>",
    "<table cellpadding=\"6\" style=\"border-collapse:collapse\">",
    ...rows.map(
      ([label, value]) =>
        `<tr><td style="color:#64748b">${escapeHtml(label)}</td><td><strong>${escapeHtml(value)}</strong></td></tr>`,
    ),
    "</table>",
    "<p>The CV is attached. Reply to this email to answer the applicant directly.</p>",
  ].join("");

  return { text, html };
}

// deps: {
//   sendEmail?: (message) => Promise,
//   sendTelegram?: ({ text, document }) => Promise,
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
      // Logged so a silently dropped submission can be told apart from a
      // delivered one when an applicant reports "nothing arrived".
      if (field(form, "hp_check")) {
        console.log("careers-form: dropped honeypot submission", request.headers.get("CF-Connecting-IP") ?? "unknown");
        return json({ ok: true, id: null }, 200, cors);
      }

      const name = field(form, "name");
      const email = field(form, "email");
      const contact = field(form, "contact");
      const role = field(form, "role") || "Not specified";

      if (name.length < 2 || name.length > MAX_NAME_CHARS) {
        throw new ApiError(400, "name must be between 2 and 120 characters");
      }
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        throw new ApiError(400, "email is not a valid address");
      }
      if (contact.length < 5 || contact.length > MAX_CONTACT_CHARS) {
        throw new ApiError(400, "contact must be between 5 and 40 characters");
      }
      if (role.length > MAX_ROLE_CHARS) {
        throw new ApiError(400, "role is too long");
      }

      const cv = form.get("cv");
      if (!cv || typeof cv === "string" || cv.size === 0) {
        throw new ApiError(400, "attach your CV as a PDF, DOC or DOCX file");
      }
      if (cv.size > MAX_CV_BYTES) {
        throw new ApiError(413, "CV is larger than 5 MB");
      }
      const extension = (cv.name.split(".").pop() ?? "").toLowerCase();
      if (!CV_TYPES[extension]) {
        throw new ApiError(415, "CV must be a PDF, DOC or DOCX file");
      }

      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      if (store && config.rateLimit > 0) {
        const hour = new Date().toISOString().slice(0, 13);
        const bucket = `rate:${ip}:${hour}`;
        const used = Number(await store.get(bucket)) || 0;
        if (used >= config.rateLimit) {
          throw new ApiError(429, "too many applications from this address, try again later");
        }
        await store.put(bucket, String(used + 1));
      }

      const id = crypto.randomUUID();
      const receivedAt = new Date().toISOString();
      const filename = safeFilename(cv.name);
      const bytes = new Uint8Array(await cv.arrayBuffer());
      const base64 = toBase64(bytes);

      // Backup copy first: if the email fails, the application is still kept.
      if (store) {
        await store.put(
          `applications/${receivedAt}-${id}.json`,
          JSON.stringify({
            id,
            receivedAt,
            name,
            email,
            contact,
            role,
            cv: { filename, size: cv.size, type: CV_TYPES[extension], base64 },
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

      // Preferred channel: the hiring inbox. Falls back to Telegram when email
      // is unset or the send fails (unverified destination, plan limit, …).
      const delivered = [];
      if (emailConfigured) {
        try {
          const { text, html } = emailBodies({
            name,
            email,
            contact,
            role,
            cvName: filename,
            cvSize: cv.size,
            receivedAt,
          });
          await sendEmail({
            to: config.notifyTo,
            from: config.from,
            replyTo: email,
            subject: `Careers application — ${role} — ${name}`,
            text,
            html,
            attachments: [
              { content: base64, filename, type: CV_TYPES[extension], disposition: "attachment" },
            ],
          });
          delivered.push("email");
        } catch (error) {
          console.error(
            "careers-form: email send failed",
            error && error.code,
            error && error.message,
          );
        }
      }

      if (!delivered.length && sendTelegram) {
        try {
          await sendTelegram({
            text: telegramCaption({ name, email, contact, role, filename, id }),
            document: {
              content: bytes,
              filename,
              type: CV_TYPES[extension],
            },
          });
          delivered.push("telegram");
        } catch (error) {
          console.error("careers-form: telegram delivery failed", error && error.message);
        }
      }

      console.log("careers-form: application accepted", id, delivered.join(",") || "none");

      if (!delivered.length) {
        throw new ApiError(
          502,
          "we could not notify the hiring team — please email career@yablokolabs.com with your CV",
        );
      }

      return json({ ok: true, id, delivered }, 200, cors);
    } catch (error) {
      if (error instanceof ApiError) {
        return json({ error: error.message }, error.status, cors);
      }
      console.error("careers-form: unexpected error", error && error.message);
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

// Telegram Bot API sender: one sendDocument call per application, with the
// applicant's details as the caption. Needs both secrets to be present.
function telegramSender(env) {
  const token = env && env.TELEGRAM_BOT_TOKEN;
  const chatId = env && env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;

  return async ({ text, document }) => {
    const body = new FormData();
    body.set("chat_id", chatId);
    body.set("caption", text);
    body.set(
      "document",
      new File([document.content], document.filename, { type: document.type }),
    );

    const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: "POST",
      body,
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`telegram responded ${response.status}: ${detail.slice(0, 200)}`);
    }
    return response.json();
  };
}

// Applications and rate-limit counters expire after 180 days, so CVs are not
// kept longer than a recruiting cycle needs them.
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
