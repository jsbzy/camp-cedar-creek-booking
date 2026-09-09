import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sites" ADD COLUMN "rating" numeric;
  ALTER TABLE "sites" ADD COLUMN "review_count" numeric;
  ALTER TABLE "_sites_v" ADD COLUMN "version_rating" numeric;
  ALTER TABLE "_sites_v" ADD COLUMN "version_review_count" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sites" DROP COLUMN "rating";
  ALTER TABLE "sites" DROP COLUMN "review_count";
  ALTER TABLE "_sites_v" DROP COLUMN "version_rating";
  ALTER TABLE "_sites_v" DROP COLUMN "version_review_count";`)
}
