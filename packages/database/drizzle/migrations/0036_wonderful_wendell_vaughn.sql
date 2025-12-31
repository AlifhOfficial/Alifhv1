ALTER TYPE "public"."specs_type" ADD VALUE 'chinese' BEFORE 'canadian';--> statement-breakpoint
ALTER TYPE "public"."specs_type" ADD VALUE 'korean' BEFORE 'canadian';--> statement-breakpoint
ALTER TABLE "car_listing" ALTER COLUMN "engine_size" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."engine_size";--> statement-breakpoint
CREATE TYPE "public"."engine_size" AS ENUM('under_1.5L', '1.5L_2.0L', '2.0L_2.5L', '2.5L_3.0L', '3.0L_4.0L', '4.0L_5.0L', '5.0L_6.0L', 'over_6.0L', 'electric');--> statement-breakpoint
ALTER TABLE "car_listing" ALTER COLUMN "engine_size" SET DATA TYPE "public"."engine_size" USING "engine_size"::"public"."engine_size";--> statement-breakpoint
ALTER TABLE "car_listing" ALTER COLUMN "seller_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "car_listing" ALTER COLUMN "seller_type" SET DEFAULT 'private'::text;--> statement-breakpoint
DROP TYPE "public"."seller_type";--> statement-breakpoint
CREATE TYPE "public"."seller_type" AS ENUM('dealer', 'private');--> statement-breakpoint
ALTER TABLE "car_listing" ALTER COLUMN "seller_type" SET DEFAULT 'private'::"public"."seller_type";--> statement-breakpoint
ALTER TABLE "car_listing" ALTER COLUMN "seller_type" SET DATA TYPE "public"."seller_type" USING "seller_type"::"public"."seller_type";