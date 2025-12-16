-- Migration: Split user_favorite into two separate tables
-- This allows users to have BOTH a favorite AND a superlike on the same listing

-- Step 1: Create new user_superlike table
CREATE TABLE IF NOT EXISTS "user_superlike" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"added_from" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Step 2: Migrate existing superlikes to new table
INSERT INTO "user_superlike" (id, user_id, listing_id, added_from, created_at)
SELECT 
	REPLACE(id, 'fav_', 'superlike_') as id,
	user_id, 
	listing_id, 
	added_from, 
	created_at
FROM "user_favorite"
WHERE type = 'superlike';

-- Step 3: Remove superlike records from user_favorite (keep only favorites)
DELETE FROM "user_favorite" WHERE type = 'superlike';

-- Step 4: Drop the type column and enum (no longer needed)
ALTER TABLE "user_favorite" DROP COLUMN IF EXISTS "type";
DROP TYPE IF EXISTS "favorite_type";

-- Step 5: Add indexes for performance
CREATE INDEX IF NOT EXISTS "user_superlike_userId_idx" ON "user_superlike" ("user_id");
CREATE INDEX IF NOT EXISTS "user_superlike_listingId_idx" ON "user_superlike" ("listing_id");
CREATE INDEX IF NOT EXISTS "user_superlike_userId_listingId_idx" ON "user_superlike" ("user_id","listing_id");
CREATE INDEX IF NOT EXISTS "user_superlike_createdAt_idx" ON "user_superlike" ("created_at");

-- Step 6: Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "user_superlike" ADD CONSTRAINT "user_superlike_user_id_user_id_fk" 
 FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Step 7: Drop old indexes related to type
DROP INDEX IF EXISTS "user_favorite_type_idx";
DROP INDEX IF EXISTS "user_favorite_userId_type_idx";

-- Verification queries (comment out in production)
-- SELECT COUNT(*) as favorites_count FROM user_favorite;
-- SELECT COUNT(*) as superlikes_count FROM user_superlike;
