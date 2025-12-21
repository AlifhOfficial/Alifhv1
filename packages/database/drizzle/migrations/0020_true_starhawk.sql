CREATE TYPE "public"."partner_type" AS ENUM('dealer', 'showroom', 'multi_brand', 'rental', 'broker', 'other');--> statement-breakpoint
ALTER TABLE "partner" ALTER COLUMN "trade_license_expiry" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_request" ALTER COLUMN "brand_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_request" ALTER COLUMN "trade_license_expiry" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "vat_number" text;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "partner_type" "partner_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_request" ADD COLUMN "partner_type" "partner_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_request" ADD COLUMN "vat_number" text;