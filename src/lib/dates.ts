/**
 * "Today" and "this date", the same on the server and in the browser.
 *
 * `new Date("2026-05-01")` is UTC midnight, which is the previous evening in
 * Oregon, and `new Date()` is the server's clock, which is UTC on Vercel. Both
 * made every site page hydrate with different text than it rendered. Everything
 * date-shaped on the public site goes through here, pinned to Pacific time.
 */
const TZ = "America/Los_Angeles";

/** Today at midnight, Pacific, as a local Date. */
export function pacificToday(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const [y, m, d] = parts.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** A YYYY-MM-DD string as a local Date, no timezone shift. */
export function localDate(s: string): Date {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "May 1, 2026" from a YYYY-MM-DD string, identical on server and client. */
export function formatDate(s: string, opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" }): string {
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return "";
  return localDate(s).toLocaleDateString("en-US", opts);
}
