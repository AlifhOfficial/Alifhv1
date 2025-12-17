ALTER TABLE "user_profile" ADD COLUMN "rating" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_profile" DROP COLUMN "cars_sold";