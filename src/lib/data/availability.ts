import { format, eachDayOfInterval, parseISO } from "date-fns";
import type { DateAvailability, Site } from "@/types";
import { getSiteBySlug } from "./sites";
import { bookings } from "./bookings";
import { sites as allSitesData } from "./seed";

export function getAvailability(
  site: Site,
  startDate: string,
  endDate: string
): DateAvailability[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days = eachDayOfInterval({ start, end });

  // Get slugs to check (for combo sites, check component sites too)
  const slugsToCheck = site.isCombo && site.componentSiteSlugs
    ? [site.slug, ...site.componentSiteSlugs]
    : [site.slug];

  // Also check any combo site that includes this site as a component
  // (booking an individual site blocks the combo)
  const comboSlugsBlocking = allSitesData
    .filter((s) => s.isCombo && s.componentSiteSlugs?.includes(site.slug))
    .map((s) => s.slug);

  const allSlugsToCheck = [...new Set([...slugsToCheck, ...comboSlugsBlocking])];

  return days.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const isBooked = bookings.some((b) =>
      allSlugsToCheck.includes(b.siteSlug) &&
      b.status !== "cancelled" &&
      dateStr >= b.checkIn &&
      dateStr < b.checkOut
    );

    const isWeekendDay = day.getDay() === 5 || day.getDay() === 6;
    return {
      date: dateStr,
      available: !isBooked,
      price: isWeekendDay ? site.weekendPrice : site.basePrice,
    };
  });
}

export function checkDateRange(
  site: Site,
  checkIn: string,
  checkOut: string
): boolean {
  const availability = getAvailability(site, checkIn, checkOut);
  // Exclude check-out date from availability check
  const stayDates = availability.filter((d) => d.date < checkOut);
  return stayDates.every((d) => d.available);
}
