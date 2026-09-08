/**
 * Build guest profiles from the bookings that already exist, and optionally
 * add a few example regulars so the screens can be judged with something in
 * them.
 *
 *   npx tsx scripts/seed-guests.ts                 # backfill from real bookings
 *   npx tsx scripts/seed-guests.ts --examples      # + demo regulars
 *   npx tsx scripts/seed-guests.ts --remove-examples
 *
 * Idempotent: matching is by email, phone, then name, so running twice does
 * not create duplicates.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { attachGuestToBooking } from "../src/lib/guests/attach";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Plausible Oregon regulars. Deliberately exercising the hard cases: one
// guest who books under two different emails but the same phone, one Hipcamp
// booking with a name and no email, and two different people called Chris Nguyen.
const EXAMPLES: {
  guest: { firstName: string; lastName: string; email?: string; phone?: string };
  stays: { slug: string; site: string; checkIn: string; checkOut: string; nights: number; guests: number; total: number }[];
}[] = [
  {
    guest: { firstName: "Marisol", lastName: "Vega", email: "marisol.vega@gmail.com", phone: "503-555-0142" },
    stays: [
      { slug: "chanterelle", site: "Chanterelle", checkIn: "2025-06-13", checkOut: "2025-06-15", nights: 2, guests: 4, total: 190 },
      { slug: "chanterelle", site: "Chanterelle", checkIn: "2025-09-05", checkOut: "2025-09-08", nights: 3, guests: 4, total: 285 },
      { slug: "puffball", site: "Puffball", checkIn: "2026-06-19", checkOut: "2026-06-21", nights: 2, guests: 6, total: 240 },
    ],
  },
  {
    // Same person, new work email, same phone: must merge on the phone.
    guest: { firstName: "Marisol", lastName: "Vega", email: "mvega@studio.co", phone: "(503) 555-0142" },
    stays: [{ slug: "lions-mane", site: "Lion's Mane", checkIn: "2026-08-14", checkOut: "2026-08-16", nights: 2, guests: 2, total: 170 }],
  },
  {
    guest: { firstName: "Danny", lastName: "Okafor", email: "d.okafor@fastmail.com", phone: "971-555-0188" },
    stays: [
      { slug: "solar-site-2", site: "Solar Site 2", checkIn: "2025-10-03", checkOut: "2025-10-06", nights: 3, guests: 2, total: 120 },
      { slug: "solar-site-2", site: "Solar Site 2", checkIn: "2026-04-17", checkOut: "2026-04-19", nights: 2, guests: 2, total: 80 },
    ],
  },
  {
    // The Hipcamp shape: a name, no email, no phone.
    guest: { firstName: "Priya", lastName: "Raman" },
    stays: [
      { slug: "turkey-tail", site: "Turkey Tail", checkIn: "2025-07-25", checkOut: "2025-07-27", nights: 2, guests: 3, total: 170 },
      { slug: "turkey-tail", site: "Turkey Tail", checkIn: "2026-07-24", checkOut: "2026-07-26", nights: 2, guests: 3, total: 180 },
    ],
  },
  {
    guest: { firstName: "Chris", lastName: "Nguyen", email: "chris.nguyen@outlook.com", phone: "503-555-0210" },
    stays: [{ slug: "fairy-ring", site: "Fairy Ring", checkIn: "2026-05-22", checkOut: "2026-05-24", nights: 2, guests: 2, total: 160 }],
  },
  {
    // A different Chris Nguyen. Must NOT merge with the one above.
    guest: { firstName: "Chris", lastName: "Nguyen", email: "cnguyen@pdxmail.com", phone: "971-555-0333" },
    stays: [{ slug: "morel", site: "Morel", checkIn: "2026-09-18", checkOut: "2026-09-20", nights: 2, guests: 2, total: 150 }],
  },
];

(async () => {
  const payload = await getPayload({ config });
  const wantExamples = process.argv.includes("--examples");
  const removeExamples = process.argv.includes("--remove-examples");

  if (removeExamples) {
    const gs = await payload.find({ collection: "guests", where: { isExample: { equals: true } }, pagination: false, depth: 0 });
    for (const g of gs.docs as any[]) {
      const bs = await payload.find({ collection: "bookings", where: { guestProfile: { equals: g.id } }, pagination: false, depth: 0 });
      for (const b of bs.docs as any[]) await payload.delete({ collection: "bookings", id: b.id });
      await payload.delete({ collection: "guests", id: g.id });
    }
    console.log(`removed ${gs.docs.length} example guests and their bookings`);
    process.exit(0);
  }

  // --- backfill from whatever is already in the database ---
  const existing = await payload.find({
    collection: "bookings",
    where: { isTest: { not_equals: true } },   // the guest list is for real people
    pagination: false,
    depth: 0,
    sort: "checkIn",
  });
  let linked = 0;
  for (const b of existing.docs as any[]) {
    if (b.guestProfile) continue;
    const r = await attachGuestToBooking(b.id, b.guest ?? {});
    if (r) {
      linked++;
      console.log(`  ${b.confirmationCode}  ->  guest ${r.guestId} (${r.created ? "new" : r.basis})`);
    }
  }
  console.log(`backfilled ${linked} booking${linked === 1 ? "" : "s"}`);

  if (!wantExamples) process.exit(0);

  // --- example regulars ---
  console.log("\nexamples:");
  for (const ex of EXAMPLES) {
    for (const stay of ex.stays) {
      const site = await payload.find({ collection: "sites", where: { slug: { equals: stay.slug } }, limit: 1, depth: 0 });
      const siteDoc: any = site.docs[0];
      const doc: any = await payload.create({
        collection: "bookings",
        data: {
          site: siteDoc?.id,
          siteSlug: stay.slug,
          siteName: stay.site,
          checkIn: stay.checkIn,
          checkOut: stay.checkOut,
          nights: stay.nights,
          guests: stay.guests,
          guest: {
            firstName: ex.guest.firstName,
            lastName: ex.guest.lastName,
            email: ex.guest.email ?? `${ex.guest.firstName}.${ex.guest.lastName}@example.invalid`.toLowerCase(),
            phone: ex.guest.phone ?? "",
          },
          addOns: [],
          nightlyBreakdown: [],
          subtotal: stay.total,
          addOnsTotal: 0,
          total: stay.total,
          waiverSigned: true,
          status: stay.checkOut < new Date().toISOString().slice(0, 10) ? "completed" : "confirmed",
          source: ex.guest.email ? "direct" : "hipcamp",
        },
      });
      // Match on exactly what a real booking would carry: no email for the
      // Hipcamp-shaped guest.
      const r = await attachGuestToBooking(doc.id, {
        firstName: ex.guest.firstName,
        lastName: ex.guest.lastName,
        email: ex.guest.email ?? null,
        phone: ex.guest.phone ?? null,
      });
      if (r) {
        await payload.update({ collection: "guests", id: r.guestId, data: { isExample: true } });
        console.log(`  ${stay.site} ${stay.checkIn}  ${ex.guest.firstName} ${ex.guest.lastName}  ->  guest ${r.guestId} (${r.created ? "new" : r.basis})`);
      }
    }
  }

  const all = await payload.find({ collection: "guests", pagination: false, depth: 0, sort: "-stayCount" });
  console.log("\nguests now:");
  for (const g of all.docs as any[]) {
    console.log(
      `  ${String(g.id).padEnd(3)} ${String(g.displayName).padEnd(22)} stays ${String(g.stayCount).padEnd(3)} nights ${String(g.nightsTotal).padEnd(3)} $${String(g.spendTotal).padEnd(5)} ${g.needsReview ? "NEEDS REVIEW" : ""}`
    );
  }
  process.exit(0);
})();
