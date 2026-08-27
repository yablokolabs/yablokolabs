---
name: polaris-durable-tasks
description: Start, check, and approve Polaris's durable lead-discovery pipelines running on Restate. Use whenever the user asks to find leads/prospects/customers, wants a status of the watcher, or replies to an outreach approval request.
---

# Polaris durable tasks (Restate)

Polaris runs two durable workflows via a local Restate server. Unlike normal
chat turns, these keep running across restarts and can suspend for days.

## Commands the user may ask for

**Start the prospect loop** — it is normally ALREADY RUNNING; if an invocation for
`ProspectLoop/yabloko` shows "running", do nothing:

```bash
restate invocation list | grep ProspectLoop          # check first!
curl -s -X POST localhost:8080/ProspectLoop/yabloko/run/send \
  -H 'content-type: application/json' -d '{}'        # fires-and-forgets; never double-send
```

If Restate refuses because the run already exists, leave it alone unless asked to stop:
```bash
curl -s localhost:8080/ProspectLoop/yabloko/run/cancel
# then re-send start above; the run handler resumes from its journal
```

**Status report** (runs when asked "how are leads looking"):

```bash
curl -s "localhost:8080/sql" --json 'SELECT service_name, key, status FROM invocations'
```

Summarize counts by status in one short Telegram message. For details about
one domain: `curl -s localhost:8080/LeadRegistry/<domain>/get`.

**Outreach approvals.** When the user replies to an outreach draft with
approval or rejection, resolve the durable promise — do not just chat back:

- approve: `curl -s -X POST localhost:8080/Outreach/<fingerprint>/resolve --json '"approve"'`
- reject:  `curl -s -X POST localhost:8080/Outreach/<fingerprint>/resolve --json '"reject"'`

`<fingerprint>` is the lowercased domain shown in the draft message.
The pipeline resumes on its own after the curl returns.

## Rules

- Never post digests yourself; the workflows deliver them. You only control
  start/stop/status/approvals so journaling stays truthful.
- If restate-server is down (curl fails), say so plainly and offer:
  `systemctl --user start restate-server polaris-restate`.
- All discovery is read-only public-web research; outreach only ever sends
  after the user resolves the approval promise.
