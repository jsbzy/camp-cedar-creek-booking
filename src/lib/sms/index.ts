import { after } from "next/server";
import {
  toE164,
  guestConfirmationSms,
  ownerBookingSms,
  ownerCancellationSms,
  segments,
  type SmsBooking,
} from "./format";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Text messages, off until there are credentials.
 *
 * Same shape as the Stripe path: nothing is sent, and nothing fails, until the
 * environment has what it needs. That means this can ship and sit inert while
 * the number is bought and the carrier registration goes through.
 */
export const isSmsEnabled = (): boolean =>
  Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);

/** Where the owners get texted. Comma separated, same idea as OWNER_NOTIFY_EMAIL. */
export function ownerNumbers(): string[] {
  return (process.env.OWNER_NOTIFY_PHONE || "")
    .split(",")
    .map((s) => toE164(s))
    .filter((s): s is string => !!s);
}

export interface SmsResult {
  to: string;
  sid?: string;
  error?: string;
}

/**
 * One message, straight to Twilio's REST API.
 *
 * No SDK: this is a form POST and an auth header, and a dependency that exists
 * to save eight lines is a dependency that has to be kept up to date forever.
 */
export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const number = toE164(to);
  if (!number) return { to, error: "not a phone number we can send to" };
  if (!isSmsEnabled()) {
    console.log(`[sms] not configured, skipped "${body.slice(0, 40)}..." to ${number}`);
    return { to: number, error: "sms is not configured" };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const form = new URLSearchParams({ To: number, From: process.env.TWILIO_FROM_NUMBER!, Body: body });

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { authorization: `Basic ${auth}`, "content-type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Twilio's own message is the useful one: "unverified number", "opted out".
      const msg = json?.message || `HTTP ${res.status}`;
      console.error(`[sms] ${number} failed: ${msg}`);
      return { to: number, error: msg };
    }
    if (segments(body) > 1) console.warn(`[sms] ${number} cost ${segments(body)} segments: ${body.length} chars`);
    return { to: number, sid: json?.sid };
  } catch (err: any) {
    console.error(`[sms] ${number} failed:`, err);
    return { to: number, error: String(err?.message ?? err) };
  }
}

/**
 * Texts for a new booking: one to the guest, one to each owner.
 *
 * Never blocks the booking. A text that does not send is worth a log line and
 * nothing more: the guest already has the page and the email, and a failed
 * message must not turn a completed booking into an error.
 */
export async function sendBookingSms(booking: SmsBooking, opts: { skipOwner?: boolean } = {}): Promise<void> {
  if (!isSmsEnabled()) return;
  const guestPhone = booking.guest?.phone;
  const jobs: Promise<SmsResult>[] = [];
  if (guestPhone) jobs.push(sendSms(guestPhone, guestConfirmationSms(booking)));
  if (!opts.skipOwner) for (const n of ownerNumbers()) jobs.push(sendSms(n, ownerBookingSms(booking)));
  await Promise.allSettled(jobs);
}

/** The owners only. A guest who just cancelled does not need a text about it. */
export async function sendCancellationSms(booking: SmsBooking, opts: { skipOwner?: boolean } = {}): Promise<void> {
  if (!isSmsEnabled() || opts.skipOwner) return;
  await Promise.allSettled(ownerNumbers().map((n) => sendSms(n, ownerCancellationSms(booking))));
}

/**
 * Send after the response has gone out.
 *
 * The iCal import taught this the hard way: work done inside a Payload save
 * sits in the same transaction as the row it needs, and the two wait on each
 * other until the pool starves. Texting is slower than that import and even
 * less urgent, so it always goes here.
 */
export function sendBookingSmsLater(booking: SmsBooking, opts: { skipOwner?: boolean } = {}): void {
  if (!isSmsEnabled()) return;
  after(async () => {
    try {
      await sendBookingSms(booking, opts);
    } catch (err) {
      console.error("[sms] booking texts failed:", err);
    }
  });
}
