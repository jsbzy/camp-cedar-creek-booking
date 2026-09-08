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
