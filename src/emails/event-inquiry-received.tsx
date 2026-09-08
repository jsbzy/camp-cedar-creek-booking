import * as React from "react";
import { EmailLayout, Text, styles } from "./shared";

export interface EventInquiryReceivedProps {
  guestName: string;
  eventType?: string;
}

export function EventInquiryReceivedEmail({ guestName, eventType }: EventInquiryReceivedProps) {
  return (
    <EmailLayout
      preview="We got your event inquiry · Camp Cedar Creek"
      heading="We got your inquiry!"
    >
      <Text style={styles.text}>
        Hi {guestName}, thanks for reaching out about hosting{" "}
        {eventType ? `your ${eventType.toLowerCase()}` : "your event"} at Camp Cedar Creek.
      </Text>
      <Text style={styles.text}>
        We review every inquiry personally and will get back to you within a day or two with
        availability, pricing, and next steps. In the meantime, feel free to reply to this email
        with any extra details — dates you&apos;re flexible on, headcount, or what you&apos;re
        dreaming up.
      </Text>
      <Text style={styles.text}>Lauren &amp; Jeremy, Camp Cedar Creek</Text>
    </EmailLayout>
  );
}

export default EventInquiryReceivedEmail;
