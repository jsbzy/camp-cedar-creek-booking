import type { GlobalConfig } from "payload";

export const Settings: GlobalConfig = {
  slug: "settings",
  admin: {
    group: "Property",
    description: "Property-wide info shown across the website.",
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
          "Rating displayed on the website. Demo values — replace with real Hipcamp numbers before launch.",
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
