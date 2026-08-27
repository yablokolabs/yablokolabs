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

## Canonical layout on the VM

| Piece | Location | Backed up? |
|---|---|---|
| This code | `~/yablokolabs/yablokolabs/polaris-restate/` (a subdirectory of the site repo clone) | no — cloned from GitHub at the manifest-pinned commit; `npm ci` rebuilds |
| Secrets `.env` | `polaris-restate/.env` (mode 600) | never — names only in manifests, values re-entered at restore |
| Restate journal + K/V state | `~/yablokolabs/restate-data/` | yes — nightly quiesced snapshot by [`bots_soul/backup-bots.sh`](../../bots_soul/backup-bots.sh) |
| User systemd units | `~/.config/systemd/user/{restate-server,polaris-restate}.service` | yes — ride `system-bits.tar.zst` |
| Polaris skill | `~/.hermes/profiles/polaris/skills/polaris-durable-tasks/` | yes — inside `polaris-profile.tar.zst` |

Hermes itself stays untouched: all model calls shell out to the same headless
`hermes chat -q` CLI with your existing provider fallback chain.

## Install on the Hermes box (fresh VM: use bots_soul instead)

**Migrations and fresh restores should run the scripted path — it also wires up
backups correctly:** `bots_soul/restore-polaris-restate.sh` +
`bots_soul/validate-polaris-restate.sh` (see `bots_soul/RESTORE.md §4d`).

Manual install of this directory only:

```bash
# Restate server + CLI binaries (pin versions per the backup manifest)
npm install --global @restatedev/restate-server@latest @restatedev/restate@latest

# This service
cd ~/yablokolabs/yablokolabs/polaris-restate
npm install && cp .env.example .env && chmod 600 .env   # then edit .env
npm run typecheck                                       # sanity
restate-server &                                        # journal → ~/yablokolabs/restate-data
npx tsx src/index.ts &                                  # handler :9080
restate deployments register http://localhost:9080
curl -s -X POST localhost:8080/ProspectLoop/yabloko/run/start --json '{"intervalHours":6}'
```

Boot persistence uses `deploy/*.service` as **user** units:

```bash
mkdir -p ~/.config/systemd/user
cp deploy/*.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now restate-server polaris-restate

# teach Polaris the chat controls (note the ISOLATED PROFILE path)
mkdir -p ~/.hermes/profiles/polaris/skills
cp -r skills/polaris-durable-tasks ~/.hermes/profiles/polaris/skills/
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

Runbook, failure modes, and migration: [`bots_soul/polaris-hermes/POLARIS_RESTATE.md`](../../bots_soul/polaris-hermes/POLARIS_RESTATE.md).

## Sources used today

- **Hacker News (Algolia)** — keyless, real announcements/discussions.
- **SearXNG** (optional) — your self-hosted meta-search with `format=json`;
  see `.env.example`. Add more ICP-specific queries in `src/sources.ts`.

Both are read-only public-web research. Nothing sends without explicit human
approval.
