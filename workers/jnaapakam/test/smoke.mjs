// Local smoke test for the persona API. Runs the worker handler in plain Node
// (no Cloudflare runtime needed) against an in-memory store.
//
//   npm test            (from workers/jnaapakam)

import { createHandler } from "../src/index.js";
import { classifyUa } from "../src/analytics.js";

class MemoryStore {
  constructor() {
    this.map = new Map();
  }
  async get(k) {
    return this.map.get(k) ?? null;
  }
  async put(k, v) {
    this.map.set(k, v);
  }
}

// In-memory stand-in for the D1-backed StatsService.
class FakeAnalytics {
  constructor() {
    this.events = [];
  }
  async record(event) {
    this.events.push(event);
  }
  async stats() {
    const created = this.events.filter((e) => e.action === "persona_created").length;
    const downloads = this.events.filter((e) => ["file_download", "zip_download"].includes(e.action)).length;
    return {
      enabled: true,
      totals: { events: this.events.length, personas_minted: created, downloads },
      unique_visitors: { last_24h: 1, last_7d: 1 },
      ua_breakdown: { tool: 1 },
      by_day: [],
      top_personas: [],
    };
  }
}

const BASE = "https://jnaapakam.yablokolabs.com";
const analytics = new FakeAnalytics();
const handle = createHandler(new MemoryStore(), analytics);

let passed = 0;
let failed = 0;
function check(label, cond) {
  if (cond) {
    passed += 1;
    console.log(`  ok  ${label}`);
  } else {
    failed += 1;
    console.error(`FAIL  ${label}`);
  }
}

const PERSONA = {
  name: "Buffy",
  emoji: "🦇",
  description: "A coding agent that ships small diffs.",
  personality: "Concise and direct; code first, prose after.",
  boundaries: ["Never git push without asking", "Never invent test results"],
  preferences: { style: "short answers", tone: "dry wit" },
  memory: {
    user: "Works on yablokolabs open-source projects.",
    lessons_learned: ["Check repo conventions before editing."],
  },
};

async function call(path, { method = "GET", body } = {}) {
  return handle(
    new Request(`${BASE}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    }),
  );
}

// ---- analytics helpers -----------------------------------------------------
check("classifyUa: agent UA", classifyUa("MoltbookAgent/1.0 (Claude-assisted; +https://moltbook.com)") === "agent");
check("classifyUa: curl UA", classifyUa("curl/8.14.1") === "tool");
check("classifyUa: browser UA", classifyUa("Mozilla/5.0 (X11; Linux) Chrome/140.0") === "browser");
check("classifyUa: empty UA", classifyUa(null) === "unknown");

// ---- root + schema -------------------------------------------------------
const root = await call("/");
check("GET / returns 200 + service info", root.status === 200 && (await root.json()).name === "jnaapakam");
check("GET / recorded info_view", analytics.events.some((e) => e.action === "info_view"));

const schemaRes = await call("/v1/schema");
const schema = schemaRes.status === 200 ? await schemaRes.json() : null;
check("GET /v1/schema returns 200", schemaRes.status === 200);
check("schema requires name", schema?.required?.includes("name") === true);
check("GET /v1/schema recorded schema_view", analytics.events.some((e) => e.action === "schema_view"));

// ---- create --------------------------------------------------------------
const created = await call("/v1/personas", { method: "POST", body: PERSONA });
const createdBody = created.status === 201 ? await created.json() : null;
check("POST /v1/personas returns 201", created.status === 201);
check("id is a 64-char hex sha256", /^[a-f0-9]{64}$/.test(createdBody?.id ?? ""));
const id = createdBody?.id;
check("POST recorded persona_created with id", analytics.events.some((e) => e.action === "persona_created" && e.personaId === id));
check("response includes inline SOUL.md", typeof createdBody?.files?.["SOUL.md"] === "string");
check("response includes jnaapakam.yml", typeof createdBody?.files?.["jnaapakam.yml"] === "string");
check("SOUL.md contains the name context", createdBody?.files?.["IDENTITY.md"]?.includes("**Name:** Buffy"));

// idempotent re-POST -> same id
const again = await call("/v1/personas", { method: "POST", body: PERSONA });
const againBody = again.status === 201 ? await again.json() : null;
check("re-POST is idempotent (same id)", againBody?.id === id);

// ---- downloads -------------------------------------------------------------
const soul = await call(`/v1/personas/${id}/SOUL.md`);
const soulText = soul.status === 200 ? await soul.text() : "";
check("GET SOUL.md returns 200", soul.status === 200);
check("SOUL.md filled personality", soulText.includes("Concise and direct"));
check("SOUL.md filled boundaries as bullets", soulText.includes("- Never git push without asking"));

const identity = await call(`/v1/personas/${id}/IDENTITY.md`);
const identityText = identity.status === 200 ? await identity.text() : "";
check("IDENTITY.md has name + emoji", identityText.includes("Buffy") && identityText.includes("🦇"));

const memory = await call(`/v1/personas/${id}/MEMORY.md`);
const memoryText = memory.status === 200 ? await memory.text() : "";
check("MEMORY.md has user context", memoryText.includes("yablokolabs open-source"));
check("MEMORY.md has lessons (lessons_learned alias)", memoryText.includes("repo conventions"));

const yml = await call(`/v1/personas/${id}/jnaapakam.yml`);
const ymlText = yml.status === 200 ? await yml.text() : "";
check("jnaapakam.yml has name", ymlText.includes("name: \"Buffy\""));
check("jnaapakam.yml lists boundaries", ymlText.includes("boundaries"));

const zip = await call(`/v1/personas/${id}.zip`);
const zipBuf = zip.status === 200 ? new Uint8Array(await zip.arrayBuffer()) : new Uint8Array();
check("GET zip returns 200 + application/zip", zip.status === 200 && zip.headers.get("Content-Type") === "application/zip");
check("zip has a plausible size", zipBuf.length > 200 && zipBuf[0] === 0x50); // "PK"

const meta = await call(`/v1/personas/${id}`);
check("GET /v1/personas/<id> metadata 200", meta.status === 200 && (await meta.json()).id === id);
check("downloads recorded file/zip events", analytics.events.filter((e) => e.action === "file_download" || e.action === "zip_download").length >= 2);

// ---- stats ------------------------------------------------------------------
const statsRes = await call("/v1/stats");
const stats = statsRes.status === 200 ? await statsRes.json() : null;
check("GET /v1/stats returns 200 + enabled", statsRes.status === 200 && stats?.enabled === true);
check("stats count personas_minted >= 1", (stats?.totals?.personas_minted ?? 0) >= 1);
check("stats count downloads >= 2", (stats?.totals?.downloads ?? 0) >= 2);
check("stats include ua_breakdown", stats?.ua_breakdown && typeof stats.ua_breakdown === "object");

// ---- errors --------------------------------------------------------------
const noName = await call("/v1/personas", { method: "POST", body: { personality: "x" } });
check("POST without name -> 400", noName.status === 400);

const badJson = await handle(new Request(`${BASE}/v1/personas`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{not json",
}));
check("POST malformed JSON -> 400", badJson.status === 400);

const missing = await call(`/v1/personas/${"0".repeat(64)}/SOUL.md`);
check("unknown persona -> 404", missing.status === 404);

const unknownFile = await call(`/v1/personas/${id}/SECRETS.md`);
check("unknown file -> 404", unknownFile.status === 404);

const nope = await call("/v1/nope");
check("unknown route -> 404", nope.status === 404);

const options = await handle(new Request(`${BASE}/v1/personas`, { method: "OPTIONS" }));
check("OPTIONS preflight -> 204 + CORS", options.status === 204 && options.headers.get("Access-Control-Allow-Origin") === "*");

// handler without analytics still serves stats as disabled
const noAnalytics = createHandler(new MemoryStore());
const statsOff = await noAnalytics(new Request(`${BASE}/v1/stats`));
check("stats without analytics -> 200 {enabled:false}", statsOff.status === 200 && (await statsOff.json()).enabled === false);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
