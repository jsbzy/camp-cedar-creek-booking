import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
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
import { Pages } from "./collections/Pages";
import { Requests } from "./collections/Requests";
import { BrandGuide } from "./globals/BrandGuide";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// SQLite for local dev, Neon Postgres in production — picked by URI scheme.
// Dev relies on schema push; production Postgres runs committed migrations
// from src/migrations (npm run migrate during the Vercel build).
const databaseUri = process.env.DATABASE_URI || "file:./ccc-booking.db";
const db = databaseUri.startsWith("postgres")
  ? postgresAdapter({
      pool: { connectionString: databaseUri },
      migrationDir: path.resolve(dirname, "migrations"),
      // Never push schema to Postgres. Push mode (the dev default, and what
      // `npm run seed` triggered) writes a 'dev' marker to payload_migrations,
      // after which `payload migrate` stalls on an interactive data-loss
      // prompt during the Vercel build. Migrations are the only schema path.
      push: false,
    })
  : sqliteAdapter({
      client: { url: databaseUri },
    });

export default buildConfig({
  admin: {
    user: "users",
    // Owners use the admin — keep it simple and consistent: always light.
    theme: "light",
    meta: {
      titleSuffix: " — Camp Cedar Creek",
    },
    // Component paths in this config ("/components/admin/…") resolve from src/.
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      // Month-at-a-glance of every site's bookings and blocks, linked from the sidebar.
      views: {
        calendar: {
          Component: "/components/admin/CalendarView#CalendarView",
          path: "/calendar",
        },
      },
      afterNavLinks: ["/components/admin/CalendarNavLink#CalendarNavLink"],
    },
  },
  // Payload's REST API lives at /payload-api so it never collides with the
  // app's own /api/* routes (bookings, ical feeds, webhooks).
  routes: {
    api: "/payload-api",
  },
  collections: [Sites, Bookings, BlockedDates, EventInquiries, Addons, Reviews, Pages, Requests, Media, Users],
  globals: [Settings, BrandGuide],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "ccc-dev-secret-change-before-prod",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db,
  graphQL: {
    disable: true,
  },
  sharp,
  plugins: [
    // Uploads go to Vercel Blob in production so images survive deploys and
    // can be added through the connector; without a token (local dev) it is
    // disabled and Payload writes to the filesystem instead.
    //
    // The plugin is ALWAYS in the config, never conditionally added: it
    // registers an admin client component, and a config that differs between
    // the machine that generates the import map and the one that serves the
    // admin produces a blank admin panel with only a server-side log line to
    // explain it. Toggle behaviour with `enabled`, never by presence.
    vercelBlobStorage({
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN ?? "",
    }),
  ],
});
