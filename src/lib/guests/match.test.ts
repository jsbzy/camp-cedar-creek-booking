/**
 * Identity matching. Run with: npx tsx src/lib/guests/match.test.ts
 * These decide whether two strangers get merged into one profile, so they are
 * worth more care than most tests.
 */
import { findGuest, mergeKeys, normalize, normalizePhone, normalizeName, displayNameFor, type GuestKeys } from "./match";

let pass = 0;
let fail = 0;
const t = (name: string, cond: boolean, detail?: unknown) => {
  if (cond) { pass++; console.log("ok   " + name); }
  else { fail++; console.log("FAIL " + name + (detail !== undefined ? "\n       " + JSON.stringify(detail) : "")); }
};

// --- normalizing ---
t("phone strips formatting", normalizePhone("(503) 555-0100") === "5035550100");
t("phone drops a leading 1", normalizePhone("1-503-555-0100") === "5035550100");
t("a placeholder phone is not a phone", normalizePhone("000-000-0000") === "0000000000");
t("a short phone is ignored", normalizePhone("000") === null);
t("name lowercases and tidies", normalizeName("  Lauren ", "Castellano ") === "lauren castellano");
t("name strips test noise", normalizeName("TEST", "(automated smoketest-abc)") === "test automated smoketest-abc");
t("a single word is not a name", normalizeName("Lauren", "") === null);
t("email lowercases", normalize({ email: "Lauren@Example.COM" }).email === "lauren@example.com");
t("a broken email is dropped", normalize({ email: "not-an-email" }).email === null);

const guests: GuestKeys[] = [
  { id: 1, emails: ["lauren@example.com"], phones: ["5035550100"], names: ["lauren castellano"] },
  { id: 2, emails: [], phones: ["5035559999"], names: ["john smith"] },
  { id: 3, emails: ["jsmith@work.com"], phones: [], names: ["john smith"] },
];

// --- certain matches ---
t("same email matches", findGuest({ email: "LAUREN@example.com" }, guests).guestId === 1);
t("email match is not flagged", findGuest({ email: "lauren@example.com" }, guests).needsReview === false);
t("same phone matches when no email", findGuest({ phone: "(503) 555-0100" }, guests).guestId === 1);
t("phone match wins with a new email", findGuest({ email: "new@x.com", phone: "5035550100" }, guests).basis === "phone");

// --- name-only: the Hipcamp case ---
const nameOnly = findGuest({ firstName: "Lauren", lastName: "Castellano" }, guests);
t("name alone links to the existing guest", nameOnly.guestId === 1, nameOnly);
t("and is flagged for review", nameOnly.needsReview === true);

// --- the trap: two different people sharing a name ---
const conflict = findGuest({ firstName: "John", lastName: "Smith", email: "different@person.com" }, guests);
t("two John Smiths already on file are not guessed between", conflict.guestId === null, conflict);
const oneNameConflict = findGuest({ firstName: "Lauren", lastName: "Castellano", email: "someone.else@x.com" }, guests);
t("a different email beats a matching name", oneNameConflict.guestId === null, oneNameConflict);
t("and says why", /different email/.test(oneNameConflict.reason), oneNameConflict.reason);

// --- nothing to go on ---
t("an unknown guest is new", findGuest({ email: "brand@new.com" }, guests).guestId === null);
t("empty identity is new", findGuest({}, guests).guestId === null);
t("placeholder phones do not collide", findGuest({ phone: "000" }, [{ id: 9, emails: [], phones: [], names: [] }]).guestId === null);

// --- merging what a booking teaches us ---
const merged = mergeKeys(guests[0], { email: "lauren.c@newjob.com", phone: "5035550100", firstName: "Lauren", lastName: "Castellano" });
t("a new email is added", merged.emails.length === 2 && merged.emails.includes("lauren.c@newjob.com"));
t("a known phone is not duplicated", merged.phones.length === 1);
t("a known name is not duplicated", merged.names.length === 1);

// --- display name ---
t("prefers the real name", displayNameFor({ firstName: "Lauren", lastName: "Castellano", email: "l@x.com" }) === "Lauren Castellano");
t("falls back to the email", displayNameFor({ email: "lauren@example.com" }) === "lauren");
t("last resort", displayNameFor({}) === "Guest");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
