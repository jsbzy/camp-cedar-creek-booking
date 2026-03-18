import { addOns } from "./seed";
import type { AddOn, SiteType } from "@/types";

export function getAddons(): AddOn[] {
  return addOns;
}

export function getAddonsForSiteType(type: SiteType): AddOn[] {
  return addOns.filter((a) => a.applicableSiteTypes.includes(type));
}
