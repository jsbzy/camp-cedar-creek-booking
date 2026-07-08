import * as React from "react";
import type { Booking } from "@/types";
import { CtaButton, EmailLayout, Text, styles } from "./shared";

export interface PostStayProps {
  booking: Booking;
  bookAgainUrl: string;
}

export function PostStayEmail({ booking, bookAgainUrl }: PostStayProps) {
  return (
    <EmailLayout
      preview="Thanks for staying at Camp Cedar Creek"
      heading="Thanks for camping with us"
    >
      <Text style={styles.text}>
        Hi {booking.guest.firstName}, thanks for staying at {booking.siteName} — we hope the creek,
        the cedars, and the quiet treated you well.
      </Text>
      <Text style={styles.text}>
        If you have a minute, we&apos;d love to hear how your stay went. Feedback from guests like
        you is how we keep making camp better — just reply to this email.
      </Text>
      <Text style={styles.text}>
        The creek will be here whenever you&apos;re ready to come back.
      </Text>
      <CtaButton href={bookAgainUrl}>Book your next stay</CtaButton>
    </EmailLayout>
  );
}

export default PostStayEmail;
