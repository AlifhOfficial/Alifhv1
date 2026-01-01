ALTER TABLE "car_listing" ADD COLUMN "ai_value_factors" jsonb;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN "ai_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "ai_estimated_price";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "ai_price_min";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "ai_price_max";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "ai_price_updated_at";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN "ai_reasoning";