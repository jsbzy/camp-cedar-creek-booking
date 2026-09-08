import type { CollectionConfig } from "payload";

export const EventInquiries: CollectionConfig = {
  slug: "event-inquiries",
  labels: { singular: "Event Inquiry", plural: "Inquiries" },
  admin: {
    useAsTitle: "guestName",
    defaultColumns: ["guestName", "eventType", "preferredDates", "partySize", "status"],
    group: "Daily",
    description: "Requests for The Loft & grounds — review and approve or decline.",
  },
  defaultSort: "-createdAt",
  fields: [
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending review", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Declined", value: "declined" },
        { label: "Converted to booking", value: "converted" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "guestName", type: "text", required: true },
        { name: "guestEmail", type: "email", required: true },
        { name: "guestPhone", type: "text" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "eventType", type: "text" },
        { name: "partySize", type: "number" },
        { name: "preferredDates", type: "text" },
      ],
    },
    { name: "message", type: "textarea" },
    { name: "adminNotes", type: "textarea", admin: { description: "Internal — guests never see this." } },
    { name: "quotedPrice", type: "number", admin: { description: "USD" } },
  ],
};
