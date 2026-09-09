/**
 * The addresses this build must not write to before launch.
 * Pure, no network:  npx tsx src/lib/email/protected.test.ts
 *
 * This exists because the rule was broken twice by hand: a smoketest that
 * mailed the owners at 6am, and a reply sent while checking that a thread
 * rendered. The seed data carries the camp's own address, so any test that
 * touches those records reaches real people.
 */
import { splitProtected } from "./index";

let pass = 0;
let fail = 0;
const t = (name: string, cond: boolean, detail?: string) => {
  if (cond) {
    pass++;
    console.log("ok   " + name);
  } else {
    fail++;
    console.log("FAIL " + name + (detail ? "\n       " + detail : ""));
  }
};

const BLOCKED = ["hello@campcedarcreek.com"];

const r = (to: string) => splitProtected(to, BLOCKED);

t("the camp inbox is refused", r("hello@campcedarcreek.com").refused.length === 1);
t("and nothing is left to send", r("hello@campcedarcreek.com").allowed.length === 0);
t("anyone else goes through", r("guest@example.com").allowed[0] === "guest@example.com");
t("and is not refused", r("guest@example.com").refused.length === 0);

t("case does not get round it", r("Hello@CampCedarCreek.com").refused.length === 1);
t("nor does whitespace", r("  hello@campcedarcreek.com  ").refused.length === 1);

const mixed = r("guest@example.com, hello@campcedarcreek.com, jeff@bzydesign.com");
t("a mixed list keeps the safe ones", mixed.allowed.length === 2, mixed.allowed.join(", "));
t("and drops only the protected one", mixed.refused.length === 1 && mixed.refused[0] === "hello@campcedarcreek.com");
t("jeff is not protected", !mixed.refused.includes("jeff@bzydesign.com"));

t("an empty list is empty, not an error", r("").allowed.length === 0 && r("").refused.length === 0);
t("stray commas are ignored", r("guest@example.com,,").allowed.length === 1);

// At launch the list is emptied and the camp gets its own mail.
t("an empty block list lets everything through", splitProtected("hello@campcedarcreek.com", []).allowed.length === 1);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
