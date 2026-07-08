import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/data/db";
import { sendEventInquiryEmails } from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, phone, eventType, guestCount, dates, message } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  const inquiry = {
    guestName: String(name).slice(0, 200),
    guestEmail: String(email).slice(0, 200),
    guestPhone: phone ? String(phone).slice(0, 50) : undefined,
    eventType: eventType ? String(eventType).slice(0, 200) : undefined,
    partySize: guestCount ? Number(guestCount) : undefined,
    preferredDates: dates ? String(dates).slice(0, 200) : undefined,
    message: message ? String(message).slice(0, 5000) : undefined,
  };

  const db = await getDb();
  await db.create({
    collection: "event-inquiries",
    data: { ...inquiry, status: "pending" },
  });

  // Acknowledge the guest and notify the owners; failures are logged, never fatal.
  await sendEventInquiryEmails(inquiry);

  return NextResponse.json({ ok: true }, { status: 201 });
}
