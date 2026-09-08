import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_messages_from" AS ENUM('guest', 'host');
  CREATE TYPE "public"."enum__messages_v_version_from" AS ENUM('guest', 'host');
  CREATE TABLE "messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"preview" varchar,
  	"from" "enum_messages_from" DEFAULT 'guest' NOT NULL,
  	"read_by_owner" boolean DEFAULT false,
  	"body" varchar NOT NULL,
  	"booking_id" integer NOT NULL,
  	"guest_id" integer,
  	"author_name" varchar,
  	"is_test" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_messages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_preview" varchar,
  	"version_from" "enum__messages_v_version_from" DEFAULT 'guest' NOT NULL,
  	"version_read_by_owner" boolean DEFAULT false,
  	"version_body" varchar NOT NULL,
  	"version_booking_id" integer NOT NULL,
  	"version_guest_id" integer,
  	"version_author_name" varchar,
  	"version_is_test" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "messages_id" integer;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_messages_v" ADD CONSTRAINT "_messages_v_parent_id_messages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_messages_v" ADD CONSTRAINT "_messages_v_version_booking_id_bookings_id_fk" FOREIGN KEY ("version_booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_messages_v" ADD CONSTRAINT "_messages_v_version_guest_id_guests_id_fk" FOREIGN KEY ("version_guest_id") REFERENCES "public"."guests"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "messages_booking_idx" ON "messages" USING btree ("booking_id");
  CREATE INDEX "messages_guest_idx" ON "messages" USING btree ("guest_id");
  CREATE INDEX "messages_updated_at_idx" ON "messages" USING btree ("updated_at");
  CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");
  CREATE INDEX "_messages_v_parent_idx" ON "_messages_v" USING btree ("parent_id");
  CREATE INDEX "_messages_v_version_version_booking_idx" ON "_messages_v" USING btree ("version_booking_id");
  CREATE INDEX "_messages_v_version_version_guest_idx" ON "_messages_v" USING btree ("version_guest_id");
  CREATE INDEX "_messages_v_version_version_updated_at_idx" ON "_messages_v" USING btree ("version_updated_at");
  CREATE INDEX "_messages_v_version_version_created_at_idx" ON "_messages_v" USING btree ("version_created_at");
  CREATE INDEX "_messages_v_created_at_idx" ON "_messages_v" USING btree ("created_at");
  CREATE INDEX "_messages_v_updated_at_idx" ON "_messages_v" USING btree ("updated_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("messages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "messages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_messages_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "messages" CASCADE;
  DROP TABLE "_messages_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_messages_fk";
  
  DROP INDEX "payload_locked_documents_rels_messages_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "messages_id";
  DROP TYPE "public"."enum_messages_from";
  DROP TYPE "public"."enum__messages_v_version_from";`)
}
