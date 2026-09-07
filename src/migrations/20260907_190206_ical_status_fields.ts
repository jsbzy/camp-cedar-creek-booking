import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sites_ical_import_urls" ALTER COLUMN "platform" SET DEFAULT 'hipcamp';
  ALTER TABLE "sites" ADD COLUMN "ical_export_url" varchar;
  ALTER TABLE "sites" ADD COLUMN "ical_last_error" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sites_ical_import_urls" ALTER COLUMN "platform" DROP DEFAULT;
  ALTER TABLE "sites" DROP COLUMN "ical_export_url";
  ALTER TABLE "sites" DROP COLUMN "ical_last_error";`)
}
