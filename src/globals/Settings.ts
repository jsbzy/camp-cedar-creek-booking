import type { GlobalConfig } from "payload";

export const Settings: GlobalConfig = {
  // History without drafts: a save takes effect at once, and every previous
  // state is kept so it can be put back. Rates, rules and dates cannot wait
  // for an approval step, but they should never be unrecoverable either.
  versions: { max: 100 },
  slug: "settings",
  label: "Camp info",
  admin: {
    group: "Settings",
    description: "What the website says about the camp: times, rules, policies, who you are.",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "propertyName", type: "text", required: true },
        { name: "location", type: "text" },
      ],
    },
    {
      name: "coordinates",
      type: "group",
      fields: [
        {
          type: "row",
          fields: [
            { name: "lat", type: "number" },
            { name: "lng", type: "number" },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "checkInTime", type: "text" },
        { name: "checkOutTime", type: "text" },
        { name: "quietHours", type: "text" },
      ],
    },
    { name: "cancellationPolicy", type: "textarea" },
    {
      name: "cancellationTerms",
      type: "group",
      admin: {
        description:
          "Drives the refund calculation when a guest cancels. Keep the policy text above in sync with these numbers.",
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "fullRefundDays",
              type: "number",
              min: 0,
              defaultValue: 14,
              admin: { description: "Cancel at least this many days before check-in → 100% refund." },
            },
            {
              name: "partialRefundDays",
              type: "number",
              min: 0,
              defaultValue: 2,
              admin: { description: "Cancel at least this many days before check-in → partial refund." },
            },
            {
              name: "partialRefundPercent",
              type: "number",
              min: 0,
              max: 100,
              defaultValue: 50,
              admin: { description: "Percent refunded in the partial window." },
            },
          ],
        },
      ],
    },
    {
      name: "houseRules",
      type: "array",
      fields: [{ name: "rule", type: "text", required: true }],
    },
    {
      name: "sharedAmenities",
      type: "array",
      fields: [{ name: "label", type: "text", required: true }],
    },
    {
      name: "host",
      type: "group",
      fields: [
        { name: "names", type: "text" },
        { name: "bio", type: "textarea" },
        {
          type: "row",
          fields: [
            { name: "responseRate", type: "number", min: 0, max: 100 },
            { name: "responseTime", type: "text" },
            { name: "email", type: "email" },
          ],
        },
      ],
    },
    {
      name: "rating",
      type: "group",
      admin: {
        description:
          "Rating displayed on the website. Demo values, replace with real Hipcamp numbers before launch.",
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "average", type: "number", min: 0, max: 5 },
            { name: "count", type: "number", min: 0 },
          ],
        },
        { name: "breakdown", type: "json", admin: { description: '{"5": 380, "4": 35, ...}' } },
      ],
    },
  ],
};
