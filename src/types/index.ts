export type SiteType =
  | "tent"
  | "van_solar"
  | "van_power"
  | "glamping";

export interface Site {
  id: string;
  slug: string;
  name: string;
  type: SiteType;
  description: string;
  shortDescription: string;
  photos: string[];
  amenities: string[];
  maxGuests: number;
  basePrice: number;
  weekendPrice: number;
  isCombo: boolean;
  componentSiteSlugs?: string[];
  latitude?: number;
  longitude?: number;
}

export interface PricingRule {
  id: string;
  name: string;
  type: "weekday" | "weekend" | "holiday";
  multiplier: number;
  startDate?: string;
  endDate?: string;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  perNight: boolean;
  applicableSiteTypes: SiteType[];
  maxQuantity: number;
}

export interface DateAvailability {
  date: string;
  available: boolean;
  price: number;
}

export interface BookingGuest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface BookingAddOn {
  addOnId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  perNight: boolean;
}

export interface Booking {
  id: string;
  siteId: string;
  siteSlug: string;
  siteName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guest: BookingGuest;
  addOns: BookingAddOn[];
  nightlyBreakdown: { date: string; price: number }[];
  subtotal: number;
  addOnsTotal: number;
  total: number;
  waiverSigned: boolean;
  waiverSignature?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface PriceCalculation {
  nights: number;
  nightlyBreakdown: { date: string; price: number }[];
  subtotal: number;
  addOnsTotal: number;
  total: number;
}

export interface SiteTypeInfo {
  type: SiteType;
  label: string;
  pluralLabel: string;
  description: string;
  icon: string;
}

// Phase 2 — Property Info
export interface PropertyInfo {
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  checkInTime: string;
  checkOutTime: string;
  quietHours: string;
  cancellationPolicy: string;
  houseRules: string[];
  sharedAmenities: string[];
  host: {
    names: string;
    bio: string;
    responseRate: number;
    responseTime: string;
    email: string;
  };
}

// Phase 3 — Reviews
export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
  siteSlug: string;
  recommends: boolean;
}

export interface PropertyRating {
  average: number;
  count: number;
  breakdown: Record<number, number>;
}
