import * as React from "react";
import { CtaButton, DetailRow, DetailsCard, EmailLayout, Text, styles } from "./shared";

export interface EventInquiryOwnerProps {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  eventType?: string;
  partySize?: number;
  preferredDates?: string;
  message?: string;
  adminUrl: string;
}

export function EventInquiryOwnerEmail(props: EventInquiryOwnerProps) {
  return (
    <EmailLayout
      preview={`New event inquiry from ${props.guestName}`}
      heading="New event inquiry"
    >
      <Text style={styles.text}>A new event inquiry just came in through the website:</Text>

      <DetailsCard>
        <DetailRow label="Name" value={props.guestName} />
        <DetailRow label="Email" value={props.guestEmail} />
        {props.guestPhone && <DetailRow label="Phone" value={props.guestPhone} />}
        {props.eventType && <DetailRow label="Event type" value={props.eventType} />}
        {props.partySize != null && <DetailRow label="Party size" value={String(props.partySize)} />}
        {props.preferredDates && <DetailRow label="Preferred dates" value={props.preferredDates} />}
      </DetailsCard>

      {props.message && (
        <>
          <Text style={{ ...styles.muted, margin: "0 0 4px" }}>Message:</Text>
          <Text style={{ ...styles.text, fontStyle: "italic" }}>&ldquo;{props.message}&rdquo;</Text>
        </>
      )}

      <CtaButton href={props.adminUrl}>Review in admin</CtaButton>
    </EmailLayout>
  );
}

export default EventInquiryOwnerEmail;
