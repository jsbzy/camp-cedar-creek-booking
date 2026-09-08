#!/usr/bin/env node
/**
 * The whole guest journey, end to end, against a running site:
 *
 *   node scripts/booking-smoketest.mjs <base-url> [resend-api-key]
 *
 * Books a site, checks the price maths and the add-on maths, confirms the
 * confirmation email actually went out, checks the nights are blocked and the
 * checkout day is not, checks the Hipcamp calendar feed carries it, opens the
 * guest's magic link and reads the refund quote, cancels, and checks the dates
 * reopen and the feed drops it.
 *
 * Safe to run against production: it books far in the future on a fixed test
 * site, labels the guest TEST, and cancels itself at the end. Pass a Resend
 * key to also assert both emails were delivered.
 */
const [, , BASE, ...rest] = process.argv;
const RESEND_KEY = rest.find((a) => a.startsWith("re_"));
const CRON_SECRET = rest.find((a) => !a.startsWith("re_") && !a.startsWith("--"));
const WANT_EMAILS = rest.includes("--emails");
if (!BASE) {
  console.error(`usage: booking-smoketest.mjs <base-url> [cron-secret] [resend-key] [--emails]

  cron-secret  marks the bookings as tests, so the OWNERS ARE NEVER EMAILED.
               Without it the run books as a normal guest and everyone gets mail.
  --emails     also send the guest's own emails, so delivery can be checked.
               Off by default: routine runs are silent.
  resend-key   with --emails, assert both guest emails were delivered.`);
  process.exit(2);
}
// Identify the run to the server. Without a secret the server has no way to
// know this is a test: the booking counts as real, it lands in the owners'
// inbox, and it spawns a guest record that will claim the tester's email as a
// matching key. A warning was not enough, because the cost of missing it lands
// on the client and not on whoever typed the command. So: against anything
// that is not localhost, no secret is a hard stop.
const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(BASE);
if (!CRON_SECRET && !LOCAL) {
  console.error(`refusing to run against ${BASE} without a cron secret.

  Without it the server treats this as a real booking: the owners get mail and
  a guest record is created. Pass the secret as the second argument:

      npm run test:booking -- ${BASE} "$CRON_SECRET"

  It is CRON_SECRET in .env.local. To test against a local server instead, use
  http://localhost:3000, where no secret is required.`);
  process.exit(2);
}
const testHeaders = CRON_SECRET
  ? { "x-smoketest": CRON_SECRET, ...(WANT_EMAILS ? { "x-smoketest-emails": "send" } : {}) }
  : {};
if (!CRON_SECRET) console.log("!! no cron secret: booking as a real guest against a local server\n");
else console.log(WANT_EMAILS ? "emails: guest only (owners never)\n" : "emails: none (pass --emails to exercise them)\n");

let n = 0;
let fails = 0;
const ok = (name, cond, detail) => {
  n++;
  if (cond) console.log("ok   " + name);
  else {
    fails++;
    console.log("FAIL " + name + (detail !== undefined ? "\n       " + String(detail).slice(0, 300) : ""));
  }
};
const step = (s) => console.log(`\n--- ${s} ---`);

// Far enough out that it can never collide with a real booking.
const SITE = "amanita";
const YEAR = new Date().getFullYear() + 2;
const IN = `${YEAR}-11-13`; // Friday-ish; exact weekday does not matter to the test
const OUT = `${YEAR}-11-15`;
const NEXT = `${YEAR}-11-16`;
const MARK = "smoketest-" + Date.now().toString(36);
const EMAIL = process.env.SMOKE_EMAIL || "jeff@bzydesign.com";

const j = async (path, init) => {
  const r = await fetch(BASE + path, init);
  const text = await r.text();
  try {
    return { status: r.status, body: JSON.parse(text) };
  } catch {
    return { status: r.status, body: text };
  }
};
const availability = async (start, end) =>
  (await j(`/api/bookings/availability?slug=${SITE}&start=${start}&end=${end}`)).body.availability || [];

/* ---------------- 0. clear anything a killed run left behind ---------------- */
// A previous run that was interrupted (piped through `head`, Ctrl-C) can leave
// its booking in place and block the window forever. Cancel leftovers first so
// the suite heals itself instead of needing a human.
step("before");
{
  const stale = (await j(`/api/bookings/availability?slug=${SITE}&start=${IN}&end=${NEXT}`)).body.availability || [];
  if (stale.some((d) => !d.available) && CRON_SECRET) {
    const res = await fetch(`${BASE}/api/bookings/cleanup-tests?slug=${SITE}&from=${IN}&to=${NEXT}`, {
      method: "POST",
      headers: { "x-smoketest": CRON_SECRET },
    });
    if (res.ok) {
      const { cancelled } = await res.json();
      if (cancelled) console.log(`     (cleared ${cancelled} leftover test booking${cancelled === 1 ? "" : "s"})`);
    }
  }
}
const before = await availability(IN, NEXT);
ok("availability answers for the test window", before.length === 4, JSON.stringify(before).slice(0, 160));
ok("the test nights start open", before.every((d) => d.available), JSON.stringify(before.filter((d) => !d.available)));
if (!before.every((d) => d.available)) {
  console.log("\nThe test window is not clear; another run may be in flight. Stopping.");
  process.exit(1);
}
const nightly = before.slice(0, 2).reduce((a, d) => a + d.price, 0);

/* ---------------- 1. price quote matches the calendar ---------------- */
step("price");
const quote = (await j("/api/bookings/price", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ siteSlug: SITE, checkIn: IN, checkOut: OUT, addOns: [] }),
})).body;
ok("two nights quoted", quote.nights === 2, JSON.stringify(quote).slice(0, 160));
ok("the quote matches the calendar's own prices", quote.subtotal === nightly, `quote ${quote.subtotal} vs calendar ${nightly}`);

/* ---------------- 2. book it, with an add-on ---------------- */
step("book");
const addOns = [{ addOnId: "1", name: "Firewood Bundle", quantity: 2, unitPrice: 12, perNight: true }];
const created = await j("/api/bookings/create", {
  method: "POST",
  headers: { "content-type": "application/json", ...testHeaders },
  body: JSON.stringify({
    siteSlug: SITE,
    siteName: "Amanita",
    checkIn: IN,
    checkOut: OUT,
    guests: 2,
    guest: { firstName: "TEST", lastName: `(automated ${MARK})`, email: EMAIL, phone: "000-000-0000" },
    addOns,
    waiverSigned: true,
    waiverSignature: "TEST",
  }),
});
const b = created.body.booking;
ok("booking created", created.status === 201 && !!b, JSON.stringify(created.body).slice(0, 200));
if (!b) process.exit(1);
ok("it is confirmed (no Stripe keys) or pending (with them)", ["confirmed", "pending"].includes(b.status), b.status);
ok("it has a confirmation code", /^CCC-[0-9A-F]{6}$/.test(b.id), b.id);
ok("add-on priced per night, times quantity", b.addOnsTotal === 12 * 2 * 2, `addOnsTotal ${b.addOnsTotal}`);
ok("total is lodging plus add-ons", b.total === b.subtotal + b.addOnsTotal, `${b.total} vs ${b.subtotal}+${b.addOnsTotal}`);
ok("the guest gets a magic link token", !!b.magicLinkToken);

/* ---------------- 3. the confirmation email actually went ---------------- */
step("email");
// confirmationSentAt is stamped only when the mail provider accepted the
// message, so this is a real signal rather than a hopeful one.
if (WANT_EMAILS || !CRON_SECRET) {
  let sentAt = null;
  for (let i = 0; i < 12 && !sentAt; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    sentAt = (await j(`/api/bookings/status?token=${b.magicLinkToken}`)).body?.confirmationSentAt ?? null;
  }
  ok("confirmation email was accepted by the mail provider", !!sentAt, sentAt ? `at ${sentAt}` : "confirmationSentAt never appeared within 18s");
} else {
  console.log("     (skipped: emails off for this run)");
}

/* ---------------- 4. the calendar closed ---------------- */
step("calendar");
const after = await availability(IN, NEXT);
const byDate = Object.fromEntries(after.map((d) => [d.date, d.available]));
ok("check-in night is blocked", byDate[IN] === false, JSON.stringify(byDate));
ok("second night is blocked", byDate[OUT.replace(/(\d+)$/, (m) => String(Number(m) - 1))] === false, JSON.stringify(byDate));
ok("checkout day stays bookable", byDate[OUT] === true, JSON.stringify(byDate));
ok("the night after is untouched", byDate[NEXT] === true, JSON.stringify(byDate));

/* ---------------- 5. the Hipcamp feed carries it ---------------- */
step("calendar feed");
const feed = await (await fetch(`${BASE}/api/ical/${SITE}.ics`)).text();
ok("the feed is a calendar", feed.startsWith("BEGIN:VCALENDAR"), feed.slice(0, 60));
ok("it contains this booking", feed.includes(b.id) || feed.includes(IN.replace(/-/g, "")), "looked for " + b.id);

/* ---------------- 6. the guest's own page ---------------- */
step("guest manage page");
const manage = await (await fetch(`${BASE}/booking/${b.magicLinkToken}`)).text();
ok("the magic link opens without a login", manage.includes("Amanita"), manage.slice(0, 120));
ok("it quotes a refund", /refund/i.test(manage));
ok("it offers to cancel", /cancel/i.test(manage));

/* ---------------- 7. cancel ---------------- */
step("cancel");
const cancelled = await j("/api/bookings/cancel", {
  method: "POST",
  headers: { "content-type": "application/json", ...testHeaders },
  body: JSON.stringify({ token: b.magicLinkToken, reason: `Automated smoketest ${MARK}` }),
});
ok("cancellation accepted", cancelled.status === 200 && cancelled.body.booking?.status === "cancelled", JSON.stringify(cancelled.body).slice(0, 160));
ok("a refund amount was computed", typeof cancelled.body.booking?.refundAmount === "number", String(cancelled.body.booking?.refundAmount));

/* ---------------- 8. everything reopens ---------------- */
step("after");
const reopened = await availability(IN, NEXT);
ok("all nights are bookable again", reopened.every((d) => d.available), JSON.stringify(reopened.filter((d) => !d.available)));
const feed2 = await (await fetch(`${BASE}/api/ical/${SITE}.ics`)).text();
ok("the feed dropped it", !feed2.includes(b.id));
const status = (await j(`/api/bookings/status?token=${b.magicLinkToken}`)).body;
ok("the booking is kept, not deleted", status?.status === "cancelled", JSON.stringify(status));

/* ---------------- 8b. the guest asks a question ---------------- */
step("messages");
const msgUrl = `${BASE}/api/bookings/messages?token=${b.magicLinkToken}`;
const empty = await (await fetch(msgUrl)).json();
ok("the thread starts empty", Array.isArray(empty.messages) && empty.messages.length === 0);

const asked = await fetch(msgUrl, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ body: `Is there firewood on site? ${MARK}` }),
});
ok("a guest can write on their own booking", asked.status === 201, `HTTP ${asked.status}`);

const thread = await (await fetch(msgUrl)).json();
ok("the message is on the thread", thread.messages?.some((m) => m.body.includes(MARK)));
ok("it is filed as from the guest", thread.messages?.[0]?.from === "guest");

const blank = await fetch(msgUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body: "   " }) });
ok("an empty message is refused", blank.status === 400);

const noToken = await fetch(`${BASE}/api/bookings/messages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body: "hello" }) });
ok("no token is refused", noToken.status === 400);
const badToken = await fetch(`${BASE}/api/bookings/messages?token=not-a-real-token`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body: "hello" }) });
ok("someone else's token is refused", badToken.status === 404);

// The confirmation code is printed on emails and is not a secret, so it must
// not open the thread.
const byCode = await fetch(`${BASE}/api/bookings/messages?token=${b.id}`);
ok("the confirmation code does not open the thread", byCode.status === 404, `HTTP ${byCode.status}`);

/* ---------------- 9. emails, if a Resend key was given ---------------- */
if (RESEND_KEY && (WANT_EMAILS || !CRON_SECRET)) {
  step("email delivery");
  // The provider's list lags a few seconds behind the send, and by more when
  // it is busy. Poll until both of the guest's emails show up rather than
  // sleeping a fixed interval and calling a slow provider a failure.
  let rows = [];
  let mine = [];
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch("https://api.resend.com/emails?limit=20", { headers: { authorization: `Bearer ${RESEND_KEY}` } });
    rows = res.ok ? (await res.json()).data || [] : [];
    mine = rows.filter((e) => (e.subject || "").includes(b.id));
    if (mine.filter((e) => e.last_event === "delivered").length >= 2) break;
  }
  ok("guest confirmation delivered", mine.some((e) => /confirmed/i.test(e.subject) && e.last_event === "delivered"), mine.map((e) => e.subject).join(" | "));
  ok("guest cancellation delivered", mine.some((e) => /cancelled/i.test(e.subject) && e.last_event === "delivered"));
  const owner = rows.filter((e) => (e.to || []).some((a) => a.includes("campcedarcreek.com")));
  ok(
    "the OWNERS were not emailed about a test booking",
    !owner.some((e) => (e.subject || "").includes(b.id)),
    owner.filter((e) => (e.subject || "").includes(b.id)).map((e) => e.subject).join(" | ")
  );
}

console.log(`\n${n - fails}/${n} passed` + (fails ? "  <-- booking flow is broken, do not ship" : ""));
process.exit(fails ? 1 : 0);
