# polaris-restate

Durable task backend for **Polaris** (your personal Hermes assistant on
Telegram). It wraps the agent loops that should outlive a chat turn in
[Restate](https://restate.dev) durable execution — the production companion to
the blog post [Durable Agent Tasks: Making Hermes More Powerful with Restate](https://yablokolabs.com/blog/hermes-restate-durable-tasks).

Currently implemented: **automated lead discovery** for Yabloko Labs.

```
ProspectLoop (every 6h, durable)                 Outreach (human-in-the-loop)
┌──────────────────────────────────────┐         ┌─────────────────────────────────┐
│ discover (SearXNG + HN adapters)     │         │ Hermes drafts personalized mail │
│   ↓ ctx.run                          │         │   ↓ ctx.run                     │
│ Hermes scores each candidate vs ICP  │  lead   │ ctx.promise("approval") suspend │
│   ↓ ctx.run                          │ ──────▶ │   ↑ you reply /approve in chat  │
│ LeadRegistry dedup + persist (VObj)  │         │ resolve over HTTP → send or drop│
│   ↓ ctx.run                          │         └─────────────────────────────────┘
│ Telegram digest per new prospect     │
└──────────────────────────────────────┘
```

Every `ctx.run` step is journaled: reboot the box mid-cycle and Restate replays
completed steps and resumes the rest. Every `ctx.sleep` and promise-wait is
durable: suspending costs nothing, whether it is six hours or six days.

## What runs where

| Piece | Service | Kind | Purpose |
|-------|---------|------|---------|
| `src/prospect-loop.ts` | `ProspectLoop` | workflow | Scheduled discovery → score → dedup → digest |
| `src/lead-registry.ts` | `LeadRegistry` | virtual object | Per-domain memory: dedup, status, drafts |
| `src/outreach.ts` | `Outreach` | workflow | Draft outreach, suspend for approval, resume |

Hermes itself stays untouched: all model calls shell out to the same
`hermes chat -q` CLI with your existing provider fallback chain.

## Install on the Hermes box

```bash
# 1. Restate server + CLI (single binaries)
sudo curl -fsSL https://restate.gateway.scarf.sh/latest/restate-server-x86_64-unknown-linux-musl.tar.xz \
  | tar -xJ --strip-components=1 -C /usr/local/bin restate-server-x86_64-unknown-linux-musl/restate-server
sudo curl -fsSL https://restate.gateway.scarf.sh/latest/restate-cli-x86_64-unknown-linux-musl.tar.xz \
  | tar -xJ --strip-components=1 -C /usr/local/bin restate-cli-x86_64-unknown-linux-musl/restate

# 2. This service
cd ~/polaris-restate && npm install && cp .env.example .env  # then edit .env
npm run typecheck                                            # sanity
npm start &                                                  # serves :9080

# 3. Register and launch
restate deployments register localhost:9080
curl -s -X POST localhost:8080/ProspectLoop/yabloko/run/start --json '{"intervalHours":6}'
```

For boot persistence use the units in `deploy/` (adjust `YOURUSER`), plus:

```bash
mkdir -p ~/.hermes/skills/polaris-durable-tasks
cp skills/polaris-durable-tasks/SKILL.md ~/.hermes/skills/polaris-durable-tasks/
```

That skill teaches Polaris to start/stop/status the pipelines and — most
importantly — how to resolve approval promises when you answer an outreach
draft in Telegram.

## Daily flow

1. Polaris messages you every time a new qualified prospect clears score ≥ 65.
2. Reply "draft outreach for <domain>" and Polaris starts an `Outreach` run.
3. When the draft arrives, answer "approve"/"reject" — Polaris resolves the
   workflow promise; sending then happens exactly once.
4. Watch everything in the Restate UI at `http://localhost:9070`: each
   journal step, retry, wait, and Telegram call is traced.

## Sources used today

- **Hacker News (Algolia)** — keyless, real announcements/discussions.
- **SearXNG** (optional) — your self-hosted meta-search with `format=json`;
  see `.env.example`. Add more ICP-specific queries in `src/sources.ts`.

Both are read-only public-web research. Nothing sends without explicit human
approval.
