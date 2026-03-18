import { NextRequest, NextResponse } from "next/server";
import { getSiteBySlug, calculatePrice, checkDateRange, createBooking } from "@/lib/data";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    siteSlug,
    siteName,
    siteId,
    checkIn,
    checkOut,
    guests,
    guest,
    addOns = [],
    waiverSigned,
    waiverSignature,
  } = body;

  // Validate required fields
  if (!siteSlug || !checkIn || !checkOut || !guest || !waiverSigned) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const site = getSiteBySlug(siteSlug);
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Check availability
  if (!checkDateRange(site, checkIn, checkOut)) {
    return NextResponse.json(
      { error: "Selected dates are no longer available" },
      { status: 409 }
    );
  }

  // Recalculate price server-side
  const pricing = calculatePrice(site, checkIn, checkOut, addOns);

  const booking = createBooking({
    siteId: siteId || site.id,
    siteSlug,
    siteName: siteName || site.name,
    checkIn,
    checkOut,
    nights: pricing.nights,
    guests,
    guest,
    addOns,
    nightlyBreakdown: pricing.nightlyBreakdown,
    subtotal: pricing.subtotal,
    addOnsTotal: pricing.addOnsTotal,
    total: pricing.total,
    waiverSigned,
    waiverSignature,
  });

  return NextResponse.json({ booking }, { status: 201 });
}
