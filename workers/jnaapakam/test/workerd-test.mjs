// Workerd-runtime test: drives the worker bundle through Miniflare (the same
// engine wrangler dev / Cloudflare edge use), so we exercise real module
// loading, the module-scoped store, and byte-level zip output.
//
// Requires a fresh bundle:
//   node_modules/.bin/wrangler deploy --dry-run --outdir /tmp/bundle-check
//   node test/workerd-test.mjs
//
// (npm test runs the lighter in-process smoke test; this one is for pre-deploy
// confidence that the bundle behaves under workerd.)

import { Miniflare } from "miniflare";

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const BUNDLE_DIR = join(here, "..", ".workerd-bundle");

const BASE = "http://jnaapakam.local";
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

const mf = new Miniflare({
  modules: true,
  rootPath: BUNDLE_DIR,
  scriptPath: "index.js",
  compatibilityDate: "2026-08-01",
  modulesRules: [{ type: "ESModule", include: ["**/*.js"] }],
});

try {
  const root = await mf.dispatchFetch(`${BASE}/`);
  check("GET / under workerd", root.status === 200 && (await root.json()).name === "jnaapakam");

  // Create on one request...
  const create = await mf.dispatchFetch(`${BASE}/v1/personas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "WorkerdBuffy",
      emoji: "👾",
      description: "Born inside a workerd isolate.",
      boundaries: ["never deploy on friday", "never lie about tests"],
      memory: { user: "Miniflare test harness.", lessons: ["bundle first, ask later"] },
    }),
  });
  const body = create.status === 201 ? await create.json() : null;
  check("POST returns 201 under workerd", create.status === 201);
  const id = body?.id;
  check("id is sha256 hex", /^[a-f0-9]{64}$/.test(id ?? ""));

  // ...then fetch back on SEPARATE requests (module-scoped store must persist).
  const soul = await mf.dispatchFetch(`${BASE}/v1/personas/${id}/SOUL.md`);
  const soulText = soul.status === 200 ? await soul.text() : "";
  check(
    "GET SOUL.md on separate request (store persisted)",
    soul.status === 200 &&
      soulText.includes("Core Personality") &&
      soulText.includes("- never deploy on friday") && // boundaries became bullets
      soulText.includes("## Boundaries"),
  );

  const identity = await mf.dispatchFetch(`${BASE}/v1/personas/${id}/IDENTITY.md`);
  const identityText = identity.status === 200 ? await identity.text() : "";
  check(
    "IDENTITY.md survives separate request",
    identity.status === 200 &&
      identityText.includes("**Name:** WorkerdBuffy") &&
      identityText.includes("Born inside a workerd isolate."),
  );

  const zip = await mf.dispatchFetch(`${BASE}/v1/personas/${id}.zip`);
  const zipBuf = zip.status === 200 ? new Uint8Array(await zip.arrayBuffer()) : new Uint8Array();
  check("zip downloads under workerd", zip.status === 200 && zip.headers.get("Content-Type") === "application/zip");
  check("zip starts with PK magic", zipBuf[0] === 0x50 && zipBuf[1] === 0x4b && zipBuf.length > 200);
  const { writeFileSync } = await import("node:fs");
  writeFileSync("/tmp/workerd.zip", zipBuf);
  console.log("  .. zip written to /tmp/workerd.zip for external validation");

  const schema = await mf.dispatchFetch(`${BASE}/v1/schema`);
  check("schema served under workerd", schema.status === 200);

  const missing = await mf.dispatchFetch(`${BASE}/v1/personas/${"a".repeat(64)}/SOUL.md`);
  check("unknown persona 404 under workerd", missing.status === 404);
} finally {
  await mf.dispose();
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
