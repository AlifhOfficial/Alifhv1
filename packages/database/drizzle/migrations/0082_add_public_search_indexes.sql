-- Performance: make common public-search patterns index-friendly
-- 1) Newest/oldest sort uses COALESCE(original_published_at, published_at)
-- 2) Tags/extras filters use jsonb existence operators (?|, ?&) and benefit from GIN

-- Matches ORDER BY COALESCE(original_published_at, published_at) <dir>, created_at <dir>
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_public_listings_sort_date"
ON "car_listing" ((COALESCE("original_published_at", "published_at")) DESC, "created_at" DESC)
WHERE "moderation_status" = 'approved'
  AND "lifecycle_status" = 'active'
  AND "needs_remoderation" = false;--> statement-breakpoint

-- Speeds: tags ?| array[...] (any of these tags)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_public_listings_tags_gin"
ON "car_listing" USING gin ("tags")
WHERE "moderation_status" = 'approved'
  AND "lifecycle_status" = 'active'
  AND "needs_remoderation" = false;--> statement-breakpoint

-- Speeds: extras ?& array[...] (all of these extras)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_public_listings_extras_gin"
ON "car_listing" USING gin ("extras")
WHERE "moderation_status" = 'approved'
  AND "lifecycle_status" = 'active'
  AND "needs_remoderation" = false;

