/**
 * Text message formatting. Pure, no network:  npx tsx src/lib/sms/format.test.ts
 */
import { toE164, shortDate, guestConfirmationSms, ownerBookingSms, ownerCancellationSms, segments } from "./format";

let pass = 0;
let fail = 0;
const t = (name: string, cond: boolean, detail?: string) => {
  if (cond) { pass++; console.log("ok   " + name); }
  else { fail++; console.log("FAIL " + name + (detail ? "\n       " + detail : "")); }
};

// --- phone numbers, as guests actually type them ---
t("plain ten digits", toE164("9253946010") === "+19253946010");
t("dashes", toE164("925-394-6010") === "+19253946010");
t("brackets and spaces", toE164("(925) 394 6010") === "+19253946010");
t("leading 1", toE164("1 925 394 6010") === "+19253946010");
t("already E164", toE164("+19253946010") === "+19253946010");
t("dots", toE164("925.394.6010") === "+19253946010");
t("too short is refused", toE164("394-6010") === null);
t("too long is refused", toE164("1234567890123456789") === null);
t("letters are refused", toE164("call me") === null);
t("empty is refused", toE164("") === null && toE164(null) === null && toE164(undefined) === null);
t("area code starting 0 or 1 is refused", toE164("0253946010") === null && toE164("1253946010") === null);
t("exchange starting 0 or 1 is refused", toE164("9250946010") === null && toE164("9251946010") === null);
t("a non-US international number passes through", toE164("+447700900123") === "+447700900123");

// --- dates ---
t("date reads like a person wrote it", shortDate("2026-11-13") === "Fri 13 Nov", shortDate("2026-11-13"));
t("a bad date is left alone", shortDate("not a date") === "not a date");

const booking = {
  id: "CCC-2C0C27",
  siteName: "Fairy Ring",
  checkIn: "2026-11-13",
  checkOut: "2026-11-15",
  nights: 2,
  total: 145,
  guest: { firstName: "Jeff", lastName: "Berezny", phone: "925-394-6010" },
  manageUrl: "https://ccc.bzy.design/booking/abc123",
};

// --- the guest's message ---
const g = guestConfirmationSms(booking);
t("greets them by name", g.startsWith("Jeff, you're booked"), g);
t("carries site, dates, code and total", ["Fairy Ring", "Fri 13 Nov", "CCC-2C0C27", "$145"].every((s) => g.includes(s)), g);
t("tells them they can reply", /Reply here/.test(g));
t("points at the email rather than carrying a token", /details in your email/.test(g) && !g.includes("http"), g);
t("fits in one message", segments(g) === 1, `${g.length} chars: ${g}`);
// A long site name and a long first name together are the worst realistic case.
const worst = guestConfirmationSms({ ...booking, siteName: "Fairy Ring + Candy Cap", guest: { firstName: "Christopher", lastName: "Nguyen" }, total: 1240 });
t("still one message at the longest realistic size", segments(worst) === 1, `${worst.length} chars: ${worst}`);
t("works with no name and no total", segments(guestConfirmationSms({ ...booking, guest: null, total: undefined })) === 1);

// --- the owners' message ---
const o = ownerBookingSms(booking);
t("owner message names the guest and the site", o.includes("Jeff Berezny") && o.includes("Fairy Ring"), o);
t("owner message fits in one", segments(o) === 1, `${o.length} chars: ${o}`);
t("cancellation says so first", ownerCancellationSms(booking).startsWith("Cancelled:"));

// --- billing ---
t("160 plain characters is one message", segments("x".repeat(160)) === 1);
t("161 is two", segments("x".repeat(161)) === 2);
t("an emoji drops the limit to 70", segments("x".repeat(71) + "\u{1F389}") === 2);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
