import { NextRequest, NextResponse } from "next/server";
import nodeIcal from "node-ical";
import { getDb } from "@/lib/data/db";
import {
  markSiteSynced,
  syncFeedEvents,
  type IcalFeedSyncResult,
  type IcalImportEvent,
} from "@/lib/data/ical";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/* eslint-disable @typescript-eslint/no-explicit-any */

// node-ical builds date-only values at local midnight — read them back with
// local getters so the calendar day survives regardless of server timezone.
function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseEvents(data: nodeIcal.CalendarResponse): IcalImportEvent[] {
  const events: IcalImportEvent[] = [];
  for (const item of Object.values(data)) {
    if ((item as any).type !== "VEVENT") continue;
    const ev = item as nodeIcal.VEvent;
    if (!ev.uid || !ev.start || !ev.end) continue;
    events.push({
      uid: ev.uid,
      start: toDateString(ev.start),
      end: toDateString(ev.end),
      summary: typeof ev.summary === "string" ? ev.summary : undefined,
    });
  }
  return events;
}

/**
 * OTA → us sync (Vercel Cron, every 15 minutes). Fetches each site's
 * configured external calendars and reconciles them into blocked-dates.
 * One broken feed never stops the rest.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const sitesRes = await db.find({
    collection: "sites",
    pagination: false,
    depth: 0,
    where: { "icalImportUrls.url": { exists: true } },
  });

  const results: IcalFeedSyncResult[] = [];
  const errors: { siteSlug: string; url: string; error: string }[] = [];

  for (const site of sitesRes.docs as any[]) {
    const feeds = (site.icalImportUrls ?? []).filter((f: any) => f?.url);
    let siteHadSuccess = false;

    for (const feed of feeds) {
      try {
        const data = await nodeIcal.async.fromURL(feed.url);
        const events = parseEvents(data);
        results.push(await syncFeedEvents(site.slug, feed.platform ?? "other", events));
        siteHadSuccess = true;
      } catch (err) {
        // Skip stale-row cleanup for a feed we couldn't read — a transient
        // fetch failure must never unblock real OTA bookings.
        console.error(`[ical] failed to sync ${feed.url} for ${site.slug}:`, err);
        errors.push({
          siteSlug: site.slug,
          url: feed.url,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (siteHadSuccess) await markSiteSynced(site.slug);
  }

  const totals = results.reduce(
    (acc, r) => ({
      created: acc.created + r.created,
      updated: acc.updated + r.updated,
      removed: acc.removed + r.removed,
    }),
    { created: 0, updated: 0, removed: 0 }
  );

  return NextResponse.json({ feeds: results.length, ...totals, results, errors });
}
