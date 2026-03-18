"use client";

import { useEffect } from "react";
import { useBookingStore } from "@/lib/booking-store";

export function BookingInitializer({ siteSlug }: { siteSlug: string }) {
  const setSiteSlug = useBookingStore((s) => s.setSiteSlug);

  useEffect(() => {
    setSiteSlug(siteSlug);
  }, [siteSlug, setSiteSlug]);

  return null;
}
