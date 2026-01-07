CREATE INDEX "partner_staff_userId_partnerId_status_idx" ON "partner_staff" USING btree ("user_id","partner_id","status");--> statement-breakpoint
CREATE INDEX "car_listing_partnerId_userId_idx" ON "car_listing" USING btree ("partner_id","user_id");--> statement-breakpoint
CREATE INDEX "car_listing_partnerId_userId_publishedAt_idx" ON "car_listing" USING btree ("partner_id","user_id","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "car_listing_partnerId_userId_lifecycleStatus_idx" ON "car_listing" USING btree ("partner_id","user_id","lifecycle_status");--> statement-breakpoint
CREATE INDEX "car_listing_userId_partnerId_not_null_idx" ON "car_listing" USING btree ("user_id","partner_id");--> statement-breakpoint
CREATE INDEX "car_listing_partnerId_publishedAt_createdAt_idx" ON "car_listing" USING btree ("partner_id","published_at" DESC NULLS LAST,"created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "car_listing_userId_publishedAt_createdAt_idx" ON "car_listing" USING btree ("user_id","published_at" DESC NULLS LAST,"created_at" DESC NULLS LAST);