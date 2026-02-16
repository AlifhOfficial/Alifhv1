CREATE TYPE "public"."device_platform" AS ENUM('ios', 'android', 'web');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('new_message', 'listing_approved', 'listing_rejected', 'listing_viewed', 'listing_saved', 'new_enquiry', 'price_drop', 'booking_request', 'booking_confirmed', 'booking_reminder', 'promotion', 'system');--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"image_url" text,
	"action_url" text,
	"action_data" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"actor_id" text,
	"actor_name" text,
	"actor_avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_device_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"platform" "device_platform" NOT NULL,
	"device_id" text,
	"device_name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp DEFAULT now(),
	"failed_attempts" text DEFAULT '0',
	"last_error" text,
	"last_error_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_notification_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"new_message" boolean DEFAULT true NOT NULL,
	"listing_approved" boolean DEFAULT true NOT NULL,
	"listing_rejected" boolean DEFAULT true NOT NULL,
	"listing_viewed" boolean DEFAULT false NOT NULL,
	"listing_saved" boolean DEFAULT true NOT NULL,
	"new_enquiry" boolean DEFAULT true NOT NULL,
	"price_drops" boolean DEFAULT true NOT NULL,
	"booking_request" boolean DEFAULT true NOT NULL,
	"booking_confirmed" boolean DEFAULT true NOT NULL,
	"booking_reminder" boolean DEFAULT true NOT NULL,
	"promotions" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_device_token" ADD CONSTRAINT "push_device_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notification_preferences" ADD CONSTRAINT "push_notification_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_user_id_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_user_created_idx" ON "notification" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "notification_user_unread_idx" ON "notification" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notification_type_idx" ON "notification" USING btree ("type");--> statement-breakpoint
CREATE INDEX "push_device_token_user_id_idx" ON "push_device_token" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "push_device_token_token_idx" ON "push_device_token" USING btree ("token");--> statement-breakpoint
CREATE INDEX "push_device_token_platform_idx" ON "push_device_token" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "push_device_token_is_active_idx" ON "push_device_token" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "push_notification_preferences_user_id_idx" ON "push_notification_preferences" USING btree ("user_id");