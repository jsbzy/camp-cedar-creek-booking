/**
 * Spam check for the homepage contact form (/api/form).
 *
 * Since 2026-10-18 a bot has posted the contact form several times a day:
 * a random 10-letter "name", a random 30-letter "message", and a real
 * stranger's email address (it posts the newsletter form with the same
 * address a few seconds earlier). Each one emailed the owners AND sent our
 * "we got your inquiry" receipt to that stranger, from bzydesign.com.
 *
 * The tell is the message: one unbroken run of letters with no spaces and
 * no punctuation. No real person writes a 20-letter message without a space.
 * The check is deliberately narrow, so a short real note ("Hi!", "pricing?")
 * or a message with a URL still goes through.
 */
export function looksLikeFormSpam(input: { name?: string; message?: string }): boolean {
  const message = (input.message || "").trim();
  // One run of 20+ letters, nothing else: no spaces, digits or punctuation.
  if (/^[A-Za-z]{20,}$/.test(message)) return true;
  return false;
}
