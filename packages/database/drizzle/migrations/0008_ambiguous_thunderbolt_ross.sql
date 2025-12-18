ALTER TABLE "car_listing" ADD COLUMN "posted_by_staff_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "user_favorite_userId_listingId_unique" ON "user_favorite" USING btree ("user_id","listing_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_superlike_userId_listingId_unique" ON "user_superlike" USING btree ("user_id","listing_id");--> statement-breakpoint
CREATE INDEX "car_listing_postedByStaffId_idx" ON "car_listing" USING btree ("posted_by_staff_id");