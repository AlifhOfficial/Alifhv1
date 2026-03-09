ALTER TABLE "partner_availability" DROP CONSTRAINT "partner_availability_partnerId_dayOfWeek_unique";--> statement-breakpoint
ALTER TABLE "partner_booking_settings" DROP CONSTRAINT "partner_booking_settings_partner_id_unique";--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "billing_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_availability" ADD COLUMN "staff_user_id" text;--> statement-breakpoint
ALTER TABLE "partner_booking_settings" ADD COLUMN "staff_user_id" text;--> statement-breakpoint
ALTER TABLE "partner_availability" ADD CONSTRAINT "partner_availability_staff_user_id_user_id_fk" FOREIGN KEY ("staff_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_booking_settings" ADD CONSTRAINT "partner_booking_settings_staff_user_id_user_id_fk" FOREIGN KEY ("staff_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "partner_availability_staffUserId_idx" ON "partner_availability" USING btree ("staff_user_id");--> statement-breakpoint
CREATE INDEX "partner_booking_settings_staffUserId_idx" ON "partner_booking_settings" USING btree ("staff_user_id");--> statement-breakpoint
ALTER TABLE "partner_availability" ADD CONSTRAINT "partner_availability_partnerId_staffUserId_dayOfWeek_unique" UNIQUE("partner_id","staff_user_id","day_of_week");--> statement-breakpoint
ALTER TABLE "partner_booking_settings" ADD CONSTRAINT "partner_booking_settings_partnerId_staffUserId_unique" UNIQUE("partner_id","staff_user_id");