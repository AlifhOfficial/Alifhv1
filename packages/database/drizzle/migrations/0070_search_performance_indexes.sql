-- Search Performance Indexes
-- Optimizes the faceted search which runs 13-16 queries per request
-- 
-- Strategy: Partial indexes on "public active listings" base conditions
-- to eliminate non-public rows from every search/facet/count scan.
--
-- Base condition: moderation_status='approved' AND lifecycle_status='active' AND needs_remoderation=false
-- The expires_at > NOW() check is dynamic, so we include expires_at as a column
-- in the index for range filtering, but NOT in the partial WHERE clause.

-- ============================================================
-- 1. PARTIAL INDEX: Public listings for ID query + relevance sort
--    Covers: SELECT id FROM car_listing WHERE <public> ORDER BY ... LIMIT 31
--    Includes expires_at for the > NOW() range filter
-- ============================================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_listings_id_expires
ON car_listing (expires_at, id)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- ============================================================
-- 2. PARTIAL INDEX: Newest sort (most common non-relevance sort)
--    Covers: ORDER BY COALESCE(original_published_at, published_at) DESC
-- ============================================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_listings_newest
ON car_listing (original_published_at DESC NULLS LAST, published_at DESC NULLS LAST, created_at DESC)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- ============================================================
-- 3. PARTIAL INDEX: Price sort
-- ============================================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_listings_price_asc
ON car_listing (price ASC, created_at DESC)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_listings_price_desc
ON car_listing (price DESC, created_at DESC)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- ============================================================
-- 4. FACET INDEXES: Each facet GROUP BY column within public listings
--    Covers: SELECT <col>, count(*) FROM car_listing WHERE <public + filters> GROUP BY <col>
--    Including expires_at for the range filter
-- ============================================================

-- Make facet (most used filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_facet_make
ON car_listing (make, expires_at)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- Model facet
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_facet_model
ON car_listing (model, expires_at)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- Trim facet
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_facet_trim
ON car_listing (trim, expires_at)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- Emirate facet
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_facet_emirate
ON car_listing (emirate, expires_at)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- Specs facet (missing from schema)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_facet_specs
ON car_listing (specs, expires_at)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- Body type facet
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_facet_body_type
ON car_listing (body_type, expires_at)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- Fuel type facet
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_facet_fuel_type
ON car_listing (fuel_type, expires_at)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- Transmission facet
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_facet_transmission
ON car_listing (transmission, expires_at)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- Engine size facet (missing from schema)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_facet_engine_size
ON car_listing (engine_size, expires_at)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- Exterior color facet (missing from schema)  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_facet_exterior_color
ON car_listing (exterior_color, expires_at)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- Interior color facet (missing from schema)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_facet_interior_color
ON car_listing (interior_color, expires_at)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- Seller type facet (missing from schema)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_facet_seller_type
ON car_listing (seller_type, expires_at)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- ============================================================
-- 5. RANGE FACET INDEX: min/max aggregates for year, price, mileage
-- ============================================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_facet_year
ON car_listing (year, expires_at)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_facet_mileage
ON car_listing (mileage, expires_at)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- Note: price already has idx_public_listings_price_asc/desc which covers price sort
-- but adding a facet-specific one for the GROUP BY / min/max pattern
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_facet_price
ON car_listing (price, expires_at)
WHERE moderation_status = 'approved'
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- ============================================================
-- 6. pg_trgm GIN INDEXES: Accelerate ILIKE '%keyword%' text search
--    Without these, ILIKE with leading wildcard forces sequential scan.
--    GIN trigram indexes allow index-based fuzzy matching.
--    Extension pg_trgm already installed on this Neon instance.
-- ============================================================

-- Make search (e.g., "merc" matches "Mercedes-Benz")
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_make_trgm
ON car_listing USING gin (make gin_trgm_ops);

-- Model search (e.g., "camr" matches "Camry")
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_model_trgm
ON car_listing USING gin (model gin_trgm_ops);

-- Trim search (e.g., "sport" matches "Sportline")
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_trim_trgm
ON car_listing USING gin (trim gin_trgm_ops);
