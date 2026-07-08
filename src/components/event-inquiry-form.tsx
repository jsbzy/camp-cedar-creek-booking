"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EventInquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        const fd = new FormData(e.currentTarget);
        try {
          const res = await fetch("/api/events/inquiry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: fd.get("name"),
              email: fd.get("email"),
              phone: fd.get("phone"),
              eventType: fd.get("eventType"),
              guestCount: fd.get("guestCount"),
              dates: fd.get("dates"),
              message: fd.get("details"),
            }),
          });
          if (!res.ok) throw new Error("Request failed");
          setSubmitted(true);
        } catch {
          setError("Something went wrong — please try again or email us directly.");
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="eventType">Type of Event</Label>
        <Input
          id="eventType"
          name="eventType"
          placeholder="Wedding, retreat, reunion..."
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="guestCount">Estimated Guest Count</Label>
        <Input id="guestCount" name="guestCount" type="number" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="dates">Preferred Dates</Label>
        <Input id="dates" name="dates" placeholder="e.g. July 15-17, 2025" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="details">Tell Us More</Label>
        <Textarea
          id="details"
          name="details"
          rows={4}
          placeholder="Any details about your event..."
          className="mt-1"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Sending..." : "Submit Inquiry"}
      </Button>
    </form>
  );
}
