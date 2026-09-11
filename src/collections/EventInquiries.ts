import type { CollectionConfig } from "payload";

export const EventInquiries: CollectionConfig = {
  slug: "event-inquiries",
  labels: { singular: "Event", plural: "Events" },
  admin: {
    useAsTitle: "guestName",
    defaultColumns: ["guestName", "eventType", "status", "createdAt"],
    hideAPIURL: true,
    description: "People asking about the Loft or the grounds for an event. Approve, decline, or quote.",
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
      admin: { components: { Cell: "/components/admin/cells#StatusCell" } },
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
    { name: "adminNotes", type: "textarea", admin: { description: "Internal. Guests never see this." } },
    { name: "quotedPrice", type: "number", admin: { description: "USD" } },
  ],
};
