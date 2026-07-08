import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_sites_ical_import_urls_platform" AS ENUM('hipcamp', 'airbnb', 'other');
  CREATE TYPE "public"."enum_sites_type" AS ENUM('tent', 'van_solar', 'van_power', 'glamping');
  CREATE TYPE "public"."enum_sites_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum_bookings_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'refunded');
  CREATE TYPE "public"."enum_bookings_source" AS ENUM('direct', 'hipcamp', 'airbnb');
  CREATE TYPE "public"."enum_blocked_dates_reason" AS ENUM('owner_block', 'maintenance', 'seasonal_closure', 'ota_booking');
  CREATE TYPE "public"."enum_blocked_dates_source" AS ENUM('manual', 'hipcamp', 'airbnb', 'other');
  CREATE TYPE "public"."enum_event_inquiries_status" AS ENUM('pending', 'approved', 'declined', 'converted');
  CREATE TYPE "public"."enum_addons_applicable_site_types" AS ENUM('tent', 'van_solar', 'van_power', 'glamping');
  CREATE TYPE "public"."enum_reviews_source" AS ENUM('hipcamp', 'direct');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'owner');
  CREATE TABLE "sites_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"alt" varchar
  );
  
  CREATE TABLE "sites_amenities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "sites_component_site_slugs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar
  );
  
  CREATE TABLE "sites_ical_import_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_sites_ical_import_urls_platform",
  	"url" varchar
  );
  
  CREATE TABLE "sites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"type" "enum_sites_type" NOT NULL,
  	"status" "enum_sites_status" DEFAULT 'active' NOT NULL,
  	"short_description" varchar,
  	"description" varchar,
  	"max_guests" numeric NOT NULL,
  	"base_price" numeric NOT NULL,
  	"weekend_price" numeric NOT NULL,
  	"is_combo" boolean DEFAULT false,
  	"latitude" numeric,
  	"longitude" numeric,
  	"sort_order" numeric DEFAULT 0,
  	"ical_last_synced" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bookings_add_ons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"add_on_id" varchar,
  	"name" varchar,
  	"quantity" numeric,
  	"unit_price" numeric,
  	"per_night" boolean DEFAULT false
  );
  
  CREATE TABLE "bookings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"confirmation_code" varchar,
  	"status" "enum_bookings_status" DEFAULT 'pending' NOT NULL,
  	"site_id" integer,
  	"site_slug" varchar NOT NULL,
  	"site_name" varchar NOT NULL,
  	"check_in" varchar NOT NULL,
  	"check_out" varchar NOT NULL,
  	"nights" numeric,
  	"guests" numeric,
  	"guest_first_name" varchar NOT NULL,
  	"guest_last_name" varchar NOT NULL,
  	"guest_email" varchar NOT NULL,
  	"guest_phone" varchar,
  	"guest_special_requests" varchar,
  	"nightly_breakdown" jsonb,
  	"subtotal" numeric,
  	"add_ons_total" numeric,
  	"total" numeric,
  	"waiver_signed" boolean DEFAULT false,
  	"waiver_signature" varchar,
  	"source" "enum_bookings_source" DEFAULT 'direct',
  	"magic_link_token" varchar,
  	"stripe_session_id" varchar,
  	"stripe_payment_intent" varchar,
  	"cancellation_reason" varchar,
  	"cancelled_at" varchar,
  	"refund_amount" numeric,
  	"notifications_confirmation_sent_at" varchar,
  	"notifications_pre_arrival_sent_at" varchar,
  	"notifications_day_before_sent_at" varchar,
  	"notifications_post_stay_sent_at" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "blocked_dates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_id" integer,
  	"site_slug" varchar NOT NULL,
  	"start_date" varchar NOT NULL,
  	"end_date" varchar NOT NULL,
  	"reason" "enum_blocked_dates_reason" DEFAULT 'owner_block' NOT NULL,
  	"source" "enum_blocked_dates_source" DEFAULT 'manual',
  	"external_uid" varchar,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "event_inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_event_inquiries_status" DEFAULT 'pending' NOT NULL,
  	"guest_name" varchar NOT NULL,
  	"guest_email" varchar NOT NULL,
  	"guest_phone" varchar,
  	"event_type" varchar,
  	"party_size" numeric,
  	"preferred_dates" varchar,
  	"message" varchar,
  	"admin_notes" varchar,
  	"quoted_price" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "addons_applicable_site_types" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_addons_applicable_site_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "addons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"price" numeric NOT NULL,
  	"per_night" boolean DEFAULT false,
  	"max_quantity" numeric DEFAULT 1 NOT NULL,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"author" varchar NOT NULL,
  	"date" varchar NOT NULL,
  	"rating" numeric NOT NULL,
  	"text" varchar NOT NULL,
  	"site_slug" varchar,
  	"recommends" boolean DEFAULT true,
  	"published" boolean DEFAULT true,
  	"source" "enum_reviews_source" DEFAULT 'hipcamp',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'owner' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sites_id" integer,
  	"bookings_id" integer,
  	"blocked_dates_id" integer,
  	"event_inquiries_id" integer,
  	"addons_id" integer,
  	"reviews_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "settings_house_rules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rule" varchar NOT NULL
  );
  
  CREATE TABLE "settings_shared_amenities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"property_name" varchar NOT NULL,
  	"location" varchar,
  	"coordinates_lat" numeric,
  	"coordinates_lng" numeric,
  	"check_in_time" varchar,
  	"check_out_time" varchar,
  	"quiet_hours" varchar,
  	"cancellation_policy" varchar,
  	"cancellation_terms_full_refund_days" numeric DEFAULT 14,
  	"cancellation_terms_partial_refund_days" numeric DEFAULT 2,
  	"cancellation_terms_partial_refund_percent" numeric DEFAULT 50,
  	"host_names" varchar,
  	"host_bio" varchar,
  	"host_response_rate" numeric,
  	"host_response_time" varchar,
  	"host_email" varchar,
  	"rating_average" numeric,
  	"rating_count" numeric,
  	"rating_breakdown" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "sites_photos" ADD CONSTRAINT "sites_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_amenities" ADD CONSTRAINT "sites_amenities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_component_site_slugs" ADD CONSTRAINT "sites_component_site_slugs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_ical_import_urls" ADD CONSTRAINT "sites_ical_import_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bookings_add_ons" ADD CONSTRAINT "bookings_add_ons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blocked_dates" ADD CONSTRAINT "blocked_dates_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "addons_applicable_site_types" ADD CONSTRAINT "addons_applicable_site_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."addons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sites_fk" FOREIGN KEY ("sites_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bookings_fk" FOREIGN KEY ("bookings_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blocked_dates_fk" FOREIGN KEY ("blocked_dates_id") REFERENCES "public"."blocked_dates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_inquiries_fk" FOREIGN KEY ("event_inquiries_id") REFERENCES "public"."event_inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_addons_fk" FOREIGN KEY ("addons_id") REFERENCES "public"."addons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_house_rules" ADD CONSTRAINT "settings_house_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_shared_amenities" ADD CONSTRAINT "settings_shared_amenities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "sites_photos_order_idx" ON "sites_photos" USING btree ("_order");
  CREATE INDEX "sites_photos_parent_id_idx" ON "sites_photos" USING btree ("_parent_id");
  CREATE INDEX "sites_amenities_order_idx" ON "sites_amenities" USING btree ("_order");
  CREATE INDEX "sites_amenities_parent_id_idx" ON "sites_amenities" USING btree ("_parent_id");
  CREATE INDEX "sites_component_site_slugs_order_idx" ON "sites_component_site_slugs" USING btree ("_order");
  CREATE INDEX "sites_component_site_slugs_parent_id_idx" ON "sites_component_site_slugs" USING btree ("_parent_id");
  CREATE INDEX "sites_ical_import_urls_order_idx" ON "sites_ical_import_urls" USING btree ("_order");
  CREATE INDEX "sites_ical_import_urls_parent_id_idx" ON "sites_ical_import_urls" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sites_slug_idx" ON "sites" USING btree ("slug");
  CREATE INDEX "sites_updated_at_idx" ON "sites" USING btree ("updated_at");
  CREATE INDEX "sites_created_at_idx" ON "sites" USING btree ("created_at");
  CREATE INDEX "bookings_add_ons_order_idx" ON "bookings_add_ons" USING btree ("_order");
  CREATE INDEX "bookings_add_ons_parent_id_idx" ON "bookings_add_ons" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "bookings_confirmation_code_idx" ON "bookings" USING btree ("confirmation_code");
  CREATE INDEX "bookings_site_idx" ON "bookings" USING btree ("site_id");
  CREATE INDEX "bookings_site_slug_idx" ON "bookings" USING btree ("site_slug");
  CREATE INDEX "bookings_updated_at_idx" ON "bookings" USING btree ("updated_at");
  CREATE INDEX "bookings_created_at_idx" ON "bookings" USING btree ("created_at");
  CREATE INDEX "blocked_dates_site_idx" ON "blocked_dates" USING btree ("site_id");
  CREATE INDEX "blocked_dates_site_slug_idx" ON "blocked_dates" USING btree ("site_slug");
  CREATE INDEX "blocked_dates_external_uid_idx" ON "blocked_dates" USING btree ("external_uid");
  CREATE INDEX "blocked_dates_updated_at_idx" ON "blocked_dates" USING btree ("updated_at");
  CREATE INDEX "blocked_dates_created_at_idx" ON "blocked_dates" USING btree ("created_at");
  CREATE INDEX "event_inquiries_updated_at_idx" ON "event_inquiries" USING btree ("updated_at");
  CREATE INDEX "event_inquiries_created_at_idx" ON "event_inquiries" USING btree ("created_at");
  CREATE INDEX "addons_applicable_site_types_order_idx" ON "addons_applicable_site_types" USING btree ("order");
  CREATE INDEX "addons_applicable_site_types_parent_idx" ON "addons_applicable_site_types" USING btree ("parent_id");
  CREATE INDEX "addons_updated_at_idx" ON "addons" USING btree ("updated_at");
  CREATE INDEX "addons_created_at_idx" ON "addons" USING btree ("created_at");
  CREATE INDEX "reviews_site_slug_idx" ON "reviews" USING btree ("site_slug");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_sites_id_idx" ON "payload_locked_documents_rels" USING btree ("sites_id");
  CREATE INDEX "payload_locked_documents_rels_bookings_id_idx" ON "payload_locked_documents_rels" USING btree ("bookings_id");
  CREATE INDEX "payload_locked_documents_rels_blocked_dates_id_idx" ON "payload_locked_documents_rels" USING btree ("blocked_dates_id");
  CREATE INDEX "payload_locked_documents_rels_event_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("event_inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_addons_id_idx" ON "payload_locked_documents_rels" USING btree ("addons_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "settings_house_rules_order_idx" ON "settings_house_rules" USING btree ("_order");
  CREATE INDEX "settings_house_rules_parent_id_idx" ON "settings_house_rules" USING btree ("_parent_id");
  CREATE INDEX "settings_shared_amenities_order_idx" ON "settings_shared_amenities" USING btree ("_order");
  CREATE INDEX "settings_shared_amenities_parent_id_idx" ON "settings_shared_amenities" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "sites_photos" CASCADE;
  DROP TABLE "sites_amenities" CASCADE;
  DROP TABLE "sites_component_site_slugs" CASCADE;
  DROP TABLE "sites_ical_import_urls" CASCADE;
  DROP TABLE "sites" CASCADE;
  DROP TABLE "bookings_add_ons" CASCADE;
  DROP TABLE "bookings" CASCADE;
  DROP TABLE "blocked_dates" CASCADE;
  DROP TABLE "event_inquiries" CASCADE;
  DROP TABLE "addons_applicable_site_types" CASCADE;
  DROP TABLE "addons" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "settings_house_rules" CASCADE;
  DROP TABLE "settings_shared_amenities" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TYPE "public"."enum_sites_ical_import_urls_platform";
  DROP TYPE "public"."enum_sites_type";
  DROP TYPE "public"."enum_sites_status";
  DROP TYPE "public"."enum_bookings_status";
  DROP TYPE "public"."enum_bookings_source";
  DROP TYPE "public"."enum_blocked_dates_reason";
  DROP TYPE "public"."enum_blocked_dates_source";
  DROP TYPE "public"."enum_event_inquiries_status";
  DROP TYPE "public"."enum_addons_applicable_site_types";
  DROP TYPE "public"."enum_reviews_source";
  DROP TYPE "public"."enum_users_role";`)
}
