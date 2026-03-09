CREATE INDEX "booking_scheduledDate_idx" ON "booking" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "booking_partnerId_scheduledDate_status_idx" ON "booking" USING btree ("partner_id","scheduled_date","status");--> statement-breakpoint
CREATE INDEX "booking_userId_listingId_status_idx" ON "booking" USING btree ("user_id","listing_id","status");--> statement-breakpoint
CREATE INDEX "booking_userId_status_startEnd_idx" ON "booking" USING btree ("user_id","status","scheduled_start_time","scheduled_end_time");--> statement-breakpoint
CREATE INDEX "booking_userId_cancelledBy_cancelledAt_idx" ON "booking" USING btree ("user_id","cancelled_by","cancelled_at");