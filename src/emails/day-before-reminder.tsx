import * as React from "react";
import type { Booking } from "@/types";
import {
  CtaButton,
  DetailRow,
  DetailsCard,
  EmailLayout,
  Text,
  formatDate,
  styles,
} from "./shared";

export interface DayBeforeProps {
  booking: Booking;
  manageUrl: string;
  checkInTime: string;
}

export function DayBeforeReminderEmail({ booking, manageUrl, checkInTime }: DayBeforeProps) {
  return (
    <EmailLayout
      preview={`See you tomorrow at ${booking.siteName}!`}
      heading="See you tomorrow!"
    >
      <Text style={styles.text}>
        Hi {booking.guest.firstName}, quick reminder — your stay at {booking.siteName} starts
        tomorrow.
      </Text>

      <DetailsCard>
        <DetailRow label="Check-in" value={`${formatDate(booking.checkIn)} · ${checkInTime}`} />
        <DetailRow label="Site" value={booking.siteName} />
        <DetailRow label="Confirmation #" value={booking.id} />
      </DetailsCard>

      <Text style={styles.text}>
        We&apos;re 40 minutes east of Portland off Highway 26 in Sandy. Cell service fades near the
        property, so load directions before you leave town. Drive safe — see you under the cedars.
      </Text>

      <CtaButton href={manageUrl}>View your booking</CtaButton>
    </EmailLayout>
  );
}

export default DayBeforeReminderEmail;
