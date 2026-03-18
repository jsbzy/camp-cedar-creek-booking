"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignaturePad } from "@/components/signature-pad";
import { useBookingStore } from "@/lib/booking-store";

export function WaiverStep() {
  const { waiverSigned, waiverSignature, setWaiver, nextStep, prevStep } =
    useBookingStore();
  const [agreed, setAgreed] = useState(waiverSigned);
  const [signature, setSignature] = useState(waiverSignature);

  function handleNext() {
    if (agreed && signature) {
      setWaiver(true, signature);
      nextStep();
    }
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold">Liability Waiver</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Please read and sign the waiver below.
      </p>

      <div className="mt-6 h-48 overflow-y-auto rounded-lg border bg-secondary p-4 text-sm leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">
          Camp Cedar Creek &mdash; Liability Waiver and Release of Claims
        </p>
        <p className="mt-3">
          I, the undersigned, acknowledge that outdoor recreational activities
          involve inherent risks including but not limited to: uneven terrain,
          wildlife encounters, weather changes, fire hazards, water hazards, and
          other natural conditions. I voluntarily assume all risks associated
          with my stay at Camp Cedar Creek.
        </p>
        <p className="mt-3">
          I agree to release, hold harmless, and indemnify Camp Cedar Creek, its
          owners, operators, employees, and agents from any and all claims,
          damages, losses, or expenses arising from my use of the facilities,
          trails, waterways, and surrounding areas.
        </p>
        <p className="mt-3">
          I agree to follow all posted campground rules, fire regulations, and
          quiet hours. I understand that violation of these rules may result in
          removal from the property without refund.
        </p>
        <p className="mt-3">
          I confirm that I am at least 18 years of age and am signing this
          waiver on behalf of myself and any minors in my party.
        </p>
      </div>

      <div className="mt-6">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 size-4 rounded border-input"
          />
          <span className="text-sm">
            I have read and agree to the liability waiver and release of claims.
          </span>
        </label>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-medium">Sign below</p>
        <SignaturePad onSave={(dataUrl) => setSignature(dataUrl)} />
        {signature && (
          <p className="mt-2 text-xs text-forest">Signature saved</p>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => prevStep()}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!agreed || !signature}>
          Next: Review
        </Button>
      </div>
    </div>
  );
}
