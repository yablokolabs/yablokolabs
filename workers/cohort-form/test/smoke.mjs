// Local smoke test for the cohort interest worker. Runs the handler in plain
// Node (no Cloudflare runtime needed) against an in-memory store and a fake
// email binding.
//
//   npm test            (from workers/cohort-form)

import { createHandler } from "../src/index.js";

const BASE = "https://cohort-form.yablokolabs.com";
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

function makeWorker({ rateLimit = 5, notifyTo = "cohort@example.com", sendEmail, sendTelegram } = {}) {
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
      from: "cohort@yablokolabs.com",
      rateLimit,
    },
  });

  return { handle, store, sent };
}

function interest(overrides = {}) {
  const form = new FormData();
  form.set("name", "Ada Lovelace");
  form.set("email", "ada@example.com");
  form.set("country", "United Kingdom");
  form.set("stage", "Final-year student");
  form.set("link", "https://github.com/ada");
  form.set("built", "A small task tracker in React with tests and a deployed demo.");
  form.set("hours", "10–15 hours");
  form.set("consent", "yes");

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) form.delete(key);
    else form.set(key, value);
  }
  return form;
}

function post(handle, form, headers = {}) {
  return handle(new Request(`${BASE}/`, { method: "POST", body: form, headers }));
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
  check("GET / describes the service", res.status === 200 && body.name === "cohort-form");
  check("service info states that no CV is collected", body.description.includes("No CV"));
}

// ---- happy path -----------------------------------------------------------
{
  const { handle, sent, store } = makeWorker();
  const res = await post(handle, interest(), { Origin: "https://yablokolabs.com" });
  const body = await res.json();
  const message = sent[0];

  check("a valid submission is accepted", res.status === 200 && body.ok === true);
  check("email delivery is reported", body.delivered.includes("email"));
  check("the notification goes to the cohort inbox", message.to === "cohort@example.com");
  check("the reply-to is the applicant", message.replyTo === "ada@example.com");
  check("the subject names the stage and applicant", message.subject.includes("Final-year student") && message.subject.includes("Ada Lovelace"));
  check("the body carries what they built", message.text.includes("task tracker"));
  check("no attachment is sent at the interest stage", message.attachments === undefined);
  check(
    "a backup record is written",
    [...store.map.keys()].some((key) => key.startsWith("interest/")),
  );
}

// ---- validation -----------------------------------------------------------
{
  const { handle } = makeWorker();
  const cases = [
    ["missing consent is rejected", interest({ consent: undefined }), 400],
    ["an invalid email is rejected", interest({ email: "not-an-email" }), 400],
    ["an unknown stage is rejected", interest({ stage: "Principal engineer" }), 400],
    ["an unknown time commitment is rejected", interest({ hours: "Whenever" }), 400],
    ["a too-short answer is rejected", interest({ built: "hi" }), 400],
    ["a missing country is rejected", interest({ country: undefined }), 400],
  ];

  for (const [label, form, status] of cases) {
    const res = await post(handle, form);
    check(label, res.status === status);
  }
}

// ---- spam, CORS and rate limiting -----------------------------------------
{
  const { handle, sent } = makeWorker();
  const res = await post(handle, interest({ hp_check: "https://spam.example" }));
  const body = await res.json();
  check("the honeypot is accepted silently and dropped", res.status === 200 && body.id === null);
  check("a honeypot submission is not delivered", sent.length === 0);
}

{
  const { handle } = makeWorker();
  const res = await post(handle, interest(), { Origin: "https://evil.example" });
  check("an unlisted origin is rejected", res.status === 403);
}

{
  const { handle } = makeWorker({ rateLimit: 2 });
  const headers = { "CF-Connecting-IP": "203.0.113.7" };
  await post(handle, interest(), headers);
  await post(handle, interest(), headers);
  const res = await post(handle, interest(), headers);
  check("the per-IP rate limit is enforced", res.status === 429);
}

// ---- delivery fallbacks ---------------------------------------------------
{
  const telegramSent = [];
  const { handle } = makeWorker({
    sendEmail: async () => {
      const error = new Error("recipient not verified");
      error.code = "E_RECIPIENT_NOT_ALLOWED";
      throw error;
    },
    sendTelegram: async ({ text }) => {
      telegramSent.push(text);
      return { ok: true };
    },
  });
  const res = await post(handle, interest());
  const body = await res.json();
  check("email failure falls back to Telegram", res.status === 200 && body.delivered.includes("telegram"));
  check("the Telegram message carries the applicant", telegramSent[0].includes("ada@example.com"));
}

{
  const { handle } = makeWorker({ notifyTo: "" });
  const res = await post(handle, interest());
  check("no delivery channel is a 503", res.status === 503);
}

{
  const { handle } = makeWorker({
    sendEmail: async () => {
      throw new Error("sender not verified");
    },
  });
  const res = await post(handle, interest());
  const body = await res.json();
  check("total delivery failure is a 502", res.status === 502);
  check("the failure points at the cohort inbox", body.error.includes("cohort@yablokolabs.com"));
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
