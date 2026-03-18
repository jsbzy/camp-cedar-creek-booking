"use client";

import { useBookingStore } from "@/lib/booking-store";
import { Button } from "@/components/ui/button";
import type { Site, AddOn, BookingAddOn } from "@/types";

interface AddonsStepProps {
  site: Site;
  availableAddOns: AddOn[];
}

export function AddonsStep({ site, availableAddOns }: AddonsStepProps) {
  const { addOns, setAddOns, nightlyBreakdown, subtotal, setPricing, nextStep, prevStep } =
    useBookingStore();
  const nights = nightlyBreakdown.length;

  const filtered = availableAddOns.filter((a) =>
    a.applicableSiteTypes.includes(site.type)
  );

  function getQuantity(addOnId: string): number {
    return addOns.find((a) => a.addOnId === addOnId)?.quantity ?? 0;
  }

  function updateQuantity(addon: AddOn, quantity: number) {
    let updated: BookingAddOn[];
    if (quantity === 0) {
      updated = addOns.filter((a) => a.addOnId !== addon.id);
    } else {
      const existing = addOns.find((a) => a.addOnId === addon.id);
      if (existing) {
        updated = addOns.map((a) =>
          a.addOnId === addon.id ? { ...a, quantity } : a
        );
      } else {
        updated = [
          ...addOns,
          {
            addOnId: addon.id,
            name: addon.name,
            quantity,
            unitPrice: addon.price,
            perNight: addon.perNight,
          },
        ];
      }
    }
    setAddOns(updated);

    // Recalculate total
    const addOnsTotal = updated.reduce((sum, a) => {
      return sum + a.unitPrice * a.quantity * (a.perNight ? nights : 1);
    }, 0);
    setPricing({
      nightlyBreakdown,
      subtotal,
      addOnsTotal,
      total: subtotal + addOnsTotal,
    });
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold">Add-ons</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enhance your stay with these optional extras.
      </p>

      <div className="mt-6 space-y-4">
        {filtered.map((addon) => {
          const qty = getQuantity(addon.id);
          return (
            <div
              key={addon.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex-1">
                <h3 className="font-medium">{addon.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {addon.description}
                </p>
                <p className="mt-1 text-sm font-medium">
                  ${addon.price}
                  {addon.perNight ? "/night" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(addon, Math.max(0, qty - 1))}
                  className="flex size-8 items-center justify-center rounded-md border text-lg"
                  disabled={qty === 0}
                >
                  -
                </button>
                <span className="w-6 text-center font-medium">{qty}</span>
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(addon, Math.min(addon.maxQuantity, qty + 1))
                  }
                  className="flex size-8 items-center justify-center rounded-md border text-lg"
                  disabled={qty >= addon.maxQuantity}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="mt-6 text-center text-muted-foreground">
          No add-ons available for this site type.
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => prevStep()}>
          Back
        </Button>
        <Button onClick={() => nextStep()}>Next: Guest Info</Button>
      </div>
    </div>
  );
}
