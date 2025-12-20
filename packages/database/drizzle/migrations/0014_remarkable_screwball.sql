ALTER TABLE "user_booking_restriction" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "message_reaction" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "consignment_lead_activity" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_booking_restriction" CASCADE;--> statement-breakpoint
DROP TABLE "message_reaction" CASCADE;--> statement-breakpoint
DROP TABLE "consignment_lead_activity" CASCADE;--> statement-breakpoint
ALTER TABLE "message" DROP CONSTRAINT "message_reply_to_message_id_message_id_fk";
--> statement-breakpoint
DROP INDEX "user_favorite_userId_idx";--> statement-breakpoint
DROP INDEX "user_favorite_userId_listingId_idx";--> statement-breakpoint
DROP INDEX "user_favorite_createdAt_idx";--> statement-breakpoint
DROP INDEX "user_superlike_userId_idx";--> statement-breakpoint
DROP INDEX "user_superlike_userId_listingId_idx";--> statement-breakpoint
DROP INDEX "user_superlike_createdAt_idx";--> statement-breakpoint
DROP INDEX "car_listing_postedByStaffId_idx";--> statement-breakpoint
DROP INDEX "car_listing_sellerType_idx";--> statement-breakpoint
DROP INDEX "car_listing_status_publishedAt_idx";--> statement-breakpoint
DROP INDEX "car_listing_isFeatured_status_idx";--> statement-breakpoint
DROP INDEX "car_listing_city_idx";--> statement-breakpoint
DROP INDEX "car_listing_qiScore_idx";--> statement-breakpoint
DROP INDEX "car_listing_createdAt_idx";--> statement-breakpoint
DROP INDEX "car_listing_publishedAt_idx";--> statement-breakpoint
DROP INDEX "car_listing_reservedBy_idx";--> statement-breakpoint
DROP INDEX "car_listing_soldTo_idx";--> statement-breakpoint
DROP INDEX "car_listing_reviewedBy_idx";--> statement-breakpoint
DROP INDEX "conversation_status_idx";--> statement-breakpoint
DROP INDEX "conversation_type_idx";--> statement-breakpoint
DROP INDEX "conversation_lastMessageSenderId_idx";--> statement-breakpoint
DROP INDEX "conversation_participant_unreadCount_idx";--> statement-breakpoint
DROP INDEX "conversation_participant_isArchived_idx";--> statement-breakpoint
DROP INDEX "message_readAt_idx";--> statement-breakpoint
DROP INDEX "message_isSystemMessage_idx";--> statement-breakpoint
DROP INDEX "message_replyToMessageId_idx";--> statement-breakpoint
DROP INDEX "message_isDeleted_idx";--> statement-breakpoint
DROP INDEX "consignment_lead_matchScore_idx";--> statement-breakpoint
ALTER TABLE "user_superlike_quota" ALTER COLUMN "max_superlikes_per_month" SET DEFAULT 5;--> statement-breakpoint
ALTER TABLE "partner_staff" ADD COLUMN "invitedBy" text;--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "total_inventory";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "active_listings";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "sold_listings";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "total_sales";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "total_revenue";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "avg_response_time";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "response_rate";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "lead_conversion_rate";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "repeat_customer_rate";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "avg_deal_value";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "monthly_views";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "monthly_leads";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "monthly_sales";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "monthly_revenue";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "team_size";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "active_staff_count";--> statement-breakpoint
ALTER TABLE "partner_staff" DROP COLUMN "permissions";--> statement-breakpoint
ALTER TABLE "partner_staff" DROP COLUMN "leads_handled";--> statement-breakpoint
ALTER TABLE "partner_staff" DROP COLUMN "leads_converted";--> statement-breakpoint
ALTER TABLE "partner_staff" DROP COLUMN "deals_closed";--> statement-breakpoint
ALTER TABLE "partner_staff" DROP COLUMN "total_sales_value";--> statement-breakpoint
ALTER TABLE "partner_staff" DROP COLUMN "avg_response_time";--> statement-breakpoint
ALTER TABLE "partner_staff" DROP COLUMN "last_active_at";--> statement-breakpoint
ALTER TABLE "partner_staff" DROP COLUMN "performance_score";--> statement-breakpoint
ALTER TABLE "partner_staff" DROP COLUMN "customer_rating";--> statement-breakpoint
ALTER TABLE "partner_staff" DROP COLUMN "invited_by";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "share_count";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "inquiry_count";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "booking_count";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "call_count";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "whatsapp_count";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "lead_quality";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "conversion_rate";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "avg_time_to_sale";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "performance_score";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "days_on_market";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "price_changes";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "last_price_change";--> statement-breakpoint
ALTER TABLE "message" DROP COLUMN "rich_content";--> statement-breakpoint
ALTER TABLE "message" DROP COLUMN "read_by";--> statement-breakpoint
ALTER TABLE "message" DROP COLUMN "reply_to_message_id";--> statement-breakpoint
ALTER TABLE "consignment_lead" DROP COLUMN "match_type";--> statement-breakpoint
ALTER TABLE "consignment_lead" DROP COLUMN "match_score";--> statement-breakpoint
ALTER TABLE "consignment_lead" DROP COLUMN "matched_criteria";--> statement-breakpoint
ALTER TABLE "consignment_lead" DROP COLUMN "time_to_contact";--> statement-breakpoint
ALTER TABLE "consignment_lead" DROP COLUMN "time_to_accept";--> statement-breakpoint
DROP TYPE "public"."consignment_filter_match_type";