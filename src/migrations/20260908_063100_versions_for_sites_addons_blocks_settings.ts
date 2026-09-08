import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum__blocked_dates_v_version_reason" AS ENUM('owner_block', 'maintenance', 'seasonal_closure', 'ota_booking');
  CREATE TYPE "public"."enum__blocked_dates_v_version_source" AS ENUM('manual', 'hipcamp', 'airbnb', 'other');
  CREATE TYPE "public"."enum__sites_v_version_ical_import_urls_platform" AS ENUM('hipcamp', 'airbnb', 'other');
  CREATE TYPE "public"."enum__sites_v_version_type" AS ENUM('tent', 'van_solar', 'van_power', 'glamping');
  CREATE TYPE "public"."enum__sites_v_version_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum__addons_v_version_applicable_site_types" AS ENUM('tent', 'van_solar', 'van_power', 'glamping');
  CREATE TABLE "_blocked_dates_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_site_id" integer,
  	"version_site_slug" varchar NOT NULL,
  	"version_start_date" varchar NOT NULL,
  	"version_end_date" varchar NOT NULL,
  	"version_reason" "enum__blocked_dates_v_version_reason" DEFAULT 'owner_block' NOT NULL,
  	"version_source" "enum__blocked_dates_v_version_source" DEFAULT 'manual',
  	"version_external_uid" varchar,
  	"version_note" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_sites_v_version_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"alt" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_sites_v_version_amenities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_sites_v_version_component_site_slugs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_sites_v_version_ical_import_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__sites_v_version_ical_import_urls_platform" DEFAULT 'hipcamp',
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_sites_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_type" "enum__sites_v_version_type" NOT NULL,
  	"version_status" "enum__sites_v_version_status" DEFAULT 'active' NOT NULL,
  	"version_short_description" varchar,
  	"version_description" varchar,
  	"version_max_guests" numeric NOT NULL,
  	"version_base_price" numeric NOT NULL,
  	"version_weekend_price" numeric NOT NULL,
  	"version_is_combo" boolean DEFAULT false,
  	"version_latitude" numeric,
  	"version_longitude" numeric,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_ical_export_url" varchar,
  	"version_ical_last_synced" timestamp(3) with time zone,
  	"version_ical_last_error" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_addons_v_version_applicable_site_types" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__addons_v_version_applicable_site_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_addons_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_description" varchar,
  	"version_price" numeric NOT NULL,
  	"version_per_night" boolean DEFAULT false,
  	"version_max_quantity" numeric DEFAULT 1 NOT NULL,
  	"version_active" boolean DEFAULT true,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_settings_v_version_house_rules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rule" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v_version_shared_amenities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_property_name" varchar NOT NULL,
  	"version_location" varchar,
  	"version_coordinates_lat" numeric,
  	"version_coordinates_lng" numeric,
  	"version_check_in_time" varchar,
  	"version_check_out_time" varchar,
  	"version_quiet_hours" varchar,
  	"version_cancellation_policy" varchar,
  	"version_cancellation_terms_full_refund_days" numeric DEFAULT 14,
  	"version_cancellation_terms_partial_refund_days" numeric DEFAULT 2,
  	"version_cancellation_terms_partial_refund_percent" numeric DEFAULT 50,
  	"version_host_names" varchar,
  	"version_host_bio" varchar,
  	"version_host_response_rate" numeric,
  	"version_host_response_time" varchar,
  	"version_host_email" varchar,
  	"version_rating_average" numeric,
  	"version_rating_count" numeric,
  	"version_rating_breakdown" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "_blocked_dates_v" ADD CONSTRAINT "_blocked_dates_v_parent_id_blocked_dates_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blocked_dates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blocked_dates_v" ADD CONSTRAINT "_blocked_dates_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sites_v_version_photos" ADD CONSTRAINT "_sites_v_version_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sites_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sites_v_version_amenities" ADD CONSTRAINT "_sites_v_version_amenities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sites_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sites_v_version_component_site_slugs" ADD CONSTRAINT "_sites_v_version_component_site_slugs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sites_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sites_v_version_ical_import_urls" ADD CONSTRAINT "_sites_v_version_ical_import_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sites_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sites_v" ADD CONSTRAINT "_sites_v_parent_id_sites_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_addons_v_version_applicable_site_types" ADD CONSTRAINT "_addons_v_version_applicable_site_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_addons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_addons_v" ADD CONSTRAINT "_addons_v_parent_id_addons_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."addons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_settings_v_version_house_rules" ADD CONSTRAINT "_settings_v_version_house_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v_version_shared_amenities" ADD CONSTRAINT "_settings_v_version_shared_amenities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_blocked_dates_v_parent_idx" ON "_blocked_dates_v" USING btree ("parent_id");
  CREATE INDEX "_blocked_dates_v_version_version_site_idx" ON "_blocked_dates_v" USING btree ("version_site_id");
  CREATE INDEX "_blocked_dates_v_version_version_site_slug_idx" ON "_blocked_dates_v" USING btree ("version_site_slug");
  CREATE INDEX "_blocked_dates_v_version_version_external_uid_idx" ON "_blocked_dates_v" USING btree ("version_external_uid");
  CREATE INDEX "_blocked_dates_v_version_version_updated_at_idx" ON "_blocked_dates_v" USING btree ("version_updated_at");
  CREATE INDEX "_blocked_dates_v_version_version_created_at_idx" ON "_blocked_dates_v" USING btree ("version_created_at");
  CREATE INDEX "_blocked_dates_v_created_at_idx" ON "_blocked_dates_v" USING btree ("created_at");
  CREATE INDEX "_blocked_dates_v_updated_at_idx" ON "_blocked_dates_v" USING btree ("updated_at");
  CREATE INDEX "_sites_v_version_photos_order_idx" ON "_sites_v_version_photos" USING btree ("_order");
  CREATE INDEX "_sites_v_version_photos_parent_id_idx" ON "_sites_v_version_photos" USING btree ("_parent_id");
  CREATE INDEX "_sites_v_version_amenities_order_idx" ON "_sites_v_version_amenities" USING btree ("_order");
  CREATE INDEX "_sites_v_version_amenities_parent_id_idx" ON "_sites_v_version_amenities" USING btree ("_parent_id");
  CREATE INDEX "_sites_v_version_component_site_slugs_order_idx" ON "_sites_v_version_component_site_slugs" USING btree ("_order");
  CREATE INDEX "_sites_v_version_component_site_slugs_parent_id_idx" ON "_sites_v_version_component_site_slugs" USING btree ("_parent_id");
  CREATE INDEX "_sites_v_version_ical_import_urls_order_idx" ON "_sites_v_version_ical_import_urls" USING btree ("_order");
  CREATE INDEX "_sites_v_version_ical_import_urls_parent_id_idx" ON "_sites_v_version_ical_import_urls" USING btree ("_parent_id");
  CREATE INDEX "_sites_v_parent_idx" ON "_sites_v" USING btree ("parent_id");
  CREATE INDEX "_sites_v_version_version_slug_idx" ON "_sites_v" USING btree ("version_slug");
  CREATE INDEX "_sites_v_version_version_updated_at_idx" ON "_sites_v" USING btree ("version_updated_at");
  CREATE INDEX "_sites_v_version_version_created_at_idx" ON "_sites_v" USING btree ("version_created_at");
  CREATE INDEX "_sites_v_created_at_idx" ON "_sites_v" USING btree ("created_at");
  CREATE INDEX "_sites_v_updated_at_idx" ON "_sites_v" USING btree ("updated_at");
  CREATE INDEX "_addons_v_version_applicable_site_types_order_idx" ON "_addons_v_version_applicable_site_types" USING btree ("order");
  CREATE INDEX "_addons_v_version_applicable_site_types_parent_idx" ON "_addons_v_version_applicable_site_types" USING btree ("parent_id");
  CREATE INDEX "_addons_v_parent_idx" ON "_addons_v" USING btree ("parent_id");
  CREATE INDEX "_addons_v_version_version_updated_at_idx" ON "_addons_v" USING btree ("version_updated_at");
  CREATE INDEX "_addons_v_version_version_created_at_idx" ON "_addons_v" USING btree ("version_created_at");
  CREATE INDEX "_addons_v_created_at_idx" ON "_addons_v" USING btree ("created_at");
  CREATE INDEX "_addons_v_updated_at_idx" ON "_addons_v" USING btree ("updated_at");
  CREATE INDEX "_settings_v_version_house_rules_order_idx" ON "_settings_v_version_house_rules" USING btree ("_order");
  CREATE INDEX "_settings_v_version_house_rules_parent_id_idx" ON "_settings_v_version_house_rules" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_shared_amenities_order_idx" ON "_settings_v_version_shared_amenities" USING btree ("_order");
  CREATE INDEX "_settings_v_version_shared_amenities_parent_id_idx" ON "_settings_v_version_shared_amenities" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_created_at_idx" ON "_settings_v" USING btree ("created_at");
  CREATE INDEX "_settings_v_updated_at_idx" ON "_settings_v" USING btree ("updated_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "_blocked_dates_v" CASCADE;
  DROP TABLE "_sites_v_version_photos" CASCADE;
  DROP TABLE "_sites_v_version_amenities" CASCADE;
  DROP TABLE "_sites_v_version_component_site_slugs" CASCADE;
  DROP TABLE "_sites_v_version_ical_import_urls" CASCADE;
  DROP TABLE "_sites_v" CASCADE;
  DROP TABLE "_addons_v_version_applicable_site_types" CASCADE;
  DROP TABLE "_addons_v" CASCADE;
  DROP TABLE "_settings_v_version_house_rules" CASCADE;
  DROP TABLE "_settings_v_version_shared_amenities" CASCADE;
  DROP TABLE "_settings_v" CASCADE;
  DROP TYPE "public"."enum__blocked_dates_v_version_reason";
  DROP TYPE "public"."enum__blocked_dates_v_version_source";
  DROP TYPE "public"."enum__sites_v_version_ical_import_urls_platform";
  DROP TYPE "public"."enum__sites_v_version_type";
  DROP TYPE "public"."enum__sites_v_version_status";
  DROP TYPE "public"."enum__addons_v_version_applicable_site_types";`)
}
