import type { GlobalConfig } from "payload";

// The Brand Guide: prose the editing agent reads, and a fenced ```json LAW
// block the server compiles into a validator and enforces on every write.
// Changing the LAW changes enforcement immediately, which is why only the
// admin tier can write here.
export const BrandGuide: GlobalConfig = {
  slug: "brand-guide",
  label: "Brand Guide",
  admin: {
    group: "Content",
    description:
      "What the site may say and how it may say it. The LAW block at the bottom is enforced on every edit made through the connector.",
  },
  access: { read: () => true },
  fields: [
    {
      name: "markdown",
      type: "code",
      required: true,
      admin: {
        language: "markdown",
        description: "Must keep a parseable ```json LAW block, or all writes are refused.",
      },
    },
  ],
};
