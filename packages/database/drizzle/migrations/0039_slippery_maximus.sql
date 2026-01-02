ALTER TABLE "partner" ADD COLUMN "black_listing_quota" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "active_black_listings_count" integer DEFAULT 0 NOT NULL;