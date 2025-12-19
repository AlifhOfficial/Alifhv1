-- Enforce canonical superlike quota at the database level
-- Sets default to 5 and normalizes existing rows (bonus back to 0)

ALTER TABLE "user_superlike_quota"
  ALTER COLUMN "max_superlikes_per_month" SET DEFAULT 5;

UPDATE "user_superlike_quota"
SET "max_superlikes_per_month" = 5
WHERE "max_superlikes_per_month" IS DISTINCT FROM 5;

UPDATE "user_superlike_quota"
SET "premium_superlikes_bonus" = 0
WHERE "premium_superlikes_bonus" IS DISTINCT FROM 0;
