CREATE TYPE "public"."favorite_type" AS ENUM('favorite', 'superlike');--> statement-breakpoint
CREATE TYPE "public"."body_type" AS ENUM('sedan', 'suv', 'coupe', 'convertible', 'hatchback', 'wagon', 'pickup', 'van', 'sports', 'luxury', 'other');--> statement-breakpoint
CREATE TYPE "public"."export_status" AS ENUM('local_only', 'gcc', 'international', 'restricted');--> statement-breakpoint
CREATE TYPE "public"."fuel_type" AS ENUM('petrol', 'diesel', 'electric', 'hybrid', 'plugin_hybrid', 'hydrogen');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'pending', 'published', 'reserved', 'sold', 'archived', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."seller_type" AS ENUM('dealer', 'private', 'consignment');--> statement-breakpoint
CREATE TYPE "public"."specs_type" AS ENUM('gcc', 'american', 'european', 'japanese', 'canadian', 'other');--> statement-breakpoint
CREATE TYPE "public"."steering_side" AS ENUM('left', 'right');--> statement-breakpoint
CREATE TYPE "public"."transmission_type" AS ENUM('automatic', 'manual', 'cvt', 'dct', 'semi_automatic');--> statement-breakpoint
CREATE TYPE "public"."booking_source" AS ENUM('web', 'mobile', 'call', 'walk_in');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'no_show', 'expired');--> statement-breakpoint
CREATE TYPE "public"."cancellation_reason" AS ENUM('schedule_conflict', 'found_another_car', 'price_issue', 'location_issue', 'changed_mind', 'emergency', 'other');--> statement-breakpoint
CREATE TYPE "public"."slot_status" AS ENUM('available', 'booked', 'blocked', 'past');--> statement-breakpoint
CREATE TYPE "public"."conversation_status" AS ENUM('active', 'archived', 'closed', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."conversation_type" AS ENUM('inquiry', 'negotiation', 'booking', 'consignment', 'support', 'system');--> statement-breakpoint
CREATE TYPE "public"."message_media_type" AS ENUM('image', 'audio', 'video', 'document', 'location');--> statement-breakpoint
CREATE TYPE "public"."consignment_filter_match_type" AS ENUM('exact', 'partial', 'broad');--> statement-breakpoint
CREATE TYPE "public"."consignment_lead_status" AS ENUM('new', 'viewed', 'interested', 'contacted', 'in_negotiation', 'accepted', 'rejected', 'expired', 'lost');--> statement-breakpoint
CREATE TABLE "user_superlike_quota" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"current_month_superlikes_used" integer DEFAULT 0 NOT NULL,
	"max_superlikes_per_month" integer DEFAULT 5 NOT NULL,
	"period_start_date" timestamp DEFAULT now() NOT NULL,
	"period_end_date" timestamp NOT NULL,
	"last_reset_at" timestamp DEFAULT now() NOT NULL,
	"total_superlikes_used" integer DEFAULT 0 NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"premium_superlikes_bonus" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_superlike_quota_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "car_listing" (
	"id" text PRIMARY KEY NOT NULL,
	"vin" text,
	"partner_id" text,
	"user_id" text,
	"seller_type" "seller_type" DEFAULT 'dealer' NOT NULL,
	"is_consignment" boolean DEFAULT false NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"trim" text,
	"body_type" "body_type",
	"fuel_type" "fuel_type",
	"transmission" "transmission_type",
	"specs" "specs_type" DEFAULT 'gcc' NOT NULL,
	"steering_side" "steering_side" DEFAULT 'left' NOT NULL,
	"engine_size" text,
	"engine_type" text,
	"cylinders" integer,
	"power" text,
	"torque" text,
	"fuel_economy" text,
	"doors" integer DEFAULT 4,
	"seating_capacity" integer DEFAULT 5,
	"exterior_color" text,
	"interior_color" text,
	"mileage" integer NOT NULL,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'AED' NOT NULL,
	"is_negotiable" boolean DEFAULT true NOT NULL,
	"fair_value" integer,
	"estimate_min" integer,
	"estimate_max" integer,
	"price_trend" text,
	"qi_score" double precision,
	"emirate" text NOT NULL,
	"city" text,
	"thumbnail" text,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"video_url" text,
	"description" text,
	"technical_features" jsonb DEFAULT '{}'::jsonb,
	"extras" jsonb DEFAULT '[]'::jsonb,
	"special_notes" jsonb DEFAULT '{}'::jsonb,
	"warranty" text,
	"status" "listing_status" DEFAULT 'draft' NOT NULL,
	"export_status" "export_status" DEFAULT 'local_only' NOT NULL,
	"badges" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_black_member" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"favourite_count" integer DEFAULT 0 NOT NULL,
	"superlike_count" integer DEFAULT 0 NOT NULL,
	"share_count" integer DEFAULT 0 NOT NULL,
	"inquiry_count" integer DEFAULT 0 NOT NULL,
	"booking_count" integer DEFAULT 0 NOT NULL,
	"call_count" integer DEFAULT 0 NOT NULL,
	"whatsapp_count" integer DEFAULT 0 NOT NULL,
	"lead_quality" double precision,
	"conversion_rate" double precision,
	"avg_time_to_sale" integer,
	"slug" text,
	"meta_title" text,
	"meta_description" text,
	"reserved_at" timestamp,
	"reserved_by" text,
	"sold_at" timestamp,
	"sold_to" text,
	"sold_price" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"archived_at" timestamp,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"performance_score" double precision,
	"days_on_market" integer,
	"price_changes" integer DEFAULT 0,
	"last_price_change" timestamp,
	CONSTRAINT "car_listing_vin_unique" UNIQUE("vin"),
	CONSTRAINT "car_listing_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "listing_price_history" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"old_price" integer NOT NULL,
	"new_price" integer NOT NULL,
	"change_percent" double precision,
	"reason" text,
	"changed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_view" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"user_id" text,
	"session_id" text,
	"ip_address" text,
	"user_agent" text,
	"referrer" text,
	"device_type" text,
	"time_spent" integer,
	"images_viewed" integer DEFAULT 0,
	"video_played" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"partner_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"slot_id" text NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"source" "booking_source" DEFAULT 'web' NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"scheduled_start_time" timestamp NOT NULL,
	"scheduled_end_time" timestamp NOT NULL,
	"confirmation_token" text NOT NULL,
	"verified_at" timestamp,
	"user_phone" text NOT NULL,
	"user_email" text NOT NULL,
	"user_name" text NOT NULL,
	"notes" text,
	"special_requests" text,
	"number_of_attendees" integer DEFAULT 1,
	"partner_notes" text,
	"confirmed_by" text,
	"confirmed_at" timestamp,
	"rejection_reason" text,
	"reschedule_count" integer DEFAULT 0 NOT NULL,
	"max_reschedule_allowed" integer DEFAULT 1 NOT NULL,
	"original_slot_id" text,
	"last_rescheduled_at" timestamp,
	"cancelled_at" timestamp,
	"cancelled_by" text,
	"cancellation_reason" "cancellation_reason",
	"cancellation_notes" text,
	"completed_at" timestamp,
	"check_in_time" timestamp,
	"check_out_time" timestamp,
	"no_show_reported" boolean DEFAULT false,
	"no_show_reported_at" timestamp,
	"no_show_reason" text,
	"reminders_sent" jsonb DEFAULT '{}'::jsonb,
	"feedback_requested" boolean DEFAULT false,
	"feedback_requested_at" timestamp,
	"feedback_submitted" boolean DEFAULT false,
	"feedback_submitted_at" timestamp,
	"feedback" jsonb,
	"lead_converted" boolean DEFAULT false,
	"converted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	CONSTRAINT "booking_confirmation_token_unique" UNIQUE("confirmation_token")
);
--> statement-breakpoint
CREATE TABLE "booking_slot" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"listing_id" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"duration" integer DEFAULT 30 NOT NULL,
	"status" "slot_status" DEFAULT 'available' NOT NULL,
	"max_bookings" integer DEFAULT 1 NOT NULL,
	"current_bookings" integer DEFAULT 0 NOT NULL,
	"location" text,
	"location_address" text,
	"location_notes" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_availability" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"slot_duration" integer DEFAULT 30 NOT NULL,
	"max_concurrent_bookings" integer DEFAULT 1 NOT NULL,
	"buffer_time" integer DEFAULT 15,
	"is_active" boolean DEFAULT true NOT NULL,
	"exclude_dates" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_availability_partnerId_dayOfWeek_unique" UNIQUE("partner_id","day_of_week")
);
--> statement-breakpoint
CREATE TABLE "partner_booking_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"booking_enabled" boolean DEFAULT true NOT NULL,
	"auto_confirm" boolean DEFAULT false NOT NULL,
	"confirmation_timeout_minutes" integer DEFAULT 60,
	"min_lead_time_hours" integer DEFAULT 2 NOT NULL,
	"max_lead_time_days" integer DEFAULT 30 NOT NULL,
	"allow_user_cancellation" boolean DEFAULT true NOT NULL,
	"cancellation_deadline_hours" integer DEFAULT 2,
	"allow_reschedule" boolean DEFAULT true NOT NULL,
	"max_reschedule_count" integer DEFAULT 1 NOT NULL,
	"reschedule_deadline_hours" integer DEFAULT 4,
	"send_reminders" boolean DEFAULT true NOT NULL,
	"reminder_times" jsonb DEFAULT '[24,2]'::jsonb,
	"sms_reminders" boolean DEFAULT true NOT NULL,
	"email_reminders" boolean DEFAULT true NOT NULL,
	"default_slot_duration" integer DEFAULT 30 NOT NULL,
	"buffer_between_bookings" integer DEFAULT 15,
	"preparation_instructions" text,
	"directions" text,
	"parking_instructions" text,
	"contact_person_name" text,
	"contact_person_phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_booking_settings_partner_id_unique" UNIQUE("partner_id")
);
--> statement-breakpoint
CREATE TABLE "user_booking_restriction" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"current_month_cancellations" integer DEFAULT 0 NOT NULL,
	"current_month_no_shows" integer DEFAULT 0 NOT NULL,
	"max_active_bookings" integer DEFAULT 3 NOT NULL,
	"max_cancellations_per_month" integer DEFAULT 2 NOT NULL,
	"max_no_shows_allowed" integer DEFAULT 3 NOT NULL,
	"active_bookings_count" integer DEFAULT 0 NOT NULL,
	"total_bookings" integer DEFAULT 0 NOT NULL,
	"total_completed_bookings" integer DEFAULT 0 NOT NULL,
	"total_cancellations" integer DEFAULT 0 NOT NULL,
	"total_no_shows" integer DEFAULT 0 NOT NULL,
	"reliability_score" double precision DEFAULT 100 NOT NULL,
	"is_blacklisted" boolean DEFAULT false NOT NULL,
	"blacklisted_at" timestamp,
	"blacklist_reason" text,
	"blacklisted_by" text,
	"suspended_until" timestamp,
	"last_monthly_reset" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_booking_restriction_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "conversation_type" DEFAULT 'inquiry' NOT NULL,
	"status" "conversation_status" DEFAULT 'active' NOT NULL,
	"listing_id" text,
	"partner_id" text,
	"subject" text,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"last_message_preview" text,
	"last_message_sender_id" text,
	"message_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "conversation_participant" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"last_read_at" timestamp,
	"is_muted" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"role" text DEFAULT 'member',
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_participant_conversationId_userId_unique" UNIQUE("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"text" text,
	"media_url" text,
	"media_type" "message_media_type",
	"media_thumbnail" text,
	"media_metadata" jsonb,
	"rich_content" jsonb,
	"is_system_message" boolean DEFAULT false NOT NULL,
	"system_message_type" text,
	"delivered_at" timestamp,
	"read_at" timestamp,
	"read_by" jsonb DEFAULT '[]'::jsonb,
	"is_edited" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" text,
	"reply_to_message_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_reaction" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"user_id" text NOT NULL,
	"emoji" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "message_reaction_messageId_userId_emoji_unique" UNIQUE("message_id","user_id","emoji")
);
--> statement-breakpoint
CREATE TABLE "consignment_lead" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"user_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"status" "consignment_lead_status" DEFAULT 'new' NOT NULL,
	"match_type" "consignment_filter_match_type" DEFAULT 'exact' NOT NULL,
	"match_score" integer DEFAULT 0 NOT NULL,
	"matched_criteria" jsonb DEFAULT '{}'::jsonb,
	"viewed_at" timestamp,
	"view_count" integer DEFAULT 0 NOT NULL,
	"interested_at" timestamp,
	"contacted_at" timestamp,
	"contact_method" text,
	"partner_notes" text,
	"internal_notes" text,
	"offer_amount" integer,
	"offer_terms" text,
	"offer_expires_at" timestamp,
	"user_responsed" boolean DEFAULT false NOT NULL,
	"user_interested_at" timestamp,
	"user_rejected_at" timestamp,
	"user_rejection_reason" text,
	"accepted_at" timestamp,
	"accepted_by_user_id" text,
	"deal_value" integer,
	"deal_notes" text,
	"rejected_at" timestamp,
	"rejected_by" text,
	"rejection_reason" text,
	"expires_at" timestamp,
	"lost_at" timestamp,
	"lost_to_partner_id" text,
	"is_priority" boolean DEFAULT false NOT NULL,
	"follow_up_at" timestamp,
	"follow_up_count" integer DEFAULT 0 NOT NULL,
	"time_to_contact" integer,
	"time_to_accept" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "consignment_lead_partnerId_listingId_unique" UNIQUE("partner_id","listing_id")
);
--> statement-breakpoint
CREATE TABLE "consignment_lead_activity" (
	"id" text PRIMARY KEY NOT NULL,
	"lead_id" text NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"details" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_consignment_preference" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"makes" jsonb DEFAULT '[]'::jsonb,
	"models" jsonb DEFAULT '[]'::jsonb,
	"body_types" jsonb DEFAULT '[]'::jsonb,
	"fuel_types" jsonb DEFAULT '[]'::jsonb,
	"min_year" integer,
	"max_year" integer,
	"min_price" integer,
	"max_price" integer,
	"max_mileage" integer,
	"emirates" jsonb DEFAULT '[]'::jsonb,
	"preferred_specs" jsonb DEFAULT '[]'::jsonb,
	"must_have_features" jsonb DEFAULT '[]'::jsonb,
	"only_verified_sellers" boolean DEFAULT false NOT NULL,
	"exclude_accidents" boolean DEFAULT true NOT NULL,
	"priority_score" integer DEFAULT 50 NOT NULL,
	"notify_on_new_lead" boolean DEFAULT true NOT NULL,
	"max_leads_per_day" integer DEFAULT 10,
	"total_leads_received" integer DEFAULT 0 NOT NULL,
	"total_leads_contacted" integer DEFAULT 0 NOT NULL,
	"total_leads_accepted" integer DEFAULT 0 NOT NULL,
	"conversion_rate" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_lead_received_at" timestamp,
	CONSTRAINT "partner_consignment_preference_partnerId_unique" UNIQUE("partner_id")
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'::text;--> statement-breakpoint
DROP TYPE "public"."platform_role";--> statement-breakpoint
CREATE TYPE "public"."platform_role" AS ENUM('user', 'admin', 'super_admin');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."platform_role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."platform_role" USING "role"::"public"."platform_role";--> statement-breakpoint
ALTER TABLE "user_favorite" ADD COLUMN "type" "favorite_type" DEFAULT 'favorite' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_favorite" ADD COLUMN "added_from" text;--> statement-breakpoint
ALTER TABLE "user_superlike_quota" ADD CONSTRAINT "user_superlike_quota_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_listing" ADD CONSTRAINT "car_listing_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_listing" ADD CONSTRAINT "car_listing_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_listing" ADD CONSTRAINT "car_listing_reserved_by_user_id_fk" FOREIGN KEY ("reserved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_listing" ADD CONSTRAINT "car_listing_sold_to_user_id_fk" FOREIGN KEY ("sold_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_listing" ADD CONSTRAINT "car_listing_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_price_history" ADD CONSTRAINT "listing_price_history_listing_id_car_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."car_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_price_history" ADD CONSTRAINT "listing_price_history_changed_by_user_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_view" ADD CONSTRAINT "listing_view_listing_id_car_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."car_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_view" ADD CONSTRAINT "listing_view_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_listing_id_car_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."car_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_slot_id_booking_slot_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."booking_slot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_confirmed_by_user_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_slot" ADD CONSTRAINT "booking_slot_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_slot" ADD CONSTRAINT "booking_slot_listing_id_car_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."car_listing"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_availability" ADD CONSTRAINT "partner_availability_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_booking_settings" ADD CONSTRAINT "partner_booking_settings_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_booking_restriction" ADD CONSTRAINT "user_booking_restriction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_listing_id_car_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."car_listing"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_last_message_sender_id_user_id_fk" FOREIGN KEY ("last_message_sender_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_reply_to_message_id_message_id_fk" FOREIGN KEY ("reply_to_message_id") REFERENCES "public"."message"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reaction" ADD CONSTRAINT "message_reaction_message_id_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reaction" ADD CONSTRAINT "message_reaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consignment_lead" ADD CONSTRAINT "consignment_lead_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consignment_lead" ADD CONSTRAINT "consignment_lead_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consignment_lead" ADD CONSTRAINT "consignment_lead_listing_id_car_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."car_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consignment_lead" ADD CONSTRAINT "consignment_lead_accepted_by_user_id_user_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consignment_lead" ADD CONSTRAINT "consignment_lead_lost_to_partner_id_partner_id_fk" FOREIGN KEY ("lost_to_partner_id") REFERENCES "public"."partner"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consignment_lead_activity" ADD CONSTRAINT "consignment_lead_activity_lead_id_consignment_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."consignment_lead"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consignment_lead_activity" ADD CONSTRAINT "consignment_lead_activity_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_consignment_preference" ADD CONSTRAINT "partner_consignment_preference_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_superlike_quota_userId_idx" ON "user_superlike_quota" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_superlike_quota_periodEndDate_idx" ON "user_superlike_quota" USING btree ("period_end_date");--> statement-breakpoint
CREATE INDEX "car_listing_vin_idx" ON "car_listing" USING btree ("vin");--> statement-breakpoint
CREATE INDEX "car_listing_slug_idx" ON "car_listing" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "car_listing_partnerId_idx" ON "car_listing" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "car_listing_userId_idx" ON "car_listing" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "car_listing_sellerType_idx" ON "car_listing" USING btree ("seller_type");--> statement-breakpoint
CREATE INDEX "car_listing_status_idx" ON "car_listing" USING btree ("status");--> statement-breakpoint
CREATE INDEX "car_listing_status_publishedAt_idx" ON "car_listing" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "car_listing_isFeatured_status_idx" ON "car_listing" USING btree ("is_featured","status");--> statement-breakpoint
CREATE INDEX "car_listing_make_idx" ON "car_listing" USING btree ("make");--> statement-breakpoint
CREATE INDEX "car_listing_model_idx" ON "car_listing" USING btree ("model");--> statement-breakpoint
CREATE INDEX "car_listing_year_idx" ON "car_listing" USING btree ("year");--> statement-breakpoint
CREATE INDEX "car_listing_make_model_year_idx" ON "car_listing" USING btree ("make","model","year");--> statement-breakpoint
CREATE INDEX "car_listing_bodyType_idx" ON "car_listing" USING btree ("body_type");--> statement-breakpoint
CREATE INDEX "car_listing_fuelType_idx" ON "car_listing" USING btree ("fuel_type");--> statement-breakpoint
CREATE INDEX "car_listing_transmission_idx" ON "car_listing" USING btree ("transmission");--> statement-breakpoint
CREATE INDEX "car_listing_emirate_idx" ON "car_listing" USING btree ("emirate");--> statement-breakpoint
CREATE INDEX "car_listing_emirate_status_idx" ON "car_listing" USING btree ("emirate","status");--> statement-breakpoint
CREATE INDEX "car_listing_price_idx" ON "car_listing" USING btree ("price");--> statement-breakpoint
CREATE INDEX "car_listing_qiScore_idx" ON "car_listing" USING btree ("qi_score");--> statement-breakpoint
CREATE INDEX "car_listing_createdAt_idx" ON "car_listing" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "car_listing_publishedAt_idx" ON "car_listing" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "car_listing_reservedBy_idx" ON "car_listing" USING btree ("reserved_by");--> statement-breakpoint
CREATE INDEX "car_listing_soldTo_idx" ON "car_listing" USING btree ("sold_to");--> statement-breakpoint
CREATE INDEX "car_listing_reviewedBy_idx" ON "car_listing" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "listing_price_history_listingId_idx" ON "listing_price_history" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listing_price_history_createdAt_idx" ON "listing_price_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "listing_view_listingId_idx" ON "listing_view" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listing_view_userId_idx" ON "listing_view" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "listing_view_createdAt_idx" ON "listing_view" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "listing_view_sessionId_idx" ON "listing_view" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "booking_userId_idx" ON "booking" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "booking_partnerId_idx" ON "booking" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "booking_listingId_idx" ON "booking" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "booking_slotId_idx" ON "booking" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX "booking_status_idx" ON "booking" USING btree ("status");--> statement-breakpoint
CREATE INDEX "booking_scheduledStartTime_idx" ON "booking" USING btree ("scheduled_start_time");--> statement-breakpoint
CREATE INDEX "booking_status_scheduledStartTime_idx" ON "booking" USING btree ("status","scheduled_start_time");--> statement-breakpoint
CREATE INDEX "booking_partnerId_status_idx" ON "booking" USING btree ("partner_id","status");--> statement-breakpoint
CREATE INDEX "booking_partnerId_scheduledDate_idx" ON "booking" USING btree ("partner_id","scheduled_date");--> statement-breakpoint
CREATE INDEX "booking_userId_status_idx" ON "booking" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "booking_userId_createdAt_idx" ON "booking" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "booking_confirmationToken_idx" ON "booking" USING btree ("confirmation_token");--> statement-breakpoint
CREATE INDEX "booking_confirmedBy_idx" ON "booking" USING btree ("confirmed_by");--> statement-breakpoint
CREATE INDEX "booking_slot_partnerId_idx" ON "booking_slot" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "booking_slot_listingId_idx" ON "booking_slot" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "booking_slot_status_idx" ON "booking_slot" USING btree ("status");--> statement-breakpoint
CREATE INDEX "booking_slot_startTime_idx" ON "booking_slot" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "booking_slot_partnerId_status_startTime_idx" ON "booking_slot" USING btree ("partner_id","status","start_time");--> statement-breakpoint
CREATE INDEX "partner_availability_partnerId_idx" ON "partner_availability" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "partner_availability_dayOfWeek_idx" ON "partner_availability" USING btree ("day_of_week");--> statement-breakpoint
CREATE INDEX "partner_availability_isActive_idx" ON "partner_availability" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "partner_booking_settings_partnerId_idx" ON "partner_booking_settings" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "partner_booking_settings_bookingEnabled_idx" ON "partner_booking_settings" USING btree ("booking_enabled");--> statement-breakpoint
CREATE INDEX "user_booking_restriction_userId_idx" ON "user_booking_restriction" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_booking_restriction_isBlacklisted_idx" ON "user_booking_restriction" USING btree ("is_blacklisted");--> statement-breakpoint
CREATE INDEX "user_booking_restriction_reliabilityScore_idx" ON "user_booking_restriction" USING btree ("reliability_score");--> statement-breakpoint
CREATE INDEX "conversation_lastMessageAt_idx" ON "conversation" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "conversation_listingId_idx" ON "conversation" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "conversation_partnerId_idx" ON "conversation" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "conversation_status_idx" ON "conversation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "conversation_type_idx" ON "conversation" USING btree ("type");--> statement-breakpoint
CREATE INDEX "conversation_lastMessageSenderId_idx" ON "conversation" USING btree ("last_message_sender_id");--> statement-breakpoint
CREATE INDEX "conversation_participant_conversationId_idx" ON "conversation_participant" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "conversation_participant_userId_idx" ON "conversation_participant" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "conversation_participant_unreadCount_idx" ON "conversation_participant" USING btree ("unread_count");--> statement-breakpoint
CREATE INDEX "conversation_participant_userId_unreadCount_idx" ON "conversation_participant" USING btree ("user_id","unread_count");--> statement-breakpoint
CREATE INDEX "conversation_participant_isArchived_idx" ON "conversation_participant" USING btree ("is_archived");--> statement-breakpoint
CREATE INDEX "message_conversationId_idx" ON "message" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "message_senderId_idx" ON "message" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "message_conversationId_createdAt_idx" ON "message" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "message_readAt_idx" ON "message" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "message_isSystemMessage_idx" ON "message" USING btree ("is_system_message");--> statement-breakpoint
CREATE INDEX "message_replyToMessageId_idx" ON "message" USING btree ("reply_to_message_id");--> statement-breakpoint
CREATE INDEX "message_isDeleted_idx" ON "message" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "message_reaction_messageId_idx" ON "message_reaction" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "message_reaction_userId_idx" ON "message_reaction" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "consignment_lead_partnerId_idx" ON "consignment_lead" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "consignment_lead_userId_idx" ON "consignment_lead" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "consignment_lead_listingId_idx" ON "consignment_lead" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "consignment_lead_status_idx" ON "consignment_lead" USING btree ("status");--> statement-breakpoint
CREATE INDEX "consignment_lead_partnerId_status_idx" ON "consignment_lead" USING btree ("partner_id","status");--> statement-breakpoint
CREATE INDEX "consignment_lead_partnerId_createdAt_idx" ON "consignment_lead" USING btree ("partner_id","created_at");--> statement-breakpoint
CREATE INDEX "consignment_lead_matchScore_idx" ON "consignment_lead" USING btree ("match_score");--> statement-breakpoint
CREATE INDEX "consignment_lead_isPriority_idx" ON "consignment_lead" USING btree ("is_priority");--> statement-breakpoint
CREATE INDEX "consignment_lead_viewedAt_idx" ON "consignment_lead" USING btree ("viewed_at");--> statement-breakpoint
CREATE INDEX "consignment_lead_contactedAt_idx" ON "consignment_lead" USING btree ("contacted_at");--> statement-breakpoint
CREATE INDEX "consignment_lead_followUpAt_idx" ON "consignment_lead" USING btree ("follow_up_at");--> statement-breakpoint
CREATE INDEX "consignment_lead_activity_leadId_idx" ON "consignment_lead_activity" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "consignment_lead_activity_userId_idx" ON "consignment_lead_activity" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "consignment_lead_activity_action_idx" ON "consignment_lead_activity" USING btree ("action");--> statement-breakpoint
CREATE INDEX "consignment_lead_activity_createdAt_idx" ON "consignment_lead_activity" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "partner_consignment_preference_partnerId_idx" ON "partner_consignment_preference" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "partner_consignment_preference_isEnabled_idx" ON "partner_consignment_preference" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "user_favorite_type_idx" ON "user_favorite" USING btree ("type");--> statement-breakpoint
CREATE INDEX "user_favorite_userId_type_idx" ON "user_favorite" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "user_favorite_createdAt_idx" ON "user_favorite" USING btree ("created_at");