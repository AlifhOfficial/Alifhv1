CREATE INDEX "car_listing_moderationStatus_lifecycleStatus_updatedAt_idx" ON "car_listing" USING btree ("moderation_status","lifecycle_status","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "car_listing_partnerId_moderationStatus_lifecycleStatus_idx" ON "car_listing" USING btree ("partner_id","moderation_status","lifecycle_status");--> statement-breakpoint
CREATE INDEX "car_listing_updatedAt_idx" ON "car_listing" USING btree ("updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "car_listing_createdAt_idx" ON "car_listing" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "car_listing_publishedAt_idx" ON "car_listing" USING btree ("published_at" DESC NULLS LAST);