import type { CollectionConfig } from "payload";

/**
 * The conversation between a guest and the camp.
 *
 * Lives on the booking, reached through the guest's magic link, so nobody needs
 * an account and no phone number is exposed in either direction. Same shape as
 * the thread Hipcamp and Airbnb already trained everyone to expect.
 *
 * Messages are never edited or deleted, only marked read. What someone actually
 * said is a record, the same way a booking is.
 */
export const Messages: CollectionConfig = {
  slug: "messages",
  labels: { singular: "Message", plural: "Messages" },
  admin: {
    group: "Manage",
    useAsTitle: "preview",
    defaultColumns: ["preview", "from", "booking", "createdAt"],
    description: "Guest conversations, from the booking page. Reply here or ask Cici.",
    listSearchableFields: ["body"],
  },
  versions: { maxPerDoc: 20 },
  access: { read: () => true },
  fields: [
    {
      name: "preview",
      type: "text",
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            const who = siblingData?.from === "guest" ? "Guest" : "Us";
            const body = String(siblingData?.body ?? "").replace(/\s+/g, " ").trim();
            return `${who}: ${body.slice(0, 70)}${body.length > 70 ? "…" : ""}`;
          },
        ],
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "from",
          type: "select",
          required: true,
          defaultValue: "guest",
          options: [
            { label: "Guest", value: "guest" },
            { label: "Camp Cedar Creek", value: "host" },
          ],
        },
        {
          name: "readByOwner",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "Cleared when a guest writes; set once someone has seen it." },
        },
      ],
    },
    { name: "body", type: "textarea", required: true, maxLength: 4000 },
    { name: "booking", type: "relationship", relationTo: "bookings", required: true, index: true },
    {
      name: "guest",
      type: "relationship",
      relationTo: "guests",
      index: true,
      admin: { description: "So the whole conversation sits on the guest's profile." },
    },
    {
      name: "authorName",
      type: "text",
      admin: { description: "Who wrote it, for host messages. Guests are named by the booking." },
    },
    {
      name: "isTest",
      type: "checkbox",
      defaultValue: false,
      admin: { hidden: true, description: "Written by the smoketest; never notifies anyone." },
    },
  ],
};
