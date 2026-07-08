import * as React from "react";
import { Resend } from "resend";
import type { Booking } from "@/types";
import { getPropertyInfo } from "@/lib/data/property";
import { markNotificationSent } from "@/lib/data/bookings";
import { BookingConfirmationEmail } from "@/emails/booking-confirmation";
import { PreArrivalEmail } from "@/emails/pre-arrival";
import { DayBeforeReminderEmail } from "@/emails/day-before-reminder";
import { PostStayEmail } from "@/emails/post-stay";
import { CancellationConfirmationEmail } from "@/emails/cancellation-confirmation";
import { EventInquiryReceivedEmail } from "@/emails/event-inquiry-received";
import { EventInquiryOwnerEmail } from "@/emails/event-inquiry-owner";

// The Resend key on this account is verified for bzydesign.com ONLY.
// Sending from campcedarcreek.com 403s until the owners verify their domain.
const FROM = "Camp Cedar Creek <bookings@bzydesign.com>";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const manageUrl = (booking: Booking) => `${appUrl()}/booking/${booking.magicLinkToken}`;

let resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

/**
 * Send an email via Resend. Never throws — a failed email must never break a
 * booking, cancellation, or inquiry. Returns the Resend message id, or null
 * when sending is disabled (no RESEND_API_KEY) or failed.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  react: React.ReactElement;
  replyTo?: string;
}): Promise<string | null> {
  const client = getResend();
  if (!client) {
    console.log(`[email] RESEND_API_KEY not set — skipped "${opts.subject}" to ${opts.to}`);
    return null;
  }
  try {
    const { data, error } = await client.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      react: opts.react,
      replyTo: opts.replyTo,
    });
    if (error) {
      console.error(`[email] Resend error for "${opts.subject}" to ${opts.to}:`, error);
      return null;
    }
    console.log(`[email] sent "${opts.subject}" to ${opts.to} (${data?.id})`);
    return data?.id ?? null;
  } catch (err) {
    console.error(`[email] failed "${opts.subject}" to ${opts.to}:`, err);
    return null;
  }
}

export async function sendBookingConfirmation(booking: Booking): Promise<string | null> {
  const info = await getPropertyInfo();
  const id = await sendEmail({
    to: booking.guest.email,
    subject: `Booking confirmed — ${booking.siteName}, ${booking.checkIn} (${booking.id})`,
    react: (
      <BookingConfirmationEmail
        booking={booking}
        manageUrl={manageUrl(booking)}
        checkInTime={info.checkInTime || "3:00 PM"}
        checkOutTime={info.checkOutTime || "11:00 AM"}
      />
    ),
  });
  if (id) await markNotificationSent(booking.id, "confirmationSentAt");
  return id;
}

export async function sendPreArrival(booking: Booking): Promise<string | null> {
  const info = await getPropertyInfo();
  const id = await sendEmail({
    to: booking.guest.email,
    subject: `One week to go — your stay at ${booking.siteName}`,
    react: (
      <PreArrivalEmail
        booking={booking}
        manageUrl={manageUrl(booking)}
        checkInTime={info.checkInTime || "3:00 PM"}
        houseRules={info.houseRules}
      />
    ),
  });
  if (id) await markNotificationSent(booking.id, "preArrivalSentAt");
  return id;
}

export async function sendDayBeforeReminder(booking: Booking): Promise<string | null> {
  const info = await getPropertyInfo();
  const id = await sendEmail({
    to: booking.guest.email,
    subject: `See you tomorrow at ${booking.siteName}!`,
    react: (
      <DayBeforeReminderEmail
        booking={booking}
        manageUrl={manageUrl(booking)}
        checkInTime={info.checkInTime || "3:00 PM"}
      />
    ),
  });
  if (id) await markNotificationSent(booking.id, "dayBeforeSentAt");
  return id;
}

export async function sendPostStay(booking: Booking): Promise<string | null> {
  const id = await sendEmail({
    to: booking.guest.email,
    subject: "Thanks for staying at Camp Cedar Creek",
    react: <PostStayEmail booking={booking} bookAgainUrl={`${appUrl()}/sites`} />,
  });
  if (id) await markNotificationSent(booking.id, "postStaySentAt");
  return id;
}

export async function sendCancellationConfirmation(
  booking: Booking,
  refund: { amount: number; percent: number }
): Promise<string | null> {
  return sendEmail({
    to: booking.guest.email,
    subject: `Booking cancelled — ${booking.siteName} (${booking.id})`,
    react: (
      <CancellationConfirmationEmail
        booking={booking}
        refundAmount={refund.amount}
        refundPercent={refund.percent}
      />
    ),
  });
}

export interface EventInquiryEmailInput {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  eventType?: string;
  partySize?: number;
  preferredDates?: string;
  message?: string;
}

export async function sendEventInquiryEmails(inquiry: EventInquiryEmailInput): Promise<void> {
  const info = await getPropertyInfo();
  // OWNER_NOTIFY_EMAIL overrides for staging so demo inquiries never land in
  // the owners' real inbox.
  const ownerEmail = process.env.OWNER_NOTIFY_EMAIL || info.host.email;

  await Promise.all([
    sendEmail({
      to: inquiry.guestEmail,
      subject: "We got your event inquiry — Camp Cedar Creek",
      react: (
        <EventInquiryReceivedEmail guestName={inquiry.guestName} eventType={inquiry.eventType} />
      ),
    }),
    ownerEmail
      ? sendEmail({
          to: ownerEmail,
          subject: `New event inquiry from ${inquiry.guestName}`,
          replyTo: inquiry.guestEmail,
          react: (
            <EventInquiryOwnerEmail
              {...inquiry}
              adminUrl={`${appUrl()}/admin/collections/event-inquiries`}
            />
          ),
        })
      : Promise.resolve(null),
  ]);
}
