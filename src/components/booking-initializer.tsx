"use client";

import { useEffect } from "react";
import { useBookingStore } from "@/lib/booking-store";

interface BookingInitializerProps {
  siteSlug: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export function BookingInitializer({
  siteSlug,
  checkIn,
  checkOut,
  guests,
}: BookingInitializerProps) {
  const { setSiteSlug, setDates, setGuests } = useBookingStore();

  useEffect(() => {
    setSiteSlug(siteSlug);
    if (checkIn && checkOut) {
      setDates(checkIn, checkOut);
    }
    if (guests && guests > 0) {
      setGuests(guests);
    }
  }, [siteSlug, checkIn, checkOut, guests, setSiteSlug, setDates, setGuests]);

  return null;
}
