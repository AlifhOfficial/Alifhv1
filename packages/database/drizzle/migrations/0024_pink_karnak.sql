ALTER TABLE "partner_staff" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "partner_staff" ADD COLUMN "work_email" text;--> statement-breakpoint
ALTER TABLE "partner_staff" ADD COLUMN "work_phone" text;--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "commission_rate";