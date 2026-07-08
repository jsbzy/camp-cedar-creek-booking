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

export interface PreArrivalProps {
  booking: Booking;
  manageUrl: string;
  checkInTime: string;
  houseRules: string[];
}

export function PreArrivalEmail({ booking, manageUrl, checkInTime, houseRules }: PreArrivalProps) {
  return (
    <EmailLayout
      preview={`One week until your stay at ${booking.siteName}`}
      heading="Your trip is one week away"
    >
      <Text style={styles.text}>
        Hi {booking.guest.firstName}, {booking.siteName} is ready for you on{" "}
        {formatDate(booking.checkIn)}. A few things to know before you head out:
      </Text>

      <DetailsCard>
        <DetailRow label="Check-in" value={`${formatDate(booking.checkIn)} · ${checkInTime}`} />
        <DetailRow label="Address" value="Camp Cedar Creek, Sandy, Oregon" />
        <DetailRow label="Confirmation #" value={booking.id} />
      </DetailsCard>

      <Text style={styles.text}>
        <strong>Getting here:</strong> we&apos;re about 40 minutes east of Portland off Highway 26.
        Detailed directions and the gate location are on your booking page. The creek-side tent
        sites require 4WD/AWD — the road in can be rough after rain.
      </Text>
      <Text style={styles.text}>
        <strong>What to bring:</strong> layers (evenings are cool under the cedars), sturdy shoes,
        headlamps, and your own drinking water for tent sites. Firewood is available on site.
      </Text>
      <Text style={styles.text}>
        <strong>Weather:</strong> check the Sandy, OR forecast before you leave:{" "}
        <a href="https://forecast.weather.gov/zipcity.php?inputstring=Sandy,OR" style={{ color: "#171717" }}>
          forecast.weather.gov
        </a>
      </Text>

      <Text style={styles.text}>
        <strong>Campground rules:</strong>
      </Text>
      {houseRules.map((rule) => (
        <Text key={rule} style={{ ...styles.muted, margin: "0 0 4px" }}>
          • {rule}
        </Text>
      ))}

      <CtaButton href={manageUrl}>View your booking</CtaButton>
    </EmailLayout>
  );
}

export default PreArrivalEmail;
