DROP INDEX "consignment_funnel_partnerId_position_idx";--> statement-breakpoint
ALTER TABLE "consignment_funnel" ADD COLUMN "staff_id" text NOT NULL;--> statement-breakpoint
CREATE INDEX "consignment_funnel_staffId_idx" ON "consignment_funnel" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "consignment_funnel_partnerId_staffId_idx" ON "consignment_funnel" USING btree ("partner_id","staff_id");