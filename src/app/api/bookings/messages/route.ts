import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { getBookingByToken } from "@/lib/data/bookings";
import { getDb } from "@/lib/data/db";
import { addMessage, threadForBooking } from "@/lib/data/messages";
import { sendGuestMessageNotice } from "@/lib/email";

/**
 * The guest's side of the conversation.
 *
 * Authenticated by the magic-link token and nothing else: no account, no
 * password, and never by the confirmation code, which is printed on emails and
 * is not a secret. Same rule as the rest of the manage-booking page.
 */

export const dynamic = "force-dynamic";

const MAX = 4000;

/**
 * The raw booking row for a magic-link token.
 *
 * The mapped booking's `id` is the confirmation code, not the row id, which is
 * right for everything a guest sees and wrong for a relationship. Messages hang
 * off the row, so they need this.
 */
async function rawBookingForToken(token: string) {
  const db = await getDb();
  const res = await db.find({
    collection: "bookings",
    where: { magicLinkToken: { equals: token } },
    limit: 1,
    depth: 0,
  });
  return (res.docs[0] as any) ?? null;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
  const raw = await rawBookingForToken(token);
  if (!raw) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  return NextResponse.json({ messages: await threadForBooking(raw.id) });
}

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const booking: any = await getBookingByToken(token);
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  let body = "";
  try {
    body = String(((await request.json()) as any)?.body ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }
  if (!body) return NextResponse.json({ error: "Write something first" }, { status: 400 });
  if (body.length > MAX) return NextResponse.json({ error: `Keep it under ${MAX} characters` }, { status: 400 });

  const raw = await rawBookingForToken(token);
  if (!raw) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const isTest = !!raw.isTest;
  // Filed against the guest profile as well as the booking, so the whole
  // conversation sits on the person rather than on one stay.
  const message = await addMessage({
    bookingId: raw.id,
    guestId: raw.guestProfile ?? null,
    from: "guest",
    body,
    isTest,
  });

  // Telling the owners is the point, but it must never hold up the reply
  // appearing on the guest's screen, and a test booking never reaches them.
  if (!isTest) {
    after(async () => {
      try {
        await sendGuestMessageNotice(booking, body);
      } catch (err) {
        console.error("[messages] could not tell the owners:", err);
      }
    });
  }

  return NextResponse.json({ message }, { status: 201 });
}
