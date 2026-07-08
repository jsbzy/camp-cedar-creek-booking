# Camp Cedar Creek — Booking System Build Plan

> **Brief for Claude Code** — This document contains everything needed to build a custom campground booking system for Camp Cedar Creek (Sandy, Oregon). Read this fully before writing any code.

---

## Project Overview

Build a standalone booking web app for **Camp Cedar Creek**, a 37-acre campground, coworking, and events venue in Sandy, Oregon — located right off Highway 26, directly between Portland (~30 min) and the peak of Mt. Hood. The property is nestled in Mt. Hood National Forest with old-growth cedar stumps, second-growth cedar trees, a creek, and ponds.

The app handles the full guest journey: browse sites, check availability, book, pay, sign a waiver, and receive automated emails. Owners manage everything through a Directus admin panel.

The existing marketing site is on **Webflow** (campcedarcreek.com) and stays as-is. This booking app is a separate deployment, linked from the Webflow site. The URL will be something like `book.campcedarcreek.com`.

Contact email: hello@campcedarcreek.com

---

## The Property — Real Data

### About Camp Cedar Creek

Camp Cedar Creek sits on 37 acres of forested land with a creek and ponds, 6 minutes from downtown Sandy. The property has two main zones:

1. **Creekside Campsites** — Down the hill along the creek. Campsites are named after wild mushrooms. Require 4WD/AWD to access. Pack-in/pack-out. Dogs allowed off-leash. Huge old-growth cedar stumps and second-growth cedar trees create an enchanted, private setting. Each site has creek access.

2. **The Blue Barn (Hilltop)** — A large barn structure sitting on the hilltop overlooking the forested land. Houses:
   - **Van parking spots** (numbered) for vanlifers and digital nomads. 2WD vehicles OK. Dogs on-leash.
   - **Communal kitchen** with full amenities
   - **Flush toilets + showers** (2 bathrooms)
   - **Laundry facilities**
   - **Gym / game area**
   - **"The Loft"** — coworking space on the 2nd and 3rd floors with high-speed WiFi, breakout areas, variety of workstations, and windows with forest and creek views. Capacity ~25 people. Also used as event/offsite space.

3. **Cedar Creek Cottage** — A standalone cottage on the property, listed on Airbnb at ~$150/night.

4. **Event Space** — The property (including The Loft and outdoor areas) can be reserved for events: weddings, birthdays, anniversaries, corporate offsites, retreats, ticketed events. Listed on Peerspace. Up to 10 waterside campsites can be reserved together for larger groups.

### Confirmed Campsite Names (mushroom-themed)

These are the creekside tent campsites confirmed from Hipcamp listings and reviews:

| # | Site Name | Description (from listings) |
|---|---|---|
| 1 | **Chanterelle** | One of the most popular sites. Space for tents and vehicles. Creek and pond access, climbing tree, large fire pit. |
| 2 | **Puffball** | Flat site with enough space for two campervans + tent space along the creek. No neighbors within view. Creekside escape. (Formerly known as "Terrydise" / "Lobster") |
| 3 | **Turkey Tail** | Direct creek access. Only one direct neighbor. Close to porta-potty. |
| 4 | **Lion's Mane** | Shade trees and creek access. Well-reviewed. |
| 5 | **Fairy Ring** | Confirmed from reviews. Details TBD. |
| 6 | **Candy Cap** | Confirmed from reviews. Details TBD. |
| 7-10 | **TBD** | ~4 more sites exist — names to be confirmed with owners. Likely other mushroom names (Morel, King Bolete, Oyster, Matsutake, Hen of the Woods, Lobster are all plausible). |

### Van/Vehicle Sites (9 sites)

9 numbered spots at the hilltop near The Blue Barn. Vehicle campers only — no tents. Two sub-types:
- **Solar Sites** (1, 2, 4, 5, 8, 9) — No hookups, good sun exposure for solar-equipped vehicles. $30-40/night.
- **Power Sites** (3, 6, 7) — Electrical + water hookup. $50/night.

All include full barn access (kitchen, showers, toilets, laundry, gym, coworking).

### Glamping Trailer (1 site)

**Trailer Glampsite 10** — A renovated 19' camper with queen bed, dining area, mini fridge. Includes picnic table, BBQ, fire pit with Adirondack chairs. Barn access included. $105/night.

### Image Sources

Pull real photos from these listing URLs for the PoC. Download and host in R2 or use as placeholders until owners provide high-res originals:

- **Hipcamp (Creekside Campsites):** https://www.hipcamp.com/en-US/land/oregon-camp-cedar-creek-1-9mxhzov1
- **Hipcamp (Van / Coworking):** https://www.hipcamp.com/en-US/land/oregon-mt-hood-vanlife-oasis-w-coworking-9mxhk92x
- **Peerspace (Event Space / The Loft):** https://www.peerspace.com/pages/listings/656f750231c77e000e822698
- **Airbnb (Cedar Creek Cottage):** https://www.airbnb.com/rooms/50682870
- **Website:** https://www.campcedarcreek.com/

> **Note to developer:** For the PoC, use placeholder images (e.g., Unsplash forest/camping stock) with the same layout. Real photos will be downloaded from the above sources and swapped in during the polish phase. Do NOT scrape these sites programmatically — we'll manually download or have the owners provide originals.

### Brand Assets (from campcedarcreek.com)

#### Logo
- **Logo (no text, square):** `https://cdn.prod.website-files.com/6525b41da06d8aab346bce9f/65a1c1cccf624976862044b1_No%20Words%20Cropped%20Square.png`
- **Favicon (32x32):** `https://cdn.prod.website-files.com/6525b41da06d8aab346bce9f/6567327bb023dbb4cc6cd609_ccc_iocn_32x32.png`
- **Apple Touch Icon (256x256):** `https://cdn.prod.website-files.com/6525b41da06d8aab346bce9f/6567325c0a61cdbeee58483e_ccc_icon_256x256.png`

#### Typography
- **Headings:** Poppins (Google Fonts) — weights 600-700
- **Body:** Roboto (Google Fonts) — weights 100, 300, 400 (regular)
- **Google Fonts import:** `https://fonts.googleapis.com/css?family=Poppins:100,200,300,regular,500,600,700,800,900|Roboto:100,300,regular`

#### Colors
- **Background:** White `#ffffff` / Off-white `#fffefe`
- **Primary text:** Near-black `#1f1f1d` / `#222222`
- **Secondary text:** Dark gray `#333333`
- **Heading text (on dark bg):** Off-white `#fbfbfd`
- **Buttons/accents:** Black `#000000` / `#010101`
- **Overall vibe:** Minimal, black-and-white with large photography. The brand is clean and modern with the photos doing the heavy lifting for warmth and personality.

#### Key Photos from Website (Webflow CDN)
These are the actual images currently on campcedarcreek.com. Download and rehost for the booking app:

```
Hero:
  https://cdn.prod.website-files.com/6525b41da06d8aab346bce9f/653596198dd7217452fa0a12_IMG_9957-preview.jpg (van at creek)

Property shots:
  https://cdn.prod.website-files.com/6525b41da06d8aab346bce9f/6526dfea6cdb14210f39fe63_westy_cedarcreek.jpg (VW westy at creek)
  https://cdn.prod.website-files.com/6525b41da06d8aab346bce9f/65a8ad48c72a2bb75fabc7fc_201.jpg
  https://cdn.prod.website-files.com/6525b41da06d8aab346bce9f/65a8b57ed82bfce873cf8475_026A9724.jpg

Partner logos on site:
  Hipcamp Logo: https://cdn.prod.website-files.com/6525b41da06d8aab346bce9f/65525ee457a474a22d71a500_hipcamp_logo.png
```

#### Design Direction for Booking App
Match the existing site's minimal, photo-forward aesthetic:
- Use **Poppins** for headings and **Roboto** for body text (same as their Webflow site)
- Keep the palette black/white/off-white — let the photography provide color and warmth
- Big, full-bleed hero images on homepage and detail pages
- Clean, generous whitespace
- Buttons: solid black with white text (matching current site style)
- The booking app should feel like a natural extension of campcedarcreek.com even though it's a separate deployment

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | Use React Server Components, SSR for SEO |
| **Styling** | Tailwind CSS + shadcn/ui | Clean, accessible component library |
| **Backend / CMS** | Directus | Headless CMS providing REST + GraphQL API and admin UI for owners |
| **Database** | PostgreSQL | Hosted on Railway alongside Directus |
| **Payments** | Stripe | Checkout Sessions for payment, Webhooks for confirmation, refund support |
| **Email** | Resend + React Email | Transactional emails with JSX-based templates |
| **Auth (guests)** | Magic links via Resend | Passwordless — guests enter email, get link to manage booking |
| **Auth (admin)** | Directus built-in auth | Role-based: owner role (daily ops) and admin role (config/technical) |
| **Waivers** | HTML Canvas signature pad | Capture signature in-browser, generate and store PDF |
| **Calendar Sync** | ical-generator + ical.js | Export iCal feeds per site, import OTA calendars to block dates |
| **Hosting** | Vercel (frontend) + Railway (Directus + Postgres) | |
| **File Storage** | Cloudflare R2 | Photos, waiver PDFs. Free tier covers needs. |

---

## Data Model

### `sites`
```
id              UUID (PK)
name            string          — e.g. "Chanterelle", "Van Spot 3", "Cedar Creek Cottage"
slug            string          — URL-safe, unique
type            enum            — tent | van | cottage | event
description     text            — rich text / markdown
short_desc      string          — one-liner for cards
photos          json[]          — array of { url, alt, order }
amenities       string[]        — e.g. ["fire_pit", "picnic_table", "creek_access"]
max_guests      int
check_in_time   string          — e.g. "14:00"
check_out_time  string          — e.g. "11:00"
requires_4wd    boolean
dogs_allowed    boolean
dogs_policy     string          — "off_leash" | "on_leash" | "no_dogs"
barn_access     boolean         — van spots include Blue Barn access
status          enum            — active | inactive | seasonal
sort_order      int
ical_import_urls json[]         — array of { platform: "hipcamp"|"airbnb", url: "https://..." }
ical_last_synced timestamp      — last successful iCal import
created_at      timestamp
updated_at      timestamp
```

### `pricing_rules`
```
id              UUID (PK)
site_id         UUID (FK → sites)
season          enum            — peak | shoulder | off
season_start    date            — e.g. "2026-06-01"
season_end      date            — e.g. "2026-09-15"
weekday_rate    decimal         — Mon-Thu nightly rate
weekend_rate    decimal         — Fri-Sun nightly rate
min_stay        int             — minimum nights
```

### `blocked_dates`
```
id              UUID (PK)
site_id         UUID (FK → sites)
date            date
reason          enum            — maintenance | ota_booking | seasonal_closure | owner_block
note            string          — optional
```

### `bookings`
```
id              UUID (PK)
site_id         UUID (FK → sites)
check_in        date
check_out       date
nights          int             — computed
guest_name      string
guest_email     string
guest_phone     string
party_size      int
special_requests text
subtotal        decimal         — site cost before add-ons
addons_total    decimal
total_price     decimal
stripe_session_id    string
stripe_payment_intent string
status          enum            — pending | confirmed | cancelled | completed | refunded
cancellation_reason  string
waiver_signed   boolean
magic_link_token string         — for guest booking management
created_at      timestamp
updated_at      timestamp
```

### `booking_addons`
```
id              UUID (PK)
booking_id      UUID (FK → bookings)
addon_id        UUID (FK → addons)
quantity        int
line_total      decimal
```

### `addons`
```
id              UUID (PK)
name            string          — e.g. "Firewood Bundle", "Blue Barn Day Pass"
description     string
price           decimal
available_for   string[]        — site types this add-on applies to: ["tent", "van", "cottage"]
max_quantity    int
active          boolean
sort_order      int
```

### `event_inquiries`
```
id              UUID (PK)
preferred_date  date
alt_date        date            — optional
party_size      int
event_type      string          — wedding | retreat | corporate | party | other
message         text
guest_name      string
guest_email     string
guest_phone     string
budget_range    string          — optional
status          enum            — pending | approved | declined | converted
admin_notes     text
quoted_price    decimal
created_at      timestamp
updated_at      timestamp
```

### `waivers`
```
id              UUID (PK)
booking_id      UUID (FK → bookings)
guest_name      string
signature_data  text            — base64 canvas data
signed_at       timestamp
waiver_version  string          — e.g. "2026-v1"
pdf_url         string          — stored in R2
```

### `settings` (key-value store)
```
key             string (PK)     — e.g. "cancellation_policy", "check_in_instructions"
value           json
```

---

## Pages & Routes

### Guest-Facing (Next.js App Router)

```
/                           → Homepage: hero, site categories, availability search
/sites                      → Browse all sites (filterable by type)
/sites/[type]               → Category page (e.g. /sites/tent, /sites/van)
/sites/[type]/[slug]        → Site detail: gallery, description, amenities, calendar, pricing, "Book Now"
/book/[slug]                → Booking flow (multi-step form):
  Step 1: Select dates + party size (with live price calc)
  Step 2: Choose add-ons
  Step 3: Guest info (name, email, phone, special requests)
  Step 4: Sign waiver (canvas signature pad)
  Step 5: Review order → Stripe Checkout
/book/confirmation/[id]     → Booking confirmed: details, "add to calendar" .ics download, what's next
/booking/[token]            → Manage booking via magic link: view details, cancel
/events                     → Event space page with gallery + inquiry form
/events/submitted           → Inquiry confirmation
/api/stripe/webhook         → Stripe webhook handler
/api/ical/[siteId].ics      → iCal feed per site (for OTA sync)
/api/bookings/availability  → GET: returns available dates for a site + date range
```

### Admin (Directus)

Directus handles all admin UI out of the box. Configure these collections:
- Sites (CRUD, photo uploads, amenity tags)
- Bookings (list, filter, calendar view via Directus extension or custom panel)
- Pricing Rules (per-site seasonal rates)
- Blocked Dates (per-site date blocking)
- Add-Ons (CRUD)
- Event Inquiries (review, approve/decline with notes + quoted price)
- Waivers (view, download PDF)
- Settings (key-value config)

Create two Directus roles:
1. **Owner** — can view/manage bookings, event inquiries, block dates, view revenue. Cannot modify site config or settings.
2. **Admin** — full access to everything including sites, pricing rules, add-ons, settings.

---

## Booking Flow (Detailed)

1. Guest browses sites on homepage or category pages
2. Guest clicks into a site detail page, sees photo gallery + availability calendar
3. Guest clicks "Book Now", enters the booking flow:
   - **Dates**: Calendar picker. Blocked dates are grayed out. Min-stay enforced. Price auto-calculates based on pricing rules (weekday/weekend/season).
   - **Add-ons**: Optional extras shown based on site type. Quantity selectors. Running total updates.
   - **Guest Info**: Name, email, phone, party size, special requests. No account creation required.
   - **Waiver**: Display liability waiver text. Guest signs with finger/mouse on canvas. Checkbox: "I agree to the terms."
   - **Review & Pay**: Order summary (dates, site, add-ons, total). "Pay with Stripe" button creates a Stripe Checkout Session and redirects.
4. Stripe processes payment. Webhook fires on success → booking status set to `confirmed`.
5. Confirmation page shows booking details + "Add to Calendar" .ics download.
6. Confirmation email sent immediately via Resend.
7. Magic link included in email for future booking management.

### Availability Logic

A date is **unavailable** if:
- A confirmed booking exists that includes that date (between check_in and check_out)
- A blocked_date record exists for that date
- The site status is `inactive` or `seasonal` and outside its active season

### Price Calculation

```
For each night in the booking:
  1. Determine which pricing_rule applies (match season by date range)
  2. Check if the night is a weekday (Mon-Thu) or weekend (Fri-Sun)
  3. Use the corresponding rate (weekday_rate or weekend_rate)
  4. Sum all nights
  5. Add add-on costs (addon.price * quantity for each)
  6. Total = site_subtotal + addons_total
```

---

## Email Automation

Use **Resend** with **React Email** templates. Trigger emails via:
- Stripe webhook (booking confirmation)
- Cron job or Directus Automate flow (pre-arrival, reminder, follow-up)

### Email Templates to Build

| Email | Trigger | Content |
|---|---|---|
| `booking-confirmation` | Stripe webhook: payment_intent.succeeded | Receipt, dates, site details, check-in info, magic link to manage booking |
| `pre-arrival` | 7 days before check_in | Directions, check-in instructions, what to bring, campground rules, weather link |
| `day-before-reminder` | 1 day before check_in | Quick reminder with key details |
| `post-stay` | 1 day after check_out | Thank you, review request (Phase 2), "book again" CTA |
| `event-inquiry-received` | On event inquiry submission | Acknowledgment to guest |
| `event-inquiry-notify-owner` | On event inquiry submission | Notify owners with inquiry details |
| `event-approved` | Admin approves inquiry | Details + quoted price + next steps to guest |
| `event-declined` | Admin declines inquiry | Polite decline + alternative suggestions |
| `cancellation-confirmation` | Guest cancels via magic link | Cancellation confirmed, refund details |

For scheduled emails (pre-arrival, reminder, follow-up), set up a **Vercel Cron Job** that runs daily at 9am PT:
1. Query bookings where `check_in - 7 days = today` → send pre-arrival
2. Query bookings where `check_in - 1 day = today` → send reminder
3. Query bookings where `check_out + 1 day = today` → send follow-up

---

## iCal Sync

**Important context:** Neither Hipcamp nor Airbnb offer public APIs for custom-built booking systems. API access is restricted to approved partner PMS/channel manager software only. **iCal is the only sync method available** for a custom build like ours, and it's the industry standard used by the vast majority of small campgrounds and B&Bs.

### How iCal Sync Works

iCal (.ics) is a standard calendar format. Each platform can export a URL that returns all booked dates as calendar events, and import a URL to block dates from an external source. Sync is **poll-based** — the importing platform fetches the .ics URL on a schedule and updates its calendar.

### The Delay Problem

The main limitation: iCal sync is not real-time. Each platform polls on its own schedule:
- **Hipcamp:** Syncs external calendars approximately every **3-4 hours**
- **Airbnb:** Syncs external calendars approximately every **1-4 hours** (varies)
- **Our system:** We control this — can poll as frequently as every **15 minutes**

This means there's a window (up to ~4 hours) where a site could theoretically be double-booked across platforms. For a 21-site property this is low-risk but real. Mitigations are listed below.

### Export (our system → OTAs)

Each site gets a public iCal feed endpoint:

```
/api/ical/[siteId].ics
```

This feed contains all confirmed bookings as VEVENT entries with:
- DTSTART/DTEND (check-in/check-out dates)
- SUMMARY (e.g., "Booked - Chanterelle Campsite")
- UID (unique per booking, stable across syncs)
- DTSTAMP and LAST-MODIFIED (for cache-busting)

The owners paste each site's .ics URL into:
- Hipcamp → Settings → External Calendar → Import
- Airbnb → Calendar → Import Calendar

Those platforms will then auto-block the same dates.

**Implementation:**
- Use `ical-generator` npm package
- Set `Cache-Control: no-cache, no-store` headers on the endpoint
- Include a `X-WR-CALNAME` header with the site name for clarity
- Generate fresh on every request (don't cache server-side) so OTAs always get the latest

### Import (OTAs → our system)

Add these fields to the `sites` table:

```
ical_import_urls    json[]   — array of { platform: "hipcamp"|"airbnb", url: "https://..." }
ical_last_synced    timestamp
```

A **Vercel Cron Job** fetches each OTA calendar URL on a schedule and creates/updates `blocked_dates` records:

```
/api/cron/ical-sync → runs every 15 minutes
```

For each site with `ical_import_urls`:
1. Fetch each .ics URL
2. Parse VEVENT entries using `ical.js` (or `node-ical`)
3. For each event, create a `blocked_dates` record with:
   - `reason: "ota_booking"`
   - `source: "hipcamp"` or `"airbnb"`
   - `external_uid: event.uid` (to detect updates/cancellations)
4. Remove any `blocked_dates` where the source event no longer exists in the feed (i.e., the OTA booking was cancelled)
5. Update `ical_last_synced` timestamp

**Polling frequency:** Every 15 minutes via Vercel Cron. This is the fastest we can reasonably poll without hitting rate limits. It means our system will pick up OTA bookings within 15 minutes — much faster than the 3-4 hours it takes Hipcamp/Airbnb to pick up ours.

### Double-Booking Mitigation

Since iCal sync has inherent delays, implement these safeguards:

1. **Aggressive import polling (15 min)** — We catch OTA bookings fast on our side
2. **Admin notification** — When a new booking is confirmed, email the owners so they can eyeball the OTA calendars
3. **Overlap detection** — Nightly cron job compares all bookings + blocked_dates for conflicts. Alert owners if any overlap is found.
4. **Grace period** — Consider showing sites as "unavailable" for 1 day buffer around existing bookings (configurable in settings) to reduce edge-case risk
5. **Manual sync button** — Add a "Sync Now" button in Directus admin that triggers an immediate iCal import for all sites

### Future: Faster Sync Options

If the delay becomes a real problem, there are upgrade paths:
- **Channex.io** — A channel manager with an open API. Acts as a middleman between our system and OTAs. Adds cost (~$20-50/month) but enables near-real-time two-way sync.
- **Phase out OTAs entirely** — Once the booking system proves itself, remove Hipcamp/Airbnb listings and the sync problem disappears.
- **Sync-Rentals-Calendar** — Open-source multi-platform iCal sync tool (https://github.com/pixelcrash/Sync-Rentals-Calendar) that could be adapted for more aggressive polling.

---

## Digital Waiver

- Display waiver text (stored in `settings` table, editable by admin)
- HTML Canvas signature pad (use `react-signature-canvas` or similar)
- On submit: save base64 signature data to `waivers` table
- Generate PDF with waiver text + signature + timestamp (use `@react-pdf/renderer` or `pdf-lib`)
- Upload PDF to Cloudflare R2
- Store URL in `waivers.pdf_url`
- Digital signatures are legally valid in Oregon under UETA and federal E-SIGN Act

---

## Cancellation Policy

Build a **configurable** system. Store policy in `settings`:

```json
{
  "cancellation_policy": {
    "full_refund_days_before": 7,
    "partial_refund_days_before": 3,
    "partial_refund_percent": 50,
    "no_refund_days_before": 0
  }
}
```

When a guest cancels via magic link:
1. Calculate days until check_in
2. Apply policy rules
3. Process refund via Stripe (full, partial, or none)
4. Update booking status
5. Unblock dates
6. Send cancellation confirmation email

Owners can adjust the policy numbers in Directus without code changes.

---

## Seed Data (for PoC)

Pre-populate with **real site names, descriptions, and pricing** sourced directly from the Hipcamp listing. The listing has **21 bookable sites** across 4 categories. Use placeholder images (Unsplash camping/forest) until real photos are swapped in.

### Complete Site Inventory (from Hipcamp, March 2026)

#### Tent-Only Campsites (type: tent) — 3 sites
All require 4WD/AWD. Pack-in/pack-out. Off-leash dogs OK. Tent camping only (no vehicles on grass).

```
1. Fairy Ring
   slug: fairy-ring
   hipcamp_rating: 98% (60 reviews)
   sleeps: 10
   hipcamp_price: from $65/night (for 6 guests)
   description: "Large campsite lining the north side of the creek. Right next to the parking area making it convenient to tent camp next to your cars. This site is close to a pond and a couple trails up the forest hills. It's also the closest to one of the porta-potties during peak season (end of May through September). Great for: tent camping (no vehicles on the grass please; vehicle camping is allowed if you park in the dirt lot right before the grass along the creek)"
   amenities: [fire_pit, creek_access, pond_nearby, trail_access, near_facilities]
   requires_4wd: true
   dogs_policy: off_leash
   tent_only: true

2. Candy Cap
   slug: candy-cap
   hipcamp_rating: 100% (59 reviews)
   sleeps: 12
   hipcamp_price: from $120/night
   description: "Another larger campsite on the north side of the creek, at the most western point of the campground offering a good amount of privacy and an almost personal trailhead. This site lines the creek, has a couple big trees offering shade, and a lot of space for dogs (and humans) to run and play. TENT CAMPING ONLY (no vehicles on the grass please)"
   amenities: [fire_pit, creek_access, privacy, shade, trail_access, spacious]
   requires_4wd: true
   dogs_policy: off_leash
   tent_only: true

3. Reishi
   slug: reishi
   hipcamp_rating: 98% (41 reviews)
   sleeps: 6
   hipcamp_price: from $45/night
   description: "This site isn't right along the creek, but basically has its own private pond, and is located in an area that's almost easy to miss when you drive in, making it feel like a little hideaway. TENT CAMPING ONLY (please do not drive past the big tree). Decent privacy and a lot of shade. Not on the creek."
   amenities: [fire_pit, private_pond, privacy, shade, hideaway]
   requires_4wd: true
   dogs_policy: off_leash
   tent_only: true
```

#### RV/Tent Campsites (type: rv_tent) — 8 sites
All require 4WD/AWD. Pack-in/pack-out. Off-leash dogs OK. Vehicles under 20-22ft allowed.

```
4. Lion's Mane
   slug: lions-mane
   hipcamp_rating: 97% (76 reviews)
   sleeps: 8
   max_vehicle_length: 20ft
   hipcamp_price: from $55/night (for 4 guests)
   description: "One of our more popular campsites along the creek with a good amount of shade. Plenty of space for both tents and vehicles with little nooks to enjoy a campfire or set up your tent betwixt the trees. You have the creek right in front of you and the biggest pond with a little beach behind you. Great for: all camping types. Along the creek."
   amenities: [fire_pit, creek_access, pond_beach, shade, vehicle_space, nooks]
   requires_4wd: true
   dogs_policy: off_leash

5. Morel
   slug: morel
   hipcamp_rating: 98% (58 reviews)
   sleeps: 4
   max_vehicle_length: 20ft
   hipcamp_price: from $50/night (for 4 guests)
   description: "One of our smaller campsites along the creek with a good amount of shade. While a little more exposed than some other sites, it's arguably one of the most picturesque being right along the creek, nestled behind some grand trees, and next to the bridge. Great for: all camping types. Smaller site, perfect for 2-4 people. One of our least private sites as it's located in the middle of the campground, directly to the left of the bridge. Along the creek."
   amenities: [fire_pit, creek_access, shade, picturesque, near_bridge]
   requires_4wd: true
   dogs_policy: off_leash

6. King Bolete
   slug: king-bolete
   hipcamp_rating: 97% (50 reviews)
   sleeps: 10
   max_vehicle_length: 20ft
   hipcamp_price: from $75/night
   description: "This is one of our largest campsites, and one of our least private. That being said, it's one of our most popular as you have prime creek access, a lot of sun, and are close to our largest pond with a beach. It's also close (just over the bridge) to the porta-potty during peak season. Great for: all camping types - tents can be on the grass and any camper vehicles can utilize the extra shaded parking area carved out along the creek."
   amenities: [fire_pit, creek_access, pond_beach, sunny, spacious, vehicle_space, near_facilities]
   requires_4wd: true
   dogs_policy: off_leash

7. Amanita
   slug: amanita
   hipcamp_rating: 95% (33 reviews)
   sleeps: 4
   max_vehicle_length: 20ft
   hipcamp_price: from $45/night (for 4 guests)
   description: "Located next to the largest pond on the property, with space between the water and a large tree/stump, it provides a natural barrier and privacy from the other sites. Amanita is the first site you'll see on the right when you enter the campground. Parking is just beyond the tree/sign. Great for: tent camping. Not along the creek, but right next to the biggest pond and main road. Best for a quick stop, convenient in and out."
   amenities: [fire_pit, pond_access, privacy, convenient_access]
   requires_4wd: true
   dogs_policy: off_leash

8. Chanterelle
   slug: chanterelle
   hipcamp_rating: 98% (23 reviews)
   sleeps: 12
   max_vehicle_length: 20ft
   hipcamp_price: from $110/night
   description: "**BEST FOR GROUP CAMPING** One of our most popular sites due to its size, location, and privacy, the Chanterelle Campsite is perfect for a larger group to enjoy. There's space for tents and vehicles, has its own creek (and pond) access point, a giant climbing tree, and a large fire pit with seating."
   amenities: [fire_pit, creek_access, pond_access, climbing_tree, privacy, spacious, vehicle_space, group_camping]
   requires_4wd: true
   dogs_policy: off_leash

9. Puffball (NEW)
   slug: puffball
   hipcamp_rating: (new listing)
   sleeps: 30
   max_vehicle_length: 22ft
   hipcamp_price: from $240/night (for 12 guests)
   description: "[Formerly known as 'Terrydise' / 'Lobster'] When it comes to privacy, views, tranquility, spaciousness, and mix of shade and sun, this site really does have it all. Flat with enough space for two campervans, plenty of space along the creek to spread out your tents, and no neighbors within view, Puffball provides the most epic creekside escape. With a large picnic table, fire ring, and personal creek pool, it is an undeniable vibe. Take advantage of arguably the best spot at Camp Cedar Creek!"
   amenities: [fire_pit, creek_access, creek_pool, picnic_table, privacy, spacious, vehicle_space, shade, sun, group_camping]
   requires_4wd: true
   dogs_policy: off_leash

10. Turkey Tail
    slug: turkey-tail
    hipcamp_rating: 100% (12 reviews)
    sleeps: 4
    max_vehicle_length: 20ft
    hipcamp_price: from $50/night (for 4 guests)
    description: "One of our smaller campsites along the creek with a good amount of shade. Turkey Tail is a great location, with direct access to the creek, only one direct neighbor, and very close to a porta-potty. Best for: vans, trucks, tents. Smaller site, perfect for 2-4 people."
    amenities: [fire_pit, creek_access, shade, near_facilities, privacy]
    requires_4wd: true
    dogs_policy: off_leash

11. Fairy Ring + Candy Cap (COMBO)
    slug: fairy-ring-candy-cap-combo
    hipcamp_rating: 100% (2 reviews)
    sleeps: 22
    max_vehicle_length: 20ft
    hipcamp_price: from $210/night
    description: "Another great option for bigger groups! Fairy Ring and Candy Cap sites sit along the north side of creek, over the bridge and separated from the other eight campsites. Close proximity to the porta-potties, best entry point to the deepest part of the creek for swimming, and closest to the hiking trails, this is a prime location."
    amenities: [fire_pit, creek_access, swimming, trail_access, near_facilities, privacy, group_camping]
    NOTE: This is a combo booking of sites #1 and #2 above. System should support "combo" listings that bundle multiple sites.
    requires_4wd: true
    dogs_policy: off_leash
```

#### Van/Vehicle Sites (type: van) — 9 sites
All at the hilltop near The Blue Barn. 2WD OK. On-leash dogs. Vehicle campers only — no tents. All include barn access (kitchen, showers, toilets, laundry, gym, coworking/WiFi).

Two sub-types: **Solar** (no electrical hookup, good sun exposure) and **Power** (electrical hookup + water hookup).

```
SOLAR SITES (no hookups, good for solar-equipped vehicles):

12. Solar Site 1
    slug: solar-site-1
    hipcamp_rating: 97% (15 reviews)
    sleeps: 4
    max_vehicle_length: 22ft
    hipcamp_price: from $30/night (for 1 guest)
    description: "Located on the upper lot just before the Blue Barn. This spot gets sunshine all day so it's perfect for a vehicle with solar panels. It's very quiet, with just one neighboring spot for another campervan, is great for your dogs to roam with an open field in front of it, and still very convenient being just a 2 minute walk to the barn's amenities, and about a 5 minute walk down to the creek."
    amenities: [barn_access, kitchen, showers, toilets, laundry, gym, coworking, wifi, all_day_sun, quiet, dog_friendly, field]

13. Solar Site 2
    slug: solar-site-2
    hipcamp_rating: (listed)
    sleeps: 2
    max_vehicle_length: 22ft
    hipcamp_price: from $30/night (for 1 guest)
    amenities: [barn_access, kitchen, showers, toilets, laundry, gym, coworking, wifi, all_day_sun]

14. Solar Site 4
    slug: solar-site-4
    hipcamp_rating: (listed)
    sleeps: 2
    max_vehicle_length: 22ft
    hipcamp_price: from $40/night
    description: "(Formerly Site 3) Situated on the backside of the barn. The best way to park is parallel to the barn. You'll have plenty of room and privacy in this space. The site gets sun in the afternoon, but is shaded by the barn's walls for the first half of the day."
    amenities: [barn_access, kitchen, showers, toilets, laundry, gym, coworking, wifi, afternoon_sun, privacy]

15. Solar Site 5
    slug: solar-site-5
    hipcamp_rating: (booked 2 times)
    sleeps: 2
    max_vehicle_length: 22ft
    hipcamp_price: from $40/night
    amenities: [barn_access, kitchen, showers, toilets, laundry, gym, coworking, wifi]

16. Solar Site 8
    slug: solar-site-8
    hipcamp_rating: (1 review)
    sleeps: 2
    max_vehicle_length: 22ft
    hipcamp_price: from $40/night
    description: "(Formerly Site 7) Situated between Sites 7 and 9 on the south side of the main parking lot. This site gets sunshine all day long and is great for vehicles with solar panels."
    amenities: [barn_access, kitchen, showers, toilets, laundry, gym, coworking, wifi, all_day_sun]

17. Solar Site 9
    slug: solar-site-9
    hipcamp_rating: (listed)
    sleeps: 2
    max_vehicle_length: 22ft
    hipcamp_price: from $40/night
    amenities: [barn_access, kitchen, showers, toilets, laundry, gym, coworking, wifi]

POWER SITES (electrical hookup + water hookup):

18. Power Site 3
    slug: power-site-3
    hipcamp_rating: (listed)
    sleeps: 4
    max_vehicle_length: 22ft
    hipcamp_price: from $50/night
    amenities: [barn_access, kitchen, showers, toilets, laundry, gym, coworking, wifi, electrical_hookup, water_hookup]

19. Power Site 6
    slug: power-site-6
    hipcamp_rating: (listed)
    sleeps: 2
    max_vehicle_length: 22ft
    hipcamp_price: from $50/night
    amenities: [barn_access, kitchen, showers, toilets, laundry, gym, coworking, wifi, electrical_hookup, water_hookup]

20. Power Site 7
    slug: power-site-7
    hipcamp_rating: (listed)
    sleeps: 2
    max_vehicle_length: 22ft
    hipcamp_price: from $50/night
    amenities: [barn_access, kitchen, showers, toilets, laundry, gym, coworking, wifi, electrical_hookup, water_hookup]

All van sites share this base description:
"The Blue Barn @ Camp Cedar Creek sits on a hill above the creekside campground providing beautiful views of the forest, creek, ponds, and meadows below. There are 9 open parking spots situated around the barn for vehicle dwellers to stay and utilize the shared amenities inside the structure, including 2 bathrooms w/ showers, a large communal kitchen, a quiet co-working space with fast wifi, a rec area with gym mats and equipment, ping pong and darts, and laundry."
```

#### Glamping / Lodging (type: glamping) — 1 site
```
21. Trailer Glampsite 10 (NEW)
    slug: glampsite-10
    hipcamp_rating: 100% (2 reviews)
    sleeps: 2
    bedrooms: 1
    beds: 1 (queen)
    hipcamp_price: from $105/night
    description: "If you're looking for comfort, privacy, and beautiful forest and creek views, you've found the perfect spot! Our newest 'glampsite' is a spacious 19' renovated camper, complete with a queen size bed, dining area, mini fridge and lots of space to store your belongings. Your site also includes a picnic table, BBQ, and fire pit with two Adirondack chairs. Located up on the hill in close proximity to the Blue Barn, your reservation includes access to the barn's amenities, including full kitchen, flush toilets and hot showers, fast wifi and coworking space, game room and rec area. A short walk down the hill will take you to the creek and access to the trail system across the way. Note: we do not allow usage of the bathroom inside the trailer. You will need to use the Barn's facilities (less than a one-minute walk)."
    amenities: [queen_bed, dining_area, mini_fridge, picnic_table, bbq, fire_pit, adirondack_chairs, barn_access, kitchen, showers, toilets, wifi, coworking, forest_views, creek_views]
```

#### Event Space (type: event, inquiry-only)
```
22. The Loft & Grounds (slug: event-space)
    short_desc: "37 acres of forest, creek, and community space — perfect for your next gathering."
    description: "Host your event at Camp Cedar Creek — 37 acres of forested land just 30 minutes from Portland. 'The Loft,' located on the 2nd and 3rd floors of The Blue Barn, is a multi-purpose space with high-speed internet, breakout areas, and a variety of workstations framed by windows with forest and creek views. Capacity up to 25 for indoor events. For larger celebrations, reserve all 10 waterside campsites together for a full-property buyout. Perfect for weddings, birthdays, anniversaries, corporate offsites, retreats, and ticketed events."
    amenities: [indoor_event_space, wifi, kitchen, bathrooms, creek_access, campfire, full_property_buyout_available]
    max_guests: 25 (indoor) / 50+ (full property)
    booking_type: inquiry_only
    NOTE: Listed on Peerspace currently
```

#### Cedar Creek Cottage (type: cottage) — listed on Airbnb separately
```
23. Cedar Creek Cottage (slug: cedar-creek-cottage)
    airbnb_price: ~$150/night
    description: "A peaceful standalone cottage on the property. Full indoor experience amidst the beauty of Camp Cedar Creek. Perfect for families, groups, or anyone who wants the campground atmosphere with the comfort of a real bed, kitchen, and bathroom."
    amenities: [full_kitchen, bathroom, bedroom, heating, private]
    max_guests: TBD (confirm with owners)
    NOTE: Currently on Airbnb. Confirm with owners if they want this on the booking system or keep it Airbnb-only for now.
```

### Summary: 23 Total Bookable Units

| Category | Count | Type in System | Booking Type |
|---|---|---|---|
| Tent-only campsites | 3 | tent | Instant book |
| RV/Tent campsites | 7 + 1 combo | rv_tent | Instant book |
| Van solar sites | 6 | van_solar | Instant book |
| Van power sites | 3 | van_power | Instant book |
| Glamping trailer | 1 | glamping | Instant book |
| Event space | 1 | event | Inquiry only |
| Cottage | 1 | cottage | Instant book (TBD) |

### Pricing (Real, from Hipcamp)

```
Tent-only sites:         $45 - $120/night (varies by site size/desirability)
RV/Tent sites:           $45 - $240/night (varies by site; Puffball is premium at $240)
Combo (FR+CC):           $210/night
Van solar sites:         $30 - $40/night
Van power sites:         $50/night
Glampsite trailer:       $105/night
Cottage (Airbnb):        ~$150/night

NOTE: Hipcamp prices are likely base prices. Weekend/seasonal differentials TBD with owners.
The system should still support weekday/weekend + seasonal pricing rules per site.
```

### Add-Ons
```
- Firewood Bundle ($10, qty: up to 5, available for: tent, rv_tent, van_solar, van_power, glamping, cottage)
- Extra Vehicle Parking ($10/night, qty: 1, available for: tent, rv_tent)
- Blue Barn Day Pass ($15/person, qty: up to 8, available for: tent, rv_tent)
  — Creekside campers don't have barn access by default; this add-on grants it
- Equipment Rental - Camp Chair ($5, qty: up to 4, available for: tent, rv_tent)
- Equipment Rental - Lantern ($5, qty: up to 2, available for: tent, rv_tent)
```

---

## Project Structure

```
camp-cedar-creek-booking/
├── src/
│   ├── app/
│   │   ├── layout.tsx              — Root layout, fonts, metadata
│   │   ├── page.tsx                — Homepage
│   │   ├── sites/
│   │   │   ├── page.tsx            — Browse all sites
│   │   │   ├── [type]/
│   │   │   │   ├── page.tsx        — Category page
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx    — Site detail
│   │   ├── book/
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx        — Booking flow (multi-step)
│   │   │   └── confirmation/
│   │   │       └── [id]/
│   │   │           └── page.tsx    — Booking confirmation
│   │   ├── booking/
│   │   │   └── [token]/
│   │   │       └── page.tsx        — Manage booking (magic link)
│   │   ├── events/
│   │   │   ├── page.tsx            — Event space + inquiry form
│   │   │   └── submitted/
│   │   │       └── page.tsx        — Inquiry confirmation
│   │   └── api/
│   │       ├── stripe/
│   │       │   └── webhook/
│   │       │       └── route.ts    — Stripe webhook handler
│   │       ├── ical/
│   │       │   └── [siteId]/
│   │       │       └── route.ts    — iCal feed per site
│   │       ├── bookings/
│   │       │   ├── availability/
│   │       │   │   └── route.ts    — Check availability
│   │       │   └── cancel/
│   │       │       └── route.ts    — Cancel booking
│   │       └── cron/
│   │           └── emails/
│   │               └── route.ts    — Daily email cron
│   ├── components/
│   │   ├── ui/                     — shadcn/ui components
│   │   ├── site-card.tsx
│   │   ├── site-gallery.tsx
│   │   ├── availability-calendar.tsx
│   │   ├── booking-form/
│   │   │   ├── date-step.tsx
│   │   │   ├── addons-step.tsx
│   │   │   ├── guest-info-step.tsx
│   │   │   ├── waiver-step.tsx
│   │   │   └── review-step.tsx
│   │   ├── event-inquiry-form.tsx
│   │   ├── signature-pad.tsx
│   │   └── price-calculator.tsx
│   ├── lib/
│   │   ├── directus.ts             — Directus SDK client
│   │   ├── stripe.ts               — Stripe client + helpers
│   │   ├── email.ts                — Resend client
│   │   ├── availability.ts         — Availability checking logic
│   │   ├── pricing.ts              — Price calculation logic
│   │   ├── ical.ts                 — iCal generation + parsing
│   │   └── waiver-pdf.ts           — PDF generation for waivers
│   ├── emails/                     — React Email templates
│   │   ├── booking-confirmation.tsx
│   │   ├── pre-arrival.tsx
│   │   ├── day-before-reminder.tsx
│   │   ├── post-stay.tsx
│   │   ├── event-inquiry-received.tsx
│   │   ├── event-inquiry-notify-owner.tsx
│   │   ├── event-approved.tsx
│   │   ├── event-declined.tsx
│   │   └── cancellation-confirmation.tsx
│   └── types/
│       └── index.ts                — TypeScript types matching data model
├── public/
│   └── images/                     — Placeholder site photos
├── .env.local                      — Environment variables (see below)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## Environment Variables

```env
# Directus
DIRECTUS_URL=https://your-instance.railway.app
DIRECTUS_TOKEN=your-static-token-for-server-side

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend
RESEND_API_KEY=re_...

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=camp-cedar-creek

# App
NEXT_PUBLIC_APP_URL=https://book.campcedarcreek.com
CRON_SECRET=random-secret-for-cron-auth
```

---

## Build Order (for the PoC)

Focus on getting a working demo deployed. Prioritize the happy path.

### Step 1: Scaffold
- `npx create-next-app@latest` with App Router, TypeScript, Tailwind
- Install shadcn/ui, add core components (Button, Card, Calendar, Dialog, Input, etc.)
- Set up project structure per the tree above
- Create TypeScript types for the data model

### Step 2: Directus + Database
- Spin up Directus on Railway with PostgreSQL
- Create all collections matching the data model
- Set up roles (Owner, Admin)
- Seed placeholder data (sites, pricing rules, add-ons)
- Test API access from Next.js using `@directus/sdk`

### Step 3: Browse & Detail Pages
- Homepage with hero, site category cards
- Category pages listing sites with photos, rates, availability indicator
- Site detail page: photo gallery, description, amenities, pricing table, availability calendar
- Wire up to Directus API for real data

### Step 4: Booking Flow
- Multi-step form component
- Date picker with availability checking (query Directus for bookings + blocked dates)
- Price calculation (apply pricing rules per night)
- Add-ons selector
- Guest info form
- Waiver signature pad (use `react-signature-canvas`)
- Review/summary step
- Stripe Checkout Session creation → redirect to Stripe → return to confirmation page

### Step 5: Stripe Webhook
- Handle `checkout.session.completed` event
- Create/update booking record in Directus
- Generate waiver PDF and upload to R2
- Trigger confirmation email via Resend

### Step 6: Deploy
- Deploy Next.js to Vercel
- Configure environment variables
- Set up custom domain (book.campcedarcreek.com) or use Vercel preview URL for demo
- Test end-to-end with Stripe test mode

### Step 7 (post-PoC): Complete MVP
- Email templates (all 9)
- Cron job for scheduled emails
- Event inquiry form + admin approval flow
- Magic link booking management
- iCal export/import
- Cancellation flow with configurable policy

---

## Design Guidelines

Match the existing campcedarcreek.com aesthetic — minimal, photo-forward, modern.

- **Vibe**: Clean, minimal, photo-driven. Black and white with large photography providing warmth. Think "nice Airbnb listing" not "enterprise SaaS."
- **Colors**: Black `#000000` buttons/accents, near-black `#1f1f1d` text, white/off-white `#ffffff`/`#fffefe` backgrounds. No bright accent colors — the photography IS the color.
- **Typography**: **Poppins** (headings, 600-700 weight) and **Roboto** (body, 300-400 weight) — matching the existing Webflow site exactly. Import via Google Fonts.
- **Photos**: Large, full-bleed hero images drive the experience. Big hero shots, gallery lightbox on detail pages. The site currently has 62 images — plenty to work with.
- **Buttons**: Solid black with white text, matching the current site. Rounded corners, generous padding.
- **Logo**: Use the square logo (no text) from the brand assets section. Place it in the nav bar.
- **Mobile-first**: Design for phone screens first. Most campers browse on mobile.
- **Whitespace**: Very generous. Don't crowd the layouts. The current site is spacious and airy.
- **Components**: Use shadcn/ui but override the default theme to match the black/white brand. Customize the Calendar, Card, Button, and Dialog components.

---

## Notes & Constraints

- This is a **standalone app**, NOT integrated into the Webflow site. It's linked from Webflow via a "Book Now" button.
- **No guest accounts** for MVP. Guest checkout only. Email + magic link for booking management.
- **Placeholder photos** are fine for PoC. Real photos will be swapped in during polish phase.
- **Placeholder pricing** is fine for PoC. Owners will confirm real rates.
- **Event space** uses an inquiry/approval flow, NOT instant booking.
- The owners need to be able to manage day-to-day bookings in Directus without technical knowledge. Keep the admin experience simple.
- Keep the **waiver text** as a placeholder in settings — owners will provide the real legal text.
- **iCal sync is critical** for the transition period where bookings come through both this system and Hipcamp/Airbnb.
