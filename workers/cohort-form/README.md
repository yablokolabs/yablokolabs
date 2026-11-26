# cohort-form — Yabloko Labs cohort interest endpoint

The `/cohort` page is part of a static Next.js export, so it has no server to
receive a form post. This Worker is that server: it accepts the interest form
(`multipart/form-data`), validates it, notifies the cohort inbox, and keeps a
backup copy in KV when a namespace is bound.

It deliberately does **not** accept a CV. The interest stage is for finding out
who is serious; a CV is requested later, from the people who are offered a seat.

Intended deployment: **https://cohort-form.yablokolabs.com** (custom domain,
Workers Free plan).

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Service info — deployment sanity check |
| POST | `/` | Register interest → `200 { ok, id, delivered }` |

POST accepts `multipart/form-data` with:

| Field | Required | Notes |
|---|---|---|
| `name` | yes | 2–120 characters |
| `email` | yes | Used as the email `Reply-To` |
| `country` | yes | 2–80 characters |
| `stage` | yes | `Final-year student`, `Recent graduate`, `Early-career developer`, or `Other` |
| `link` | no | GitHub, portfolio, or LinkedIn, up to 300 characters |
| `built` | yes | What they have built, 10–1200 characters |
| `hours` | yes | `Under 5 hours`, `5–10 hours`, `10–15 hours`, or `15+ hours` |
| `consent` | yes | Must be `yes` — explicit consent to be contacted |
| `hp_check` | — | Honeypot; any value means "drop this silently" |

Errors come back as `{ "error": "…" }` with a status the site can show:
`400` invalid fields, `403` origin not allowed, `429` more than 5 submissions
per IP per hour, `502` delivery failed, `503` worker not configured.

## Delivery

Two channels, tried in this order:

1. **Email** — Cloudflare Email Sending, with `Reply-To` set to the applicant.
   Free only when `COHORT_NOTIFY_TO` is a verified Email Routing destination
   address; sending to arbitrary recipients requires the Workers Paid plan.
2. **Telegram** — one `sendMessage` call to `TELEGRAM_CHAT_ID` through
   `TELEGRAM_BOT_TOKEN`. Works on the Free plan and needs no DNS changes.

The response reports which channel took it:
`{ "ok": true, "id": "…", "delivered": ["telegram"] }`.

## Setup

1. **Telegram fallback** — store the bot token and target chat as secrets (they
   are not in the repo):

   ```bash
   printf '%s' "<bot token>" | npx wrangler secret put TELEGRAM_BOT_TOKEN
   printf '%s' "<chat id>"  | npx wrangler secret put TELEGRAM_CHAT_ID
   ```

2. **Email (optional).** Set `COHORT_NOTIFY_TO` in `wrangler.toml` to a verified
   Email Routing destination address. On `yablokolabs.com` this can mean
   changing MX records, so either accept that or upgrade to Workers Paid, which
   allows sending to any inbox with no MX changes.

   ```toml
   [vars]
   COHORT_FROM = "cohort@yablokolabs.com"
   COHORT_NOTIFY_TO = ""   # empty = skip email, use Telegram only
   ```

3. **Optional backup copies.** To store submissions in KV (180-day expiry):

   ```bash
   npx wrangler kv namespace create SUBMISSIONS
   # paste the returned id into the commented [[kv_namespaces]] block
   ```

4. **Deploy:**

   ```bash
   npm install
   npm run deploy
   ```

5. **Point the site at it.** The `/cohort` page posts to
   `https://cohort-form.yablokolabs.com` by default. To use a different host,
   build the site with
   `NEXT_PUBLIC_COHORT_FORM_ENDPOINT=https://…` and add that origin to
   `ALLOWED_ORIGINS`.

6. **Verify:**

   ```bash
   curl -s https://cohort-form.yablokolabs.com/

   curl -s -X POST https://cohort-form.yablokolabs.com/ \
     -H 'Origin: https://yablokolabs.com' \
     -F name='Ada Lovelace' \
     -F email='ada@example.com' \
     -F country='United Kingdom' \
     -F stage='Final-year student' \
     -F link='https://github.com/ada' \
     -F built='A small task tracker in React with tests and a deployed demo.' \
     -F hours='10–15 hours' \
     -F consent='yes'
   ```

## Local development

```bash
npm install
npm run dev      # wrangler dev — http://127.0.0.1:8787
npm run dev:local  # plain Node endpoint on 127.0.0.1:8787, prints submissions
npm test         # node smoke test, no Cloudflare runtime needed
```

`dev:local` is the quickest way to try the real `/cohort` form end to end:

```bash
# terminal 1
cd workers/cohort-form && npm run dev:local

# terminal 2
cd next-app
NEXT_PUBLIC_COHORT_FORM_ENDPOINT=http://127.0.0.1:8787 npm run dev
```

Submissions are printed in terminal 1 instead of being emailed.

The smoke test stubs the email binding, the Telegram sender, and the KV store,
so it covers validation, consent, the honeypot, CORS, rate limiting, and
delivery fallbacks without sending anything.

## Notes / limits

- Rate limiting is best-effort: KV is eventually consistent, so a burst can
  still land a couple of extra submissions. The honeypot stops naive bots.
- Without a KV binding the rate limiter counts in memory per isolate, so it is
  only a coarse speed bump.
- With a KV binding, submissions and rate-limit counters expire after 180 days.
- Keep `cohort@yablokolabs.com` working: the site's fallback message tells
  applicants to email it when the form cannot deliver.
