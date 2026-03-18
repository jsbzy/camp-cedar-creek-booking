"use client";

import { useState, useEffect, useCallback } from "react";
import { type DateRange } from "react-day-picker";
import { format, addDays, startOfDay, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import type { Site } from "@/types";

interface BookingWidgetProps {
  site: Site;
}

export function BookingWidget({ site }: BookingWidgetProps) {
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState<{
    nights: number;
    subtotal: number;
    total: number;
  } | null>(null);

  const today = startOfDay(new Date());

  const fetchPrice = useCallback(
    async (from: Date, to: Date) => {
      setLoading(true);
      try {
        const res = await fetch("/api/bookings/price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteSlug: site.slug,
            checkIn: format(from, "yyyy-MM-dd"),
            checkOut: format(to, "yyyy-MM-dd"),
            addOns: [],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setPricing({
            nights: data.nights,
            subtotal: data.subtotal,
            total: data.total,
          });
        }
      } catch {
        // fail silently for PoC
      } finally {
        setLoading(false);
      }
    },
    [site.slug]
  );

  useEffect(() => {
    if (range?.from && range?.to) {
      fetchPrice(range.from, range.to);
      setCalendarOpen(false);
    }
  }, [range, fetchPrice]);

  const nights = range?.from && range?.to ? differenceInDays(range.to, range.from) : 0;

  const bookUrl =
    range?.from && range?.to
      ? `/book/${site.slug}?checkIn=${format(range.from, "yyyy-MM-dd")}&checkOut=${format(range.to, "yyyy-MM-dd")}&guests=${guests}`
      : `/book/${site.slug}`;

  return (
    <>
      {/* Desktop: Sticky sidebar widget */}
      <div className="hidden w-[340px] shrink-0 lg:block">
        <div className="sticky top-20 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">${site.basePrice}</span>
            <span className="text-muted-foreground">/night</span>
          </div>

          {/* Date selector */}
          <div className="mt-4">
            <button
              onClick={() => setCalendarOpen(!calendarOpen)}
              className="flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors hover:border-foreground/30"
            >
              <CalendarIcon className="size-4 text-muted-foreground" />
              {range?.from && range?.to ? (
                <span>
                  {format(range.from, "MMM d")} – {format(range.to, "MMM d")}
                </span>
              ) : (
                <span className="text-muted-foreground">Select dates</span>
              )}
            </button>

            {calendarOpen && (
              <div className="mt-2 rounded-lg border bg-card p-3 shadow-lg">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  numberOfMonths={1}
                  disabled={{ before: addDays(today, 1) }}
                />
              </div>
            )}
          </div>

          {/* Guest selector */}
          <div className="mt-3">
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <span className="text-sm">Guests</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="flex size-7 items-center justify-center rounded-full border transition-colors hover:bg-secondary"
                >
                  <Minus className="size-3" />
                </button>
                <span className="w-6 text-center text-sm font-medium">{guests}</span>
                <button
                  type="button"
                  onClick={() => setGuests(Math.min(site.maxGuests, guests + 1))}
                  className="flex size-7 items-center justify-center rounded-full border transition-colors hover:bg-secondary"
                >
                  <Plus className="size-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Pricing summary */}
          {pricing && nights > 0 && (
            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  ${site.basePrice} × {nights} night{nights > 1 ? "s" : ""}
                </span>
                <span>${pricing.subtotal}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${pricing.total}</span>
              </div>
            </div>
          )}

          {/* CTA */}
          <Button render={<a href={bookUrl} />} className="mt-4 w-full" size="lg">
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : range?.from && range?.to ? (
              "Book Now"
            ) : (
              "Check Availability"
            )}
          </Button>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            You won&apos;t be charged yet
          </p>
        </div>
      </div>

      {/* Mobile: Fixed bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold">${site.basePrice}</span>
              <span className="text-sm text-muted-foreground">/night</span>
            </div>
            {pricing && nights > 0 && (
              <p className="text-xs text-muted-foreground">
                ${pricing.total} total · {nights} night{nights > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <Button render={<a href={bookUrl} />} size="sm">
            {range?.from && range?.to ? "Book Now" : "Check Availability"}
          </Button>
        </div>
      </div>
    </>
  );
}
