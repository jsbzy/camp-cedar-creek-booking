import nodeIcal from "node-ical";
import { removeOrphanedPlatformBlocks, syncFeedEvents, type IcalFeedSyncResult, type IcalImportEvent } from "./ical";

/* eslint-disable @typescript-eslint/no-explicit-any */

// node-ical builds date-only values at local midnight — read them back with
// local getters so the calendar day survives regardless of server timezone.
function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// How far ahead to import. A Google feed can carry years of events (the US
// holidays calendar has 300+); a lambda cannot sit through creating a row
// for each, and nothing older than today can block a booking anyway.
const HORIZON_DAYS = 550;

export function parseEvents(data: nodeIcal.CalendarResponse, today = new Date()): IcalImportEvent[] {
  const todayStr = toDateString(today);
  const horizon = toDateString(new Date(today.getTime() + HORIZON_DAYS * 86400000));
  const events: IcalImportEvent[] = [];
  for (const item of Object.values(data)) {
    if ((item as any).type !== "VEVENT") continue;
    const ev = item as nodeIcal.VEvent;
    if (!ev.uid || !ev.start || !ev.end) continue;
    const start = toDateString(ev.start);
    const end = toDateString(ev.end);
    if (end <= todayStr || start > horizon) continue;   // already over, or too far out to matter
    events.push({
      uid: ev.uid,
      start,
      end,
      summary: typeof ev.summary === "string" ? ev.summary : undefined,
    });
  }
  return events;
}

// Google Calendar hands out "webcal://" addresses in some places; it is plain
// HTTPS underneath. Accept what the owner pastes.
export function normalizeFeedUrl(url: string): string {
  return url.trim().replace(/^webcal:\/\//i, "https://");
}

export interface SiteFeedSync {
  results: IcalFeedSyncResult[];
  errors: { url: string; error: string }[];
}

/**
 * Pull every external calendar configured on a site and reconcile it into
 * blocked-dates. One broken feed never stops the rest, and a feed we could
 * not read is left alone: a transient fetch failure must never unblock real
 * OTA bookings. Used by the 15-minute cron and by the Sites afterChange hook
 * (so a URL pasted into the admin takes effect on save).
 */
export async function syncSiteFeeds(site: { slug: string; icalImportUrls?: any[] | null }): Promise<SiteFeedSync> {
  const feeds = (site.icalImportUrls ?? []).filter((f: any) => f?.url);
  const out: SiteFeedSync = { results: [], errors: [] };
  for (const feed of feeds) {
    const url = normalizeFeedUrl(feed.url);
    try {
      const data = await nodeIcal.async.fromURL(url);
      const events = parseEvents(data);
      out.results.push(await syncFeedEvents(site.slug, feed.platform ?? "other", events));
    } catch (err) {
      console.error(`[ical] failed to sync ${url} for ${site.slug}:`, err);
      out.errors.push({ url, error: err instanceof Error ? err.message : String(err) });
    }
  }
  // A feed that was removed from the site takes its blocks with it.
  const configured = new Set(feeds.map((f: any) => f.platform ?? "other"));
  const removed = await removeOrphanedPlatformBlocks(site.slug, [...configured]);
  if (removed) out.results.push({ siteSlug: site.slug, platform: "removed-feeds", created: 0, updated: 0, removed });
  return out;
}

/** One line an owner can read in the admin about the last sync. */
export function describeSync(sync: SiteFeedSync): string {
  const n = sync.results.reduce((a, r) => a + r.created + r.updated + r.removed, 0);
  const ok = sync.results.length
    ? `${sync.results.length} calendar${sync.results.length === 1 ? "" : "s"} read, ${n} change${n === 1 ? "" : "s"}`
    : "";
  const bad = sync.errors.map((e) => `Could not read ${e.url}: ${e.error}`).join(" · ");
  return [ok, bad].filter(Boolean).join(" · ");
}
