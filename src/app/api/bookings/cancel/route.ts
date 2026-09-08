import { NextRequest, NextResponse } from "next/server";
import { cancelBooking, getBookingByToken } from "@/lib/data/bookings";
import { getCancellationTerms } from "@/lib/data/property";
import { computeRefund, todayPacific } from "@/lib/cancellation";
import { sendCancellationConfirmation } from "@/lib/email";
import { sendCancellationSms } from "@/lib/sms";
import { getStripe, isStripeEnabled } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { token, reason } = body as { token?: string; reason?: string };
  // Same contract as create: the automated suite identifies itself with the
  // cron secret, and its cancellations never email the owners.
  const isTest = !!process.env.CRON_SECRET && request.headers.get("x-smoketest") === process.env.CRON_SECRET;
  const testWantsEmail = isTest && request.headers.get("x-smoketest-emails") === "send";

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const booking = await getBookingByToken(token);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "confirmed" && booking.status !== "pending") {
    return NextResponse.json(
      { error: `This booking is already ${booking.status}.` },
      { status: 409 }
    );
  }

  const today = todayPacific();
  if (booking.checkIn <= today) {
    return NextResponse.json(
      { error: "This stay has already started. Contact us directly to make changes." },
      { status: 409 }
    );
  }

  const terms = await getCancellationTerms();
  const refund = computeRefund(booking, terms, today);

  // With Stripe live and a captured payment, actually move the money back.
  let refunded = false;
  if (refund.amount > 0 && isStripeEnabled() && booking.stripePaymentIntent) {
    try {
      await getStripe().refunds.create({
        payment_intent: booking.stripePaymentIntent,
        amount: Math.round(refund.amount * 100),
      });
      refunded = true;
    } catch (err) {
      // Cancel anyway — the owners can issue the refund manually from the
      // Stripe dashboard; refundAmount records what's owed.
      console.error(`[stripe] refund failed for booking ${booking.id}:`, err);
    }
  }

  const updated = await cancelBooking(booking.id, {
    reason: reason ? String(reason).slice(0, 2000) : "Cancelled by guest via magic link",
    refundAmount: refund.amount,
    refunded,
  });

  if (updated) {
    if (!isTest || testWantsEmail) await sendCancellationConfirmation(updated, refund, { skipOwner: isTest });
    // Owners only. Someone who has just cancelled does not need a text saying so.
    if (!isTest) void sendCancellationSms(updated as any, { skipOwner: isTest });
  }

  return NextResponse.json({
    booking: updated,
    refund: { amount: refund.amount, percent: refund.percent },
  });
}
