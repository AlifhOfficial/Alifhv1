ALTER TABLE "partner_availability" DROP CONSTRAINT "partner_availability_partnerId_dayOfWeek_unique";--> statement-breakpoint
ALTER TABLE "partner_booking_settings" DROP CONSTRAINT "partner_booking_settings_partner_id_unique";--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "billing_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_availability" ADD COLUMN "staff_user_id" text;--> statement-breakpoint
ALTER TABLE "partner_booking_settings" ADD COLUMN "staff_user_id" text;--> statement-breakpoint
ALTER TABLE "partner_availability" ADD CONSTRAINT "partner_availability_staff_user_id_user_id_fk" FOREIGN KEY ("staff_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_booking_settings" ADD CONSTRAINT "partner_booking_settings_staff_user_id_user_id_fk" FOREIGN KEY ("staff_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "partner_availability_staffUserId_idx" ON "partner_availability" USING btree ("staff_user_id");--> statement-breakpoint
CREATE INDEX "partner_booking_settings_staffUserId_idx" ON "partner_booking_settings" USING btree ("staff_user_id");--> statement-breakpoint
DELETE FROM "partner_availability" a
USING "partner_availability" b
WHERE a.id < b.id
  AND a.partner_id = b.partner_id
  AND a.day_of_week = b.day_of_week
  AND (
    (a.staff_user_id IS NULL AND b.staff_user_id IS NULL)
    OR a.staff_user_id = b.staff_user_id
  );--> statement-breakpoint
DELETE FROM "partner_booking_settings" a
USING "partner_booking_settings" b
WHERE a.id < b.id
  AND a.partner_id = b.partner_id
  AND (
    (a.staff_user_id IS NULL AND b.staff_user_id IS NULL)
    OR a.staff_user_id = b.staff_user_id
  );--> statement-breakpoint
CREATE UNIQUE INDEX "partner_availability_partnerId_dayOfWeek_default_unique" ON "partner_availability" USING btree ("partner_id","day_of_week") WHERE "staff_user_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "partner_availability_partnerId_staffUserId_dayOfWeek_unique" ON "partner_availability" USING btree ("partner_id","staff_user_id","day_of_week") WHERE "staff_user_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "partner_booking_settings_partnerId_default_unique" ON "partner_booking_settings" USING btree ("partner_id") WHERE "staff_user_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "partner_booking_settings_partnerId_staffUserId_unique" ON "partner_booking_settings" USING btree ("partner_id","staff_user_id") WHERE "staff_user_id" IS NOT NULL;
