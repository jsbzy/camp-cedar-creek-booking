import * as React from "react";
import type { Booking } from "@/types";
import {
  CtaButton,
  DetailRow,
  DetailsCard,
  EmailLayout,
  Hr,
  Text,
  formatDate,
  formatMoney,
  styles,
} from "./shared";

export interface BookingConfirmationProps {
  booking: Booking;
  manageUrl: string;
  checkInTime: string;
  checkOutTime: string;
}

export function BookingConfirmationEmail({
  booking,
  manageUrl,
  checkInTime,
  checkOutTime,
}: BookingConfirmationProps) {
  return (
    <EmailLayout
      preview={`You're booked at ${booking.siteName} — ${formatDate(booking.checkIn)}`}
      heading="Your booking is confirmed!"
    >
      <Text style={styles.text}>
        Hi {booking.guest.firstName}, we can&apos;t wait to see you at Camp Cedar Creek. Here are
        your details:
      </Text>

      <DetailsCard>
        <DetailRow label="Confirmation #" value={booking.id} />
        <DetailRow label="Site" value={booking.siteName} />
        <DetailRow label="Check-in" value={`${formatDate(booking.checkIn)} · ${checkInTime}`} />
        <DetailRow label="Check-out" value={`${formatDate(booking.checkOut)} · ${checkOutTime}`} />
        <DetailRow
          label="Guests"
          value={`${booking.guests} guest${booking.guests !== 1 ? "s" : ""} · ${booking.nights} night${booking.nights !== 1 ? "s" : ""}`}
        />
        <Hr style={styles.hr} />
        <DetailRow label="Lodging" value={formatMoney(booking.subtotal)} />
        {booking.addOns.map((a) => (
          <DetailRow
            key={a.addOnId}
            label={`${a.name} ×${a.quantity}${a.perNight ? ` × ${booking.nights} nights` : ""}`}
            value={formatMoney(a.unitPrice * a.quantity * (a.perNight ? booking.nights : 1))}
          />
        ))}
        <DetailRow label={<strong>Total paid</strong>} value={<strong>{formatMoney(booking.total)}</strong>} />
      </DetailsCard>

      <CtaButton href={manageUrl}>Manage your booking</CtaButton>
      <Text style={styles.muted}>
        Use the link above any time to view your reservation or cancel — no account needed. Keep
        this email handy.
      </Text>
    </EmailLayout>
  );
}

export default BookingConfirmationEmail;
