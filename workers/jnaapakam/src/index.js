// jnaapakam persona API — Cloudflare Worker
//
// Lets any AI agent mint a persona: POST structured JSON, get back
// SOUL.md / IDENTITY.md / MEMORY.md (the identity set `jnaapakam seal` reads)
// plus a jnaapakam.yml manifest, inline and as stable download URLs.
//
// Endpoints:
//   GET  /                       service info (agent- and human-readable)
//   GET  /v1/schema              JSON Schema of the POST body (self-discovery)
//   POST /v1/personas            create a persona -> 201 { id, files, urls, zip_url }
//   GET  /v1/personas/<id>       persona metadata (id + URLs)
//   GET  /v1/personas/<id>.zip   SOUL.md + IDENTITY.md + MEMORY.md + jnaapakam.yml
//   GET  /v1/personas/<id>/SOUL.md | IDENTITY.md | MEMORY.md | jnaapakam.yml
//
// Personas are content-addressed: the id is the sha256 of the canonical JSON,
// so identical personas always share a URL and re-POSTing is idempotent.

import { zipSync, strToU8 } from "fflate";
import {
  SOUL_FILES,
  renderSoul,
  renderIdentity,
  renderMemory,
  renderYaml,
} from "./templates.js";
import { ApiError, PERSONA_SCHEMA, validateAndNormalize } from "./schema.js";
import { ACTION, StatsService } from "./analytics.js";

const SERVICE = {
  name: "jnaapakam",
  service: "jnaapakam persona API",
  description:
    "An open protocol for AI agent memory persistence — mint a persona and download its identity set.",
  version: "0.1.0",
  endpoints: {
    schema: "/v1/schema",
    create: "POST /v1/personas",
    download: "GET /v1/personas/<id>.zip",
    stats: "/v1/stats",
  },
  example:
    "curl -s -X POST https://jnaapakam.yablokolabs.com/v1/personas " +
    "-H 'Content-Type: application/json' -d '{\"name\":\"Buffy\",\"personality\":\"concise\"}'",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}

function text(body, status = 200, type = "text/plain; charset=utf-8") {
  return new Response(body, {
    status,
    headers: { ...CORS, "Content-Type": type },
  });
}

// In-memory store used for local dev / tests when no KV binding is present.
// Production binds env.PERSONAS (Cloudflare KV); see wrangler.toml.
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

async function sha256Hex(str) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function canonicalPersonaJson(p) {
  // Personas are already in canonical key order after validateAndNormalize,
  // so a plain stringify is deterministic.
  return JSON.stringify(p);
}

function renderAll(p) {
  return {
    "SOUL.md": renderSoul(p),
    "IDENTITY.md": renderIdentity(p),
    "MEMORY.md": renderMemory(p),
    "jnaapakam.yml": renderYaml(p),
  };
}

function baseUrls(request) {
  return new URL(request.url).origin;
}

function makeUrls(origin, id) {
  return {
    "SOUL.md": `${origin}/v1/personas/${id}/SOUL.md`,
    "IDENTITY.md": `${origin}/v1/personas/${id}/IDENTITY.md`,
    "MEMORY.md": `${origin}/v1/personas/${id}/MEMORY.md`,
    "jnaapakam.yml": `${origin}/v1/personas/${id}/jnaapakam.yml`,
    zip: `${origin}/v1/personas/${id}.zip`,
  };
}

const FILE_TYPES = {
  "SOUL.md": "text/markdown; charset=utf-8",
  "IDENTITY.md": "text/markdown; charset=utf-8",
  "MEMORY.md": "text/markdown; charset=utf-8",
  "jnaapakam.yml": "application/yaml; charset=utf-8",
};

// store: { get(key) -> Promise<string|null>, put(key, value) -> Promise<void> }
// analytics: StatsService (D1-backed) or undefined — recording never blocks/fails requests.
export function createHandler(store, analytics) {
  return async function handle(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Best-effort analytics: failures are swallowed inside record().
    const track = (action, extra = {}) => {
      if (!analytics) return Promise.resolve();
      return analytics.record({
        action,
        path,
        ua: request.headers.get("User-Agent"),
        ip: request.headers.get("CF-Connecting-IP"),
        ...extra,
      });
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    try {
      // ---- service info ---------------------------------------------------
      if (request.method === "GET" && path === "/") {
        await track(ACTION.INFO_VIEW);
        return json(SERVICE);
      }

      // ---- schema ----------------------------------------------------------
      if (request.method === "GET" && path === "/v1/schema") {
        await track(ACTION.SCHEMA_VIEW);
        return json(PERSONA_SCHEMA);
      }

      // ---- stats -----------------------------------------------------------
      if (request.method === "GET" && path === "/v1/stats") {
        await track(ACTION.STATS_VIEW);
        return json(analytics ? await analytics.stats() : { enabled: false });
      }

      // ---- create -----------------------------------------------------------
      if (request.method === "POST" && path === "/v1/personas") {
        let input;
        try {
          input = await request.json();
        } catch {
          throw new ApiError(400, "body must be valid JSON");
        }
        const persona = validateAndNormalize(input);
        const raw = canonicalPersonaJson(persona);
        const id = await sha256Hex(raw);
        await store.put(id, raw);
        await track(ACTION.PERSONA_CREATED, { personaId: id });
        const files = renderAll(persona);
        const urls = makeUrls(baseUrls(request), id);
        return json(
          {
            id,
            created: persona.created,
            message:
              "Persona minted. Download the identity set, or read the files inline below.",
            persona,
            files,
            urls,
            zip_url: urls.zip,
            seal_hint:
              "Run `jnaapakam seal --soul-dir <dir>` (jnaapakam[signing]) on the " +
              "downloaded SOUL.md/IDENTITY.md/MEMORY.md to sign this persona into a continuity record.",
          },
          201,
        );
      }

      // ---- persona metadata ---------------------------------------------------
      const metaMatch = path.match(/^\/v1\/personas\/([a-f0-9]{64})$/);
      if (request.method === "GET" && metaMatch) {
        const raw = await store.get(metaMatch[1]);
        if (!raw) throw new ApiError(404, "persona not found");
        await track(ACTION.META_VIEW, { personaId: metaMatch[1] });
        const persona = JSON.parse(raw);
        const urls = makeUrls(baseUrls(request), metaMatch[1]);
        return json({
          id: metaMatch[1],
          created: persona.created,
          persona,
          files: Object.keys(renderAll(persona)),
          urls,
          zip_url: urls.zip,
        });
      }

      // ---- zip download -----------------------------------------------------
      const zipMatch = path.match(/^\/v1\/personas\/([a-f0-9]{64})\.zip$/);
      if (request.method === "GET" && zipMatch) {
        const raw = await store.get(zipMatch[1]);
        if (!raw) throw new ApiError(404, "persona not found");
        await track(ACTION.ZIP_DOWNLOAD, { personaId: zipMatch[1] });
        const files = renderAll(JSON.parse(raw));
        const zip = zipSync(
          Object.fromEntries(
            Object.entries(files).map(([name, content]) => [name, strToU8(content)]),
          ),
          { level: 6 },
        );
        return new Response(zip, {
          status: 200,
          headers: {
            ...CORS,
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="jnaapakam-persona-${zipMatch[1].slice(0, 12)}.zip"`,
          },
        });
      }

      // ---- single file -----------------------------------------------------
      const fileMatch = path.match(/^\/v1\/personas\/([a-f0-9]{64})\/([^/]+)$/);
      if (request.method === "GET" && fileMatch) {
        const [, id, filename] = fileMatch;
        if (!FILE_TYPES[filename]) throw new ApiError(404, "unknown file");
        const raw = await store.get(id);
        if (!raw) throw new ApiError(404, "persona not found");
        await track(ACTION.FILE_DOWNLOAD, { personaId: id });
        const files = renderAll(JSON.parse(raw));
        return text(files[filename], 200, FILE_TYPES[filename]);
      }

      // ---- everything else ---------------------------------------------------
      return json(
        { error: "not found", hint: "GET / for available endpoints" },
        404,
      );
    } catch (err) {
      if (err instanceof ApiError) {
        return json({ error: err.message }, err.status);
      }
      return json({ error: "internal error" }, 500);
    }
  };
}

// Module-scoped dev store: persists across requests within the isolate so that
// `wrangler dev` (no KV binding) behaves like the real thing. Production binds
// env.PERSONAS (Cloudflare KV); see wrangler.toml.
const devStore = new MemoryStore();

// Default export consumed by the Workers runtime.
export default {
  async fetch(request, env) {
    const store =
      env && env.PERSONAS && typeof env.PERSONAS.get === "function"
        ? {
            get: (k) => env.PERSONAS.get(k),
            put: (k, v) => env.PERSONAS.put(k, v),
          }
        : devStore;
    const analytics = env && env.ANALYTICS ? new StatsService(env.ANALYTICS) : null;
    return createHandler(store, analytics)(request);
  },
};

export { SOUL_FILES };
