# Deploy Runbook — Camp Cedar Creek Booking

Phase 4: staging on `camp-cedar-creek-booking.bzy.design` (Vercel project
`camp-cedar-creek-booking`, jsbzys-projects), then the launch flip with the
owners. `main` auto-deploys — **do not merge until the env vars below exist on
Vercel**, or the live demo breaks.

## Database

Production runs Neon Postgres; the adapter switches on the `DATABASE_URI`
scheme (`postgres://…` → Postgres, anything else → local SQLite).

- Schema lives in committed migrations (`src/migrations/`). The Vercel build
  runs them: `vercel.json` sets `buildCommand: npm run build:vercel`
  (= `payload migrate && next build`). Verified locally against Postgres 16.
- **Never run `npm run dev` against the Neon URI.** Dev mode pushes schema
  directly and poisons the migration state — `payload migrate` will then stall
  on an interactive data-loss prompt (this exact failure was reproduced during
  verification).
- Schema changes: edit collections → `DATABASE_URI=<any postgres uri> npm run
  migrate:create <name>` → commit the new file in `src/migrations/`.
  (`npm run generate:types` as usual.)

## Staging deploy, in order

1. **Neon**: create project → copy the *pooled* connection string.
2. **Vercel env vars** (Production):

   | Var | Value |
   |---|---|
   | `PAYLOAD_SECRET` | fresh 32+ char random string |
   | `DATABASE_URI` | Neon pooled `postgres://…` |
   | `RESEND_API_KEY` | existing key (bzydesign.com verified) |
   | `CRON_SECRET` | fresh random string (Vercel sends it on cron requests automatically) |
   | `NEXT_PUBLIC_APP_URL` | `https://camp-cedar-creek-booking.bzy.design` (magic links resolve against this) |
   | `OWNER_NOTIFY_EMAIL` | your inbox for staging — keeps demo inquiries away from the owners |
   | `STRIPE_SECRET_KEY` | TEST key — checkout stays disabled (direct-confirm) until set |
   | `STRIPE_WEBHOOK_SECRET` | from the Stripe webhook endpoint (below) |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | TEST key |

3. **Domain**: add `camp-cedar-creek-booking.bzy.design` to the Vercel project.
4. **Merge + push `main`** → auto-deploy runs migrations, then builds.
5. **Seed** (sites/add-ons/reviews/settings only; never touches bookings):
   `DATABASE_URI=<neon-uri> npm run seed` from a checkout.
6. **First admin user**: visit `/admin` and register.
7. **Stripe webhook** (when keys exist): dashboard → add endpoint
   `https://<domain>/api/stripe/webhook`, events `checkout.session.completed`
   + `checkout.session.expired`; put its signing secret in
   `STRIPE_WEBHOOK_SECRET`.
8. **Crons**: defined in `vercel.json` — emails daily 16:00 UTC (9am PT),
   iCal import every 15 min. 15-min schedules need a paid plan; crons fire on
   the production deployment only.

### Post-deploy smoke test

Book a site with your own email → confirmation email arrives with magic link →
manage page shows refund quote → cancel → dates reopen + cancellation email.
`GET /api/ical/fairy-ring.ics` returns a calendar. Cron endpoints 401 without
the bearer secret.

## Launch flip (with owners)

- [ ] Stripe **live** keys + live webhook endpoint
- [ ] `book.campcedarcreek.com` DNS → Vercel; update `NEXT_PUBLIC_APP_URL`
- [ ] Verify campcedarcreek.com in Resend, then change `FROM` in
      `src/lib/email/index.tsx` (until then it must stay `bookings@bzydesign.com`)
- [ ] `OWNER_NOTIFY_EMAIL` → owners' real inbox (or remove; falls back to
      Settings → host email)
- [ ] Replace fabricated seed reviews + displayed 4.9/427 rating with real
      Hipcamp data (or hide reviews)
- [ ] Real waiver text, confirmed pricing
- [ ] iCal: paste each site's `/api/ical/<slug>.ics` URL into Hipcamp
      (+ Airbnb for the cottage); add their export URLs to each site's
      "iCal import URLs" in `/admin`
- [ ] Delete staging/demo bookings from Neon before go-live
