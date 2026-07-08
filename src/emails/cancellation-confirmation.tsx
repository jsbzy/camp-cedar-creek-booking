import * as React from "react";
import type { Booking } from "@/types";
import {
  DetailRow,
  DetailsCard,
  EmailLayout,
  Hr,
  Text,
  formatDate,
  formatMoney,
  styles,
} from "./shared";

export interface CancellationProps {
  booking: Booking;
  refundAmount: number;
  refundPercent: number;
}

export function CancellationConfirmationEmail({
  booking,
  refundAmount,
  refundPercent,
}: CancellationProps) {
  return (
    <EmailLayout
      preview={`Your booking at ${booking.siteName} has been cancelled`}
      heading="Your booking is cancelled"
    >
      <Text style={styles.text}>
        Hi {booking.guest.firstName}, we&apos;ve cancelled your reservation as requested. Here&apos;s
        the summary:
      </Text>

      <DetailsCard>
        <DetailRow label="Confirmation #" value={booking.id} />
        <DetailRow label="Site" value={booking.siteName} />
        <DetailRow label="Dates" value={`${formatDate(booking.checkIn)} – ${formatDate(booking.checkOut)}`} />
        <Hr style={styles.hr} />
        <DetailRow label="Booking total" value={formatMoney(booking.total)} />
        <DetailRow
          label={<strong>Refund ({refundPercent}%)</strong>}
          value={<strong>{formatMoney(refundAmount)}</strong>}
        />
      </DetailsCard>

      {refundAmount > 0 ? (
        <Text style={styles.text}>
          Your refund is being processed and will appear on your original payment method within
          5–10 business days.
        </Text>
      ) : (
        <Text style={styles.text}>
          Per our cancellation policy, this booking wasn&apos;t eligible for a refund. If something
          unexpected came up, reply to this email — we&apos;re happy to talk it through.
        </Text>
      )}
      <Text style={styles.text}>We hope to see you at camp another time.</Text>
    </EmailLayout>
  );
}

export default CancellationConfirmationEmail;
