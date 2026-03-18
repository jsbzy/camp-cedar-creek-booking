"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBookingStore } from "@/lib/booking-store";

export function GuestInfoStep() {
  const { guestInfo, setGuestInfo, nextStep, prevStep } = useBookingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!guestInfo.firstName.trim()) newErrors.firstName = "First name is required";
    if (!guestInfo.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!guestInfo.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email))
      newErrors.email = "Invalid email address";
    if (!guestInfo.phone.trim()) newErrors.phone = "Phone is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validate()) nextStep();
  }

  function update(field: string, value: string) {
    setGuestInfo({ ...guestInfo, [field]: value });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold">Guest Information</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell us who&apos;s checking in.
      </p>

      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={guestInfo.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className="mt-1"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={guestInfo.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className="mt-1"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={guestInfo.email}
            onChange={(e) => update("email", e.target.value)}
            className="mt-1"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            value={guestInfo.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="mt-1"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
          )}
        </div>

        <div>
          <Label htmlFor="specialRequests">Special Requests</Label>
          <Textarea
            id="specialRequests"
            value={guestInfo.specialRequests ?? ""}
            onChange={(e) => update("specialRequests", e.target.value)}
            rows={3}
            placeholder="Any special needs or requests..."
            className="mt-1"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => prevStep()}>
          Back
        </Button>
        <Button onClick={handleNext}>Next: Waiver</Button>
      </div>
    </div>
  );
}
