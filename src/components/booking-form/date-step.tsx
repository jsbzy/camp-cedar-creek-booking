"use client";

import { useState, useEffect, useCallback } from "react";
import { type DateRange } from "react-day-picker";
import { format, addDays, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { useBookingStore } from "@/lib/booking-store";
import type { Site } from "@/types";

interface DateStepProps {
  site: Site;
}

export function DateStep({ site }: DateStepProps) {
  const { checkIn, checkOut, guests, setDates, setGuests, setPricing, nextStep } =
    useBookingStore();

  const [range, setRange] = useState<DateRange | undefined>(
    checkIn && checkOut
      ? { from: new Date(checkIn), to: new Date(checkOut) }
      : undefined
  );
  const [loading, setLoading] = useState(false);
  const [breakdown, setBreakdown] = useState<{ date: string; price: number }[]>([]);

  const today = startOfDay(new Date());

  const fetchPrice = useCallback(async (from: Date, to: Date) => {
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
        setBreakdown(data.nightlyBreakdown);
        setPricing({
          nightlyBreakdown: data.nightlyBreakdown,
          subtotal: data.subtotal,
          addOnsTotal: 0,
          total: data.total,
        });
        setDates(format(from, "yyyy-MM-dd"), format(to, "yyyy-MM-dd"));
      }
    } catch {
      // fail silently for PoC
    } finally {
      setLoading(false);
    }
  }, [site.slug, setPricing, setDates]);

  useEffect(() => {
    if (range?.from && range?.to) {
      fetchPrice(range.from, range.to);
    }
  }, [range, fetchPrice]);

  const canProceed = range?.from && range?.to && !loading;

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold">Select Your Dates</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose your check-in and check-out dates for {site.name}.
      </p>

      <div className="mt-6 flex justify-center">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
          disabled={{ before: addDays(today, 1) }}
        />
      </div>

      <div className="mt-6">
        <Label htmlFor="guests">Number of Guests</Label>
        <div className="mt-1 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGuests(Math.max(1, guests - 1))}
            className="flex size-8 items-center justify-center rounded-md border text-lg"
          >
            -
          </button>
          <span className="w-8 text-center font-medium">{guests}</span>
          <button
            type="button"
            onClick={() => setGuests(Math.min(site.maxGuests, guests + 1))}
            className="flex size-8 items-center justify-center rounded-md border text-lg"
          >
            +
          </button>
          <span className="text-sm text-muted-foreground">
            (max {site.maxGuests})
          </span>
        </div>
      </div>

      {/* Nightly breakdown */}
      {breakdown.length > 0 && (
        <div className="mt-6 rounded-lg bg-secondary p-4">
          <h3 className="font-medium">Price Breakdown</h3>
          <div className="mt-2 space-y-1 text-sm">
            {breakdown.map((night) => (
              <div key={night.date} className="flex justify-between">
                <span className="text-muted-foreground">
                  {format(new Date(night.date + "T12:00:00"), "EEE, MMM d")}
                </span>
                <span>${night.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button onClick={() => nextStep()} disabled={!canProceed}>
          {loading ? "Calculating..." : "Next: Add-ons"}
        </Button>
      </div>
    </div>
  );
}
