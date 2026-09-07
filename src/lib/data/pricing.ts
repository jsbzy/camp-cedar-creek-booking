import { pricingRules } from "./seed";
import type { PricingRule, PriceCalculation, Site, BookingAddOn } from "@/types";
import { eachDayOfInterval, parseISO, format } from "date-fns";

// A "weekend night" for lodging is Friday night and Saturday night: the guest
// sleeps there Friday and Saturday. date-fns isWeekend() means Sat/Sun, which
// priced Friday as a weekday and Sunday as a weekend, and disagreed with the
// availability calendar. One definition, used by both.
export function isWeekendNight(date: Date): boolean {
  const d = date.getDay();
  return d === 5 || d === 6;
}

export function getPricingRules(): PricingRule[] {
  return pricingRules;
}

export function calculatePrice(
  site: Site,
  checkIn: string,
  checkOut: string,
  addOns: BookingAddOn[] = []
): PriceCalculation {
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);

  // Generate each night (check-in to day before check-out)
  const nights = eachDayOfInterval({ start, end: new Date(end.getTime() - 86400000) });

  const nightlyBreakdown = nights.map((date) => ({
    date: format(date, "yyyy-MM-dd"),
    price: isWeekendNight(date) ? site.weekendPrice : site.basePrice,
  }));

  const subtotal = nightlyBreakdown.reduce((sum, n) => sum + n.price, 0);

  const addOnsTotal = addOns.reduce((sum, addon) => {
    const perNightTotal = addon.perNight ? addon.unitPrice * addon.quantity * nights.length : addon.unitPrice * addon.quantity;
    return sum + perNightTotal;
  }, 0);

  return {
    nights: nights.length,
    nightlyBreakdown,
    subtotal,
    addOnsTotal,
    total: subtotal + addOnsTotal,
  };
}
