// Local smoke test for the persona API. Runs the worker handler in plain Node
// (no Cloudflare runtime needed) against an in-memory store.
//
//   npm test            (from workers/jnaapakam)

import { createHandler } from "../src/index.js";

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

const BASE = "https://jnaapakam.yablokolabs.com";
const handle = createHandler(new MemoryStore());

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

// ---- root + schema -------------------------------------------------------
const root = await call("/");
check("GET / returns 200 + service info", root.status === 200 && (await root.json()).name === "jnaapakam");

const schemaRes = await call("/v1/schema");
const schema = schemaRes.status === 200 ? await schemaRes.json() : null;
check("GET /v1/schema returns 200", schemaRes.status === 200);
check("schema requires name", schema?.required?.includes("name") === true);

// ---- create --------------------------------------------------------------
const created = await call("/v1/personas", { method: "POST", body: PERSONA });
const createdBody = created.status === 201 ? await created.json() : null;
check("POST /v1/personas returns 201", created.status === 201);
check("id is a 64-char hex sha256", /^[a-f0-9]{64}$/.test(createdBody?.id ?? ""));
const id = createdBody?.id;
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

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
