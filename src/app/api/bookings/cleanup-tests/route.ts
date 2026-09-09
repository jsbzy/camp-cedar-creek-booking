import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/data/db";
import { cancelBooking } from "@/lib/data/bookings";

// Cancels test bookings left behind by an interrupted smoketest run, so the
// suite heals itself instead of needing someone to clear the window by hand.
// Only ever touches bookings marked isTest, only with the cron secret, and it
// emails nobody.

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("x-smoketest") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = request.nextUrl;

  // The connector suite creates a page and a site each run to prove that adding
  // things works. Both are named with a smoke prefix and swept here, so the
  // suite is safe to run against production without leaving litter behind.
  if (searchParams.get("what") === "connector") {
    const db = await getDb();
    let removed = 0;
    for (const [collection, prefix] of [["pages", "smoke-"], ["sites", "smokesite-"]] as const) {
      const res = await db.find({ collection, pagination: false, depth: 0, where: { slug: { like: prefix } } });
      for (const doc of res.docs as { id: number | string; slug?: string }[]) {
        if (!doc.slug?.startsWith(prefix)) continue; // `like` is loose; the prefix is the rule
        await db.delete({ collection, id: doc.id });
        removed++;
      }
    }

    // Messages too, and these were the worst of it: reply_to_guest is exercised
    // against the first real booking the suite can find, so a dozen "Firewood is
    // by the barn" replies had accumulated on a real guest's record.
    const msgs = await db.find({ collection: "messages", pagination: false, depth: 0, where: { body: { like: "smoketest-" } } });
    for (const doc of msgs.docs as { id: number | string; body?: string }[]) {
      if (!doc.body?.includes("smoketest-")) continue;
      await db.delete({ collection: "messages", id: doc.id });
      removed++;
    }

    // Requests too. The suite files one every run to prove add_request works,
    // and declining it is not enough: the list is what the owners read to see
    // what is coming, and half of it had become "smoketest test request".
    const reqs = await db.find({ collection: "requests", pagination: false, depth: 0, where: { title: { like: "smoketest-" } } });
    for (const doc of reqs.docs as { id: number | string; title?: string }[]) {
      if (!doc.title?.startsWith("smoketest-")) continue;
      await db.delete({ collection: "requests", id: doc.id });
      removed++;
    }
    return NextResponse.json({ removed });
  }

  const slug = searchParams.get("slug");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!slug || !from || !to) {
    return NextResponse.json({ error: "Missing slug, from, or to" }, { status: 400 });
  }

  const db = await getDb();
  const res = await db.find({
    collection: "bookings",
    pagination: false,
    depth: 0,
    where: {
      and: [
        { isTest: { equals: true } },
        { siteSlug: { equals: slug } },
        { status: { not_in: ["cancelled", "refunded"] } },
        { checkIn: { less_than: to } },
        { checkOut: { greater_than: from } },
      ],
    },
  });

  let cancelled = 0;
  for (const doc of res.docs as { confirmationCode?: string }[]) {
    if (!doc.confirmationCode) continue;
    // Go through cancelBooking so blocked dates are released exactly the way a
    // real cancellation releases them.
    await cancelBooking(doc.confirmationCode, { reason: "Cleared: interrupted smoketest run", refundAmount: 0 });
    cancelled++;
  }
  return NextResponse.json({ cancelled });
}
