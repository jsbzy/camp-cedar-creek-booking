import type { CollectionConfig } from "payload";

export const Sites: CollectionConfig = {
  slug: "sites",
  labels: { singular: "Site", plural: "Sites" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type", "basePrice", "weekendPrice", "status", "sortOrder"],
    group: "Property",
    description: "Bookable campsites, van spots, and glamping units shown on the website.",
    listSearchableFields: ["name", "slug"],
  },
  defaultSort: "sortOrder",
  access: {
    read: () => true,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "Used in the site URL — don't change after launch." },
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Tent Campsite", value: "tent" },
        { label: "Solar Van Site", value: "van_solar" },
        { label: "Power Van Site", value: "van_power" },
        { label: "Glamping", value: "glamping" },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "active",
      options: [
        { label: "Active (bookable)", value: "active" },
        { label: "Hidden", value: "inactive" },
      ],
      admin: { description: "Hidden sites disappear from the website immediately." },
    },
    {
      name: "shortDescription",
      type: "textarea",
      admin: { description: "One-liner shown on browse cards." },
    },
    { name: "description", type: "textarea" },
    {
      name: "photos",
      type: "array",
      fields: [
        { name: "url", type: "text", required: true },
        { name: "alt", type: "text" },
      ],
      admin: { description: "First photo is the cover image." },
    },
    {
      name: "amenities",
      type: "array",
      fields: [{ name: "label", type: "text", required: true }],
    },
    {
      type: "row",
      fields: [
        { name: "maxGuests", type: "number", required: true, min: 1 },
        {
          name: "basePrice",
          type: "number",
          required: true,
          min: 0,
          admin: { description: "Sun–Thu nightly rate (USD)" },
        },
        {
          name: "weekendPrice",
          type: "number",
          required: true,
          min: 0,
          admin: { description: "Fri & Sat nightly rate (USD)" },
        },
      ],
    },
    {
      name: "isCombo",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "This listing bundles other sites (e.g. Fairy Ring + Candy Cap)." },
    },
    {
      name: "componentSiteSlugs",
      type: "array",
      admin: {
        condition: (data) => Boolean(data?.isCombo),
        description: "Slugs of the sites this combo includes. Booking the combo blocks them, and vice versa.",
      },
      fields: [{ name: "slug", type: "text", required: true }],
    },
    {
      type: "row",
      fields: [
        { name: "latitude", type: "number" },
        { name: "longitude", type: "number" },
      ],
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      admin: { description: "Lower numbers appear first." },
    },
    {
      name: "icalImportUrls",
      type: "array",
      admin: {
        description: "External calendars (Hipcamp/Airbnb) whose bookings should block dates here.",
      },
      fields: [
        {
          name: "platform",
          type: "select",
          options: [
            { label: "Hipcamp", value: "hipcamp" },
            { label: "Airbnb", value: "airbnb" },
            { label: "Other", value: "other" },
          ],
        },
        { name: "url", type: "text" },
      ],
    },
    {
      name: "icalLastSynced",
      type: "date",
      admin: { readOnly: true, description: "Last successful calendar import." },
    },
  ],
};
