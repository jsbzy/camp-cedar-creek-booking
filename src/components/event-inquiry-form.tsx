"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EventInquiryForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-lg border border-forest/20 bg-forest/5 p-6 text-center">
        <p className="font-heading text-lg font-semibold text-forest">
          Thanks for your inquiry!
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll review your request and get back to you within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" type="tel" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="eventType">Type of Event</Label>
        <Input
          id="eventType"
          placeholder="Wedding, retreat, reunion..."
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="guestCount">Estimated Guest Count</Label>
        <Input id="guestCount" type="number" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="dates">Preferred Dates</Label>
        <Input id="dates" placeholder="e.g. July 15-17, 2025" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="details">Tell Us More</Label>
        <Textarea
          id="details"
          rows={4}
          placeholder="Any details about your event..."
          className="mt-1"
        />
      </div>
      <Button type="submit" className="w-full">
        Submit Inquiry
      </Button>
    </form>
  );
}
