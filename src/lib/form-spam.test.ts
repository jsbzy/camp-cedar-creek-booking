/**
 * The homepage contact form's spam check.
 * Pure, no network:  npx tsx src/lib/form-spam.test.ts
 *
 * The spam samples are real submissions from the database (Nov 2026).
 */
import { looksLikeFormSpam } from "./form-spam";

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
