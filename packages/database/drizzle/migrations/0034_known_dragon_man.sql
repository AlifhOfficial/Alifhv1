ALTER TYPE "public"."staff_role" ADD VALUE 'staff';--> statement-breakpoint
ALTER TABLE "conversation" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "conversation" ALTER COLUMN "type" SET DEFAULT 'inquiry'::text;--> statement-breakpoint
DROP TYPE "public"."conversation_type";--> statement-breakpoint
CREATE TYPE "public"."conversation_type" AS ENUM('inquiry');--> statement-breakpoint
ALTER TABLE "conversation" ALTER COLUMN "type" SET DEFAULT 'inquiry'::"public"."conversation_type";--> statement-breakpoint
ALTER TABLE "conversation" ALTER COLUMN "type" SET DATA TYPE "public"."conversation_type" USING "type"::"public"."conversation_type";--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;