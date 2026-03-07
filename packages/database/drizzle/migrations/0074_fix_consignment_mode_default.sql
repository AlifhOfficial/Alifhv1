-- Fix consignment_mode default: should be true (opt-in by default), not false
-- The schema was updated to default(true) but the original migration had DEFAULT false

ALTER TABLE "user_profile" ALTER COLUMN "consignment_mode" SET DEFAULT true;

-- Also update existing users who have false (from the wrong default) to true
-- Only update users who never explicitly changed it (created with the wrong default)
UPDATE "user_profile" SET "consignment_mode" = true WHERE "consignment_mode" = false;
