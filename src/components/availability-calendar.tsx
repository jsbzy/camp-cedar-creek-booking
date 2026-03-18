"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  getDay,
  isBefore,
  startOfDay,
} from "date-fns";
import type { DateAvailability } from "@/types";

interface AvailabilityCalendarProps {
  siteSlug: string;
  basePrice: number;
  weekendPrice: number;
}

export function AvailabilityCalendar({
  siteSlug,
  basePrice,
  weekendPrice,
}: AvailabilityCalendarProps) {
  const [availability, setAvailability] = useState<DateAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  const today = startOfDay(new Date());
  const month1Start = startOfMonth(today);
  const month2End = endOfMonth(addMonths(today, 1));

  useEffect(() => {
    async function fetchAvailability() {
      try {
        const res = await fetch(
          `/api/bookings/availability?slug=${siteSlug}&start=${format(month1Start, "yyyy-MM-dd")}&end=${format(month2End, "yyyy-MM-dd")}`
        );
        if (res.ok) {
          const data = await res.json();
          setAvailability(data.availability);
        }
      } catch {
        // silently fail for PoC
      } finally {
        setLoading(false);
      }
    }
    fetchAvailability();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteSlug]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  const months = [month1Start, addMonths(month1Start, 1)];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {months.map((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
        const startDow = getDay(monthStart);

        return (
          <div key={format(monthStart, "yyyy-MM")} className="rounded-lg border p-4">
            <h4 className="mb-3 text-center font-heading font-semibold">
              {format(monthStart, "MMMM yyyy")}
            </h4>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {dayNames.map((d) => (
                <div key={d} className="py-1 font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
              {Array.from({ length: startDow }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {days.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const avail = availability.find((a) => a.date === dateStr);
                const isPast = isBefore(day, today);
                const isAvailable = avail?.available && !isPast;

                return (
                  <div
                    key={dateStr}
                    className={`rounded py-1.5 text-xs ${
                      isPast
                        ? "text-muted-foreground/40"
                        : isAvailable
                        ? "bg-secondary text-foreground"
                        : "bg-muted text-muted-foreground line-through"
                    }`}
                  >
                    <div>{format(day, "d")}</div>
                    {!isPast && (
                      <div className="text-[10px] text-muted-foreground">
                        ${avail?.price ?? basePrice}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
