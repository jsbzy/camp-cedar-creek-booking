/**
 * Turning bookings into text messages. Pure, so it can be tested without a
 * phone or a Twilio account.
 */

export interface SmsBooking {
  id: string;
  siteName: string;
  checkIn: string;
  checkOut: string;
  nights?: number;
  total?: number;
  guest?: { firstName?: string | null; lastName?: string | null; phone?: string | null } | null;
  manageUrl?: string;
}

/**
 * A US phone number as Twilio wants it, or null if it cannot be trusted.
 *
 * Guests type these by hand, so accept the shapes people actually use and
 * refuse anything else rather than guessing. A wrong number is a text to a
 * stranger.
 */
export function toE164(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Already international and not US: pass it through if it looks sane.
  if (/^\+/.test(trimmed)) {
    const digits = trimmed.replace(/[^\d]/g, "");
    return digits.length >= 11 && digits.length <= 15 ? `+${digits}` : null;
  }

  const d = trimmed.replace(/\D/g, "");
  if (d.length === 10) {
    // North American numbers never start an area code or exchange with 0 or 1.
    if (/^[01]/.test(d) || /^\d{3}[01]/.test(d)) return null;
    return `+1${d}`;
  }
  if (d.length === 11 && d.startsWith("1")) {
    const rest = d.slice(1);
    if (/^[01]/.test(rest) || /^\d{3}[01]/.test(rest)) return null;
    return `+${d}`;
  }
  return null;
}

const money = (n: unknown) => (typeof n === "number" ? `$${n}` : "");

/** Friendly date: "Fri 13 Nov". Dates are stored as plain YYYY-MM-DD. */
export function shortDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()];
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()];
  return `${day} ${d.getUTCDate()} ${mon}`;
}

export const firstName = (b: SmsBooking) => (b.guest?.firstName || "").trim().split(/\s+/)[0] || "";

/**
 * The guest's confirmation. One message, deliberately.
 *
 * No manage link. The real one carries a long single-use token, which pushes
 * this past 160 characters into a second billed segment, and puts a key to the
 * booking into SMS logs and lock screens. The email already carries it, so this
 * says where to look instead. What this message is for is the reply: it is the
 * guest's first sight of the number they can text.
 */
export function guestConfirmationSms(b: SmsBooking): string {
  const hi = firstName(b) ? `${firstName(b)}, you` : "You";
  const total = money(b.total) ? ` ${money(b.total)}.` : "";
  return (
    `${hi}'re booked at Camp Cedar Creek. ${b.siteName}, ` +
    `${shortDate(b.checkIn)} to ${shortDate(b.checkOut)}.${total} ${b.id}, ` +
    `details in your email. Reply here anytime.`
  );
}

/** What the owners get. Written to be read at a glance on a lock screen. */
export function ownerBookingSms(b: SmsBooking): string {
  const who = [b.guest?.firstName, b.guest?.lastName].filter(Boolean).join(" ") || "A guest";
  const nights = b.nights ? `${b.nights} night${b.nights === 1 ? "" : "s"}, ` : "";
  return `New booking: ${b.siteName}, ${shortDate(b.checkIn)}. ${who}, ${nights}${money(b.total)}. ${b.id}`;
}

export function ownerCancellationSms(b: SmsBooking): string {
  const who = [b.guest?.firstName, b.guest?.lastName].filter(Boolean).join(" ") || "A guest";
  return `Cancelled: ${b.siteName}, ${shortDate(b.checkIn)}. ${who}. ${b.id}`;
}

/**
 * A text is billed per 160 characters (70 if it contains anything outside the
 * GSM alphabet). Nothing here should ever need two.
 */
export function segments(body: string): number {
  const unicode = /[^\x20-\x7E\n\r]/.test(body);
  const size = unicode ? 70 : 160;
  const multi = unicode ? 67 : 153;
  return body.length <= size ? 1 : Math.ceil(body.length / multi);
}
