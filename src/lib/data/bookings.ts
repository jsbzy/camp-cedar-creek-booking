import type { Booking } from "@/types";
import { getDb } from "./db";
import { attachGuestToBooking, refreshGuestForBooking } from "@/lib/guests/attach";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapBooking(doc: any): Booking {
  return {
    id: doc.confirmationCode ?? String(doc.id),
    siteId:
      typeof doc.site === "object" && doc.site !== null ? String(doc.site.id) : String(doc.site ?? ""),
    siteSlug: doc.siteSlug,
    siteName: doc.siteName,
    checkIn: doc.checkIn,
    checkOut: doc.checkOut,
    nights: doc.nights,
    guests: doc.guests,
    guest: {
      firstName: doc.guest?.firstName ?? "",
      lastName: doc.guest?.lastName ?? "",
      email: doc.guest?.email ?? "",
      phone: doc.guest?.phone ?? "",
      specialRequests: doc.guest?.specialRequests ?? undefined,
    },
    addOns: (doc.addOns ?? []).map((a: any) => ({
      addOnId: a.addOnId,
      name: a.name,
      quantity: a.quantity,
      unitPrice: a.unitPrice,
      perNight: Boolean(a.perNight),
    })),
    nightlyBreakdown: (doc.nightlyBreakdown ?? []) as { date: string; price: number }[],
    subtotal: doc.subtotal,
    addOnsTotal: doc.addOnsTotal,
    total: doc.total,
    waiverSigned: Boolean(doc.waiverSigned),
    waiverSignature: doc.waiverSignature ?? undefined,
    status: doc.status,
    magicLinkToken: doc.magicLinkToken ?? undefined,
    stripePaymentIntent: doc.stripePaymentIntent ?? undefined,
    cancelledAt: doc.cancelledAt ?? undefined,
    isTest: Boolean(doc.isTest),
    cancellationReason: doc.cancellationReason ?? undefined,
    notifications: doc.notifications ?? undefined,
    refundAmount: doc.refundAmount ?? undefined,
    createdAt: doc.createdAt,
  };
}

export async function createBooking(
  input: Omit<Booking, "id" | "createdAt" | "status">,
  options: { status?: "pending" | "confirmed"; isTest?: boolean } = {}
): Promise<Booking> {
  const db = await getDb();
  const siteRes = await db.find({
    collection: "sites",
    where: { slug: { equals: input.siteSlug } },
    limit: 1,
    depth: 0,
  });
  const siteDoc = siteRes.docs[0];

  const doc = await db.create({
    collection: "bookings",
    data: {
      site: siteDoc ? siteDoc.id : undefined,
      siteSlug: input.siteSlug,
      siteName: input.siteName,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      nights: input.nights,
      guests: input.guests,
      guest: input.guest,
      addOns: input.addOns,
      nightlyBreakdown: input.nightlyBreakdown,
      subtotal: input.subtotal,
      addOnsTotal: input.addOnsTotal,
      total: input.total,
      waiverSigned: input.waiverSigned,
      waiverSignature: input.waiverSignature,
      isTest: options.isTest ?? false,
      // Stripe flow creates as "pending" and confirms via webhook; the
      // no-keys demo flow confirms immediately.
      status: options.status ?? "confirmed",
      source: "direct",
    },
  });
  // Link the booking to a guest profile, creating one if this is someone new.
  // Test bookings get no profile: the guest list is for real people.
  // Never let a CRM problem fail a booking.
  try {
    if (!options.isTest) await attachGuestToBooking(doc.id, input.guest);
  } catch (err) {
    console.error("[guests] could not attach a profile to " + doc.id + ":", err);
  }

  return mapBooking(doc);
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  const db = await getDb();
  const res = await db.find({
    collection: "bookings",
    where: { confirmationCode: { equals: id } },
    limit: 1,
    depth: 0,
  });
  return res.docs[0] ? mapBooking(res.docs[0]) : undefined;
}

export async function getBookingByToken(token: string): Promise<Booking | undefined> {
  if (!token) return undefined;
  const db = await getDb();
  const res = await db.find({
    collection: "bookings",
    where: { magicLinkToken: { equals: token } },
    limit: 1,
    depth: 0,
  });
  return res.docs[0] ? mapBooking(res.docs[0]) : undefined;
}

async function updateByCode(confirmationCode: string, data: Record<string, unknown>) {
  const db = await getDb();
  const res = await db.update({
    collection: "bookings",
    where: { confirmationCode: { equals: confirmationCode } },
    data,
  });
  const doc = (res.docs ?? [])[0];
  return doc ? mapBooking(doc) : undefined;
}

export async function attachStripeSession(
  confirmationCode: string,
  stripeSessionId: string
): Promise<Booking | undefined> {
  return updateByCode(confirmationCode, { stripeSessionId });
}

export async function confirmBooking(
  confirmationCode: string,
  stripe?: { stripeSessionId?: string; stripePaymentIntent?: string }
): Promise<Booking | undefined> {
  return updateByCode(confirmationCode, { status: "confirmed", ...stripe });
}

export async function cancelBooking(
  confirmationCode: string,
  opts: { reason?: string; refundAmount: number; refunded?: boolean }
): Promise<Booking | undefined> {
  const updated = await updateByCode(confirmationCode, {
    // "refunded" only once money has actually moved (Stripe refund issued);
    // until keys exist the demo flow always lands on "cancelled".
    status: opts.refunded ? "refunded" : "cancelled",
    cancellationReason: opts.reason || undefined,
    cancelledAt: new Date().toISOString(),
    refundAmount: opts.refundAmount,
  });
  // Their totals move when a stay is cancelled.
  if (updated) {
    try {
      await refreshGuestForBooking(updated.id);
    } catch (err) {
      console.error("[guests] could not refresh totals after cancelling " + confirmationCode + ":", err);
    }
  }
  return updated;
}

export async function markNotificationSent(
  confirmationCode: string,
  field: "confirmationSentAt" | "preArrivalSentAt" | "dayBeforeSentAt" | "postStaySentAt"
): Promise<void> {
  const db = await getDb();
  const res = await db.find({
    collection: "bookings",
    where: { confirmationCode: { equals: confirmationCode } },
    limit: 1,
    depth: 0,
  });
  const doc: any = res.docs[0];
  if (!doc) return;
  await updateByCode(confirmationCode, {
    notifications: { ...(doc.notifications ?? {}), [field]: new Date().toISOString() },
  });
}

/**
 * Confirmed bookings whose lifecycle email is due today and not yet sent.
 * `field` picks the checked date column and the notifications flag.
 */
export async function findBookingsDueForEmail(
  field: "preArrivalSentAt" | "dayBeforeSentAt" | "postStaySentAt",
  date: string
): Promise<Booking[]> {
  const db = await getDb();
  const dateField = field === "postStaySentAt" ? "checkOut" : "checkIn";
  const res = await db.find({
    collection: "bookings",
    pagination: false,
    depth: 0,
    where: {
      and: [
        { status: { equals: "confirmed" } },
        { [dateField]: { equals: date } },
        { [`notifications.${field}`]: { exists: false } },
      ],
    },
  });
  return res.docs.map(mapBooking);
}
