// Local smoke test for the careers form worker. Runs the handler in plain Node
// (no Cloudflare runtime needed) against an in-memory store and a fake email
// binding.
//
//   npm test            (from workers/careers-form)

import { createHandler } from "../src/index.js";

const BASE = "https://careers-form.yablokolabs.com";
const ALLOWED = ["https://yablokolabs.com", "https://www.yablokolabs.com"];

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

function makeWorker({ rateLimit = 5, notifyTo = "hiring@example.com", sendEmail, sendTelegram } = {}) {
  const store = new MemoryStore();
  const sent = [];
  const send =
    sendEmail ??
    (async (message) => {
      sent.push(message);
      return { messageId: "msg_test" };
    });

  const handle = createHandler({
    sendEmail: send,
    sendTelegram,
    store,
    config: {
      allowedOrigins: ALLOWED,
      notifyTo,
      from: "careers@yablokolabs.com",
      rateLimit,
    },
  });

  return { handle, store, sent };
}

function application(overrides = {}) {
  const form = new FormData();
  form.set("name", "Ada Lovelace");
  form.set("email", "ada@example.com");
  form.set("contact", "+44 7700 900123");
  form.set("role", "Sales Shark");
  form.set("cv", new File(["%PDF-1.4 test cv"], "ada-lovelace.pdf", { type: "application/pdf" }));

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) form.delete(key);
    else form.set(key, value);
  }
  return form;
}

function post(handle, form, headers = {}) {
  return handle(
    new Request(`${BASE}/`, { method: "POST", body: form, headers }),
  );
}

let passed = 0;
let failed = 0;
function check(label, condition) {
  if (condition) {
    passed += 1;
    console.log(`  ok  ${label}`);
  } else {
    failed += 1;
    console.error(`FAIL  ${label}`);
  }
}

// ---- service info ---------------------------------------------------------
{
  const { handle } = makeWorker();
  const res = await handle(new Request(`${BASE}/`));
  const body = await res.json();
  check("GET / reports the service", res.status === 200 && body.name === "careers-form");
  check("GET / lists the CV size limit", body.limits.max_cv_bytes === 5 * 1024 * 1024);
}

// ---- happy path -----------------------------------------------------------
{
  const { handle, store, sent } = makeWorker();
  const res = await post(handle, application());
  const body = await res.json();

  check("valid application returns 200 ok", res.status === 200 && body.ok === true);
  check("valid application returns an id", typeof body.id === "string" && body.id.length === 36);
  check("one email was sent", sent.length === 1);

  const mail = sent[0] ?? {};
  check("email goes to the configured inbox", mail.to === "hiring@example.com");
  check("email is sent from the domain address", mail.from === "careers@yablokolabs.com");
  check("reply-to is the applicant", mail.replyTo === "ada@example.com");
  check(
    "subject names the role and applicant",
    mail.subject === "Careers application — Sales Shark — Ada Lovelace",
  );
  check(
    "CV is attached with a usable filename",
    mail.attachments?.[0]?.filename === "ada-lovelace.pdf" &&
      mail.attachments[0].type === "application/pdf" &&
      mail.attachments[0].disposition === "attachment",
  );
  check(
    "attachment content is the uploaded file",
    Buffer.from(mail.attachments[0].content, "base64").toString() === "%PDF-1.4 test cv",
  );
  check("plain-text body carries the contact number", mail.text.includes("+44 7700 900123"));

  const key = [...store.map.keys()].find((k) => k.startsWith("applications/"));
  const stored = key ? JSON.parse(store.map.get(key)) : null;
  check("backup copy is stored in KV", stored !== null && stored.email === "ada@example.com");
  check("backup copy keeps the CV bytes", stored !== null && stored.cv.base64.length > 0);
}

// ---- validation -----------------------------------------------------------
{
  const { handle, sent } = makeWorker();

  const noCv = await post(handle, application({ cv: undefined }));
  check("missing CV is rejected with 400", noCv.status === 400);

  const bigCv = await post(
    handle,
    application({
      cv: new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.pdf", { type: "application/pdf" }),
    }),
  );
  check("CV over 5 MB is rejected with 413", bigCv.status === 413);

  const exe = await post(
    handle,
    application({ cv: new File(["MZ"], "cv.exe", { type: "application/octet-stream" }) }),
  );
  check("non-document CV is rejected with 415", exe.status === 415);

  const badEmail = await post(handle, application({ email: "not-an-email" }));
  check("invalid email is rejected with 400", badEmail.status === 400);

  const shortContact = await post(handle, application({ contact: "123" }));
  check("too-short contact is rejected with 400", shortContact.status === 400);

  const missingName = await post(handle, application({ name: "" }));
  check("empty name is rejected with 400", missingName.status === 400);

  const wrongType = await handle(
    new Request(`${BASE}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }),
  );
  check("JSON body is rejected with 415", wrongType.status === 415);

  check("no email is sent for rejected applications", sent.length === 0);
}

// ---- spam and CORS --------------------------------------------------------
{
  const { handle, sent } = makeWorker();
  const honeypot = application({ company_website: "https://spam.example" });
  const res = await post(handle, honeypot);
  const body = await res.json();
  check("honeypot submissions look successful", res.status === 200 && body.ok === true);
  check("honeypot submissions are not emailed", sent.length === 0);
}

{
  const { handle } = makeWorker();
  const blocked = await post(handle, application(), { Origin: "https://evil.example" });
  check("foreign origin is rejected with 403", blocked.status === 403);

  const allowedRes = await post(handle, application(), { Origin: "https://yablokolabs.com" });
  check(
    "allowed origin is echoed in CORS headers",
    allowedRes.headers.get("Access-Control-Allow-Origin") === "https://yablokolabs.com",
  );

  const preflight = await handle(
    new Request(`${BASE}/`, {
      method: "OPTIONS",
      headers: { Origin: "https://yablokolabs.com" },
    }),
  );
  check("preflight returns 204", preflight.status === 204);
}

// ---- rate limiting --------------------------------------------------------
{
  const { handle } = makeWorker({ rateLimit: 2 });
  const first = await post(handle, application());
  const second = await post(handle, application());
  const third = await post(handle, application());
  check("applications under the limit are accepted", first.status === 200 && second.status === 200);
  check("applications over the limit get 429", third.status === 429);
}

// ---- delivery channels ----------------------------------------------------
{
  // Email is preferred; Telegram is only used when email fails.
  const telegramSent = [];
  const { handle } = makeWorker({
    notifyTo: "",
    sendTelegram: async (message) => {
      telegramSent.push(message);
      return { ok: true };
    },
  });
  const res = await post(handle, application());
  const body = await res.json();
  const message = telegramSent[0] ?? {};
  check("Telegram-only setup delivers the application", res.status === 200 && body.delivered[0] === "telegram");
  check("Telegram caption carries the applicant details", message.text.includes("ada@example.com"));
  check("Telegram receives the CV as a file", message.document?.filename === "ada-lovelace.pdf");
  check(
    "Telegram document is the uploaded CV",
    Buffer.from(message.document.content).toString() === "%PDF-1.4 test cv",
  );
}

{
  // Unverified destination / plan limit: email throws, Telegram still lands it.
  const telegramSent = [];
  const { handle } = makeWorker({
    sendEmail: async () => {
      const error = new Error("destination address is not a verified address");
      error.code = "E_RECIPIENT_NOT_ALLOWED";
      throw error;
    },
    sendTelegram: async (message) => {
      telegramSent.push(message);
      return { ok: true };
    },
  });
  const res = await post(handle, application());
  const body = await res.json();
  check(
    "failed email falls back to Telegram",
    res.status === 200 && body.delivered[0] === "telegram" && telegramSent.length === 1,
  );
}

{
  // A verified email destination means no duplicate Telegram notification.
  const telegramSent = [];
  const { handle } = makeWorker({
    sendTelegram: async (message) => {
      telegramSent.push(message);
      return { ok: true };
    },
  });
  const res = await post(handle, application());
  const body = await res.json();
  check(
    "working email suppresses the Telegram fallback",
    res.status === 200 && body.delivered[0] === "email" && telegramSent.length === 0,
  );
}

// ---- failure handling -----------------------------------------------------
{
  const { handle } = makeWorker({
    sendEmail: async () => {
      const error = new Error("sender not verified");
      error.code = "E_SENDER_NOT_VERIFIED";
      throw error;
    },
  });
  const res = await post(handle, application());
  const body = await res.json();
  check("email failure with no fallback surfaces as 502", res.status === 502);
  check("failure message points at the fallback inbox", body.error.includes("career@yablokolabs.com"));
}

{
  const { handle } = makeWorker({ notifyTo: "" });
  const res = await post(handle, application());
  check("no delivery channel is a 503", res.status === 503);
}

// ---- routing --------------------------------------------------------------
{
  const { handle } = makeWorker();
  const notFound = await handle(new Request(`${BASE}/nope`));
  check("unknown path returns 404", notFound.status === 404);

  const wrongMethod = await handle(new Request(`${BASE}/`, { method: "PUT", body: "x" }));
  check("unsupported method returns 405", wrongMethod.status === 405);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
