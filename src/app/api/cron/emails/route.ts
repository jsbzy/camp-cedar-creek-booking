import { NextRequest, NextResponse } from "next/server";
import { findBookingsDueForEmail } from "@/lib/data/bookings";
import { sendPreArrival, sendDayBeforeReminder, sendPostStay } from "@/lib/email";
import { addDays, todayPacific } from "@/lib/cancellation";

export const dynamic = "force-dynamic";

/**
 * Daily lifecycle emails (Vercel Cron, 9am PT):
 *   check-in in 7 days  → pre-arrival
 *   check-in tomorrow   → day-before reminder
 *   checked out yesterday → post-stay thank you
 * Sent-at stamps on each booking make reruns idempotent.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // `?today=YYYY-MM-DD` lets staging exercise the cron against seeded dates.
  const override = request.nextUrl.searchParams.get("today");
  const today = override && /^\d{4}-\d{2}-\d{2}$/.test(override) ? override : todayPacific();

  const [preArrival, dayBefore, postStay] = await Promise.all([
    findBookingsDueForEmail("preArrivalSentAt", addDays(today, 7)),
    findBookingsDueForEmail("dayBeforeSentAt", addDays(today, 1)),
    findBookingsDueForEmail("postStaySentAt", addDays(today, -1)),
  ]);

  const results = { today, preArrival: 0, dayBefore: 0, postStay: 0 };
  for (const b of preArrival) if (await sendPreArrival(b)) results.preArrival++;
  for (const b of dayBefore) if (await sendDayBeforeReminder(b)) results.dayBefore++;
  for (const b of postStay) if (await sendPostStay(b)) results.postStay++;

  return NextResponse.json(results);
}
