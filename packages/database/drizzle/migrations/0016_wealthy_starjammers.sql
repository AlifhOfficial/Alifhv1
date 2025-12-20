ALTER TABLE "car_listing" ALTER COLUMN "doors" SET DEFAULT '4'::"public"."doors";--> statement-breakpoint
ALTER TABLE "car_listing" ALTER COLUMN "doors" SET DATA TYPE "public"."doors" USING "doors"::"public"."doors";--> statement-breakpoint
ALTER TABLE "car_listing" ALTER COLUMN "seating_capacity" SET DEFAULT '5'::"public"."seating_capacity";--> statement-breakpoint
ALTER TABLE "car_listing" ALTER COLUMN "seating_capacity" SET DATA TYPE "public"."seating_capacity" USING "seating_capacity"::"public"."seating_capacity";--> statement-breakpoint
ALTER TABLE "car_listing" ALTER COLUMN "exterior_color" SET DATA TYPE "public"."exterior_color" USING "exterior_color"::"public"."exterior_color";--> statement-breakpoint
ALTER TABLE "car_listing" ALTER COLUMN "interior_color" SET DATA TYPE "public"."interior_color" USING "interior_color"::"public"."interior_color";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "power";