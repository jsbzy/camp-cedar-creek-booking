"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CancelBookingCardProps {
  token: string;
  policyText: string;
  refundAmount: number;
  refundPercent: number;
  daysUntilCheckIn: number;
}

export function CancelBookingCard({
  token,
  policyText,
  refundAmount,
  refundPercent,
  daysUntilCheckIn,
}: CancelBookingCardProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Cancellation failed");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8 rounded-lg border p-6">
      <h2 className="font-heading text-lg font-semibold">Need to cancel?</h2>
      <p className="mt-2 text-sm text-muted-foreground">{policyText}</p>
      <p className="mt-3 text-sm">
        Your check-in is <strong>{daysUntilCheckIn} day{daysUntilCheckIn !== 1 ? "s" : ""}</strong>{" "}
        away. Cancelling today refunds{" "}
        <strong>
          ${refundAmount.toFixed(2)} ({refundPercent}%)
        </strong>
        .
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <div className="mt-4 flex gap-3">
        {confirming ? (
          <>
            <Button variant="destructive" onClick={handleCancel} disabled={submitting}>
              {submitting ? "Cancelling..." : "Yes, cancel this booking"}
            </Button>
            <Button variant="outline" onClick={() => setConfirming(false)} disabled={submitting}>
              Keep my booking
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => setConfirming(true)}>
            Cancel booking
          </Button>
        )}
      </div>
    </div>
  );
}
