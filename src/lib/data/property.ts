import { cache } from "react";
import type { CancellationTerms, PropertyInfo, PropertyRating } from "@/types";
import { getDb } from "./db";

/* eslint-disable @typescript-eslint/no-explicit-any */
const getSettings = cache(async (): Promise<any> => {
  const db = await getDb();
  return db.findGlobal({ slug: "settings", depth: 0 });
});

export async function getPropertyInfo(): Promise<PropertyInfo> {
  const s = await getSettings();
  return {
    name: s.propertyName ?? "Camp Cedar Creek",
    location: s.location ?? "",
    coordinates: { lat: s.coordinates?.lat ?? 0, lng: s.coordinates?.lng ?? 0 },
    checkInTime: s.checkInTime ?? "",
    checkOutTime: s.checkOutTime ?? "",
    quietHours: s.quietHours ?? "",
    cancellationPolicy: s.cancellationPolicy ?? "",
    cancellationTerms: {
      fullRefundDays: s.cancellationTerms?.fullRefundDays ?? 14,
      partialRefundDays: s.cancellationTerms?.partialRefundDays ?? 2,
      partialRefundPercent: s.cancellationTerms?.partialRefundPercent ?? 50,
    },
    houseRules: (s.houseRules ?? []).map((r: any) => r.rule),
    sharedAmenities: (s.sharedAmenities ?? []).map((a: any) => a.label),
    host: {
      names: s.host?.names ?? "",
      bio: s.host?.bio ?? "",
      responseRate: s.host?.responseRate ?? 0,
      responseTime: s.host?.responseTime ?? "",
      email: s.host?.email ?? "",
    },
  };
}

export async function getCancellationTerms(): Promise<CancellationTerms> {
  const info = await getPropertyInfo();
  return info.cancellationTerms;
}

export async function getPropertyRating(): Promise<PropertyRating> {
  const s = await getSettings();
  return {
    average: s.rating?.average ?? 0,
    count: s.rating?.count ?? 0,
    breakdown: (s.rating?.breakdown ?? {}) as Record<number, number>,
  };
}
