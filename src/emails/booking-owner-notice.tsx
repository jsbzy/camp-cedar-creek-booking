import * as React from "react";
import type { Booking } from "@/types";
import {
  EmailLayout,
  DetailsCard,
  DetailRow,
  CtaButton,
  Hr,
  Text,
  Link,
  styles,
  formatDate,
  formatMoney,
} from "./shared";

export interface BookingOwnerNoticeProps {
  booking: Booking;
  kind: "new" | "cancelled";
  adminUrl: string;
  refundAmount?: number;
  cancellationReason?: string;
}

// What the owners get for every booking: who is coming, when, where, what
// they paid, how to reach them. Reply-to is the guest, so "reply" just works.
export function BookingOwnerNoticeEmail({ booking, kind, adminUrl, refundAmount, cancellationReason }: BookingOwnerNoticeProps) {
  const g = booking.guest;
  const name = `${g.firstName} ${g.lastName}`.trim();
  const isNew = kind === "new";
  return (
    <EmailLayout
      preview={isNew ? `${name} booked ${booking.siteName}, ${formatDate(booking.checkIn)}` : `${name} cancelled ${booking.siteName}, ${formatDate(booking.checkIn)}`}
      heading={isNew ? `New booking: ${booking.siteName}` : `Cancelled: ${booking.siteName}`}
    >
      <Text style={styles.text}>
        {isNew
          ? `${name} just booked ${booking.siteName} for ${booking.nights} night${booking.nights !== 1 ? "s" : ""}, arriving ${formatDate(booking.checkIn)}.`
          : `${name} cancelled their ${booking.nights}-night stay at ${booking.siteName} that was to start ${formatDate(booking.checkIn)}. The dates are open again.`}
      </Text>

      <DetailsCard>
        <DetailRow label="Guest" value={name} />
        <DetailRow label="Email" value={<Link href={`mailto:${g.email}`}>{g.email}</Link>} />
        {g.phone ? <DetailRow label="Phone" value={<Link href={`tel:${g.phone}`}>{g.phone}</Link>} /> : null}
        <DetailRow label="Party" value={`${booking.guests} guest${booking.guests !== 1 ? "s" : ""}`} />
        <Hr style={styles.hr} />
        <DetailRow label="Site" value={booking.siteName} />
        <DetailRow label="Check-in" value={formatDate(booking.checkIn)} />
        <DetailRow label="Check-out" value={formatDate(booking.checkOut)} />
        <DetailRow label="Confirmation #" value={booking.id} />
        <Hr style={styles.hr} />
        <DetailRow label="Lodging" value={formatMoney(booking.subtotal)} />
        {booking.addOns.map((a) => (
          <DetailRow
            key={a.addOnId}
            label={`${a.name} ×${a.quantity}${a.perNight ? ` × ${booking.nights} nights` : ""}`}
            value={formatMoney(a.unitPrice * a.quantity * (a.perNight ? booking.nights : 1))}
          />
        ))}
        <DetailRow label={<strong>Total</strong>} value={<strong>{formatMoney(booking.total)}</strong>} />
        {!isNew && typeof refundAmount === "number" ? (
          <DetailRow label="Refund owed" value={formatMoney(refundAmount)} />
        ) : null}
      </DetailsCard>

      {g.specialRequests ? (
        <Text style={styles.text}>
          <strong>Special requests:</strong> {g.specialRequests}
        </Text>
      ) : null}
      {!isNew && cancellationReason ? (
        <Text style={styles.text}>
          <strong>Reason given:</strong> {cancellationReason}
        </Text>
      ) : null}

      <CtaButton href={adminUrl}>Open in the admin</CtaButton>
      <Text style={styles.muted}>Reply to this email to reach the guest directly.</Text>
    </EmailLayout>
  );
}

export default BookingOwnerNoticeEmail;
