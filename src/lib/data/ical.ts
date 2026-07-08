import type { Site } from "@/types";
import { getDb } from "./db";
import { getBlockingSlugs } from "./availability";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IcalExportEvent {
  uid: string;
  start: string; // YYYY-MM-DD, first blocked night
  end: string; // YYYY-MM-DD, exclusive (checkout day) — matches iCal DTEND;VALUE=DATE
  summary: string;
  lastModified: string;
}

/**
 * Everything that makes `site` unavailable, for the per-site export feed:
 * direct + combo-related bookings (same statuses availability blocks on) and
 * manually entered blocked dates. OTA-imported blocks are deliberately
 * excluded so we never echo a platform's own bookings back at it.
 */
export async function getIcalExportEvents(site: Site): Promise<IcalExportEvent[]> {
  const db = await getDb();
  const slugsToCheck = await getBlockingSlugs(site);

  const [bookingsRes, blocksRes] = await Promise.all([
    db.find({
      collection: "bookings",
      pagination: false,
      depth: 0,
      where: {
        and: [
          { siteSlug: { in: slugsToCheck } },
          { status: { not_in: ["cancelled", "refunded"] } },
        ],
      },
    }),
    db.find({
      collection: "blocked-dates",
      pagination: false,
      depth: 0,
      where: {
        and: [{ siteSlug: { in: slugsToCheck } }, { source: { equals: "manual" } }],
      },
    }),
  ]);

  return [
    ...bookingsRes.docs.map((b: any) => ({
      uid: `${b.confirmationCode}@campcedarcreek`,
      start: b.checkIn,
      end: b.checkOut,
      summary: `Booked - ${site.name}`,
      lastModified: b.updatedAt ?? b.createdAt,
    })),
    ...blocksRes.docs.map((bl: any) => ({
      uid: `block-${bl.id}@campcedarcreek`,
      start: bl.startDate,
      end: bl.endDate,
      summary: `Blocked - ${site.name}`,
      lastModified: bl.updatedAt ?? bl.createdAt,
    })),
  ];
}

export interface IcalImportEvent {
  uid: string;
  start: string;
  end: string;
  summary?: string;
}

export interface IcalFeedSyncResult {
  siteSlug: string;
  platform: string;
  created: number;
  updated: number;
  removed: number;
}

/**
 * Reconcile one external feed's events into blocked-dates for a site.
 * Keyed by (siteSlug, source, externalUid): new events create rows, changed
 * dates update them, and rows whose event vanished from the feed are deleted
 * (the OTA booking was cancelled).
 */
export async function syncFeedEvents(
  siteSlug: string,
  platform: "hipcamp" | "airbnb" | "other",
  events: IcalImportEvent[]
): Promise<IcalFeedSyncResult> {
  const db = await getDb();
  const siteRes = await db.find({
    collection: "sites",
    where: { slug: { equals: siteSlug } },
    limit: 1,
    depth: 0,
  });
  const siteId = siteRes.docs[0]?.id;

  const existingRes = await db.find({
    collection: "blocked-dates",
    pagination: false,
    depth: 0,
    where: {
      and: [{ siteSlug: { equals: siteSlug } }, { source: { equals: platform } }],
    },
  });
  const existingByUid = new Map<string, any>(
    existingRes.docs.filter((d: any) => d.externalUid).map((d: any) => [d.externalUid, d])
  );

  const result: IcalFeedSyncResult = { siteSlug, platform, created: 0, updated: 0, removed: 0 };
  const seenUids = new Set<string>();

  for (const ev of events) {
    if (!ev.uid || !ev.start || !ev.end) continue;
    seenUids.add(ev.uid);
    const existing = existingByUid.get(ev.uid);
    if (existing) {
      if (existing.startDate !== ev.start || existing.endDate !== ev.end) {
        await db.update({
          collection: "blocked-dates",
          id: existing.id,
          data: { startDate: ev.start, endDate: ev.end, note: ev.summary },
        });
        result.updated++;
      }
    } else {
      await db.create({
        collection: "blocked-dates",
        data: {
          site: siteId,
          siteSlug,
          startDate: ev.start,
          endDate: ev.end,
          reason: "ota_booking",
          source: platform,
          externalUid: ev.uid,
          note: ev.summary,
        },
      });
      result.created++;
    }
  }

  for (const [uid, doc] of existingByUid) {
    if (!seenUids.has(uid)) {
      await db.delete({ collection: "blocked-dates", id: doc.id });
      result.removed++;
    }
  }

  return result;
}

export async function markSiteSynced(siteSlug: string): Promise<void> {
  const db = await getDb();
  await db.update({
    collection: "sites",
    where: { slug: { equals: siteSlug } },
    data: { icalLastSynced: new Date().toISOString() },
  });
}
