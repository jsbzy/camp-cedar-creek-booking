import crypto from "crypto";
import type { CollectionConfig } from "payload";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const dateValidate = (value?: string | null) =>
  !value || DATE_RE.test(value) || "Use YYYY-MM-DD format";

export const Bookings: CollectionConfig = {
  slug: "bookings",
  admin: {
    useAsTitle: "confirmationCode",
    defaultColumns: ["confirmationCode", "siteName", "checkIn", "checkOut", "status", "total"],
    group: "Bookings",
    description: "Guest reservations. Never delete a booking — change its status instead.",
    listSearchableFields: ["confirmationCode", "siteName", "guest.lastName", "guest.email"],
  },
  defaultSort: "-createdAt",
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create") {
          data.confirmationCode =
            data.confirmationCode || `CCC-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
          data.magicLinkToken = data.magicLinkToken || crypto.randomBytes(24).toString("hex");
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "confirmationCode",
      type: "text",
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending payment", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Completed", value: "completed" },
        { label: "Refunded", value: "refunded" },
      ],
    },
    { name: "site", type: "relationship", relationTo: "sites" },
    { name: "siteSlug", type: "text", required: true, index: true },
    { name: "siteName", type: "text", required: true },
    {
      type: "row",
      fields: [
        { name: "checkIn", type: "text", required: true, validate: dateValidate, admin: { description: "YYYY-MM-DD" } },
        { name: "checkOut", type: "text", required: true, validate: dateValidate, admin: { description: "YYYY-MM-DD" } },
        { name: "nights", type: "number", min: 1 },
        { name: "guests", type: "number", min: 1 },
      ],
    },
    {
      name: "guest",
      type: "group",
      fields: [
        {
          type: "row",
          fields: [
            { name: "firstName", type: "text", required: true },
            { name: "lastName", type: "text", required: true },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "email", type: "email", required: true },
            { name: "phone", type: "text" },
          ],
        },
        { name: "specialRequests", type: "textarea" },
      ],
    },
    {
      name: "addOns",
      type: "array",
      fields: [
        { name: "addOnId", type: "text" },
        { name: "name", type: "text" },
        { name: "quantity", type: "number" },
        { name: "unitPrice", type: "number" },
        { name: "perNight", type: "checkbox", defaultValue: false },
      ],
    },
    { name: "nightlyBreakdown", type: "json", admin: { readOnly: true } },
    {
      type: "row",
      fields: [
        { name: "subtotal", type: "number" },
        { name: "addOnsTotal", type: "number" },
        { name: "total", type: "number" },
      ],
    },
    { name: "waiverSigned", type: "checkbox", defaultValue: false },
    {
      name: "waiverSignature",
      type: "textarea",
      admin: { readOnly: true, description: "Guest signature (image data)." },
    },
    {
      name: "source",
      type: "select",
      defaultValue: "direct",
      options: [
        { label: "Direct", value: "direct" },
        { label: "Hipcamp", value: "hipcamp" },
        { label: "Airbnb", value: "airbnb" },
      ],
    },
    { name: "magicLinkToken", type: "text", admin: { hidden: true } },
    { name: "stripeSessionId", type: "text", admin: { readOnly: true } },
    { name: "stripePaymentIntent", type: "text", admin: { readOnly: true } },
    { name: "cancellationReason", type: "textarea" },
  ],
};
