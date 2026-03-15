-- Performance: speed unresolved keyword search by using ONE trigram index
-- Instead of OR-ing ILIKE across make/model/trim, index the combined identity text.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_public_listings_identity_text_trgm"
ON "car_listing"
USING gin ((("make" || ' ' || "model" || ' ' || COALESCE("trim", ''))) extensions.gin_trgm_ops)
WHERE "moderation_status" = 'approved'
  AND "lifecycle_status" = 'active'
  AND "needs_remoderation" = false;

