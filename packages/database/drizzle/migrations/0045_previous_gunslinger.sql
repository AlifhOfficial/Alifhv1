CREATE TYPE "public"."vehicle_condition" AS ENUM('new', 'used');--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "condition" "vehicle_condition" DEFAULT 'used' NOT NULL;