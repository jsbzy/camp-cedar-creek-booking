import { format, eachDayOfInterval, parseISO } from "date-fns";
import type { DateAvailability, Site } from "@/types";
import { getDb } from "./db";

/* eslint-disable @typescript-eslint/no-explicit-any */

// A booking on any of these slugs blocks this site:
// - the site itself
// - its component sites (when this is a combo)
// - any combo that includes this site
async function getBlockingSlugs(site: Site): Promise<string[]> {
  const db = await getDb();
  const slugs =
    site.isCombo && site.componentSiteSlugs?.length
      ? [site.slug, ...site.componentSiteSlugs]
      : [site.slug];

  const combos = await db.find({
    collection: "sites",
    where: {
      and: [{ isCombo: { equals: true } }, { "componentSiteSlugs.slug": { equals: site.slug } }],
    },
    pagination: false,
    depth: 0,
  });

  return [...new Set([...slugs, ...combos.docs.map((d: any) => d.slug as string)])];
}

export async function getAvailability(
  site: Site,
  startDate: string,
  endDate: string
): Promise<DateAvailability[]> {
  const db = await getDb();
  const slugsToCheck = await getBlockingSlugs(site);

  // ISO date strings compare lexicographically, so string operators are safe here.
  const [bookingsRes, blocksRes] = await Promise.all([
    db.find({
      collection: "bookings",
      pagination: false,
      depth: 0,
      where: {
        and: [
          { siteSlug: { in: slugsToCheck } },
          { status: { not_in: ["cancelled", "refunded"] } },
          { checkIn: { less_than: endDate } },
          { checkOut: { greater_than: startDate } },
        ],
      },
    }),
    db.find({
      collection: "blocked-dates",
      pagination: false,
      depth: 0,
      where: {
        and: [
          { siteSlug: { in: slugsToCheck } },
          { startDate: { less_than: endDate } },
          { endDate: { greater_than: startDate } },
        ],
      },
    }),
  ]);

  const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });

  return days.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const isBooked =
      bookingsRes.docs.some((b: any) => dateStr >= b.checkIn && dateStr < b.checkOut) ||
      blocksRes.docs.some((bl: any) => dateStr >= bl.startDate && dateStr < bl.endDate);

    const isWeekendDay = day.getDay() === 5 || day.getDay() === 6;
    return {
      date: dateStr,
      available: !isBooked,
      price: isWeekendDay ? site.weekendPrice : site.basePrice,
    };
  });
}

export async function checkDateRange(
  site: Site,
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  const availability = await getAvailability(site, checkIn, checkOut);
  // Exclude check-out date from availability check
  const stayDates = availability.filter((d) => d.date < checkOut);
  return stayDates.every((d) => d.available);
}
