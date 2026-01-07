-- Personal listings optimization index
-- Covers: WHERE userId = ? AND partnerId IS NULL (personal listings filter)
-- Includes sort columns for ORDER BY published_at DESC NULLS LAST, created_at DESC

-- ⚡ PARTIAL INDEX: Only indexes rows where partner_id IS NULL (user's personal listings)
-- Much smaller and faster than full table index for this common query pattern
CREATE INDEX CONCURRENTLY IF NOT EXISTS "car_listing_userId_personal_idx" 
ON "car_listing" ("user_id", "published_at" DESC NULLS LAST, "created_at" DESC)
WHERE "partner_id" IS NULL;

-- Also create a covering index for the stats query pattern
-- Covers: SELECT count(*) ... WHERE userId = ? AND partnerId IS NULL
CREATE INDEX CONCURRENTLY IF NOT EXISTS "car_listing_userId_personal_stats_idx"
ON "car_listing" ("user_id", "lifecycle_status", "moderation_status")
WHERE "partner_id" IS NULL;
