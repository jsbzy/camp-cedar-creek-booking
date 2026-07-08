import { NextRequest, NextResponse } from "next/server";
import { getBookingByToken } from "@/lib/data/bookings";

export const dynamic = "force-dynamic";

/**
 * Live status for the confirmation page, keyed by magic-link token (never by
 * guessable confirmation code). In Stripe mode the page lands here while the
 * webhook is still flipping pending → confirmed.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  const booking = await getBookingByToken(token);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  return NextResponse.json({ id: booking.id, status: booking.status });
}
