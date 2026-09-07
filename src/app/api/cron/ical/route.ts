import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/data/db";
import { describeSync, syncSiteFeeds } from "@/lib/data/ical-import";
import type { IcalFeedSyncResult } from "@/lib/data/ical";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * OTA → us sync (Vercel Cron, every 15 minutes). Fetches each site's
 * configured external calendars and reconciles them into blocked-dates.
 * The same import runs on save from the Sites admin (see the afterChange
 * hook); this is the safety net that keeps catching changes afterwards.
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
    const sync = await syncSiteFeeds(site);
    results.push(...sync.results);
    errors.push(...sync.errors.map((e) => ({ siteSlug: site.slug, ...e })));
    await db.update({
      collection: "sites",
      id: site.id,
      data: {
        icalLastError: describeSync(sync),
        ...(sync.results.length ? { icalLastSynced: new Date().toISOString() } : {}),
      },
      context: { icalStatusWrite: true },
    });
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
