import type { CollectionConfig } from "payload";

export const Addons: CollectionConfig = {
  // History without drafts: a save takes effect at once, and every previous
  // state is kept so it can be put back. Rates, rules and dates cannot wait
  // for an approval step, but they should never be unrecoverable either.
  versions: { maxPerDoc: 100 },
  slug: "addons",
  labels: { singular: "Add-On", plural: "Add-Ons" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "price", "perNight", "active", "sortOrder"],
    group: "Set up",
    description: "Optional extras guests can add during booking (firewood, rentals, etc.).",
  },
  defaultSort: "sortOrder",
  access: {
    read: () => true,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      type: "row",
      fields: [
        { name: "price", type: "number", required: true, min: 0, admin: { description: "USD" } },
        {
          name: "perNight",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "Charge per night instead of once per stay." },
        },
        { name: "maxQuantity", type: "number", required: true, defaultValue: 1, min: 1 },
      ],
    },
    {
      name: "applicableSiteTypes",
      type: "select",
      hasMany: true,
      required: true,
      options: [
        { label: "Tent Campsite", value: "tent" },
        { label: "Solar Van Site", value: "van_solar" },
        { label: "Power Van Site", value: "van_power" },
        { label: "Glamping", value: "glamping" },
      ],
    },
    { name: "active", type: "checkbox", defaultValue: true },
    { name: "sortOrder", type: "number", defaultValue: 0 },
  ],
};
