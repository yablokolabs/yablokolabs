# careers-form — Yabloko Labs careers application endpoint

The careers page is a static Next.js export, so it has no server to receive a
form post. This Worker is that server: it accepts the application form
(`multipart/form-data`), validates it, emails the hiring inbox with the CV
attached, and keeps a backup copy in KV when a namespace is bound.

Deployed at **https://careers-form.yablokolabs.com** (custom domain, Workers
Free plan).

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Service info — deployment sanity check |
| POST | `/` | Submit an application → `200 { ok, id }` |

POST accepts `multipart/form-data` with:

| Field | Required | Notes |
|---|---|---|
| `name` | yes | 2–120 characters |
| `email` | yes | Used as the email `Reply-To` |
| `contact` | yes | 5–40 characters (phone or similar) |
| `role` | no | Defaults to `Not specified` |
| `cv` | yes | PDF, DOC or DOCX, max 5 MB |
| `company_website` | — | Honeypot; any value means "drop this silently" |

Errors come back as `{ "error": "…" }` with a status the site can show:
`400` invalid fields, `413` CV too large, `415` wrong file type/content type,
`429` more than 5 applications per IP per hour, `403` origin not allowed,
`502` email delivery failed, `503` worker not configured.

## Delivery

Two channels, tried in this order:

1. **Email** — Cloudflare Email Sending with the CV attached, `Reply-To` set to
   the applicant. Free only when `CAREERS_NOTIFY_TO` is a **verified Email
   Routing destination address**; sending to arbitrary recipients requires the
   Workers Paid plan. Until then Cloudflare answers
   `E_RECIPIENT_NOT_ALLOWED` and the worker moves on to the next channel.
2. **Telegram** — one `sendDocument` call to `TELEGRAM_CHAT_ID` through
   `TELEGRAM_BOT_TOKEN`, with the applicant's name, email, contact, role and the
   CV file. Works today on the Free plan and needs no DNS changes, which
   matters here: `yablokolabs.com` receives mail through AWS SES and
   atomicmail, and enabling Email Routing would replace those MX records.

The response reports which channel took it: `{ "ok": true, "id": "…", "delivered": ["telegram"] }`.
A working email destination suppresses the Telegram duplicate. If every channel
fails the applicant gets a `502` telling them to email
`career@yablokolabs.com`, and the site shows that message.

## Setup

Already done for this deployment (custom domain, secrets, Free plan). Steps
below are for rebuilding it or moving it to another account.

1. **Telegram fallback** — store the bot token and target chat as secrets (they
   are not in the repo):

   ```bash
   printf '%s' "<bot token>" | npx wrangler secret put TELEGRAM_BOT_TOKEN
   printf '%s' "<chat id>"  | npx wrangler secret put TELEGRAM_CHAT_ID
   ```

   The bot must be able to message that chat (a DM to a user who has started
   the bot works).
2. **Email (optional).** Set `CAREERS_NOTIFY_TO` in `wrangler.toml` to a
   verified Email Routing destination address. That requires Email Routing on a
   zone in the account; on `yablokolabs.com` it would replace the SES MX
   records, so either accept that (and recreate the forwarding rules) or
   upgrade to Workers Paid, which allows sending to any inbox with no MX
   changes.

   ```toml
   [vars]
   CAREERS_FROM = "careers@yablokolabs.com"
   CAREERS_NOTIFY_TO = ""   # empty = skip email, use Telegram only
   ```

   `CAREERS_FROM` must be an address on a domain on this Cloudflare account.
3. **Optional backup copies.** To also store applications in KV (180-day
   expiry, keeps the CV so nothing is lost if delivery fails), which needs a
   token with Workers KV edit permission:

   ```bash
   npx wrangler kv namespace create SUBMISSIONS
   # paste the returned id into the commented [[kv_namespaces]] block
   ```

4. **Deploy:**

   ```bash
   npm install
   npm run deploy
   ```

   The first deploy serves the worker at
   `https://careers-form.<account>.workers.dev`.

5. **Point the site at it.** The careers page posts to
   `https://careers-form.yablokolabs.com` by default; the `[[routes]]` block in
   `wrangler.toml` owns that hostname (`custom_domain = true`). To use a
   different host, build the site with
   `NEXT_PUBLIC_CAREERS_FORM_ENDPOINT=https://…` and add that origin to
   `ALLOWED_ORIGINS`.

6. **Verify:**

   ```bash
   curl -s https://careers-form.yablokolabs.com/

   curl -s -X POST https://careers-form.yablokolabs.com/ \
     -H 'Origin: https://yablokolabs.com' \
     -F name='Ada Lovelace' \
     -F email='ada@example.com' \
     -F contact='+44 7700 900123' \
     -F role='Sales Shark' \
     -F cv=@ada-lovelace.pdf
   ```

## Local development

```bash
npm install
npm run dev      # wrangler dev — http://127.0.0.1:8787
npm test         # node smoke test, no Cloudflare runtime needed
```

The smoke test stubs the email binding and KV store, so it covers validation,
the honeypot, CORS, rate limiting, attachment encoding and failure paths
without sending mail. In `wrangler dev` the real `EMAIL` binding needs network
access to Cloudflare (`wrangler dev --remote`), so use the smoke test for
checks that do not need real delivery.

## Notes / limits

- Rate limiting is best-effort: KV is eventually consistent, so a burst can
  still land a couple of extra applications. Add Cloudflare Turnstile to the
  form if spam ever gets through; the honeypot stops naive bots.
- CVs are capped at 5 MB: below Cloudflare's 25 MiB message limit once base64
  encoding is counted, and well under Telegram's 50 MB document limit.
- Without a KV binding the rate limiter counts in memory per isolate, so it is
  only a coarse speed bump — the honeypot is the real bot filter until KV is
  bound.
- With a KV binding, applications and rate-limit counters expire after 180
  days, so candidate CVs are not retained longer than a recruiting cycle.
- The site's fallback message points applicants at `career@yablokolabs.com`, so
  keep that mailbox working (Email Routing can forward it to the same inbox).
