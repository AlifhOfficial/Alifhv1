CREATE TYPE "public"."company_size" AS ENUM('small', 'medium', 'large', 'enterprise');--> statement-breakpoint
ALTER TABLE "partner" ALTER COLUMN "partner_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "partner_request" ALTER COLUMN "partner_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."partner_type";--> statement-breakpoint
CREATE TYPE "public"."partner_type" AS ENUM('car_dealer', 'showroom');--> statement-breakpoint
ALTER TABLE "partner" ALTER COLUMN "partner_type" SET DATA TYPE "public"."partner_type" USING "partner_type"::"public"."partner_type";--> statement-breakpoint
ALTER TABLE "partner_request" ALTER COLUMN "partner_type" SET DATA TYPE "public"."partner_type" USING "partner_type"::"public"."partner_type";--> statement-breakpoint
ALTER TABLE "partner_request" ALTER COLUMN "vat_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_request" ALTER COLUMN "trade_license_document_url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_request" ADD COLUMN "company_size" "company_size" NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_request" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "partner_request" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "partner_request" DROP COLUMN "brand_name";--> statement-breakpoint
ALTER TABLE "partner_request" DROP COLUMN "website";--> statement-breakpoint
ALTER TABLE "partner_request" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "partner_request" DROP COLUMN "emirate";--> statement-breakpoint
ALTER TABLE "partner_request" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "partner_request" DROP COLUMN "experience_years";--> statement-breakpoint
ALTER TABLE "partner_request" DROP COLUMN "specialties";