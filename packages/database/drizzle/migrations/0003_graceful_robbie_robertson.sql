-- Migration: Add Profile and Partner schemas
-- Skips existing tables (user, account, session, verification)

-- Create new enums
CREATE TYPE "public"."partner_request_status" AS ENUM('pending', 'approved', 'rejected');
CREATE TYPE "public"."partner_status" AS ENUM('pending', 'active', 'suspended', 'cancelled');
CREATE TYPE "public"."partner_tier" AS ENUM('standard', 'gold', 'platinum', 'black');
CREATE TYPE "public"."staff_role" AS ENUM('owner', 'admin', 'sales', 'viewer');
CREATE TYPE "public"."staff_status" AS ENUM('active', 'invited', 'suspended', 'left');

-- Create user_profile table
CREATE TABLE IF NOT EXISTS "user_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"phone" text,
	"first_name" text,
	"last_name" text,
	"avatar" text,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"kyc_verified" boolean DEFAULT false NOT NULL,
	"kyc_verified_at" timestamp,
	"badges" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"location_lat" double precision,
	"location_lng" double precision,
	"location_city" text,
	"location_emirate" text,
	"inventory_count" integer DEFAULT 0 NOT NULL,
	"cars_sold" integer DEFAULT 0 NOT NULL,
	"avg_response_time" integer,
	"last_active_at" timestamp,
	"notification_preferences" jsonb DEFAULT '{"emailKYC":true,"emailEscrow":true,"emailBooking":true,"emailMessages":true,"emailFinancial":true,"emailMarketing":false,"emailReservation":true}'::jsonb NOT NULL,
	"privacy_settings" jsonb DEFAULT '{"showEmail":false,"showPhone":true}'::jsonb NOT NULL,
	"preferences" jsonb DEFAULT '{"theme":"system","language":"en","distanceUnit":"km"}'::jsonb NOT NULL,
	"consignment_mode" boolean DEFAULT false NOT NULL,
	"member_since" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profile_user_id_unique" UNIQUE("user_id")
);

-- Create kyc_record table
CREATE TABLE IF NOT EXISTS "kyc_record" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" text NOT NULL,
	"type" text NOT NULL,
	"document_type" text,
	"document_number" text,
	"document_front_url" text,
	"document_back_url" text,
	"selfie_url" text,
	"verified_by" text,
	"verified_at" timestamp,
	"rejection_reason" text,
	"expires_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create user_favorite table
CREATE TABLE IF NOT EXISTS "user_favorite" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create partner table
CREATE TABLE IF NOT EXISTS "partner" (
	"id" text PRIMARY KEY NOT NULL,
	"company_name_legal" text NOT NULL,
	"brand_name" text NOT NULL,
	"trade_license" text NOT NULL,
	"trade_license_expiry" timestamp,
	"trade_license_document_url" text,
	"status" "partner_status" DEFAULT 'pending' NOT NULL,
	"tier" "partner_tier" DEFAULT 'standard' NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"website" text,
	"address" text,
	"emirate" text,
	"location_lat" double precision,
	"location_lng" double precision,
	"showroom_count" integer DEFAULT 1 NOT NULL,
	"logo" text,
	"hero_image" text,
	"cover_image" text,
	"gallery_images" jsonb DEFAULT '[]'::jsonb,
	"description" text,
	"specialties" jsonb DEFAULT '[]'::jsonb,
	"experience_years" integer,
	"founded_year" integer,
	"google_review_url" text,
	"google_rating" double precision,
	"google_review_count" integer DEFAULT 0,
	"platform_rating" double precision,
	"platform_review_count" integer DEFAULT 0,
	"customer_satisfaction" double precision,
	"total_inventory" integer DEFAULT 0 NOT NULL,
	"active_listings" integer DEFAULT 0 NOT NULL,
	"sold_listings" integer DEFAULT 0 NOT NULL,
	"total_sales" integer DEFAULT 0 NOT NULL,
	"total_revenue" integer DEFAULT 0 NOT NULL,
	"avg_response_time" integer,
	"response_rate" double precision,
	"lead_conversion_rate" double precision,
	"repeat_customer_rate" double precision,
	"avg_deal_value" integer DEFAULT 0,
	"monthly_views" integer DEFAULT 0,
	"monthly_leads" integer DEFAULT 0,
	"monthly_sales" integer DEFAULT 0,
	"monthly_revenue" integer DEFAULT 0,
	"team_size" integer DEFAULT 0,
	"active_staff_count" integer DEFAULT 0,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" text,
	"badges" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"features" jsonb DEFAULT '{"homeDelivery":false,"testDriveAvailable":true,"financing":false,"tradeIn":false,"warranty":false,"insurance":false,"registration":false,"exportAssistance":false}'::jsonb NOT NULL,
	"business_hours" jsonb DEFAULT '{"monday":{"open":"09:00","close":"18:00"},"tuesday":{"open":"09:00","close":"18:00"},"wednesday":{"open":"09:00","close":"18:00"},"thursday":{"open":"09:00","close":"18:00"},"friday":{"closed":true,"open":"","close":""},"saturday":{"open":"09:00","close":"18:00"},"sunday":{"open":"09:00","close":"18:00"}}'::jsonb,
	"commission_rate" double precision DEFAULT 0 NOT NULL,
	"subscription_tier" text DEFAULT 'basic',
	"subscription_expires_at" timestamp,
	"payment_terms" text DEFAULT 'net30',
	"notification_preferences" jsonb DEFAULT '{"emailNewLead":true,"emailBooking":true,"emailMessage":true,"emailSale":true,"emailReview":true,"emailMarketing":false,"smsNewLead":true,"smsBooking":true}'::jsonb NOT NULL,
	"account_manager_id" text,
	"primary_contact_id" text,
	"last_audit_at" timestamp,
	"next_audit_at" timestamp,
	"compliance_score" integer,
	"submitted_at" timestamp,
	"approved_at" timestamp,
	"approved_by" text,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"activated_at" timestamp,
	"suspended_at" timestamp,
	"cancelled_at" timestamp,
	CONSTRAINT "partner_email_unique" UNIQUE("email"),
	CONSTRAINT "partner_trade_license_unique" UNIQUE("trade_license")
);

-- Create partner_staff table
CREATE TABLE IF NOT EXISTS "partner_staff" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "staff_role" NOT NULL,
	"title" text,
	"department" text,
	"is_primary_contact" boolean DEFAULT false NOT NULL,
	"permissions" jsonb DEFAULT '{"manageListings":true,"manageTeam":false,"viewAnalytics":false,"manageBookings":true,"respondToLeads":true,"manageFinancials":false,"manageSettings":false,"exportData":false}'::jsonb NOT NULL,
	"status" "staff_status" DEFAULT 'active' NOT NULL,
	"leads_handled" integer DEFAULT 0 NOT NULL,
	"leads_converted" integer DEFAULT 0 NOT NULL,
	"deals_closed" integer DEFAULT 0 NOT NULL,
	"total_sales_value" integer DEFAULT 0 NOT NULL,
	"avg_response_time" integer,
	"last_active_at" timestamp,
	"performance_score" double precision,
	"customer_rating" double precision,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"invited_at" timestamp,
	"invited_by" text,
	"accepted_at" timestamp,
	"left_at" timestamp,
	"left_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_staff_partnerId_userId_unique" UNIQUE("partner_id","user_id")
);

-- Create partner_request table
CREATE TABLE IF NOT EXISTS "partner_request" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"company_name_legal" text NOT NULL,
	"brand_name" text NOT NULL,
	"trade_license" text NOT NULL,
	"trade_license_document_url" text,
	"trade_license_expiry" timestamp,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"website" text,
	"address" text,
	"emirate" text,
	"description" text,
	"experience_years" integer,
	"specialties" jsonb DEFAULT '[]'::jsonb,
	"status" "partner_request_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"internal_notes" text,
	"partner_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create partner_review table  
CREATE TABLE IF NOT EXISTS "partner_review" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"review" text,
	"communication_rating" integer,
	"vehicle_condition_rating" integer,
	"process_rating" integer,
	"is_verified_purchase" boolean DEFAULT false NOT NULL,
	"purchase_id" text,
	"partner_response" text,
	"responded_at" timestamp,
	"status" text DEFAULT 'published' NOT NULL,
	"moderated_by" text,
	"moderated_at" timestamp,
	"helpful_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"user_id" text,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"old_values" jsonb,
	"new_values" jsonb,
	"severity" text DEFAULT 'info' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign keys
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "kyc_record" ADD CONSTRAINT "kyc_record_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_favorite" ADD CONSTRAINT "user_favorite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "partner" ADD CONSTRAINT "partner_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "partner" ADD CONSTRAINT "partner_account_manager_id_user_id_fk" FOREIGN KEY ("account_manager_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "partner" ADD CONSTRAINT "partner_primary_contact_id_partner_staff_id_fk" FOREIGN KEY ("primary_contact_id") REFERENCES "public"."partner_staff"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "partner" ADD CONSTRAINT "partner_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "partner_staff" ADD CONSTRAINT "partner_staff_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "partner_staff" ADD CONSTRAINT "partner_staff_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "partner_request" ADD CONSTRAINT "partner_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "partner_request" ADD CONSTRAINT "partner_request_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "partner_request" ADD CONSTRAINT "partner_request_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "partner_review" ADD CONSTRAINT "partner_review_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "partner_review" ADD CONSTRAINT "partner_review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;

-- Create indexes
CREATE INDEX IF NOT EXISTS "user_profile_userId_idx" ON "user_profile" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "user_profile_phone_idx" ON "user_profile" USING btree ("phone");
CREATE INDEX IF NOT EXISTS "user_profile_location_idx" ON "user_profile" USING btree ("location_city","location_emirate");
CREATE INDEX IF NOT EXISTS "user_profile_kyc_verified_idx" ON "user_profile" USING btree ("kyc_verified");
CREATE INDEX IF NOT EXISTS "user_profile_status_idx" ON "user_profile" USING btree ("status");

CREATE INDEX IF NOT EXISTS "kyc_record_userId_idx" ON "kyc_record" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "kyc_record_status_idx" ON "kyc_record" USING btree ("status");

CREATE INDEX IF NOT EXISTS "user_favorite_userId_idx" ON "user_favorite" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "user_favorite_listingId_idx" ON "user_favorite" USING btree ("listing_id");
CREATE INDEX IF NOT EXISTS "user_favorite_userId_listingId_idx" ON "user_favorite" USING btree ("user_id","listing_id");

CREATE INDEX IF NOT EXISTS "partner_email_idx" ON "partner" USING btree ("email");
CREATE INDEX IF NOT EXISTS "partner_phone_idx" ON "partner" USING btree ("phone");
CREATE INDEX IF NOT EXISTS "partner_trade_license_idx" ON "partner" USING btree ("trade_license");
CREATE INDEX IF NOT EXISTS "partner_status_idx" ON "partner" USING btree ("status");
CREATE INDEX IF NOT EXISTS "partner_tier_idx" ON "partner" USING btree ("tier");
CREATE INDEX IF NOT EXISTS "partner_is_verified_idx" ON "partner" USING btree ("is_verified");
CREATE INDEX IF NOT EXISTS "partner_emirate_idx" ON "partner" USING btree ("emirate");
CREATE INDEX IF NOT EXISTS "partner_location_idx" ON "partner" USING btree ("location_lat","location_lng");
CREATE INDEX IF NOT EXISTS "partner_primaryContactId_idx" ON "partner" USING btree ("primary_contact_id");
CREATE INDEX IF NOT EXISTS "partner_approvedBy_idx" ON "partner" USING btree ("approved_by");
CREATE INDEX IF NOT EXISTS "partner_accountManagerId_idx" ON "partner" USING btree ("account_manager_id");
CREATE INDEX IF NOT EXISTS "partner_verifiedBy_idx" ON "partner" USING btree ("verified_by");

CREATE INDEX IF NOT EXISTS "partner_staff_partnerId_idx" ON "partner_staff" USING btree ("partner_id");
CREATE INDEX IF NOT EXISTS "partner_staff_userId_idx" ON "partner_staff" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "partner_staff_status_idx" ON "partner_staff" USING btree ("status");
CREATE INDEX IF NOT EXISTS "partner_staff_role_idx" ON "partner_staff" USING btree ("role");

CREATE INDEX IF NOT EXISTS "partner_request_userId_idx" ON "partner_request" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "partner_request_status_idx" ON "partner_request" USING btree ("status");
CREATE INDEX IF NOT EXISTS "partner_request_reviewedBy_idx" ON "partner_request" USING btree ("reviewed_by");
CREATE INDEX IF NOT EXISTS "partner_request_tradeLicense_idx" ON "partner_request" USING btree ("trade_license");
CREATE INDEX IF NOT EXISTS "partner_request_createdAt_idx" ON "partner_request" USING btree ("created_at");

CREATE INDEX IF NOT EXISTS "partner_review_partnerId_idx" ON "partner_review" USING btree ("partner_id");
CREATE INDEX IF NOT EXISTS "partner_review_userId_idx" ON "partner_review" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "partner_review_rating_idx" ON "partner_review" USING btree ("rating");
CREATE INDEX IF NOT EXISTS "partner_review_status_idx" ON "partner_review" USING btree ("status");

CREATE INDEX IF NOT EXISTS "audit_log_userId_idx" ON "audit_log" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "audit_log_entityType_idx" ON "audit_log" USING btree ("entity_type");
CREATE INDEX IF NOT EXISTS "audit_log_entityId_idx" ON "audit_log" USING btree ("entity_id");
CREATE INDEX IF NOT EXISTS "audit_log_action_idx" ON "audit_log" USING btree ("action");
CREATE INDEX IF NOT EXISTS "audit_log_createdAt_idx" ON "audit_log" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "audit_log_severity_idx" ON "audit_log" USING btree ("severity");
CREATE INDEX IF NOT EXISTS "audit_log_entityType_entityId_idx" ON "audit_log" USING btree ("entity_type","entity_id");
