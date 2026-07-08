# Handoff: Camp Cedar Creek Booking — Phase 2

You are a Claude Code agent on **bzy-dev-box** continuing this project at
`/home/bzy/repos/camp-cedar-creek-booking`, branch **`payload-backend`**.
Read `CLAUDE.md` and `docs/BUILD_PLAN.md` (full spec: emails, iCal, cancellation) before coding.

**What was done (Phase 1, commit `8364091`, verified end-to-end):**
- Payload CMS 3.85 installed inside the Next.js app (Next bumped to 16.2.10, `"type": "module"` added). Admin at `/admin`, Payload REST at `/payload-api` (deliberately not `/api` — the app's own routes live there).
- Collections in `src/collections/`: Sites, Bookings, BlockedDates, Addons, EventInquiries, Reviews, Media, Users + `src/globals/Settings.ts`. Booking hooks auto-generate `confirmationCode` (CCC-XXXXXX) and `magicLinkToken`.
- All data reads/writes go through `src/lib/data/*` (Payload local API, React `cache()`); pages are `force-dynamic`. Seed fixtures live in `src/lib/data/seed.ts`; `npm run seed` (tsx) wipes and reloads sites/add-ons/reviews/settings — never bookings/users.
- Booking flow persists: create → SQLite row → dates blocked (checkout-day exclusive) → survives restart. Add-on prices are resolved server-side (`sanitizeAddOns` in `src/lib/data/addons.ts`) — client prices are never trusted.
- Events inquiry form now actually submits (`/api/events/inquiry` → event-inquiries collection).

**What's pending — YOUR SCOPE (Phase 2), in priority order:**
1. **Resend + React Email.** Booking confirmation email fires after booking creation; templates per `docs/BUILD_PLAN.md` §Email Automation (confirmation, pre-arrival 7d, day-before, post-stay) in `src/emails/`; daily cron route `/api/cron/emails` guarded by `CRON_SECRET`. Also notify guest + owner on event-inquiry submission. `RESEND_API_KEY` is already in `.env.local` on this box.
2. **Magic-link booking management.** Page `/booking/[token]` (view details, cancel), cancel API. Add structured cancellation-policy fields to the Settings global (`fullRefundDays`, `partialRefundDays`, `partialRefundPercent`) alongside the existing display text, seed them (14/50%/policy per current text), and compute the refund amount from them.
3. **Stripe Checkout (code-complete, keys pending).** Jeff has NOT provided test keys yet. Build the full flow — review step creates a Checkout Session, `/api/stripe/webhook` confirms the booking (`pending` → `confirmed`), store `stripeSessionId`/`stripePaymentIntent` — but **feature-flag on `STRIPE_SECRET_KEY` being set**: when absent, keep today's direct-confirm flow working so the demo never breaks. Stripe packages are already installed.
4. Confirmation email includes the magic link; confirmation page shows the code.

**Key files:**
- `/home/bzy/repos/camp-cedar-creek-booking/src/payload.config.ts` — Payload config (SQLite via `DATABASE_URI`, REST at `/payload-api`, GraphQL disabled)
- `src/collections/*.ts`, `src/globals/Settings.ts` — schema (regenerate types after changes: `npm run generate:types`)
- `src/lib/data/{db,sites,bookings,availability,addons,reviews,property}.ts` — the only data-access layer; components never import Payload directly
- `src/app/api/bookings/{create,availability,price}/route.ts`, `src/app/api/events/inquiry/route.ts`
- `src/app/(frontend)/**` (site) · `src/app/(payload)/**` (admin plumbing — don't touch)
- `.env.local` (pre-created on this box, gitignored): `PAYLOAD_SECRET`, `DATABASE_URI=file:./ccc-booking.db`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`

**Decisions made (do not re-litigate):**
- Payload in-app over Directus/Supabase; SQLite for dev, Neon Postgres swapped at deploy (Phase 4, not yours).
- Booking dates are `YYYY-MM-DD` **text** fields — string comparison everywhere, no timezone math. Keep it that way in new code.
- Bookings are never deleted, only status-changed. New Stripe flow creates as `pending`, webhook flips to `confirmed`.
- Two-way iCal with Hipcamp is Phase 3 (schema hooks already exist: `sites.icalImportUrls`, blocked-dates `source`/`externalUid`).
- Displayed rating (4.9/427) + seed reviews are demo data, replaced before launch (Phase 4). Leave them.
- Email FROM address: the Resend key is verified for **bzydesign.com only** — send from `Camp Cedar Creek <bookings@bzydesign.com>` (or jeff@bzydesign.com) until the owners' domain is verified. Do NOT send from campcedarcreek.com — it will 403.

**Watch out for:**
- **NEVER push `main`** — GitHub → Vercel auto-deploys `main` to the live demo, and Vercel has no Payload env vars yet. Work, commit, and push on `payload-backend` only. No merging, no deploys — that's Phase 4, handled elsewhere.
- `payload run scripts/seed.ts` exits silently without running — that's why `npm run seed` uses `tsx`. Same trap applies to any new scripts.
- Project is ESM (`"type": "module"`). Payload CLI needs it; don't remove.
- This box has no headless Chrome / browser — verify with `curl`, server logs, and SQLite (`sqlite3 ccc-booking.db`), not screenshots. Dev server: `npm run dev` (port 3000; if taken, pick another and update `NEXT_PUBLIC_APP_URL` so magic links resolve).
- Fresh DB here has no admin user — create one at `/admin` on first boot (or POST `/payload-api/users/first-register`).
- Known cosmetic issue, deferred to polish: Base UI warning about `Button render={<Link/>}` (nativeButton) in the console. Ignore.
- Availability treats `checkOut`/`endDate` as exclusive (checkout day stays bookable). Preserve in the cancel flow when unblocking.

When done: commit + push `payload-backend`, then reply with a summary of what shipped, what you verified (with output), and anything blocking.
