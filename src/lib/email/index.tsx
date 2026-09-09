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
import { BookingOwnerNoticeEmail } from "@/emails/booking-owner-notice";
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
/**
 * Addresses this build must not write to.
 *
 * The site is not launched. Every booking, guest and message in it is ours,
 * except that the seed data carries the camp's own address, so any test that
 * touches those records mails the owners for real. It has happened twice: a
 * smoketest at 6am, and a reply sent while checking that a thread rendered.
 *
 * Defaults to the camp inbox and is cleared at launch by setting
 * PROTECTED_EMAILS to an empty string.
 */
function protectedAddresses(): string[] {
  const raw = process.env.PROTECTED_EMAILS ?? "hello@campcedarcreek.com";
  return raw.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean);
}

/** Split a recipient list into the ones we may write to and the ones we may not. */
export function splitProtected(to: string, blocked = protectedAddresses()): { allowed: string[]; refused: string[] } {
  const all = to.split(",").map((a) => a.trim()).filter(Boolean);
  const refused = all.filter((a) => blocked.includes(a.toLowerCase()));
  return { allowed: all.filter((a) => !refused.includes(a)), refused };
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  /** A designed email. Use `text` instead for short internal notices. */
  react?: React.ReactElement;
  /** Plain text, for the one-paragraph notices that do not want a template. */
  text?: string;
  replyTo?: string;
}): Promise<string | null> {
  const { allowed, refused } = splitProtected(opts.to);
  if (refused.length) {
    console.warn(`[email] refused to mail ${refused.join(", ")} before launch: "${opts.subject}"`);
  }
  if (!allowed.length) return null;

  const client = getResend();
  if (!client) {
    console.log(`[email] RESEND_API_KEY not set, skipped "${opts.subject}" to ${allowed.join(", ")}`);
    return null;
  }
  try {
    const { data, error } = await client.emails.send({
      from: FROM,
      to: allowed,
      subject: opts.subject,
      ...(opts.react ? { react: opts.react } : { text: opts.text ?? "" }),
      replyTo: opts.replyTo,
    } as Parameters<typeof client.emails.send>[0]);
    if (error) {
      console.error(`[email] Resend error for "${opts.subject}" to ${allowed.join(", ")}:`, error);
      return null;
    }
    console.log(`[email] sent "${opts.subject}" to ${allowed.join(", ")} (${data?.id})`);
    return data?.id ?? null;
  } catch (err) {
    console.error(`[email] failed "${opts.subject}" to ${allowed.join(", ")}:`, err);
    return null;
  }
}

/**
 * Tell the owners. Every confirmed booking and every cancellation goes to
 * OWNER_NOTIFY_EMAIL (comma-separated is fine), falling back to the host
 * email in Settings. Reply-to is the guest. Never blocks the guest's email.
 */
export async function sendOwnerBookingNotice(
  booking: Booking,
  kind: "new" | "cancelled",
  extra?: { refundAmount?: number; cancellationReason?: string }
): Promise<string | null> {
  const info = await getPropertyInfo();
  const to = process.env.OWNER_NOTIFY_EMAIL || info.host.email;
  if (!to) return null;
  const g = booking.guest;
  const name = `${g.firstName} ${g.lastName}`.trim();
  const adminUrl = `${appUrl()}/admin/collections/bookings?search=${encodeURIComponent(booking.id)}`;
  return sendEmail({
    to,
    replyTo: g.email,
    subject:
      kind === "new"
        ? `New booking: ${booking.siteName}, ${booking.checkIn}, ${name} (${booking.id})`
        : `Cancelled: ${booking.siteName}, ${booking.checkIn}, ${name} (${booking.id})`,
    react: (
      <BookingOwnerNoticeEmail
        booking={booking}
        kind={kind}
        adminUrl={adminUrl}
        refundAmount={extra?.refundAmount}
        cancellationReason={extra?.cancellationReason}
      />
    ),
  });
}

/**
 * A guest has written on their booking page. Tell the owners, with the message
 * in the email so they can judge urgency without opening anything, and
 * reply-to set to the guest so hitting reply reaches a real person.
 *
 * The thread itself lives on the site. This is the nudge, which is the part
 * that decides whether an on-page conversation actually works.
 */
export async function sendGuestMessageNotice(booking: Booking, body: string): Promise<string | null> {
  const info = await getPropertyInfo();
  const to = process.env.OWNER_NOTIFY_EMAIL || info.host.email;
  if (!to) return null;
  const g = booking.guest;
  const name = `${g.firstName} ${g.lastName}`.trim() || "A guest";
  const adminUrl = `${appUrl()}/admin/collections/messages?search=${encodeURIComponent(booking.id)}`;
  const quoted = body.length > 900 ? `${body.slice(0, 900)}…` : body;
  return sendEmail({
    to,
    replyTo: g.email,
    subject: `${name} sent a message about ${booking.siteName} (${booking.id})`,
    text:
      `${name} wrote about their stay at ${booking.siteName}, ${booking.checkIn}:\n\n` +
      `${quoted}\n\n` +
      `Reply in the admin: ${adminUrl}\n` +
      `Or ask Cici: "reply to ${name} about ${booking.id}"\n\n` +
      `Replying to this email reaches the guest directly, but it will not appear in the thread on their booking page.`,
  });
}

/**
 * The camp has answered. Tell the guest, and give them the way back in.
 */
export async function sendHostMessageNotice(booking: Booking, body: string, manageUrl: string): Promise<string | null> {
  const g = booking.guest;
  if (!g?.email) return null;
  const quoted = body.length > 900 ? `${body.slice(0, 900)}…` : body;
  return sendEmail({
    to: g.email,
    subject: `Camp Cedar Creek replied about your stay (${booking.id})`,
    text:
      `${g.firstName || "Hello"},\n\n` +
      `${quoted}\n\n` +
      `Reply here: ${manageUrl}\n\n` +
      `Lauren & Jeremy, Camp Cedar Creek`,
  });
}

export async function sendBookingConfirmation(
  booking: Booking,
  opts: { skipOwner?: boolean } = {}
): Promise<string | null> {
  const info = await getPropertyInfo();
  // Test bookings never reach the owners' inbox.
  if (!opts.skipOwner) void sendOwnerBookingNotice(booking, "new");
  const id = await sendEmail({
    to: booking.guest.email,
    subject: `Booking confirmed: ${booking.siteName}, ${booking.checkIn} (${booking.id})`,
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
    subject: `One week to go: your stay at ${booking.siteName}`,
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
  refund: { amount: number; percent: number },
  opts: { skipOwner?: boolean } = {}
): Promise<string | null> {
  if (!opts.skipOwner)
    void sendOwnerBookingNotice(booking, "cancelled", {
      refundAmount: refund.amount,
      cancellationReason: booking.cancellationReason,
    });
  return sendEmail({
    to: booking.guest.email,
    subject: `Booking cancelled: ${booking.siteName} (${booking.id})`,
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
      subject: "We got your event inquiry · Camp Cedar Creek",
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
