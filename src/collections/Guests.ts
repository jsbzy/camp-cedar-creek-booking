import type { CollectionConfig } from "payload";

// A light record of who has stayed. Created automatically from bookings, so
// nobody has to maintain it. The point is the two questions an owner actually
// asks: "have they been here before?" and "what do I know about them?"
export const Guests: CollectionConfig = {
  slug: "guests",
  labels: { singular: "Guest", plural: "Guests" },
  admin: {
    useAsTitle: "displayName",
    defaultColumns: ["displayName", "stayCount", "lastStay", "primaryEmail"],
    hideAPIURL: true,
    description: "Everyone who has stayed. Built from bookings; add your own notes.",
    listSearchableFields: ["displayName", "primaryEmail", "primaryPhone"],
  },
  defaultSort: "-lastStay",
  access: { read: () => true, create: ({ req }) => (req.user as { role?: string } | undefined)?.role === "admin" },
  fields: [
    {
      name: "summary",
      type: "ui",
      admin: { components: { Field: "/components/admin/GuestSummary#GuestSummary" } },
    },
    {
      name: "thread",
      type: "ui",
      admin: { components: { Field: "/components/admin/Thread#Thread" } },
    },
    { name: "displayName", type: "text", required: true, label: "Name" },
    {
      name: "notes",
      type: "textarea",
      admin: {
        description: "What you want to remember. Two dogs, likes site 4, asked about a wedding.",
      },
    },
    // Contact details and totals are all in the card above; keeping the raw
    // fields on the form too just made the screen look like a database.
    { name: "primaryEmail", type: "text", label: "Email", admin: { hidden: true } },
    { name: "primaryPhone", type: "text", admin: { hidden: true } },
    {
      name: "needsReview",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Matched to an existing guest by name alone. Confirm it is the same person, then untick.",
      },
    },
    { name: "reviewNote", type: "text", admin: { position: "sidebar", readOnly: true, condition: (data) => Boolean(data?.needsReview) } },
    // Everything below is maintained by the app.
    {
      type: "collapsible",
      label: "Matching keys",
      admin: { initCollapsed: true, description: "Every email, phone, and spelling of the name we have seen." },
      fields: [
        { name: "emails", type: "array", fields: [{ name: "value", type: "text" }], admin: { readOnly: true } },
        { name: "phones", type: "array", fields: [{ name: "value", type: "text" }], admin: { readOnly: true } },
        { name: "names", type: "array", fields: [{ name: "value", type: "text" }], admin: { readOnly: true } },
      ],
    },
    { name: "stayCount", type: "number", defaultValue: 0, label: "Stays", admin: { hidden: true } },
    { name: "nightsTotal", type: "number", defaultValue: 0, admin: { hidden: true } },
    { name: "spendTotal", type: "number", defaultValue: 0, admin: { hidden: true } },
    { name: "firstStay", type: "text", admin: { hidden: true } },
    { name: "lastStay", type: "text", label: "Last stay", admin: { hidden: true, components: { Cell: "/components/admin/cells#DateCell" } } },
    {
      name: "isExample",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Demo data. Remove before launch.", condition: (_d, _s, { user }) => (user as { role?: string } | undefined)?.role === "admin" },
    },
  ],
};
