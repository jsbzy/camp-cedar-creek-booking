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
    group: "Manage",
    description: "Guest reservations. Never delete a booking. Change its status instead.",
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
      // The booking as the owner reads it. Everything codey below is hidden.
      name: "summary",
      type: "ui",
      admin: { components: { Field: "/components/admin/BookingSummary#BookingSummary" } },
    },
    {
      name: "confirmationCode",
      type: "text",
      unique: true,
      index: true,
      admin: { hidden: true },
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
    { name: "site", type: "relationship", relationTo: "sites", admin: { hidden: true } },
    { name: "siteSlug", type: "text", required: true, index: true, admin: { hidden: true } },
    { name: "siteName", type: "text", required: true, admin: { readOnly: true } },
    {
      type: "row",
      fields: [
        { name: "checkIn", type: "text", required: true, validate: dateValidate, admin: { readOnly: true, description: "To move a booking, cancel and rebook. This does not re-check availability." } },
        { name: "checkOut", type: "text", required: true, validate: dateValidate, admin: { readOnly: true } },
        { name: "nights", type: "number", min: 1, admin: { readOnly: true } },
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
      admin: { hidden: true },
      fields: [
        { name: "addOnId", type: "text" },
        { name: "name", type: "text" },
        { name: "quantity", type: "number" },
        { name: "unitPrice", type: "number" },
        { name: "perNight", type: "checkbox", defaultValue: false },
      ],
    },
    { name: "nightlyBreakdown", type: "json", admin: { hidden: true } },
    {
      type: "row",
      fields: [
        { name: "subtotal", type: "number", admin: { hidden: true } },
        { name: "addOnsTotal", type: "number", admin: { hidden: true } },
        { name: "total", type: "number", admin: { hidden: true } },
      ],
    },
    { name: "waiverSigned", type: "checkbox", defaultValue: false, admin: { hidden: true } },
    {
      name: "waiverSignature",
      type: "textarea",
      admin: { hidden: true },
    },
    {
      name: "guestProfile",
      type: "relationship",
      relationTo: "guests",
      admin: { position: "sidebar", description: "Their profile and past stays. Linked automatically." },
    },
    {
      name: "isTest",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Made by the automated test suite. Never emails the owners; excluded from reports.",
      },
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
    { name: "stripeSessionId", type: "text", admin: { hidden: true } },
    { name: "stripePaymentIntent", type: "text", admin: { hidden: true } },
    {
      name: "cancellationReason",
      type: "textarea",
      admin: { condition: (data) => data?.status === "cancelled" || data?.status === "refunded" },
    },
    {
      type: "row",
      admin: { condition: (data) => data?.status === "cancelled" || data?.status === "refunded" },
      fields: [
        {
          name: "cancelledAt",
          type: "text",
          admin: { readOnly: true, description: "When it was cancelled" },
        },
        {
          name: "refundAmount",
          type: "number",
          admin: { readOnly: true, description: "USD owed back per the cancellation policy." },
        },
      ],
    },
    {
      name: "notifications",
      type: "group",
      admin: { hidden: true },
      fields: [
        {
          type: "row",
          fields: [
            { name: "confirmationSentAt", type: "text", admin: { readOnly: true } },
            { name: "preArrivalSentAt", type: "text", admin: { readOnly: true } },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "dayBeforeSentAt", type: "text", admin: { readOnly: true } },
            { name: "postStaySentAt", type: "text", admin: { readOnly: true } },
          ],
        },
      ],
    },
  ],
};
