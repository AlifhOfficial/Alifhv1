ALTER TABLE "subscription" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "subscription" CASCADE;--> statement-breakpoint
ALTER TABLE "partner" ALTER COLUMN "tier" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "partner" ALTER COLUMN "tier" SET DEFAULT 'flow'::text;--> statement-breakpoint
DROP TYPE "public"."partner_tier";--> statement-breakpoint
CREATE TYPE "public"."partner_tier" AS ENUM('flow', 'black');--> statement-breakpoint
ALTER TABLE "partner" ALTER COLUMN "tier" SET DEFAULT 'flow'::"public"."partner_tier";--> statement-breakpoint
ALTER TABLE "partner" ALTER COLUMN "tier" SET DATA TYPE "public"."partner_tier" USING "tier"::"public"."partner_tier";--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
CREATE INDEX "partner_stripeCustomerId_idx" ON "partner" USING btree ("stripe_customer_id");--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "subscription_tier";--> statement-breakpoint
ALTER TABLE "partner" DROP COLUMN "subscription_expires_at";