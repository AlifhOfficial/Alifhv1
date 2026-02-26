CREATE TYPE "public"."vin_visibility" AS ENUM('public', 'private');--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "vin_visibility" "vin_visibility" DEFAULT 'public' NOT NULL;