/**
 * Car Card Listings Queries
 * Queries for fetching and managing listings displayed in car cards
 */

import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';
import { db } from '../../dbclient';
import { carListing } from '../../schema/listing';

const LISTING_ID_PREFIX = 'listing_';
const makeListingId = () => `${LISTING_ID_PREFIX}${createId()}`;

// Type Exports
export type ListingRecord = typeof carListing.$inferSelect;
export type ListingInsert = typeof carListing.$inferInsert;
export type ListingUpdate = Partial<Omit<ListingInsert, 'id' | 'createdAt'>>;

// ==================== CORE CRUD ====================

/**
 * Get listing by ID
 */
export const getListingById = async (id: string): Promise<ListingRecord | null> => {
  const result = await db
    .select()
    .from(carListing)
    .where(eq(carListing.id, id))
    .limit(1);

  return result[0] ?? null;
};

/**
 * Create a new listing
 */
export const createListing = async (data: Omit<ListingInsert, 'id'>): Promise<ListingRecord> => {
  const now = new Date();
  const slugBase = `${data.year}-${data.make}-${data.model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const slug = `${slugBase}-${createId().slice(0, 8)}`;

  // Fetch partner data if partnerId provided (for denormalized fields)
  let partnerBrandName = null;
  let partnerVerified = false;
  
  if (data.partnerId) {
    const { partner } = await import('../../schema/partner');
    const partnerData = await db
      .select({ brandName: partner.brandName, isVerified: partner.isVerified })
      .from(partner)
      .where(eq(partner.id, data.partnerId))
      .limit(1);
    
    if (partnerData[0]) {
      partnerBrandName = partnerData[0].brandName;
      partnerVerified = partnerData[0].isVerified || false;
    }
  }

  const [result] = await db
    .insert(carListing)
    .values({
      id: makeListingId(),
      ...data,
      partnerBrandName,
      partnerVerified,
      slug: data.slug || slug,
      status: data.status || 'draft',
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return result;
};

/**
 * Update an existing listing
 */
export const updateListing = async (id: string, data: ListingUpdate): Promise<ListingRecord | null> => {
  const [result] = await db
    .update(carListing)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(carListing.id, id))
    .returning();

  return result ?? null;
};

/**
 * Delete a listing (soft delete)
 */
export const deleteListing = async (id: string): Promise<boolean> => {
  const [result] = await db
    .update(carListing)
    .set({
      status: 'archived',
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(carListing.id, id))
    .returning();

  return !!result;
};
