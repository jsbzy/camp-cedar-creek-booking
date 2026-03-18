import { sites, siteTypes } from "./seed";
import type { Site, SiteType, SiteTypeInfo } from "@/types";

export function getSites(): Site[] {
  return sites;
}

export function getSiteBySlug(slug: string): Site | undefined {
  return sites.find((s) => s.slug === slug);
}

export function getSitesByType(type: SiteType): Site[] {
  return sites.filter((s) => s.type === type);
}

export function getSiteTypeInfo(type: SiteType): SiteTypeInfo | undefined {
  return siteTypes.find((t) => t.type === type);
}

export function getAllSiteTypes(): SiteTypeInfo[] {
  return siteTypes;
}
