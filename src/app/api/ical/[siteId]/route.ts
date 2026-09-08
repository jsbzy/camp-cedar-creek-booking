import { NextRequest, NextResponse } from "next/server";
import ical from "ical-generator";
import { getSiteBySlug } from "@/lib/data";
import { getIcalExportEvents } from "@/lib/data/ical";

export const dynamic = "force-dynamic";

// Turn "2026-08-14" into a UTC Date so ical-generator's all-day formatting
// can't shift the day across timezones.
function utcDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Public per-site availability feed: /api/ical/[slug].ics
 * Owners paste this URL into Hipcamp/Airbnb's "import calendar" so those
 * platforms auto-block dates booked here. Generated fresh on every request.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const slug = siteId.replace(/\.ics$/i, "");

  const site = await getSiteBySlug(slug);
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const events = await getIcalExportEvents(site);

  const cal = ical({
    name: `Camp Cedar Creek: ${site.name}`,
    prodId: { company: "Camp Cedar Creek", product: "booking" },
  });

  for (const ev of events) {
    cal.createEvent({
      id: ev.uid,
      start: utcDate(ev.start),
      end: utcDate(ev.end), // DTEND is exclusive for all-day events — checkout day stays open
      allDay: true,
      summary: ev.summary,
      stamp: new Date(ev.lastModified),
    });
  }

  return new NextResponse(cal.toString(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ics"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
