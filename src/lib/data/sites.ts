import { cache } from "react";
import type { Site, SiteType, SiteTypeInfo } from "@/types";
import { siteTypes } from "../site-types";
import { getDb } from "./db";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapSite(doc: any): Site {
  return {
    id: String(doc.id),
    slug: doc.slug,
    name: doc.name,
    type: doc.type as SiteType,
    description: doc.description ?? "",
    shortDescription: doc.shortDescription ?? "",
    photos: (doc.photos ?? []).map((p: any) => p.url),
    amenities: (doc.amenities ?? []).map((a: any) => a.label),
    maxGuests: doc.maxGuests,
    basePrice: doc.basePrice,
    weekendPrice: doc.weekendPrice,
    isCombo: Boolean(doc.isCombo),
    componentSiteSlugs: (doc.componentSiteSlugs ?? []).map((c: any) => c.slug),
    latitude: doc.latitude ?? undefined,
    longitude: doc.longitude ?? undefined,
  };
}

export const getSites = cache(async (): Promise<Site[]> => {
  const db = await getDb();
  const res = await db.find({
    collection: "sites",
    where: { status: { equals: "active" } },
    sort: "sortOrder",
    pagination: false,
    depth: 0,
  });
  return res.docs.map(mapSite);
});

export const getSiteBySlug = cache(async (slug: string): Promise<Site | undefined> => {
  const db = await getDb();
  const res = await db.find({
    collection: "sites",
    where: { and: [{ slug: { equals: slug } }, { status: { equals: "active" } }] },
    limit: 1,
    depth: 0,
  });
  return res.docs[0] ? mapSite(res.docs[0]) : undefined;
});

export async function getSitesByType(type: SiteType): Promise<Site[]> {
  return (await getSites()).filter((s) => s.type === type);
}

export function getSiteTypeInfo(type: SiteType): SiteTypeInfo | undefined {
  return siteTypes.find((t) => t.type === type);
}

export function getAllSiteTypes(): SiteTypeInfo[] {
  return siteTypes;
}
