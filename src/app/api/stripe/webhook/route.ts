import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { cancelBooking, confirmBooking, getBookingById } from "@/lib/data/bookings";
import { sendBookingConfirmation } from "@/lib/email";
import { getStripe, isStripeEnabled } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook — the only thing that flips a Stripe-flow booking from
 * `pending` to `confirmed`. Also releases dates when a Checkout Session
 * expires without payment.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeEnabled() || !webhookSecret) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch (err) {
    console.error("[stripe] webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const code = session.metadata?.confirmationCode;
    if (!code) {
      console.error(`[stripe] ${event.type} without confirmationCode metadata (${session.id})`);
      return NextResponse.json({ received: true });
    }

    const booking = await getBookingById(code);
    if (!booking) {
      console.error(`[stripe] ${event.type}: no booking for code ${code}`);
      return NextResponse.json({ received: true });
    }

    if (event.type === "checkout.session.completed") {
      if (booking.status === "pending") {
        const confirmed = await confirmBooking(code, {
          stripeSessionId: session.id,
          stripePaymentIntent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id,
        });
        if (confirmed) await sendBookingConfirmation(confirmed);
        console.log(`[stripe] booking ${code} confirmed via checkout session ${session.id}`);
      }
    } else if (booking.status === "pending") {
      // Expired without payment — release the dates.
      await cancelBooking(code, { reason: "Payment session expired", refundAmount: 0 });
      console.log(`[stripe] booking ${code} cancelled — checkout session expired`);
    }
  }

  return NextResponse.json({ received: true });
}
