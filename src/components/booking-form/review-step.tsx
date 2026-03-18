"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useBookingStore } from "@/lib/booking-store";
import type { Site } from "@/types";

interface ReviewStepProps {
  site: Site;
}

export function ReviewStep({ site }: ReviewStepProps) {
  const router = useRouter();
  const store = useBookingStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteSlug: site.slug,
          siteName: site.name,
          siteId: site.id,
          checkIn: store.checkIn,
          checkOut: store.checkOut,
          guests: store.guests,
          guest: store.guestInfo,
          addOns: store.addOns,
          waiverSigned: store.waiverSigned,
          waiverSignature: store.waiverSignature,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Booking failed");
      }

      const { booking } = await res.json();
      store.reset();
      router.push(`/book/confirmation/${booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold">Review Your Booking</h2>

      {/* Site */}
      <div className="mt-6 rounded-lg bg-secondary p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{site.name}</h3>
          <Button variant="ghost" size="sm" onClick={() => store.setStep(1)}>
            Edit
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {store.checkIn && store.checkOut && (
            <>
              {format(new Date(store.checkIn + "T12:00:00"), "MMM d, yyyy")} &mdash;{" "}
              {format(new Date(store.checkOut + "T12:00:00"), "MMM d, yyyy")}
            </>
          )}
          {" \u00B7 "}{store.nightlyBreakdown.length} night{store.nightlyBreakdown.length !== 1 ? "s" : ""}
          {" \u00B7 "}{store.guests} guest{store.guests !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Nightly breakdown */}
      <div className="mt-4 space-y-1 text-sm">
        {store.nightlyBreakdown.map((night) => (
          <div key={night.date} className="flex justify-between">
            <span className="text-muted-foreground">
              {format(new Date(night.date + "T12:00:00"), "EEE, MMM d")}
            </span>
            <span>${night.price}</span>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      {/* Add-ons */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Add-ons</h3>
        <Button variant="ghost" size="sm" onClick={() => store.setStep(2)}>
          Edit
        </Button>
      </div>
      {store.addOns.length > 0 ? (
        <div className="mt-2 space-y-1 text-sm">
          {store.addOns.map((addon) => (
            <div key={addon.addOnId} className="flex justify-between">
              <span className="text-muted-foreground">
                {addon.name} x{addon.quantity}
                {addon.perNight ? ` x ${store.nightlyBreakdown.length} nights` : ""}
              </span>
              <span>
                $
                {addon.unitPrice *
                  addon.quantity *
                  (addon.perNight ? store.nightlyBreakdown.length : 1)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">None selected</p>
      )}

      <Separator className="my-4" />

      {/* Guest info */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Guest</h3>
        <Button variant="ghost" size="sm" onClick={() => store.setStep(3)}>
          Edit
        </Button>
      </div>
      <div className="mt-1 text-sm text-muted-foreground">
        <p>
          {store.guestInfo.firstName} {store.guestInfo.lastName}
        </p>
        <p>{store.guestInfo.email}</p>
        <p>{store.guestInfo.phone}</p>
        {store.guestInfo.specialRequests && (
          <p className="mt-1 italic">{store.guestInfo.specialRequests}</p>
        )}
      </div>

      <Separator className="my-4" />

      {/* Waiver */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Waiver</h3>
        <Button variant="ghost" size="sm" onClick={() => store.setStep(4)}>
          Edit
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {store.waiverSigned ? "Signed \u2713" : "Not signed"}
      </p>

      <Separator className="my-4" />

      {/* Total */}
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${store.subtotal.toFixed(2)}</span>
        </div>
        {store.addOnsTotal > 0 && (
          <div className="flex justify-between">
            <span>Add-ons</span>
            <span>${store.addOnsTotal.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${store.total.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => store.prevStep()}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Processing..." : "Proceed to Payment"}
        </Button>
      </div>
    </div>
  );
}
