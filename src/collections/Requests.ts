import type { CollectionConfig } from "payload";

// Anything the connector cannot do itself: a new page, SMS reminders, a
// different email, a report, a change to how the site works. The agent writes
// the request down here instead of guessing or half-building it, and Jeff
// picks it up. This is the queue that keeps "can you also..." from turning
// into scope nobody wrote down.
export const Requests: CollectionConfig = {
  slug: "requests",
  labels: { singular: "Request", plural: "Requests" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "size", "requestedBy", "createdAt"],
    group: false,
    description: "New features and bigger changes, captured as they come up.",
  },
  defaultSort: "-createdAt",
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "detail",
      type: "textarea",
      admin: { description: "What they want, in their words, and why." },
    },
    {
      type: "row",
      fields: [
        {
          name: "status",
          type: "select",
          defaultValue: "new",
          options: [
            { label: "New", value: "new" },
            { label: "Planned", value: "planned" },
            { label: "Building", value: "building" },
            { label: "Done", value: "done" },
            { label: "Not doing", value: "declined" },
          ],
        },
        {
          name: "size",
          type: "select",
          defaultValue: "unknown",
          admin: { description: "Small: an hour or two. Big: needs a plan and a test pass." },
          options: [
            { label: "Not sized yet", value: "unknown" },
            { label: "Small", value: "small" },
            { label: "Big", value: "big" },
          ],
        },
        { name: "requestedBy", type: "text", admin: { description: "Who asked." } },
      ],
    },
    { name: "response", type: "textarea", admin: { description: "What was decided or shipped." } },
  ],
};
