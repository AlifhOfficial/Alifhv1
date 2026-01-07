DROP INDEX "conversation_participant_userId_idx";--> statement-breakpoint
DROP INDEX "message_conversationId_idx";--> statement-breakpoint
DROP INDEX "message_conversationId_createdAt_idx";--> statement-breakpoint
CREATE INDEX "conversation_participant_userId_isArchived_idx" ON "conversation_participant" USING btree ("user_id","is_archived");--> statement-breakpoint
CREATE INDEX "message_conversationId_createdAt_isDeleted_idx" ON "message" USING btree ("conversation_id","created_at","is_deleted");