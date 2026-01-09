ALTER TABLE "user" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone_number_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "phone_verified";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "phone_verified_at";