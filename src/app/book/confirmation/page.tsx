"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Booking } from "@/types";

export default function ConfirmationPage() {
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("lastBooking");
    if (stored) {
      setBooking(JSON.parse(stored));
    }
  }, []);

  if (!booking) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold">No Booking Found</h1>
        <p className="mt-2 text-muted-foreground">
          It looks like you haven&apos;t completed a booking yet.
        </p>
        <Button render={<Link href="/sites" />} className="mt-6">
          Browse Sites
        </Button>
      </div>
    );
  }

  const icsStart = booking.checkIn.replace(/-/g, "") + "T150000";
  const icsEnd = booking.checkOut.replace(/-/g, "") + "T110000";
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${icsStart}`,
    `DTEND:${icsEnd}`,
    `SUMMARY:Camp Cedar Creek - ${booking.siteName}`,
    `DESCRIPTION:Booking ${booking.id}\\nGuests: ${booking.guests}`,
    "LOCATION:Camp Cedar Creek, Sandy, Oregon",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");

  const icsDataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <div className="text-5xl">🏕️</div>
      <h1 className="mt-4 font-heading text-3xl font-bold">Booking Confirmed!</h1>
      <p className="mt-2 text-muted-foreground">
        We can&apos;t wait to see you at Camp Cedar Creek.
      </p>

      <div className="mt-8 rounded-lg border bg-card p-6 text-left">
        <h2 className="font-heading text-lg font-semibold">{booking.siteName}</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Confirmation #</span>
            <span className="font-mono text-xs">{booking.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-in</span>
            <span>
              {format(new Date(booking.checkIn + "T12:00:00"), "EEEE, MMMM d, yyyy")} at 3:00 PM
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-out</span>
            <span>
              {format(new Date(booking.checkOut + "T12:00:00"), "EEEE, MMMM d, yyyy")} at 11:00 AM
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Guests</span>
            <span>{booking.guests}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nights</span>
            <span>{booking.nights}</span>
          </div>

          <Separator className="my-3" />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Guest</span>
            <span>
              {booking.guest.firstName} {booking.guest.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{booking.guest.email}</span>
          </div>

          <Separator className="my-3" />

          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>${booking.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a
          href={icsDataUrl}
          download={`camp-cedar-creek-${booking.id}.ics`}
          className="inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-secondary"
        >
          Add to Calendar
        </a>
        <Button render={<Link href="/" />} variant="outline">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
