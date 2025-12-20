ALTER TABLE "partner" ADD COLUMN "active_listings_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "total_inventory_value" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "avg_listing_price" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "sold_this_month" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "revenue_this_month" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "conversion_rate" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "analytics_last_updated" timestamp;--> statement-breakpoint
ALTER TABLE "partner_staff" ADD COLUMN "is_owner" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "ai_estimated_price" integer;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "ai_price_min" integer;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "ai_price_max" integer;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "ai_confidence_score" double precision;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "ai_price_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "ai_model" text DEFAULT 'v1';--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "heat_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "heat_score_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "conversation" ADD COLUMN "initiated_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_initiated_by_user_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."favorite_type";