import type { CollectionConfig } from "payload";
import { describeSync, syncSiteFeeds } from "@/lib/data/ical-import";

// Set by the hooks below so their own status writes do not re-trigger a sync.
const INTERNAL = "icalStatusWrite";

export const Sites: CollectionConfig = {
  slug: "sites",
  labels: { singular: "Site", plural: "Sites" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type", "basePrice", "weekendPrice", "status", "sortOrder"],
    group: "Property",
    description: "Bookable campsites, van spots, and glamping units shown on the website.",
    listSearchableFields: ["name", "slug"],
  },
  defaultSort: "sortOrder",
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // The URL Hipcamp/Airbnb should import from, shown read-only so the
        // owner can copy it straight out of the site record.
        const base = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
        if (data?.slug) data.icalExportUrl = `${base}/api/ical/${data.slug}.ics`;
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req, context }) => {
        if (context?.[INTERNAL]) return doc;
        const before = JSON.stringify(previousDoc?.icalImportUrls ?? []);
        const after = JSON.stringify(doc?.icalImportUrls ?? []);
        if (before === after) return doc;
        // A pasted calendar URL should take effect on save, not at the next
        // 15-minute cron. Never let a bad feed fail the save: record it.
        let status = "";
        let ok = false;
        try {
          const sync = await syncSiteFeeds(doc);
          status = describeSync(sync);
          ok = sync.results.length > 0;
        } catch (err) {
          status = `Sync failed: ${err instanceof Error ? err.message : String(err)}`;
        }
        await req.payload.update({
          collection: "sites",
          id: doc.id,
          data: {
            icalLastError: status,
            ...(ok ? { icalLastSynced: new Date().toISOString() } : {}),
          },
          context: { [INTERNAL]: true },
          req,
        });
        return doc;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "Used in the site URL — don't change after launch." },
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Tent Campsite", value: "tent" },
        { label: "Solar Van Site", value: "van_solar" },
        { label: "Power Van Site", value: "van_power" },
        { label: "Glamping", value: "glamping" },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "active",
      options: [
        { label: "Active (bookable)", value: "active" },
        { label: "Hidden", value: "inactive" },
      ],
      admin: { description: "Hidden sites disappear from the website immediately." },
    },
    {
      name: "shortDescription",
      type: "textarea",
      admin: { description: "One-liner shown on browse cards." },
    },
    { name: "description", type: "textarea" },
    {
      name: "photos",
      type: "array",
      fields: [
        { name: "url", type: "text", required: true },
        { name: "alt", type: "text" },
      ],
      admin: { description: "First photo is the cover image." },
    },
    {
      name: "amenities",
      type: "array",
      fields: [{ name: "label", type: "text", required: true }],
    },
    {
      type: "row",
      fields: [
        { name: "maxGuests", type: "number", required: true, min: 1 },
        {
          name: "basePrice",
          type: "number",
          required: true,
          min: 0,
          admin: { description: "Sun–Thu nightly rate (USD)" },
        },
        {
          name: "weekendPrice",
          type: "number",
          required: true,
          min: 0,
          admin: { description: "Fri & Sat nightly rate (USD)" },
        },
      ],
    },
    {
      name: "isCombo",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "This listing bundles other sites (e.g. Fairy Ring + Candy Cap)." },
    },
    {
      name: "componentSiteSlugs",
      type: "array",
      admin: {
        condition: (data) => Boolean(data?.isCombo),
        description: "Slugs of the sites this combo includes. Booking the combo blocks them, and vice versa.",
      },
      fields: [{ name: "slug", type: "text", required: true }],
    },
    {
      type: "row",
      fields: [
        { name: "latitude", type: "number" },
        { name: "longitude", type: "number" },
      ],
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      admin: { description: "Lower numbers appear first." },
    },
    {
      name: "icalExportUrl",
      label: "This site's calendar (give this to Hipcamp / Airbnb)",
      type: "text",
      admin: {
        readOnly: true,
        description:
          "Paste this into Hipcamp → Calendar → Sync calendars → Import, and into Airbnb for the cottage. Bookings made here then block those dates there.",
      },
    },
    {
      name: "icalImportUrls",
      label: "Calendars to import (Hipcamp / Airbnb / Google)",
      type: "array",
      admin: {
        description:
          "Their bookings block dates here. Hipcamp: Calendar → Sync calendars → Export → copy the link. Google Calendar: Settings → the calendar → \"Secret address in iCal format\". Syncs when you save, then every 15 minutes.",
      },
      fields: [
        {
          name: "platform",
          type: "select",
          defaultValue: "hipcamp",
          options: [
            { label: "Hipcamp", value: "hipcamp" },
            { label: "Airbnb", value: "airbnb" },
            { label: "Other (Google Calendar, etc.)", value: "other" },
          ],
        },
        { name: "url", type: "text", admin: { description: "Ends in .ics — webcal:// links are fine too." } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "icalLastSynced",
          type: "date",
          admin: { readOnly: true, description: "Last successful import.", date: { displayFormat: "MMM d, yyyy h:mm a" } },
        },
        {
          name: "icalLastError",
          label: "Last sync result",
          type: "text",
          admin: { readOnly: true, description: "What happened on the last import. Empty until the first sync." },
        },
      ],
    },
  ],
};
