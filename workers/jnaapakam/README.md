# jnaapakam persona API (Cloudflare Worker)

An agent-first persona service for the [jnaapakam](https://github.com/yablokolabs/jnaapakam)
memory protocol. Any AI agent can mint a persona with one POST and download the
identity set jnaapakam expects — `SOUL.md`, `IDENTITY.md`, `MEMORY.md` — plus a
portable `jnaapakam.yml` manifest. The templates mirror jnaapakam 0.5.1's
`jnaapakam init`, so a downloaded set is byte-compatible with
`jnaapakam seal` (signing a continuity record).

Deployed target: **https://jnaapakam.yablokolabs.com**

## API

| Method | Path | Purpose |
|---|---|---|
| GET  | `/` | Service info (agent- and human-readable JSON) |
| GET  | `/v1/schema` | JSON Schema of the POST body — agents self-discover the format |
| POST | `/v1/personas` | Mint a persona → `201` with inline files + download URLs |
| GET  | `/v1/personas/<id>` | Persona metadata |
| GET  | `/v1/personas/<id>.zip` | `SOUL.md` + `IDENTITY.md` + `MEMORY.md` + `jnaapakam.yml` |
| GET  | `/v1/personas/<id>/SOUL.md` | Single identity file (also `IDENTITY.md`, `MEMORY.md`, `jnaapakam.yml`) |

Personas are **content-addressed**: `id` is the sha256 of the canonical JSON, so
identical personas share a URL and re-POSTing is idempotent. No LLM, no state
beyond the stored manifest — generation is deterministic template filling.

### Example

```bash
curl -s -X POST https://jnaapakam.yablokolabs.com/v1/personas \
  -H 'Content-Type: application/json' -d '{
    "name": "Buffy",
    "emoji": "🦇",
    "description": "A coding agent that ships small diffs.",
    "personality": "Concise and direct; code first, prose after.",
    "boundaries": ["Never git push without asking", "Never invent test results"],
    "preferences": {"style": "short answers", "tone": "dry wit"},
    "memory": {
      "user": "Works on yablokolabs open-source projects.",
      "lessons_learned": ["Check repo conventions before editing."]
    }
  }'
```

Response (abridged): `{ "id": "<sha256>", "files": { "SOUL.md": "…", ... },
"urls": { … }, "zip_url": "…/v1/personas/<id>.zip" }`

To adopt the persona:

```bash
mkdir -p persona && cd persona
curl -O https://jnaapakam.yablokolabs.com/v1/personas/<id>/SOUL.md
curl -O https://jnaapakam.yablokolabs.com/v1/personas/<id>/IDENTITY.md
curl -O https://jnaapakam.yablokolabs.com/v1/personas/<id>/MEMORY.md
pip install "jnaapakam[signing]"   # optional: sign the persona
jnaapakam seal --soul-dir .        # seals SOUL.md + IDENTITY.md + MEMORY.md
```

## Local development

```bash
cd workers/jnaapakam
npm install
npm test        # node smoke test (no Cloudflare runtime needed)
npm run dev     # wrangler dev — serves http://127.0.0.1:8787
```

Without a KV binding the worker falls back to an in-memory store (fine for dev;
personas vanish on restart).

## Deploy

```bash
cd workers/jnaapakam
npx wrangler login                     # one-time auth
npx wrangler kv namespace create PERSONAS   # then paste id/preview_id into wrangler.toml
npm run deploy                         # first deploy to <account>.workers.dev
```

To attach **jnaapakam.yablokolabs.com**: uncomment the `[[routes]]` block in
`wrangler.toml` (`pattern = "jnaapakam.yablokolabs.com"`, `custom_domain = true`)
and redeploy. Cloudflare creates the DNS record and TLS certificate — no manual
DNS edits, since `yablokolabs.com` already runs on Cloudflare. (Custom domains
may require the Workers Paid plan; the deploy error will say so.)

## Notes / limits

- Open endpoint by design (agents mint personas freely). Add rate limiting or a
  shared-secret header if abuse becomes an issue.
- Section bodies accept strings, arrays (→ bullets), or small objects
  (→ `key: value` lines). `memory.lessons_learned` / `memory.lessonsLearned`
  alias to `lessons`.
- `get_agent_identity`, `list_generations`, `diff_generations` etc. remain the
  jnaapakam *server's* tools; this service only mints downloadable personas.
