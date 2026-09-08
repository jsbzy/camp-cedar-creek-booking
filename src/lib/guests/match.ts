// Working out whether two bookings are the same person, when the information
// is uneven. Direct bookings give us an email and usually a phone; Hipcamp
// often gives a name and little else. So identity is layered:
//
//   email match  -> certain, merge
//   phone match  -> certain, merge
//   name match   -> probably, merge but flag for a human to confirm, unless
//                   the two records carry different emails or phones, which
//                   means they are two people who share a name
//
// Pure and tested (src/lib/guests/match.test.ts). No database in here.

export interface Identity {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

/** What we store and compare on: lowercase email, ten-digit phone, tidy name. */
export interface NormalizedIdentity {
  email: string | null;
  phone: string | null;
  name: string | null;
}

export function normalizeEmail(raw?: string | null): string | null {
  const e = (raw ?? "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}

export function normalizePhone(raw?: string | null): string | null {
  let d = (raw ?? "").replace(/\D+/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  // Ten digits is a real US number. Anything shorter is a placeholder like
  // "000" and must never match another placeholder.
  return d.length === 10 ? d : null;
}

export function normalizeName(first?: string | null, last?: string | null): string | null {
  const n = `${first ?? ""} ${last ?? ""}`
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")     // drop the "(automated smoketest)" noise
    .replace(/\s+/g, " ")
    .trim();
  // A single word is not enough to identify anyone.
  return n.includes(" ") ? n : null;
}

export function normalize(id: Identity): NormalizedIdentity {
  return {
    email: normalizeEmail(id.email),
    phone: normalizePhone(id.phone),
    name: normalizeName(id.firstName, id.lastName),
  };
}

/** What a guest profile knows about itself, for matching. */
export interface GuestKeys {
  id: string | number;
  emails: string[];
  phones: string[];
  names: string[];
}

export type MatchBasis = "email" | "phone" | "name" | null;

export interface MatchResult {
  guestId: string | number | null;
  basis: MatchBasis;
  /** True when we matched on a name alone: probably right, worth confirming. */
  needsReview: boolean;
  reason: string;
}

/**
 * Find the guest this booking belongs to. Candidates are every existing
 * profile; in practice the caller narrows that first.
 */
export function findGuest(id: Identity, candidates: GuestKeys[]): MatchResult {
  const n = normalize(id);

  if (n.email) {
    const hit = candidates.find((c) => c.emails.includes(n.email!));
    if (hit) return { guestId: hit.id, basis: "email", needsReview: false, reason: `same email (${n.email})` };
  }
  if (n.phone) {
    const hit = candidates.find((c) => c.phones.includes(n.phone!));
    if (hit) return { guestId: hit.id, basis: "phone", needsReview: false, reason: `same phone (${n.phone})` };
  }
  if (n.name) {
    const byName = candidates.filter((c) => c.names.includes(n.name!));
    if (byName.length === 1) {
      const c = byName[0];
      // Two people can share a name. If this booking carries contact details
      // the profile already has different values for, they are not the same
      // person and we would be merging two strangers.
      const emailConflict = !!n.email && c.emails.length > 0 && !c.emails.includes(n.email);
      const phoneConflict = !!n.phone && c.phones.length > 0 && !c.phones.includes(n.phone);
      if (emailConflict || phoneConflict) {
        return {
          guestId: null,
          basis: null,
          needsReview: false,
          reason: `same name as guest ${c.id} but a different ${emailConflict ? "email" : "phone"}, so treated as a different person`,
        };
      }
      return {
        guestId: c.id,
        basis: "name",
        needsReview: true,
        reason: `same name (${n.name}) with nothing that contradicts it, so linked for review`,
      };
    }
    if (byName.length > 1) {
      return { guestId: null, basis: null, needsReview: false, reason: `${byName.length} guests already share that name, so not guessing` };
    }
  }

  return { guestId: null, basis: null, needsReview: false, reason: "no match" };
}

/** Add anything new this booking taught us, without duplicates. */
export function mergeKeys(existing: GuestKeys, id: Identity): { emails: string[]; phones: string[]; names: string[] } {
  const n = normalize(id);
  const add = (list: string[], v: string | null) => (v && !list.includes(v) ? [...list, v] : list);
  return {
    emails: add(existing.emails, n.email),
    phones: add(existing.phones, n.phone),
    names: add(existing.names, n.name),
  };
}

/** "Lauren Castellano" from whatever we have; falls back to the email local part. */
export function displayNameFor(id: Identity): string {
  const full = `${id.firstName ?? ""} ${id.lastName ?? ""}`.replace(/\s+/g, " ").trim();
  if (full) return full;
  const email = normalizeEmail(id.email);
  if (email) return email.split("@")[0];
  return "Guest";
}
