import type { CollectionConfig } from "payload";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const dateValidate = (value?: string | null) =>
  !value || DATE_RE.test(value) || "Use YYYY-MM-DD format";

export const BlockedDates: CollectionConfig = {
  // History without drafts: a save takes effect at once, and every previous
  // state is kept so it can be put back. Rates, rules and dates cannot wait
  // for an approval step, but they should never be unrecoverable either.
  versions: { maxPerDoc: 100 },
  slug: "blocked-dates",
  labels: { singular: "Blocked Dates", plural: "Blocked Dates" },
  admin: {
    useAsTitle: "siteSlug",
    defaultColumns: ["siteSlug", "startDate", "endDate", "reason", "source"],
    group: false,
    description:
      "Date ranges a site can't be booked: maintenance, closures, or bookings from Hipcamp/Airbnb. End date works like a checkout date (not blocked itself).",
  },
  fields: [
    { name: "site", type: "relationship", relationTo: "sites" },
    { name: "siteSlug", type: "text", required: true, index: true },
    {
      type: "row",
      fields: [
        { name: "startDate", type: "text", required: true, validate: dateValidate, admin: { description: "YYYY-MM-DD, first blocked night" } },
        { name: "endDate", type: "text", required: true, validate: dateValidate, admin: { description: "YYYY-MM-DD, like a checkout date" } },
      ],
    },
    {
      name: "reason",
      type: "select",
      required: true,
      defaultValue: "owner_block",
      options: [
        { label: "Owner block", value: "owner_block" },
        { label: "Maintenance", value: "maintenance" },
        { label: "Seasonal closure", value: "seasonal_closure" },
        { label: "Booked on another platform", value: "ota_booking" },
      ],
    },
    {
      name: "source",
      type: "select",
      defaultValue: "manual",
      options: [
        { label: "Manual", value: "manual" },
        { label: "Hipcamp sync", value: "hipcamp" },
        { label: "Airbnb sync", value: "airbnb" },
        { label: "Other calendar sync", value: "other" },
      ],
      admin: { readOnly: false },
    },
    {
      name: "externalUid",
      type: "text",
      index: true,
      admin: { readOnly: true, description: "Event ID from the synced calendar (managed automatically)." },
    },
    { name: "note", type: "text" },
  ],
};
