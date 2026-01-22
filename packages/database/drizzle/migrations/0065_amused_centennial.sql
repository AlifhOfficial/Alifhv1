ALTER TABLE "partner_showroom" ALTER COLUMN "hero_cta_text" SET DEFAULT 'Talk to Us';--> statement-breakpoint
ALTER TABLE "partner_showroom" ALTER COLUMN "hero_cta_secondary_text" SET DEFAULT 'Browse Collection';--> statement-breakpoint
ALTER TABLE "partner_showroom" ADD COLUMN "hero_cta_link" text;--> statement-breakpoint
ALTER TABLE "partner_showroom" ADD COLUMN "hero_cta_secondary_link" text;