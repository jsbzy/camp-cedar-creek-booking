import type { Booking } from "@/types";

// In-memory store for PoC
export const bookings: Booking[] = [];

export function createBooking(booking: Omit<Booking, "id" | "createdAt" | "status">): Booking {
  const newBooking: Booking = {
    ...booking,
    id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  return newBooking;
}

export function getBookingById(id: string): Booking | undefined {
  return bookings.find((b) => b.id === id);
}
