/**
 * The homepage contact form's spam check.
 * Pure, no network:  npx tsx src/lib/form-spam.test.ts
 *
 * The spam samples are real submissions from the database (Nov 2026).
 */
import { looksLikeFormSpam, receiptName } from "./form-spam";

let pass = 0;
let fail = 0;
const t = (name: string, cond: boolean) => {
  if (cond) {
    pass++;
    console.log("ok   " + name);
  } else {
    fail++;
    console.log("FAIL " + name);
  }
};

const spam = [
  { name: "wupjkkvkus", message: "wzsezewxsyhfjflokfltnxmrirpirx" },
  { name: "wlptuflgos", message: "eiwiysyseofsejfdngzirjstvxiuxk" },
  { name: "ydtsvogiut", message: "eudnqlhtjxyjqhnersxyqniepsxiof" },
];
for (const s of spam) t(`spam is caught: ${s.name}`, looksLikeFormSpam(s));

// Wave 2 (2026-11-17): phishing line as the name, jumbled tokens as the message.
const wave2 = [
  { name: "Оплата 2318 руб получена, остаток на выдачу: https://goo.su/jP0p9G#7X4531", message: "B3PIDIy Ufb5 20Uw5Nk Ukz4pNV afmg rdUNOhv" },
  { name: "Payment received, claim here: goo.su/abc123", message: "hello" },
  { name: "Sam", message: "Xk29fa Lq0pZ 8HhsT2 mmQ7r" },
];
for (const s of wave2) t(`wave 2 spam is caught: ${s.name.slice(0, 20)}`, looksLikeFormSpam(s));

t("receipt greets a plain name", receiptName("Sarah Lee") === "Sarah Lee");
t("receipt greets an accented name", receiptName("José O'Neil-Ruiz") === "José O'Neil-Ruiz");
t("receipt drops a phishing name", receiptName("Оплата 2318 руб: https://goo.su/x") === "");
t("receipt drops a link name", receiptName("claim at bit.ly/x") === "");

const real = [
  { name: "Sarah Lee", message: "Hi! We're hoping to book the Loft for a 40th birthday in June. Is it available?" },
  { name: "Tom", message: "pricing?" },
  { name: "Ana", message: "Hi" },
  { name: "", message: "" },
  { name: "Mike", message: "Wedding" },
  { name: "Jo", message: "https://example.com/our-event-details" },
  { name: "Kim", message: "Thanks!" },
  { name: "Lee", message: "Reunion for about 30 people, mid-August" },
];
for (const r of real) t(`real note goes through: "${r.message.slice(0, 30)}"`, !looksLikeFormSpam(r));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
