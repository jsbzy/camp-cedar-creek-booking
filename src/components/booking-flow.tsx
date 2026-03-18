"use client";

import { useBookingStore } from "@/lib/booking-store";
import { DateStep } from "@/components/booking-form/date-step";
import { AddonsStep } from "@/components/booking-form/addons-step";
import { GuestInfoStep } from "@/components/booking-form/guest-info-step";
import { WaiverStep } from "@/components/booking-form/waiver-step";
import { ReviewStep } from "@/components/booking-form/review-step";
import type { Site, AddOn } from "@/types";

const stepLabels = ["Dates", "Add-ons", "Guest Info", "Waiver", "Review"];

interface BookingFlowProps {
  site: Site;
  addOns: AddOn[];
}

export function BookingFlow({ site, addOns }: BookingFlowProps) {
  const { currentStep, total } = useBookingStore();

  return (
    <div className="mx-auto max-w-3xl">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-between">
        {stepLabels.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;
          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? "\u2713" : stepNum}
                </div>
                <span
                  className={`mt-1 text-xs ${
                    isActive ? "font-medium" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div
                  className={`mx-2 h-px flex-1 ${
                    isCompleted ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="rounded-lg border bg-card p-6 md:p-8">
        {currentStep === 1 && <DateStep site={site} />}
        {currentStep === 2 && <AddonsStep site={site} availableAddOns={addOns} />}
        {currentStep === 3 && <GuestInfoStep />}
        {currentStep === 4 && <WaiverStep />}
        {currentStep === 5 && <ReviewStep site={site} />}
      </div>

      {/* Sticky price total */}
      {total > 0 && (
        <div className="sticky bottom-0 mt-4 rounded-lg border bg-card p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-heading font-semibold">Total</span>
            <span className="text-2xl font-bold">${total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
