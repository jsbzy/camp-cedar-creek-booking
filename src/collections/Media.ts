import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    group: "Setup",
    description: "Uploaded photos. (Site photos currently use hosted URLs — uploads move to R2 at launch.)",
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
