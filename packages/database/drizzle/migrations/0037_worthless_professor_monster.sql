ALTER TABLE "partner" ADD COLUMN "google_place_id" text;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "google_reviews_synced_at" timestamp;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "ai_reasoning" text;