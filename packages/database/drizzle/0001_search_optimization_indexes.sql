-- Search Optimization Indexes
-- Run this migration to optimize search performance

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON FILTER COMBINATIONS
-- ============================================================================

-- Core search: make + model + year (most common filter combo)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_make_model_year_price 
ON car_listing (make, model, year, price)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active' 
  AND needs_remoderation = false
  AND expires_at > NOW();

-- Price range search with status filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_price_status
ON car_listing (price, moderation_status, lifecycle_status)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- Emirate + price (location-based browsing)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_emirate_price
ON car_listing (emirate, price)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- Body type filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_body_type_price
ON car_listing (body_type, price)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- Fuel type filtering (EV/Hybrid searches are popular)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_fuel_type_price
ON car_listing (fuel_type, price)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- ============================================================================
-- TEXT SEARCH OPTIMIZATION (requires pg_trgm extension)
-- ============================================================================

-- Enable trigram extension if not exists (for fuzzy text search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index for fuzzy make search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_make_trgm 
ON car_listing USING gin (make gin_trgm_ops);

-- GIN index for fuzzy model search  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_model_trgm
ON car_listing USING gin (model gin_trgm_ops);

-- Combined make+model for "Toyota Camry" style searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_make_model_combined
ON car_listing USING gin ((make || ' ' || model) gin_trgm_ops);

-- ============================================================================
-- FACET COUNT OPTIMIZATION
-- ============================================================================

-- Make facet counts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_make_facet
ON car_listing (make)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- Model facet counts  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_model_facet
ON car_listing (model)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active'
  AND needs_remoderation = false;

-- Emirate facet counts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_emirate_facet
ON car_listing (emirate)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- Body type facet counts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_body_type_facet
ON car_listing (body_type)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- Fuel type facet counts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_fuel_type_facet
ON car_listing (fuel_type)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- Transmission facet counts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_transmission_facet
ON car_listing (transmission)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- Specs facet counts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_specs_facet
ON car_listing (specs)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- Seller type facet counts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_seller_type_facet
ON car_listing (seller_type)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- ============================================================================
-- RANGE STATS OPTIMIZATION
-- ============================================================================

-- Year range stats
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_year_stats
ON car_listing (year)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- Price range stats
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_price_stats
ON car_listing (price)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- Mileage range stats
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_mileage_stats
ON car_listing (mileage)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- ============================================================================
-- SORTING OPTIMIZATION
-- ============================================================================

-- Published date sorting (newest first - most common)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_published_sort
ON car_listing (published_at DESC NULLS LAST, created_at DESC)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- Price sorting (low to high)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_price_asc_sort
ON car_listing (price ASC, created_at DESC)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- Price sorting (high to low)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_price_desc_sort
ON car_listing (price DESC, created_at DESC)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- Year sorting (newest year)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_year_desc_sort
ON car_listing (year DESC, created_at DESC)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- Mileage sorting (lowest mileage)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_mileage_asc_sort
ON car_listing (mileage ASC, created_at DESC)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- Popularity sorting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_car_listing_popularity_sort
ON car_listing ((view_count + favourite_count * 2) DESC, created_at DESC)
WHERE moderation_status = 'approved' 
  AND lifecycle_status = 'active';

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- 1. CONCURRENTLY: Indexes are created without locking the table
-- 2. Partial indexes: Only index approved+active listings (smaller, faster)
-- 3. pg_trgm: Enables fuzzy matching (typo tolerance)
-- 4. Run ANALYZE after creating indexes: ANALYZE car_listing;
--
-- To monitor index usage:
-- SELECT indexrelname, idx_scan, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public' AND relname = 'car_listing';
