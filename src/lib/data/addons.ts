import { cache } from "react";
import type { AddOn, BookingAddOn, SiteType } from "@/types";
import { getDb } from "./db";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapAddon(doc: any): AddOn {
  return {
    id: String(doc.id),
    name: doc.name,
    description: doc.description ?? "",
    price: doc.price,
    perNight: Boolean(doc.perNight),
    applicableSiteTypes: (doc.applicableSiteTypes ?? []) as SiteType[],
    maxQuantity: doc.maxQuantity ?? 1,
  };
}

export const getAddons = cache(async (): Promise<AddOn[]> => {
  const db = await getDb();
  const res = await db.find({
    collection: "addons",
    where: { active: { equals: true } },
    sort: "sortOrder",
    pagination: false,
    depth: 0,
  });
  return res.docs.map(mapAddon);
});

export async function getAddonsForSiteType(type: SiteType): Promise<AddOn[]> {
  return (await getAddons()).filter((a) => a.applicableSiteTypes.includes(type));
}

// Never trust add-on prices from the client: re-resolve every requested add-on
// against the database, drop unknown/inapplicable ones, clamp quantities.
export async function sanitizeAddOns(
  siteType: SiteType,
  requested: { addOnId: string; quantity: number }[]
): Promise<BookingAddOn[]> {
  const valid = await getAddonsForSiteType(siteType);
  const byId = new Map(valid.map((a) => [a.id, a]));

  const result: BookingAddOn[] = [];
  for (const r of requested ?? []) {
    const addon = byId.get(String(r.addOnId));
    if (!addon) continue;
    const quantity = Math.min(Math.max(1, Math.floor(Number(r.quantity) || 1)), addon.maxQuantity);
    result.push({
      addOnId: addon.id,
      name: addon.name,
      quantity,
      unitPrice: addon.price,
      perNight: addon.perNight,
    });
  }
  return result;
}
