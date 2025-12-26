DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_lifecycle_status') THEN
  CREATE TYPE "public"."listing_lifecycle_status" AS ENUM('active','archived','sold','expired','deleted');
 END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_moderation_status') THEN
  CREATE TYPE "public"."listing_moderation_status" AS ENUM('draft','submitted','pending_review','approved','rejected');
 END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_posted_by_role') THEN
  CREATE TYPE "public"."listing_posted_by_role" AS ENUM('user','staff');
 END IF;
END $$;--> statement-breakpoint

ALTER TABLE "car_listing" DROP CONSTRAINT IF EXISTS "car_listing_reviewed_by_user_id_fk";--> statement-breakpoint

DROP INDEX IF EXISTS "car_listing_partnerId_status_createdAt_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "car_listing_status_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "car_listing_status_createdAt_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "car_listing_status_expiresAt_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "car_listing_emirate_status_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "car_listing_openToConsignment_status_idx";--> statement-breakpoint

ALTER TABLE "car_listing" ADD COLUMN IF NOT EXISTS "posted_by_role" "public"."listing_posted_by_role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN IF NOT EXISTS "moderation_status" "public"."listing_moderation_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN IF NOT EXISTS "lifecycle_status" "public"."listing_lifecycle_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN IF NOT EXISTS "last_edited_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN IF NOT EXISTS "submitted_at" timestamp;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN IF NOT EXISTS "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN IF NOT EXISTS "last_moderated_at" timestamp;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN IF NOT EXISTS "needs_remoderation" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN IF NOT EXISTS "extension_history" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "car_listing" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;--> statement-breakpoint

DO $$ BEGIN
  -- Backfill only when legacy columns exist (fresh DBs may already be on the new shape).
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'car_listing'
      AND column_name = 'status'
  ) THEN
    -- Ensure expiry is set for existing public-ish listings.
    UPDATE "car_listing"
    SET "expires_at" = ("published_at" + interval '24 days')
    WHERE "status" IN ('published', 'reserved')
      AND "expires_at" IS NULL
      AND "published_at" IS NOT NULL;

    UPDATE "car_listing"
    SET
      "posted_by_role" = CASE WHEN "partner_id" IS NOT NULL THEN 'staff' ELSE 'user' END,
      "moderation_status" = CASE
        WHEN "status" = 'draft' THEN 'draft'
        WHEN "status" = 'pending' THEN 'pending_review'
        WHEN "status" = 'rejected' THEN 'rejected'
        WHEN "status" IN ('published','reserved','sold','expired') THEN 'approved'
        WHEN "status" = 'archived'
          THEN CASE WHEN "published_at" IS NOT NULL OR "reviewed_at" IS NOT NULL THEN 'approved' ELSE 'draft' END
        ELSE 'draft'
      END,
      "lifecycle_status" = CASE
        WHEN "status" = 'sold' THEN 'sold'
        WHEN "status" = 'expired' THEN 'expired'
        WHEN "status" IN ('archived','rejected') THEN 'archived'
        ELSE 'active'
      END,
      "submitted_at" = CASE
        WHEN "status" IN ('pending','published','reserved','sold','expired','archived','rejected')
          THEN COALESCE("published_at", "reviewed_at", "created_at")
        ELSE NULL
      END,
      "approved_at" = CASE
        WHEN "status" IN ('published','reserved','sold','expired')
          THEN COALESCE("reviewed_at", "published_at", "created_at")
        ELSE NULL
      END,
      "last_moderated_at" = CASE
        WHEN "status" IN ('pending','published','reserved','sold','expired','archived','rejected')
          THEN COALESCE("reviewed_at", "published_at", "created_at")
        ELSE NULL
      END,
      "last_edited_at" = COALESCE("updated_at", "created_at");
  END IF;
END $$;--> statement-breakpoint

ALTER TABLE "car_listing" ALTER COLUMN "posted_by_role" DROP DEFAULT;--> statement-breakpoint

ALTER TABLE "car_listing" DROP COLUMN IF EXISTS "status";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN IF EXISTS "reviewed_by";--> statement-breakpoint
ALTER TABLE "car_listing" DROP COLUMN IF EXISTS "reviewed_at";--> statement-breakpoint

DROP TYPE IF EXISTS "public"."listing_status";--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'car_listing_public_requires_expiry'
  ) THEN
    ALTER TABLE "car_listing"
    ADD CONSTRAINT "car_listing_public_requires_expiry"
    CHECK (NOT ("moderation_status" = 'approved' AND "lifecycle_status" = 'active' AND "expires_at" IS NULL));
  END IF;
END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "car_listing_partnerId_lifecycleStatus_createdAt_idx" ON "car_listing" USING btree ("partner_id","lifecycle_status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "car_listing_moderationStatus_idx" ON "car_listing" USING btree ("moderation_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "car_listing_lifecycleStatus_idx" ON "car_listing" USING btree ("lifecycle_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "car_listing_moderationStatus_lifecycleStatus_createdAt_idx" ON "car_listing" USING btree ("moderation_status","lifecycle_status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "car_listing_lifecycleStatus_expiresAt_idx" ON "car_listing" USING btree ("lifecycle_status","expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "car_listing_moderationStatus_lifecycleStatus_expiresAt_idx" ON "car_listing" USING btree ("moderation_status","lifecycle_status","expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "car_listing_emirate_lifecycleStatus_idx" ON "car_listing" USING btree ("emirate","lifecycle_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "car_listing_openToConsignment_publicish_idx" ON "car_listing" USING btree ("open_to_consignment","moderation_status","lifecycle_status");--> statement-breakpoint

CREATE OR REPLACE FUNCTION "public"."car_listing_posted_by_role_immutable_fn"()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.posted_by_role IS DISTINCT FROM OLD.posted_by_role THEN
    RAISE EXCEPTION 'posted_by_role is immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

DROP TRIGGER IF EXISTS "car_listing_posted_by_role_immutable" ON "car_listing";--> statement-breakpoint
CREATE TRIGGER "car_listing_posted_by_role_immutable"
BEFORE UPDATE ON "car_listing"
FOR EACH ROW
EXECUTE FUNCTION "public"."car_listing_posted_by_role_immutable_fn"();--> statement-breakpoint
