import { create } from "zustand";
import type { BookingGuest, BookingAddOn } from "@/types";

interface BookingState {
  // Step tracking
  currentStep: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Step 1 — Dates
  siteSlug: string;
  setSiteSlug: (slug: string) => void;
  checkIn: string | null;
  checkOut: string | null;
  setDates: (checkIn: string, checkOut: string) => void;
  guests: number;
  setGuests: (guests: number) => void;

  // Step 2 — Add-ons
  addOns: BookingAddOn[];
  setAddOns: (addOns: BookingAddOn[]) => void;

  // Step 3 — Guest info
  guestInfo: BookingGuest;
  setGuestInfo: (info: BookingGuest) => void;

  // Step 4 — Waiver
  waiverSigned: boolean;
  waiverSignature: string;
  setWaiver: (signed: boolean, signature: string) => void;

  // Pricing (calculated)
  nightlyBreakdown: { date: string; price: number }[];
  subtotal: number;
  addOnsTotal: number;
  total: number;
  setPricing: (pricing: {
    nightlyBreakdown: { date: string; price: number }[];
    subtotal: number;
    addOnsTotal: number;
    total: number;
  }) => void;

  // Reset
  reset: () => void;
}

const initialGuestInfo: BookingGuest = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  specialRequests: "",
};

export const useBookingStore = create<BookingState>((set) => ({
  currentStep: 1,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 5) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),

  siteSlug: "",
  setSiteSlug: (slug) => set({ siteSlug: slug }),
  checkIn: null,
  checkOut: null,
  setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),
  guests: 1,
  setGuests: (guests) => set({ guests }),

  addOns: [],
  setAddOns: (addOns) => set({ addOns }),

  guestInfo: initialGuestInfo,
  setGuestInfo: (guestInfo) => set({ guestInfo }),

  waiverSigned: false,
  waiverSignature: "",
  setWaiver: (waiverSigned, waiverSignature) =>
    set({ waiverSigned, waiverSignature }),

  nightlyBreakdown: [],
  subtotal: 0,
  addOnsTotal: 0,
  total: 0,
  setPricing: (pricing) => set(pricing),

  reset: () =>
    set({
      currentStep: 1,
      siteSlug: "",
      checkIn: null,
      checkOut: null,
      guests: 1,
      addOns: [],
      guestInfo: initialGuestInfo,
      waiverSigned: false,
      waiverSignature: "",
      nightlyBreakdown: [],
      subtotal: 0,
      addOnsTotal: 0,
      total: 0,
    }),
}));
