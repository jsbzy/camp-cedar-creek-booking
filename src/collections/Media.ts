import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Photo", plural: "Photos" },
  admin: {
    // Photos used to live on Hipcamp's image server, which meant the site
    // emptied itself the day a listing came down. They are ours now, so this
    // belongs where the owners actually look rather than under Advanced.
    group: "Settings",
    useAsTitle: "filename",
    defaultColumns: ["filename", "alt", "updatedAt"],
    description: "Every photo on the site. Stored by us, so nothing breaks when a listing elsewhere comes down.",
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*"],
  },
  fields: [{ name: "alt", type: "text" }],
};
