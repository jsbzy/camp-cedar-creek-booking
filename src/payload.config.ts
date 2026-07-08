import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Sites } from "./collections/Sites";
import { Bookings } from "./collections/Bookings";
import { BlockedDates } from "./collections/BlockedDates";
import { Addons } from "./collections/Addons";
import { EventInquiries } from "./collections/EventInquiries";
import { Reviews } from "./collections/Reviews";
import { Settings } from "./globals/Settings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "users",
    meta: {
      titleSuffix: " — Camp Cedar Creek",
    },
  },
  // Payload's REST API lives at /payload-api so it never collides with the
  // app's own /api/* routes (bookings, ical feeds, webhooks).
  routes: {
    api: "/payload-api",
  },
  collections: [Sites, Bookings, BlockedDates, EventInquiries, Addons, Reviews, Media, Users],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "ccc-dev-secret-change-before-prod",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || "file:./ccc-booking.db",
    },
  }),
  graphQL: {
    disable: true,
  },
  sharp,
});
