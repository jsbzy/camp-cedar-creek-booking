import { getDb } from "@/lib/data/db";
import { findGuest, mergeKeys, normalize, displayNameFor, type GuestKeys, type Identity } from "./match";

/* eslint-disable @typescript-eslint/no-explicit-any */

const vals = (arr: unknown): string[] =>
  Array.isArray(arr) ? arr.map((x: any) => (typeof x === "string" ? x : x?.value)).filter(Boolean) : [];
const wrap = (list: string[]) => list.map((value) => ({ value }));

function keysOf(doc: any): GuestKeys {
  return { id: doc.id, emails: vals(doc.emails), phones: vals(doc.phones), names: vals(doc.names) };
}

/**
 * Recompute a guest's totals from their bookings. Cancelled and refunded
 * stays do not count towards anything; test bookings are ignored entirely.
 */
export async function recomputeGuest(guestId: string | number): Promise<void> {
  const db = await getDb();
  const res = await db.find({
    collection: "bookings",
    pagination: false,
    depth: 0,
    where: {
      and: [
        { guestProfile: { equals: guestId } },
        { status: { not_in: ["cancelled", "refunded"] } },
        { isTest: { not_equals: true } },
      ],
    },
  });
  const docs = res.docs as any[];
  const dates = docs.map((b) => b.checkIn).filter(Boolean).sort();
  await db.update({
    collection: "guests",
    id: guestId,
    data: {
      stayCount: docs.length,
      nightsTotal: docs.reduce((a, b) => a + (b.nights ?? 0), 0),
      spendTotal: docs.reduce((a, b) => a + (b.total ?? 0), 0),
      firstStay: dates[0] ?? null,
      lastStay: dates[dates.length - 1] ?? null,
    },
    context: { guestRollup: true },
  });
}

export interface AttachResult {
  guestId: string | number;
  created: boolean;
  basis: string;
  reason: string;
}

/**
 * Find or create the guest behind a booking, teach the profile anything new,
 * and link the booking to it. Safe to call twice for the same booking.
 */
export async function attachGuestToBooking(bookingId: string | number, identity: Identity): Promise<AttachResult | null> {
  const db = await getDb();
  const n = normalize(identity);
  if (!n.email && !n.phone && !n.name) return null; // nothing to identify them by

  // Narrow the candidates rather than loading every guest: anything sharing
  // one of this booking's keys.
  const or: any[] = [];
  if (n.email) or.push({ "emails.value": { equals: n.email } });
  if (n.phone) or.push({ "phones.value": { equals: n.phone } });
  if (n.name) or.push({ "names.value": { equals: n.name } });
  const candidatesRes = await db.find({ collection: "guests", where: { or }, pagination: false, depth: 0 });
  const candidates = (candidatesRes.docs as any[]).map(keysOf);

  const match = findGuest(identity, candidates);
  let guestId = match.guestId;
  let created = false;

  if (guestId) {
    const existing = candidates.find((c) => c.id === guestId)!;
    const merged = mergeKeys(existing, identity);
    await db.update({
      collection: "guests",
      id: guestId,
      data: {
        emails: wrap(merged.emails),
        phones: wrap(merged.phones),
        names: wrap(merged.names),
        ...(n.email ? { primaryEmail: n.email } : {}),
        ...(n.phone ? { primaryPhone: n.phone } : {}),
        ...(match.needsReview ? { needsReview: true, reviewNote: match.reason } : {}),
      },
      context: { guestRollup: true },
    });
  } else {
    const doc: any = await db.create({
      collection: "guests",
      data: {
        displayName: displayNameFor(identity),
        emails: wrap(n.email ? [n.email] : []),
        phones: wrap(n.phone ? [n.phone] : []),
        names: wrap(n.name ? [n.name] : []),
        primaryEmail: n.email,
        primaryPhone: n.phone,
      },
      context: { guestRollup: true },
    });
    guestId = doc.id;
    created = true;
  }

  await db.update({
    collection: "bookings",
    id: bookingId,
    data: { guestProfile: guestId as number },
    context: { guestRollup: true },
  });
  await recomputeGuest(guestId!);
  return { guestId: guestId!, created, basis: match.basis ?? "new", reason: match.reason };
}

/** After a status change, the totals move. */
export async function refreshGuestForBooking(bookingId: string | number): Promise<void> {
  const db = await getDb();
  const b: any = await db.findByID({ collection: "bookings", id: bookingId, depth: 0 }).catch(() => null);
  if (b?.guestProfile) await recomputeGuest(b.guestProfile);
}
