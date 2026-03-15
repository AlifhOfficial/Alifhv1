CREATE INDEX CONCURRENTLY IF NOT EXISTS "partner_request_partnerId_idx" ON "partner_request" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "car_listing_reservedBy_idx" ON "car_listing" USING btree ("reserved_by");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "car_listing_soldTo_idx" ON "car_listing" USING btree ("sold_to");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "listing_price_history_changedBy_idx" ON "listing_price_history" USING btree ("changed_by");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "vin_publication_history_currentListingId_idx" ON "vin_publication_history" USING btree ("current_listing_id");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "conversation_initiatedBy_idx" ON "conversation" USING btree ("initiated_by");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "conversation_lastMessageSenderId_idx" ON "conversation" USING btree ("last_message_sender_id");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "ban_appeal_reviewedBy_idx" ON "ban_appeal" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "feedback_reviewedBy_idx" ON "feedback" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "communications_assignedTo_idx" ON "communications" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "communications_resolvedBy_idx" ON "communications" USING btree ("resolved_by");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "notification_actorId_idx" ON "notification" USING btree ("actor_id");
