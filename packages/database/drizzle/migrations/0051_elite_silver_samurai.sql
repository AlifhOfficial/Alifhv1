ALTER TABLE "partner_staff" ADD COLUMN "use_personal_phone" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_staff" ADD COLUMN "work_phone_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_staff" DROP COLUMN "work_email";