ALTER TYPE "public"."listing_status" ADD VALUE 'expired' BEFORE 'archived';--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "extension_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "last_extended_at" timestamp;--> statement-breakpoint
UPDATE "car_listing"
SET "expires_at" = ("published_at" + interval '24 days')
WHERE "status" = 'published' AND "expires_at" IS NULL AND "published_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "car_listing_status_expiresAt_idx" ON "car_listing" USING btree ("status","expires_at");
