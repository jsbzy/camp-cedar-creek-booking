import { NextRequest, NextResponse } from "next/server";
import {
  getSiteBySlug,
  calculatePrice,
  checkDateRange,
  createBooking,
  attachStripeSession,
  cancelBooking,
  sanitizeAddOns,
} from "@/lib/data";
import { sendBookingConfirmation } from "@/lib/email";
import { getStripe, isStripeEnabled } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // The automated suite books and cancels for real, so it identifies itself
  // with the cron secret. Test bookings NEVER email the owners, and only
  // email the guest when the run explicitly asks (see scripts/booking-smoketest.mjs).
  const testHeader = request.headers.get("x-smoketest");
  const isTest = !!process.env.CRON_SECRET && testHeader === process.env.CRON_SECRET;
  const testWantsEmail = isTest && request.headers.get("x-smoketest-emails") === "send";
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

  const site = await getSiteBySlug(siteSlug);
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Check availability
  if (!(await checkDateRange(site, checkIn, checkOut))) {
    return NextResponse.json(
      { error: "Selected dates are no longer available" },
      { status: 409 }
    );
  }

  // Never trust client prices — resolve add-ons and recalculate server-side
  const safeAddOns = await sanitizeAddOns(site.type, addOns);
  const pricing = calculatePrice(site, checkIn, checkOut, safeAddOns);

  const stripeMode = isStripeEnabled();

  const booking = await createBooking(
    {
      siteId: siteId || site.id,
      siteSlug,
      siteName: siteName || site.name,
      checkIn,
      checkOut,
      nights: pricing.nights,
      guests,
      guest,
      addOns: safeAddOns,
      nightlyBreakdown: pricing.nightlyBreakdown,
      subtotal: pricing.subtotal,
      addOnsTotal: pricing.addOnsTotal,
      total: pricing.total,
      waiverSigned,
      waiverSignature,
    },
    // Stripe flow: hold as pending, webhook confirms after payment.
    { status: stripeMode ? "pending" : "confirmed", isTest }
  );

  if (!stripeMode) {
    // Demo flow (no Stripe keys): booking is confirmed immediately.
    if (!isTest || testWantsEmail) await sendBookingConfirmation(booking, { skipOwner: isTest });
    return NextResponse.json({ booking }, { status: 201 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const stripe = getStripe();
  const lineItems = [
    {
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(pricing.subtotal * 100),
        product_data: {
          name: `${booking.siteName}, ${pricing.nights} night${pricing.nights !== 1 ? "s" : ""}`,
          description: `${checkIn} to ${checkOut} · ${guests} guest${guests !== 1 ? "s" : ""}`,
        },
      },
    },
    ...safeAddOns.map((a) => ({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(
          a.unitPrice * a.quantity * (a.perNight ? pricing.nights : 1) * 100
        ),
        product_data: {
          name: `${a.name} ×${a.quantity}${a.perNight ? ` × ${pricing.nights} nights` : ""}`,
        },
      },
    })),
  ];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: booking.guest.email,
      line_items: lineItems,
      metadata: { confirmationCode: booking.id },
      success_url: `${appUrl}/book/confirmation`,
      cancel_url: `${appUrl}/book/${siteSlug}`,
      // Abandoned sessions expire quickly so pending bookings release their
      // dates via the checkout.session.expired webhook.
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });
    await attachStripeSession(booking.id, session.id);
    return NextResponse.json({ booking, checkoutUrl: session.url }, { status: 201 });
  } catch (err) {
    console.error("[stripe] failed to create checkout session:", err);
    // Release the held dates — the guest never saw a payment page.
    await cancelBooking(booking.id, { reason: "Payment initialization failed", refundAmount: 0 });
    return NextResponse.json(
      { error: "Payment could not be initialized. Please try again." },
      { status: 502 }
    );
  }
}
