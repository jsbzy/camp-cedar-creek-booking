# Camp Cedar Creek — Booking App

Hipcamp-style direct booking system for Camp Cedar Creek (Sandy, OR). 21 bookable sites + event inquiries. Full spec: `docs/BUILD_PLAN.md` (data model, emails, iCal architecture, real site inventory — read it before big changes).

**Active branch: `payload-backend`** — Phase 2+ happens here (devbox agent, see `HANDOFF.md`). ⚠️ Never push `main`: GitHub → Vercel auto-deploys it to the live demo, which has no Payload env vars yet. Merge + deploy is Phase 4, from the Mac.

## Decisions (locked 2026-07-08)

- **Backend/admin:** Payload CMS 3 inside this Next.js app. Admin at `/admin` (owners use it; keep it simple). Schema lives in `src/collections/`. SQLite (`@payloadcms/db-sqlite`) for local dev; Neon Postgres at deploy.
- **OTA sync:** full two-way iCal with Hipcamp (+ Airbnb for cottage). Export feed per site at `/api/ical/[siteId].ics`; import cron every 15 min → blocked-dates. No public APIs exist — iCal is the only channel.
- **Launch path:** staging-complete on `camp-cedar-creek-booking.bzy.design` with Stripe TEST mode, then flip with owners (their Stripe live keys, `book.campcedarcreek.com` DNS, Hipcamp iCal URLs, real waiver text, confirmed pricing).
- **Marketing site:** stays separate. Webflow mirror at `/Users/jeffbzy/dev/projects/campcedarcreek.com` deploys as its own static site; cross-link only.
- **Guests:** no accounts. Guest checkout + magic-link booking management.
- **Reviews:** current seed reviews are fabricated for demo. Must be replaced with real Hipcamp reviews (or removed) before launch.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 + shadcn/ui · Zustand (booking flow state) · Payload 3 · Stripe Checkout · Resend + React Email · ical-generator/node-ical

## Run

```bash
cd "/Users/jeffbzy/dev/clients/Camp Cedar Creek/camp-cedar-creek-booking" && npm run dev
```

Dev server on http://localhost:3000, admin at /admin. Seed the DB: `npm run seed`.

## Conventions

- Fonts: Poppins (headings 600/700), Roboto (body 300/400) — matches campcedarcreek.com.
- Palette: black/white/off-white only; photography carries the color. No accent colors.
- Data access goes through `src/lib/data/*` — pages/components never import Payload directly.
- Bookings are never deleted, only status-changed (pending | confirmed | cancelled | completed | refunded).
- Deploys: Vercel project `camp-cedar-creek-booking` (jsbzys-projects). Do not push/deploy mid-phase; verify locally first.
