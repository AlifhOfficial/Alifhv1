CREATE TYPE "public"."doors" AS ENUM('2', '3', '4', '5', '6');--> statement-breakpoint
CREATE TYPE "public"."engine_size" AS ENUM('1.0L', '1.2L', '1.4L', '1.5L', '1.6L', '1.8L', '2.0L', '2.5L', '3.0L', '3.5L', '4.0L', '5.0L', '6.0L', 'other');--> statement-breakpoint
CREATE TYPE "public"."engine_type" AS ENUM('inline-3', 'inline-4', 'inline-6', 'v6', 'v8', 'v10', 'v12', 'w12', 'electric', 'hybrid', 'other');--> statement-breakpoint
CREATE TYPE "public"."exterior_color" AS ENUM('white', 'black', 'silver', 'grey', 'blue', 'red', 'green', 'brown', 'beige', 'gold', 'orange', 'yellow', 'purple', 'other');--> statement-breakpoint
CREATE TYPE "public"."interior_color" AS ENUM('black', 'beige', 'brown', 'tan', 'grey', 'white', 'red', 'burgundy', 'other');--> statement-breakpoint
CREATE TYPE "public"."power_range" AS ENUM('under_100', '100_200', '200_300', '300_400', '400_500', '500_600', '600_700', '700_plus', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."seating_capacity" AS ENUM('2', '4', '5', '6', '7', '8', '9_plus');--> statement-breakpoint
CREATE TYPE "public"."warranty_type" AS ENUM('none', 'manufacturer', 'extended', 'dealer', 'other');--> statement-breakpoint
ALTER TABLE "car_listing" ALTER COLUMN "engine_size" SET DATA TYPE "public"."engine_size" USING "engine_size"::"public"."engine_size";--> statement-breakpoint
ALTER TABLE "car_listing" ALTER COLUMN "engine_type" SET DATA TYPE "public"."engine_type" USING "engine_type"::"public"."engine_type";--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "power_range" "power_range";--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "warranty_type" "warranty_type";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "warranty";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "is_featured";