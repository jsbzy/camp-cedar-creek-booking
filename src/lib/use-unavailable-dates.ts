"use client";

import { useEffect, useState } from "react";
import { addDays, format, parseISO, startOfDay } from "date-fns";

// Nights a guest cannot book on a site: existing bookings, owner blocks, and
// anything imported from Hipcamp/Airbnb. Fetched once per site for the next
// 18 months so both calendars (site page widget, booking form) grey out the
// same days the server would refuse.
const LOOKAHEAD_DAYS = 548;

export function useUnavailableDates(siteSlug: string): { dates: Date[]; loading: boolean } {
  const [dates, setDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const today = startOfDay(new Date());
    const start = format(today, "yyyy-MM-dd");
    const end = format(addDays(today, LOOKAHEAD_DAYS), "yyyy-MM-dd");
    setLoading(true);
    fetch(`/api/bookings/availability?slug=${encodeURIComponent(siteSlug)}&start=${start}&end=${end}`)
      .then((r) => (r.ok ? r.json() : { availability: [] }))
      .then((data: { availability?: { date: string; available: boolean }[] }) => {
        if (cancelled) return;
        setDates((data.availability ?? []).filter((d) => !d.available).map((d) => parseISO(d.date)));
      })
      .catch(() => {
        // Leave the calendar open; the server still refuses an unavailable range on submit.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [siteSlug]);

  return { dates, loading };
}
