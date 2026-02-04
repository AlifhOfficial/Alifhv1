ALTER TABLE "partner" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
CREATE INDEX "partner_slug_idx" ON "partner" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "partner" ADD CONSTRAINT "partner_slug_unique" UNIQUE("slug");