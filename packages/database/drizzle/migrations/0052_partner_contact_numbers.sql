-- Partner contact numbers for fallback when staff doesn't respond
-- Admin phone requires verification, toll number does not

ALTER TABLE "partner" ADD COLUMN "admin_phone" text;
ALTER TABLE "partner" ADD COLUMN "admin_phone_verified" boolean DEFAULT false NOT NULL;
ALTER TABLE "partner" ADD COLUMN "admin_name" text;
ALTER TABLE "partner" ADD COLUMN "toll_number" text;

-- Index for looking up by admin phone
CREATE INDEX "partner_admin_phone_idx" ON "partner" ("admin_phone");
