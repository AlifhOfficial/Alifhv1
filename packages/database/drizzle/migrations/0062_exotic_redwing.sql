CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"plan" text NOT NULL,
	"reference_id" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"status" text DEFAULT 'incomplete' NOT NULL,
	"period_start" timestamp,
	"period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"cancel_at" timestamp,
	"canceled_at" timestamp,
	"ended_at" timestamp,
	"seats" integer,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vin_publication_history" (
	"id" text PRIMARY KEY NOT NULL,
	"vin" text NOT NULL,
	"user_id" text NOT NULL,
	"original_published_at" timestamp NOT NULL,
	"current_listing_id" text,
	"listing_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"repost_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "original_published_at" timestamp;--> statement-breakpoint
ALTER TABLE "vin_publication_history" ADD CONSTRAINT "vin_publication_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vin_publication_history" ADD CONSTRAINT "vin_publication_history_current_listing_id_car_listing_id_fk" FOREIGN KEY ("current_listing_id") REFERENCES "public"."car_listing"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscription_referenceId_idx" ON "subscription" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "subscription_stripeCustomerId_idx" ON "subscription" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "subscription_stripeSubscriptionId_idx" ON "subscription" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "subscription_status_idx" ON "subscription" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscription_plan_idx" ON "subscription" USING btree ("plan");--> statement-breakpoint
CREATE INDEX "subscription_referenceId_status_idx" ON "subscription" USING btree ("reference_id","status");--> statement-breakpoint
CREATE INDEX "vin_publication_history_vin_userId_idx" ON "vin_publication_history" USING btree ("vin","user_id");--> statement-breakpoint
CREATE INDEX "vin_publication_history_vin_idx" ON "vin_publication_history" USING btree ("vin");--> statement-breakpoint
CREATE INDEX "vin_publication_history_userId_idx" ON "vin_publication_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_stripeCustomerId_idx" ON "user" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "car_listing_public_search_originalPublishedAt_idx" ON "car_listing" USING btree ("moderation_status","lifecycle_status","needs_remoderation","original_published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "car_listing_originalPublishedAt_idx" ON "car_listing" USING btree ("original_published_at" DESC NULLS LAST);