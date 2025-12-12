CREATE TYPE "public"."partner_role" AS ENUM('staff', 'admin', 'owner');--> statement-breakpoint
CREATE TYPE "public"."partner_status" AS ENUM('draft', 'active', 'suspended', 'banned');--> statement-breakpoint
CREATE TYPE "public"."platform_role" AS ENUM('user', 'staff', 'admin', 'super-admin');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'pending', 'suspended', 'inactive');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"expiresAt" timestamp,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"user_id" text,
	"old_values" text,
	"new_values" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_members" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"partner_id" text NOT NULL,
	"role" "partner_role" DEFAULT 'staff' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"invited_by" text NOT NULL,
	CONSTRAINT "partner_members_user_partner_unique" UNIQUE("user_id","partner_id")
);
--> statement-breakpoint
CREATE TABLE "partner_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"business_name" text NOT NULL,
	"business_email" text NOT NULL,
	"business_phone" text,
	"business_website" text,
	"description" text,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"partner_id" text
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"status" "partner_status" DEFAULT 'draft' NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"website" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	CONSTRAINT "partners_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false,
	"image" text,
	"platformRole" "platform_role" DEFAULT 'user' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"activePartnerId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "account_provider_account_idx" ON "account" USING btree ("providerId","accountId");--> statement-breakpoint
CREATE INDEX "account_expires_at_idx" ON "account" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "audit_log_user_id_idx" ON "audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_log_action_idx" ON "audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_log_entity_type_idx" ON "audit_log" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "audit_log_entity_id_idx" ON "audit_log" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_log_user_action_idx" ON "audit_log" USING btree ("user_id","action");--> statement-breakpoint
CREATE INDEX "audit_log_action_created_at_idx" ON "audit_log" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "partner_members_user_id_idx" ON "partner_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "partner_members_partner_id_idx" ON "partner_members" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "partner_members_is_active_idx" ON "partner_members" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "partner_members_role_idx" ON "partner_members" USING btree ("role");--> statement-breakpoint
CREATE INDEX "partner_members_invited_by_idx" ON "partner_members" USING btree ("invited_by");--> statement-breakpoint
CREATE INDEX "partner_members_partner_active_idx" ON "partner_members" USING btree ("partner_id","is_active");--> statement-breakpoint
CREATE INDEX "partner_members_user_active_idx" ON "partner_members" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "partner_members_partner_role_active_idx" ON "partner_members" USING btree ("partner_id","role","is_active");--> statement-breakpoint
CREATE INDEX "partner_requests_user_id_idx" ON "partner_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "partner_requests_status_idx" ON "partner_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "partner_requests_business_email_idx" ON "partner_requests" USING btree ("business_email");--> statement-breakpoint
CREATE INDEX "partner_requests_reviewed_by_idx" ON "partner_requests" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "partner_requests_partner_id_idx" ON "partner_requests" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "partner_requests_created_at_idx" ON "partner_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "partner_requests_reviewed_at_idx" ON "partner_requests" USING btree ("reviewed_at");--> statement-breakpoint
CREATE INDEX "partner_requests_status_created_at_idx" ON "partner_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "partner_requests_status_reviewed_at_idx" ON "partner_requests" USING btree ("status","reviewed_at");--> statement-breakpoint
CREATE INDEX "partners_slug_idx" ON "partners" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "partners_status_idx" ON "partners" USING btree ("status");--> statement-breakpoint
CREATE INDEX "partners_email_idx" ON "partners" USING btree ("email");--> statement-breakpoint
CREATE INDEX "partners_created_by_idx" ON "partners" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "partners_created_at_idx" ON "partners" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "partners_status_created_at_idx" ON "partners" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "session" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_platform_role_idx" ON "users" USING btree ("platformRole");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_active_partner_idx" ON "users" USING btree ("activePartnerId");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "users_status_role_idx" ON "users" USING btree ("status","platformRole");--> statement-breakpoint
CREATE INDEX "users_email_verified_idx" ON "users" USING btree ("emailVerified");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_value_idx" ON "verification" USING btree ("value");--> statement-breakpoint
CREATE INDEX "verification_expires_at_idx" ON "verification" USING btree ("expiresAt");