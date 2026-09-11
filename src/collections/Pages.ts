import type { CollectionConfig } from "payload";

// Marketing pages, homepage first. The HTML is the page: it came from the
// Webflow build and its layout, classes, and scripts are load-bearing, so
// this stores the document whole rather than trying to model it into fields.
// Editing happens through the connector (which edits a section or a string at
// a time and validates against the Brand Guide) or, for the brave, here.
//
// Drafts are on: a save is a draft, publishing is a separate act. That is the
// whole staging model. Payload keeps every version, so the Record is free.
export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Page", plural: "Website pages" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    group: false,
    description: "The marketing pages. Saving makes a draft; publishing puts it live.",
  },
  versions: {
    drafts: { autosave: false },
    maxPerDoc: 100,
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: 'The homepage is "home". Others become /p/<slug>.' },
    },
    {
      name: "html",
      type: "code",
      required: true,
      admin: {
        language: "html",
        description:
          "The complete page. Edited through the connector; every change is validated against the Brand Guide.",
      },
    },
    {
      name: "notes",
      type: "text",
      admin: { description: "What changed and why, on the last edit." },
    },
  ],
};
