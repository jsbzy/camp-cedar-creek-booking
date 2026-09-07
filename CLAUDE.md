# Camp Cedar Creek — Booking App

Hipcamp-style direct booking system for Camp Cedar Creek (Sandy, OR). 21 bookable sites + event inquiries. Full spec: `docs/BUILD_PLAN.md` (data model, emails, iCal architecture, real site inventory — read it before big changes).

**Deployed 2026-09-07 (Phase 4 done).** Staging is live at https://camp-cedar-creek-booking.bzy.design on Neon Postgres (Vercel marketplace, project `camp-cedar-creek-booking`), Stripe off (no keys → direct-confirm), emails via Resend to jeff@bzydigital.com. **`main` deploys on push** — the build runs `payload migrate && next build`. Work on `payload-backend`, merge `--ff-only` into `main` to ship. Admin login: `ADMIN.local.md` (gitignored). Owner test script: `docs/TESTING.md`. Runbook: `docs/DEPLOY.md`. Never run `npm run seed` or `npm run dev` against the Neon URI — `push:false` in the adapter now guards it, but `seed` poisoned the migration state once (see DEPLOY.md).

## Decisions (locked 2026-07-08)

- **Backend/admin:** Payload CMS 3 inside this Next.js app. Admin at `/admin` (owners use it; keep it simple). Schema lives in `src/collections/`. SQLite (`@payloadcms/db-sqlite`) for local dev; Neon Postgres at deploy.
- **OTA sync:** full two-way iCal with Hipcamp (+ Airbnb for cottage). Export feed per site at `/api/ical/[siteId].ics`; import cron every 15 min → blocked-dates. No public APIs exist — iCal is the only channel.
- **Launch path:** staging-complete on `camp-cedar-creek-booking.bzy.design` with Stripe TEST mode, then flip with owners (their Stripe live keys, `book.campcedarcreek.com` DNS, Hipcamp iCal URLs, real waiver text, confirmed pricing).
- **Marketing site:** separate repo `~/repos/campcedarcreek.com` (governed mirror + AI-CMS connector, live at https://campcedarcreek.bzy.design). Cross-link only.
- **Guests:** no accounts. Guest checkout + magic-link booking management.
- **Commercial model (decided 2026-09-07):** no per-booking fee, ever — that is what the owners are leaving Hipcamp to escape. Stripe runs on the owners' own account (their keys; no Stripe Connect / platform fees). Hosting stays on Jeff's Vercel/Neon/Resend and is billed only if it has a real cost; otherwise handed over free. Full transfer (Vercel project, Neon, Resend, GitHub) is available any time.
- **Reviews:** current seed reviews are fabricated for demo. Must be replaced with real Hipcamp reviews (or removed) before launch.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 + shadcn/ui · Zustand (booking flow state) · Payload 3 · Stripe Checkout · Resend + React Email · ical-generator/node-ical

## Run

```bash
cd ~/repos/camp-cedar-creek-booking && npm run dev   # port 3000 is taken on bzybox; Next picks 3001
```

Dev server on http://localhost:3000, admin at /admin. Seed the DB: `npm run seed`.

## Conventions

- Fonts: Poppins (headings 600/700), Roboto (body 300/400) — matches campcedarcreek.com.
- Palette: black/white/off-white only; photography carries the color. No accent colors.
- Data access goes through `src/lib/data/*` — pages/components never import Payload directly.
- Bookings are never deleted, only status-changed (pending | confirmed | cancelled | completed | refunded).
- Deploys: Vercel project `camp-cedar-creek-booking` (jsbzys-projects). Do not push/deploy mid-phase; verify locally first.
