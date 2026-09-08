import type { CollectionConfig } from "payload";

export const Reviews: CollectionConfig = {
  slug: "reviews",
  admin: {
    useAsTitle: "author",
    defaultColumns: ["author", "siteSlug", "rating", "date", "published"],
    group: "Website",
    description: "Guest reviews shown on site pages. Unpublish to hide one.",
  },
  defaultSort: "-date",
  access: {
    read: () => true,
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "author", type: "text", required: true },
        { name: "date", type: "text", required: true, admin: { description: "YYYY-MM-DD" } },
        { name: "rating", type: "number", required: true, min: 1, max: 5 },
      ],
    },
    { name: "text", type: "textarea", required: true },
    { name: "siteSlug", type: "text", index: true, admin: { description: "Which site the stay was at." } },
    { name: "recommends", type: "checkbox", defaultValue: true },
    { name: "published", type: "checkbox", defaultValue: true },
    {
      name: "source",
      type: "select",
      defaultValue: "hipcamp",
      options: [
        { label: "Hipcamp", value: "hipcamp" },
        { label: "Direct", value: "direct" },
      ],
    },
  ],
};
