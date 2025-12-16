DROP INDEX "user_profile_status_idx";--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "city" text;--> statement-breakpoint
CREATE INDEX "partner_city_idx" ON "partner" USING btree ("city");--> statement-breakpoint
CREATE INDEX "car_listing_city_idx" ON "car_listing" USING btree ("city");--> statement-breakpoint
ALTER TABLE "user_profile" DROP COLUMN "status";