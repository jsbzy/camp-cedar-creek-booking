import type { Booking, CancellationTerms } from "@/types";

// Whole days between two YYYY-MM-DD strings (b - a). UTC math on date-only
// strings — no timezone drift, matching the string-date convention everywhere.
export function diffDays(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

// Today as YYYY-MM-DD in the property's timezone (Sandy, OR).
export function todayPacific(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());
}

export interface RefundQuote {
  daysUntilCheckIn: number;
  percent: number;
  amount: number;
}

export function computeRefund(
  booking: Pick<Booking, "total" | "checkIn">,
  terms: CancellationTerms,
  today: string = todayPacific()
): RefundQuote {
  const daysUntilCheckIn = diffDays(today, booking.checkIn);
  let percent = 0;
  if (daysUntilCheckIn >= terms.fullRefundDays) percent = 100;
  else if (daysUntilCheckIn >= terms.partialRefundDays) percent = terms.partialRefundPercent;
  const amount = Math.round(booking.total * percent) / 100;
  return { daysUntilCheckIn, percent, amount };
}
