import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
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
  collections: [Sites, Bookings, BlockedDates, EventInquiries, Addons, Reviews, Media, Users],
  globals: [Settings],
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
});
