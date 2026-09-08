import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "Advanced",
    description: "People who can log in to this admin panel.",
  },
  fields: [
    { name: "name", type: "text" },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "owner",
      options: [
        { label: "Admin (full access)", value: "admin" },
        { label: "Owner (daily operations)", value: "owner" },
      ],
    },
  ],
};
