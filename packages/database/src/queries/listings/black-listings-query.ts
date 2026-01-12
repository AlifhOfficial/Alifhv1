/**
 * Black Listings Query
 * 
 * Queries for managing black listings (premium quota-controlled listings)
 * 
 * Black listings:
 * - Do not appear on normal listings page
 * - Appear on separate signature/premium page
 * - Quota: Black tier = 5, Other tiers = 1
 */

import { db } from '../../dbclient';
import { carListing, partner, user, userProfile } from '../../schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface BlackListingItem {
  id: string;
  slug: string | null;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  price: number;
  mileage: number;
  emirate: string;
  specs: string;
  thumbnail: string | null;
  images: string[];
  qiScore: number | null;
  moderationStatus: string;
  lifecycleStatus: string;
  partnerName: string | null;
  partnerLogo: string | null;
  partnerVerified: boolean | null;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  publishedAt: Date | null;
  createdAt: Date;
}

export interface BlackListingsQuota {
  used: number;
  max: number;
  tier: string;
  remaining: number;
}

export interface PartnerBlackListingsResult {
  listings: BlackListingItem[];
  quota: BlackListingsQuota;
}

/**
 * Get all black listings for a partner with quota info
 */
export async function getPartnerBlackListings(
  partnerId: string
): Promise<PartnerBlackListingsResult> {
  // Fetch partner quota info
  const [partnerData] = await db
    .select({
      tier: partner.tier,
      blackListingQuota: partner.blackListingQuota,
      activeBlackListingsCount: partner.activeBlackListingsCount,
      brandName: partner.brandName,
      logo: partner.logo,
      isVerified: partner.isVerified,
    })
    .from(partner)
    .where(eq(partner.id, partnerId))
    .limit(1);

  if (!partnerData) {
    return {
      listings: [],
      quota: { used: 0, max: 1, tier: 'standard', remaining: 1 },
    };
  }

  // Fetch black listings
  const listings = await db
    .select({
      id: carListing.id,
      slug: carListing.slug,
      make: carListing.make,
      model: carListing.model,
      year: carListing.year,
      trim: carListing.trim,
      price: carListing.price,
      mileage: carListing.mileage,
      emirate: carListing.emirate,
      specs: carListing.specs,
      thumbnail: carListing.thumbnail,
      images: carListing.images,
      qiScore: carListing.qiScore,
      moderationStatus: carListing.moderationStatus,
      lifecycleStatus: carListing.lifecycleStatus,
      publishedAt: carListing.publishedAt,
      createdAt: carListing.createdAt,
      partnerName: sql<string | null>`coalesce(${carListing.partnerBrandName}, ${partner.brandName})`,
      partnerLogo: partner.logo,
      partnerVerified: sql<boolean | null>`coalesce(${carListing.partnerVerified}, ${partner.isVerified})`,
      sellerName: user.name,
      sellerAvatarUrl: userProfile.avatar,
    })
    .from(carListing)
    .leftJoin(partner, eq(partner.id, carListing.partnerId))
    .leftJoin(user, eq(user.id, carListing.userId))
    .leftJoin(userProfile, eq(userProfile.userId, user.id))
    .where(
      and(
        eq(carListing.partnerId, partnerId),
        eq(carListing.isBlkListing, true)
      )
    )
    .orderBy(desc(carListing.createdAt));

  return {
    listings: listings.map((l) => ({
      ...l,
      images: l.images || [],
    })) as BlackListingItem[],
    quota: {
      used: partnerData.activeBlackListingsCount,
      max: partnerData.blackListingQuota,
      tier: partnerData.tier,
      remaining: Math.max(0, partnerData.blackListingQuota - partnerData.activeBlackListingsCount),
    },
  };
}

/**
 * Get black listings quota for a partner
 */
export async function getPartnerBlackListingsQuota(
  partnerId: string
): Promise<BlackListingsQuota | null> {
  const [partnerData] = await db
    .select({
      tier: partner.tier,
      blackListingQuota: partner.blackListingQuota,
      activeBlackListingsCount: partner.activeBlackListingsCount,
    })
    .from(partner)
    .where(eq(partner.id, partnerId))
    .limit(1);

  if (!partnerData) return null;

  return {
    used: partnerData.activeBlackListingsCount,
    max: partnerData.blackListingQuota,
    tier: partnerData.tier,
    remaining: Math.max(0, partnerData.blackListingQuota - partnerData.activeBlackListingsCount),
  };
}

/**
 * Get all public black listings (for the signature page)
 * Only returns approved, active, non-expired black listings
 */
export async function getPublicBlackListings(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ listings: BlackListingItem[]; total: number }> {
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  const now = new Date();

  // Count total
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(carListing)
    .where(
      and(
        eq(carListing.isBlkListing, true),
        eq(carListing.moderationStatus, 'approved'),
        eq(carListing.lifecycleStatus, 'active'),
        eq(carListing.needsRemoderation, false),
        sql`${carListing.expiresAt} > ${now}`
      )
    );

  // Fetch listings
  const listings = await db
    .select({
      id: carListing.id,
      slug: carListing.slug,
      make: carListing.make,
      model: carListing.model,
      year: carListing.year,
      trim: carListing.trim,
      price: carListing.price,
      mileage: carListing.mileage,
      emirate: carListing.emirate,
      specs: carListing.specs,
      thumbnail: carListing.thumbnail,
      images: carListing.images,
      qiScore: carListing.qiScore,
      moderationStatus: carListing.moderationStatus,
      lifecycleStatus: carListing.lifecycleStatus,
      publishedAt: carListing.publishedAt,
      createdAt: carListing.createdAt,
      partnerName: sql<string | null>`coalesce(${carListing.partnerBrandName}, ${partner.brandName})`,
      partnerLogo: partner.logo,
      partnerVerified: sql<boolean | null>`coalesce(${carListing.partnerVerified}, ${partner.isVerified})`,
      sellerName: user.name,
      sellerAvatarUrl: userProfile.avatar,
    })
    .from(carListing)
    .leftJoin(partner, eq(partner.id, carListing.partnerId))
    .leftJoin(user, eq(user.id, carListing.userId))
    .leftJoin(userProfile, eq(userProfile.userId, user.id))
    .where(
      and(
        eq(carListing.isBlkListing, true),
        eq(carListing.moderationStatus, 'approved'),
        eq(carListing.lifecycleStatus, 'active'),
        eq(carListing.needsRemoderation, false),
        sql`${carListing.expiresAt} > ${now}`
      )
    )
    // Use originalPublishedAt to prevent repost "bump to top" abuse
    .orderBy(sql`${carListing.originalPublishedAt} desc nulls last`, desc(carListing.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    listings: listings.map((l) => ({
      ...l,
      images: l.images || [],
    })) as BlackListingItem[],
    total: countResult?.count ?? 0,
  };
}

/**
 * Sync partner's activeBlackListingsCount with actual count
 * Call this if counts get out of sync
 */
export async function syncPartnerBlackListingsCount(partnerId: string): Promise<number> {
  // Count actual active black listings
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(carListing)
    .where(
      and(
        eq(carListing.partnerId, partnerId),
        eq(carListing.isBlkListing, true),
        eq(carListing.lifecycleStatus, 'active')
      )
    );

  const actualCount = countResult?.count ?? 0;

  // Update partner
  await db
    .update(partner)
    .set({
      activeBlackListingsCount: actualCount,
      updatedAt: new Date(),
    })
    .where(eq(partner.id, partnerId));

  return actualCount;
}
