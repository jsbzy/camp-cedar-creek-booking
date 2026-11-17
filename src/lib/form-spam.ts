/**
 * Spam checks for the website's inquiry forms (/api/form and /api/events/inquiry).
 *
 * Wave 1 (from 2026-10-18): a random 10-letter "name", a random 30-letter
 * "message" and a real stranger's email. The tell was the message, one
 * unbroken run of letters.
 *
 * Wave 2 (from 2026-11-17): the "name" is a Russian phishing line with a short
 * link ("Оплата 2318 руб получена, остаток на выдачу: https://goo.su/..."),
 * the message is random mixed-case tokens with spaces, and the email is the
 * victim's. Our "we got your inquiry" receipt greeted the victim by that
 * "name", so bzydesign.com was mailing phishing links to strangers. It burned
 * through the Resend daily quota (200 of 100) in one morning.
 *
 * Two defences: these checks drop the submission, and receiptName() never lets
 * a name that is not plainly a name into an email (see lib/email).
 */
const URL_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(su|ru|ly|io|me|co|cc|xyz|top|link|click|com|net|org)\/)/i;
const CYRILLIC_RE = /[Ѐ-ӿ]/;

export function looksLikeFormSpam(input: { name?: string; message?: string }): boolean {
  const name = (input.name || "").trim();
  const message = (input.message || "").trim();
  // Wave 1: one run of 20+ letters, nothing else.
  if (/^[A-Za-z]{20,}$/.test(message)) return true;
  // Wave 2: a name is never a link, never Cyrillic money talk, never a sentence.
  if (URL_RE.test(name)) return true;
  if (CYRILLIC_RE.test(name)) return true;
  if (name.length > 60) return true;
  // Wave 2 message: 4+ tokens, every one a mixed-case/digit jumble like "B3PIDIy Ufb5 20Uw5Nk".
  const tokens = message.split(/\s+/).filter(Boolean);
  const jumble = (w: string) => /^[A-Za-z0-9]{4,}$/.test(w) && /[A-Z]/.test(w.slice(1)) && /[a-z]/.test(w) || /^(?=.*\d)(?=.*[A-Za-z])[A-Za-z0-9]{4,}$/.test(w);
  if (tokens.length >= 4 && tokens.every(jumble)) return true;
  return false;
}

/** The name to greet someone by in an email: a plain name, or nothing. */
export function receiptName(name?: string): string {
  const n = (name || "").trim();
  return /^[\p{L}][\p{L} .'-]{0,39}$/u.test(n) && !CYRILLIC_RE.test(n) ? n : "";
}
