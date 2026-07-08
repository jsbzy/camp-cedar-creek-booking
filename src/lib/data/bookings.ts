import type { Booking } from "@/types";
import { getDb } from "./db";

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
    createdAt: doc.createdAt,
  };
}

export async function createBooking(
  input: Omit<Booking, "id" | "createdAt" | "status">
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
      // Phase 2 (Stripe) will create as "pending" and confirm via webhook.
      status: "confirmed",
      source: "direct",
    },
  });
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
