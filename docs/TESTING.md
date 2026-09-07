# Testing the booking site with the owners

Staging: **https://camp-cedar-creek-booking.bzy.design**
Admin: **https://camp-cedar-creek-booking.bzy.design/admin** (login from Jeff)

This is the real system on a real database (Neon Postgres), with real
emails, running in **demo-payment mode**: there are no Stripe keys yet, so a
booking confirms immediately with no card step. Everything else — the
calendar, pricing, blocked dates, confirmation emails, the guest's manage
page, cancellation and refund math, the iCal feeds Hipcamp will read — is
exactly what launches.

Every test booking goes into the database. That's fine; they are deleted
before go-live. Use your own email addresses so you see what guests see.

## 1. Book a site as a guest (10 min)

1. Open the staging URL. Browse **Sites** → pick a creekside site (Fairy
   Ring, Chanterelle…) → the detail page shows photos, amenities, rules,
   the calendar, and the price per night.
2. Pick check-in / check-out in the sticky booking widget, set guests,
   **Book now**.
3. The booking form: guest details, add-ons (firewood, etc.), the waiver
   with signature, review the total. Submit.
4. Confirmation page shows the **confirmation code** (`CCC-XXXXXX`).
5. Check the email you used: **booking confirmation** with the dates, total,
   and a **Manage your booking** link.

What to look at with the owners: is the nightly pricing right for weekdays,
weekends, holidays? Are the add-ons and their prices right? Is the waiver
text what they want (it's placeholder until they supply theirs)?

## 2. Watch it block the calendar (2 min)

Go back to that site's detail page. The nights you booked are now
unavailable; the **checkout day is still bookable** (that's correct —
checkout morning, next guest checks in that afternoon).

## 3. Manage and cancel as the guest (5 min)

1. Click **Manage your booking** in the email (a private link — no login).
2. The page shows the booking and the **refund you'd get if you cancelled
   today**, computed from the cancellation policy in Settings: full refund
   14+ days out, 50% between 14 and 2 days, nothing inside 48 hours.
3. Cancel with a reason. You get a **cancellation email**; the dates reopen
   on the calendar immediately.

## 4. The owners' side: the admin (10 min)

Log in at `/admin`.

- **Bookings** — every booking, its status (pending / confirmed / cancelled
  / completed / refunded), guest, dates, totals, the cancellation reason.
  Bookings are never deleted, only status-changed.
- **Sites** — all 21 units: name, type, capacity, nightly rates
  (weekday / weekend / holiday), amenities, photos, rules, and the
  **iCal import URLs** field (where Hipcamp's calendar link goes later).
- **Blocked dates** — manual blocks (maintenance, personal use) plus
  anything imported from Hipcamp. Add one and watch it disappear from the
  public calendar.
- **Add-ons** — firewood etc. with prices and which site types they apply to.
- **Event inquiries** — submissions from the Events page form.
- **Settings** — cancellation policy numbers, house rules, host info, the
  amenities list shown on every site.

Change a nightly rate in Sites and reload the public detail page: it
updates immediately.

## 5. Events inquiry (2 min)

**Events** page → fill the inquiry form → submit. The owners' notification
goes to `OWNER_NOTIFY_EMAIL` (Jeff's inbox on staging), the guest gets an
acknowledgement, and the inquiry appears in the admin.

## 6. The Hipcamp sync, explained (no action yet)

Each site has a calendar feed at
`/api/ical/<site-slug>.ics` — for example
https://camp-cedar-creek-booking.bzy.design/api/ical/fairy-ring.ics. At
launch, that URL gets pasted into Hipcamp (and Airbnb for the cottage) so a
direct booking here blocks the dates there. In the other direction,
Hipcamp's export URL goes into the site's **iCal import URLs** in the
admin, and a cron pulls it every 15 minutes into Blocked dates. iCal is the
only channel Hipcamp offers; the delay is theirs, not ours.

## What is not on yet

- **Payments.** Stripe is code-complete and switched off by the absence of
  keys. Turning it on is a test-mode key pair plus one redeploy; then the
  booking form hands off to Stripe Checkout and the booking sits `pending`
  until payment confirms it.
- **Photos on uploads.** Site photos are remote URLs today. Uploading new
  photos through the admin needs a storage adapter (Vercel Blob) — small,
  not done.
- **Reviews and the 4.9 rating** are seed data, fabricated for the demo.
  Replaced with real Hipcamp reviews (or removed) before launch.
- **Waiver text and pricing** are placeholders until the owners confirm.
- `/contact` and `/privacy` footer links go nowhere yet.

## Launch checklist (for the meeting, not today)

Owners' Stripe account and live keys · `book.campcedarcreek.com` DNS ·
Hipcamp iCal URLs both directions · real waiver text · confirmed rates ·
real reviews · `hello@campcedarcreek.com` verified for sending · delete the
test bookings.
