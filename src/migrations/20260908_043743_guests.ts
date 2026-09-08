import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "guests_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "guests_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "guests_names" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "guests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar NOT NULL,
  	"notes" varchar,
  	"primary_email" varchar,
  	"primary_phone" varchar,
  	"needs_review" boolean DEFAULT false,
  	"review_note" varchar,
  	"stay_count" numeric DEFAULT 0,
  	"nights_total" numeric DEFAULT 0,
  	"spend_total" numeric DEFAULT 0,
  	"first_stay" varchar,
  	"last_stay" varchar,
  	"is_example" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "bookings" ADD COLUMN "guest_profile_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "guests_id" integer;
  ALTER TABLE "guests_emails" ADD CONSTRAINT "guests_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guests_phones" ADD CONSTRAINT "guests_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guests_names" ADD CONSTRAINT "guests_names_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "guests_emails_order_idx" ON "guests_emails" USING btree ("_order");
  CREATE INDEX "guests_emails_parent_id_idx" ON "guests_emails" USING btree ("_parent_id");
  CREATE INDEX "guests_phones_order_idx" ON "guests_phones" USING btree ("_order");
  CREATE INDEX "guests_phones_parent_id_idx" ON "guests_phones" USING btree ("_parent_id");
  CREATE INDEX "guests_names_order_idx" ON "guests_names" USING btree ("_order");
  CREATE INDEX "guests_names_parent_id_idx" ON "guests_names" USING btree ("_parent_id");
  CREATE INDEX "guests_updated_at_idx" ON "guests" USING btree ("updated_at");
  CREATE INDEX "guests_created_at_idx" ON "guests" USING btree ("created_at");
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guest_profile_id_guests_id_fk" FOREIGN KEY ("guest_profile_id") REFERENCES "public"."guests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_guests_fk" FOREIGN KEY ("guests_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "bookings_guest_profile_idx" ON "bookings" USING btree ("guest_profile_id");
  CREATE INDEX "payload_locked_documents_rels_guests_id_idx" ON "payload_locked_documents_rels" USING btree ("guests_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "guests_emails" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "guests_phones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "guests_names" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "guests" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "guests_emails" CASCADE;
  DROP TABLE "guests_phones" CASCADE;
  DROP TABLE "guests_names" CASCADE;
  DROP TABLE "guests" CASCADE;
  ALTER TABLE "bookings" DROP CONSTRAINT "bookings_guest_profile_id_guests_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_guests_fk";
  
  DROP INDEX "bookings_guest_profile_idx";
  DROP INDEX "payload_locked_documents_rels_guests_id_idx";
  ALTER TABLE "bookings" DROP COLUMN "guest_profile_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "guests_id";`)
}
