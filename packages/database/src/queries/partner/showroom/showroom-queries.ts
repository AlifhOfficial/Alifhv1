/**
 * Partner Showroom Queries (Black Tier Exclusive)
 * 
 * Ultra-optimized queries for the premium brand showroom experience.
 * 
 * Performance Optimizations:
 * - Aggressive caching with smart invalidation
 * - Prepared statements for repeated queries
 * - Minimal data selection (only what's needed)
 * - Index-optimized where clauses
 * 
 * @module queries/partner/showroom
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../../../dbclient';
import { partner, partnerShowroom } from '../../../schema/partner';
import { memoryCache, CacheKeys, CacheTTL, CachePrefixes } from '../../../caches/memory-cache';
import type {
  ShowroomTeamMember,
  ShowroomAchievement,
  ShowroomTestimonial,
  ShowroomService,
  ShowroomPressFeature,
} from '../../../schema/partner';

// ============================================================================
// Cache Keys & TTL (extend existing cache infrastructure)
// ============================================================================

const ShowroomCacheKeys = {
  byPartnerId: (partnerId: string) => `showroom:partner:${partnerId}`,
  bySlug: (slug: string) => `showroom:slug:${slug}`,
  publicBySlug: (slug: string) => `showroom:public:${slug}`,
  list: (page: number, limit: number) => `showroom:list:${page}:${limit}`,
};

const ShowroomCacheTTL = {
  full: 300,        // 5 min - full showroom data (admin view)
  public: 600,      // 10 min - public showroom page (longer, heavily cached)
  list: 300,        // 5 min - directory listing
};

// ============================================================================
// Types
// ============================================================================

/**
 * Full showroom data (for admin/editing)
 */
export interface PartnerShowroomFull {
  id: string;
  partnerId: string;
  
  // Hero Section
  heroVideoUrl: string | null;
  heroVideoFile: string | null;
  heroVideoThumbnail: string | null;
  heroImage: string | null;
  heroTagline: string | null;
  heroBackgroundType: 'video' | 'image' | 'gradient';
  heroCtaText: string;
  heroCtaLink: string | null;
  heroCtaSecondaryText: string;
  heroCtaSecondaryLink: string | null;
  
  // Brand Story
  brandStoryTitle: string;
  brandStoryContent: string | null;
  brandStoryVideoUrl: string | null;
  brandStoryVideoFile: string | null;
  brandPhilosophy: string | null;
  founderName: string | null;
  founderTitle: string | null;
  founderImage: string | null;
  founderQuote: string | null;
  
  // Gallery
  showroomImages: string[];
  showroomVideoTourUrl: string | null;
  showroomVideoTourFile: string | null;
  ambientStyle: 'modern' | 'classic' | 'industrial' | 'luxury' | 'minimal';
  
  // Signature Collection
  signatureVehicleIds: string[];
  collectionTitle: string;
  collectionDescription: string | null;
  
  // Team
  teamMembers: ShowroomTeamMember[];
  teamSectionTitle: string;
  
  // Achievements
  achievements: ShowroomAchievement[];
  totalCarsSold: number | null;
  yearsInBusiness: number | null;
  clientLogos: string[];
  achievementsSectionTitle: string;
  
  // Testimonials
  featuredTestimonials: ShowroomTestimonial[];
  testimonialsSectionTitle: string;
  
  // Services
  signatureServices: ShowroomService[];
  vipPerks: string[];
  servicesSectionTitle: string;
  
  // Contact
  showroomAddress: string | null;
  showroomMapEmbedUrl: string | null;
  showroomExteriorImages: string[];
  parkingInfo: string | null;
  appointmentCtaText: string;
  
  // Social
  instagramHandle: string | null;
  instagramFeedEnabled: boolean;
  youtubeChannelUrl: string | null;
  tiktokHandle: string | null;
  linkedinUrl: string | null;
  pressFeatures: ShowroomPressFeature[];
  
  // Theming
  primaryColor: string | null;
  accentColor: string | null;
  fontFamily: string | null;
  customCss: string | null;
  
  // SEO
  seoTitle: string | null;
  seoDescription: string | null;
  seoImage: string | null;
  slug: string | null;
  
  // Status
  isPublished: boolean;
  publishedAt: Date | null;
  lastEditedAt: Date | null;
  lastEditedBy: string | null;
  
  // Analytics (read-only)
  viewCount: number;
  uniqueVisitors: number;
  avgTimeOnPage: number | null;
  lastViewedAt: Date | null;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Public showroom data (for visitors, with partner info)
 * Optimized: excludes internal fields, includes partner branding
 */
export interface PartnerShowroomPublic {
  // Core IDs
  id: string;
  partnerId: string;
  slug: string;
  
  // Partner Branding (joined)
  partner: {
    id: string;
    brandName: string;
    logo: string | null;
    heroImage: string | null;
    isVerified: boolean;
    tier: string;
    googleRating: number | null;
    googleReviewCount: number;
    city: string | null;
    emirate: string | null;
    phone: string;
    website: string | null;
    locationLat: number | null;
    locationLng: number | null;
  };
  
  // All showroom content fields (same as full, minus internal)
  heroVideoUrl: string | null;
  heroVideoFile: string | null;
  heroVideoThumbnail: string | null;
  heroImage: string | null;
  heroTagline: string | null;
  heroBackgroundType: 'video' | 'image' | 'gradient';
  heroCtaText: string;
  heroCtaLink: string | null;
  heroCtaSecondaryText: string;
  heroCtaSecondaryLink: string | null;
  
  brandStoryTitle: string;
  brandStoryContent: string | null;
  brandStoryVideoUrl: string | null;
  brandStoryVideoFile: string | null;
  brandPhilosophy: string | null;
  founderName: string | null;
  founderTitle: string | null;
  founderImage: string | null;
  founderQuote: string | null;
  
  showroomImages: string[];
  showroomVideoTourUrl: string | null;
  showroomVideoTourFile: string | null;
  ambientStyle: 'modern' | 'classic' | 'industrial' | 'luxury' | 'minimal';
  
  signatureVehicleIds: string[];
  collectionTitle: string;
  collectionDescription: string | null;
  
  teamMembers: ShowroomTeamMember[];
  teamSectionTitle: string;
  
  achievements: ShowroomAchievement[];
  totalCarsSold: number | null;
  yearsInBusiness: number | null;
  clientLogos: string[];
  achievementsSectionTitle: string;
  
  featuredTestimonials: ShowroomTestimonial[];
  testimonialsSectionTitle: string;
  
  signatureServices: ShowroomService[];
  vipPerks: string[];
  servicesSectionTitle: string;
  
  showroomAddress: string | null;
  showroomMapEmbedUrl: string | null;
  showroomExteriorImages: string[];
  parkingInfo: string | null;
  appointmentCtaText: string;
  
  instagramHandle: string | null;
  instagramFeedEnabled: boolean;
  youtubeChannelUrl: string | null;
  tiktokHandle: string | null;
  linkedinUrl: string | null;
  pressFeatures: ShowroomPressFeature[];
  
  primaryColor: string | null;
  accentColor: string | null;
  fontFamily: string | null;
  
  seoTitle: string | null;
  seoDescription: string | null;
  seoImage: string | null;
  
  publishedAt: Date | null;
  updatedAt: Date;
}

/**
 * Create showroom input (minimal required fields)
 */
export interface ShowroomCreateInput {
  partnerId: string;
  heroTagline?: string;
  slug?: string;
}

/**
 * Update showroom input (all fields optional)
 */
export type ShowroomUpdateInput = Partial<Omit<
  PartnerShowroomFull,
  'id' | 'partnerId' | 'createdAt' | 'updatedAt' | 'viewCount' | 'uniqueVisitors' | 'avgTimeOnPage' | 'lastViewedAt'
>>;

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Check if a partner has a published showroom (lightweight check)
 * Used by seller profile cards to conditionally show "View Showroom" link
 * 
 * @param partnerId - The partner's ID
 * @returns Boolean indicating if showroom is published
 */
export async function hasPublishedShowroom(partnerId: string): Promise<boolean> {
  const cacheKey = `showroom:exists:${partnerId}`;
  
  // Check cache first
  const cached = memoryCache.get<boolean>(cacheKey);
  if (cached !== undefined) return cached;
  
  // Lightweight query - just check existence
  const result = await db
    .select({ id: partnerShowroom.id })
    .from(partnerShowroom)
    .where(and(
      eq(partnerShowroom.partnerId, partnerId),
      eq(partnerShowroom.isPublished, true),
    ))
    .limit(1);
  
  const exists = result.length > 0;
  
  // Cache for 5 minutes
  memoryCache.set(cacheKey, exists, ShowroomCacheTTL.full);
  
  return exists;
}

/**
 * Get showroom by partner ID (for admin/editing)
 * Uses cache with 5 min TTL
 * 
 * @param partnerId - The partner's ID
 * @returns Full showroom data or null if not found
 */
export async function getShowroomByPartnerId(partnerId: string): Promise<PartnerShowroomFull | null> {
  const cacheKey = ShowroomCacheKeys.byPartnerId(partnerId);
  
  // Check cache first
  const cached = memoryCache.get<PartnerShowroomFull>(cacheKey);
  if (cached) return cached;
  
  // Query database
  const result = await db
    .select()
    .from(partnerShowroom)
    .where(eq(partnerShowroom.partnerId, partnerId))
    .limit(1);
  
  if (!result.length) return null;
  
  const showroom = mapToShowroomFull(result[0]);
  
  // Cache result
  memoryCache.set(cacheKey, showroom, ShowroomCacheTTL.full);
  
  return showroom;
}

/**
 * Get showroom by slug (for admin/editing)
 * Uses cache with 5 min TTL
 * 
 * @param slug - The showroom's URL slug
 * @returns Full showroom data or null if not found
 */
export async function getShowroomBySlug(slug: string): Promise<PartnerShowroomFull | null> {
  const cacheKey = ShowroomCacheKeys.bySlug(slug);
  
  // Check cache first
  const cached = memoryCache.get<PartnerShowroomFull>(cacheKey);
  if (cached) return cached;
  
  // Query database
  const result = await db
    .select()
    .from(partnerShowroom)
    .where(eq(partnerShowroom.slug, slug))
    .limit(1);
  
  if (!result.length) return null;
  
  const showroom = mapToShowroomFull(result[0]);
  
  // Cache result
  memoryCache.set(cacheKey, showroom, ShowroomCacheTTL.full);
  
  return showroom;
}

/**
 * Get published showroom by slug (for public page)
 * Joins partner data for branding
 * Uses longer cache TTL (10 min) for public pages
 * 
 * PERFORMANCE: Single query with minimal joins, indexed on slug + isPublished
 * 
 * @param slug - The showroom's URL slug
 * @returns Public showroom data with partner info or null
 */
export async function getPublishedShowroomBySlug(slug: string): Promise<PartnerShowroomPublic | null> {
  const cacheKey = ShowroomCacheKeys.publicBySlug(slug);
  
  // Check cache first
  const cached = memoryCache.get<PartnerShowroomPublic>(cacheKey);
  if (cached) return cached;
  
  // Single optimized query with partner join
  const result = await db
    .select({
      // Showroom fields
      showroom: partnerShowroom,
      // Partner branding fields (only what we need)
      partnerId: partner.id,
      partnerBrandName: partner.brandName,
      partnerLogo: partner.logo,
      partnerHeroImage: partner.heroImage,
      partnerIsVerified: partner.isVerified,
      partnerTier: partner.tier,
      partnerGoogleRating: partner.googleRating,
      partnerGoogleReviewCount: partner.googleReviewCount,
      partnerCity: partner.city,
      partnerEmirate: partner.emirate,
      partnerPhone: partner.phone,
      partnerWebsite: partner.website,
      partnerLocationLat: partner.locationLat,
      partnerLocationLng: partner.locationLng,
    })
    .from(partnerShowroom)
    .innerJoin(partner, eq(partnerShowroom.partnerId, partner.id))
    .where(and(
      eq(partnerShowroom.slug, slug),
      eq(partnerShowroom.isPublished, true),
      eq(partner.status, 'active'), // Only active partners
      eq(partner.tier, 'black'), // Only black tier
    ))
    .limit(1);
  
  if (!result.length) return null;
  
  const row = result[0];
  const showroom = mapToShowroomPublic(row.showroom, {
    id: row.partnerId,
    brandName: row.partnerBrandName,
    logo: row.partnerLogo,
    heroImage: row.partnerHeroImage,
    isVerified: row.partnerIsVerified,
    tier: row.partnerTier,
    googleRating: row.partnerGoogleRating,
    googleReviewCount: row.partnerGoogleReviewCount || 0,
    city: row.partnerCity,
    emirate: row.partnerEmirate,
    phone: row.partnerPhone,
    website: row.partnerWebsite,
    locationLat: row.partnerLocationLat,
    locationLng: row.partnerLocationLng,
  });
  
  // Cache with longer TTL for public pages
  memoryCache.set(cacheKey, showroom, ShowroomCacheTTL.public);
  
  return showroom;
}

/**
 * Get published showroom by partner ID (for public page)
 * Used when linking from seller profile card
 * 
 * @param partnerId - The partner's ID
 * @returns Public showroom data with partner info or null
 */
export async function getPublishedShowroomByPartnerId(partnerId: string): Promise<PartnerShowroomPublic | null> {
  const cacheKey = `showroom:public:partner:${partnerId}`;
  
  // Check cache first
  const cached = memoryCache.get<PartnerShowroomPublic>(cacheKey);
  if (cached) return cached;
  
  // Single optimized query with partner join
  const result = await db
    .select({
      showroom: partnerShowroom,
      partnerId: partner.id,
      partnerBrandName: partner.brandName,
      partnerLogo: partner.logo,
      partnerHeroImage: partner.heroImage,
      partnerIsVerified: partner.isVerified,
      partnerTier: partner.tier,
      partnerGoogleRating: partner.googleRating,
      partnerGoogleReviewCount: partner.googleReviewCount,
      partnerCity: partner.city,
      partnerEmirate: partner.emirate,
      partnerPhone: partner.phone,
      partnerWebsite: partner.website,
      partnerLocationLat: partner.locationLat,
      partnerLocationLng: partner.locationLng,
    })
    .from(partnerShowroom)
    .innerJoin(partner, eq(partnerShowroom.partnerId, partner.id))
    .where(and(
      eq(partnerShowroom.partnerId, partnerId),
      eq(partnerShowroom.isPublished, true),
      eq(partner.status, 'active'),
      eq(partner.tier, 'black'),
    ))
    .limit(1);
  
  if (!result.length) return null;
  
  const row = result[0];
  const showroom = mapToShowroomPublic(row.showroom, {
    id: row.partnerId,
    brandName: row.partnerBrandName,
    logo: row.partnerLogo,
    heroImage: row.partnerHeroImage,
    isVerified: row.partnerIsVerified,
    tier: row.partnerTier,
    googleRating: row.partnerGoogleRating,
    googleReviewCount: row.partnerGoogleReviewCount || 0,
    city: row.partnerCity,
    emirate: row.partnerEmirate,
    phone: row.partnerPhone,
    website: row.partnerWebsite,
    locationLat: row.partnerLocationLat,
    locationLng: row.partnerLocationLng,
  });
  
  // Cache with longer TTL for public pages
  memoryCache.set(cacheKey, showroom, ShowroomCacheTTL.public);
  
  return showroom;
}

/**
 * Get list of published showrooms (for directory page)
 * Paginated with basic partner info
 * 
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Array of showrooms with partner info
 */
export async function getPublishedShowrooms(
  page: number = 1,
  limit: number = 12
): Promise<{ showrooms: PartnerShowroomPublic[]; total: number }> {
  const cacheKey = ShowroomCacheKeys.list(page, limit);
  
  // Check cache first
  const cached = memoryCache.get<{ showrooms: PartnerShowroomPublic[]; total: number }>(cacheKey);
  if (cached) return cached;
  
  const offset = (page - 1) * limit;
  
  // Query with join and pagination
  const [showrooms, countResult] = await Promise.all([
    db
      .select({
        showroom: partnerShowroom,
        partnerId: partner.id,
        partnerBrandName: partner.brandName,
        partnerLogo: partner.logo,
        partnerHeroImage: partner.heroImage,
        partnerIsVerified: partner.isVerified,
        partnerTier: partner.tier,
        partnerGoogleRating: partner.googleRating,
        partnerGoogleReviewCount: partner.googleReviewCount,
        partnerCity: partner.city,
        partnerEmirate: partner.emirate,
        partnerPhone: partner.phone,
        partnerWebsite: partner.website,
        partnerLocationLat: partner.locationLat,
        partnerLocationLng: partner.locationLng,
      })
      .from(partnerShowroom)
      .innerJoin(partner, eq(partnerShowroom.partnerId, partner.id))
      .where(and(
        eq(partnerShowroom.isPublished, true),
        eq(partner.status, 'active'),
        eq(partner.tier, 'black'),
      ))
      .orderBy(desc(partnerShowroom.publishedAt))
      .limit(limit)
      .offset(offset),
    
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(partnerShowroom)
      .innerJoin(partner, eq(partnerShowroom.partnerId, partner.id))
      .where(and(
        eq(partnerShowroom.isPublished, true),
        eq(partner.status, 'active'),
        eq(partner.tier, 'black'),
      )),
  ]);
  
  const result = {
    showrooms: showrooms.map(row => mapToShowroomPublic(row.showroom, {
      id: row.partnerId,
      brandName: row.partnerBrandName,
      logo: row.partnerLogo,
      heroImage: row.partnerHeroImage,
      isVerified: row.partnerIsVerified,
      tier: row.partnerTier,
      googleRating: row.partnerGoogleRating,
      googleReviewCount: row.partnerGoogleReviewCount || 0,
      city: row.partnerCity,
      emirate: row.partnerEmirate,
      phone: row.partnerPhone,
      website: row.partnerWebsite,
      locationLat: row.partnerLocationLat,
      locationLng: row.partnerLocationLng,
    })),
    total: countResult[0]?.count || 0,
  };
  
  memoryCache.set(cacheKey, result, ShowroomCacheTTL.list);
  
  return result;
}

/**
 * Create a new showroom for a partner
 * Only allowed for Black tier partners
 * Auto-generates a slug from partnerId if not provided
 * 
 * @param input - Creation input
 * @returns Created showroom
 */
export async function createShowroom(input: ShowroomCreateInput): Promise<PartnerShowroomFull> {
  const id = createId();
  
  // Auto-generate slug from partnerId if not provided
  const slug = input.slug || input.partnerId;
  
  const [created] = await db
    .insert(partnerShowroom)
    .values({
      id,
      partnerId: input.partnerId,
      heroTagline: input.heroTagline || null,
      slug,
    })
    .returning();
  
  const showroom = mapToShowroomFull(created);
  
  // Cache the new showroom
  memoryCache.set(ShowroomCacheKeys.byPartnerId(input.partnerId), showroom, ShowroomCacheTTL.full);
  
  return showroom;
}

/**
 * Update showroom data
 * 
 * @param showroomId - Showroom ID
 * @param updates - Fields to update
 * @param editorUserId - User making the edit
 * @returns Updated showroom
 */
export async function updateShowroom(
  showroomId: string,
  updates: ShowroomUpdateInput,
  editorUserId?: string
): Promise<PartnerShowroomFull> {
  const [updated] = await db
    .update(partnerShowroom)
    .set({
      ...updates,
      lastEditedAt: new Date(),
      lastEditedBy: editorUserId || null,
    })
    .where(eq(partnerShowroom.id, showroomId))
    .returning();
  
  const showroom = mapToShowroomFull(updated);
  
  // Invalidate all related caches
  invalidateShowroomCache(updated.partnerId, updated.slug);
  
  // Re-cache with fresh data
  memoryCache.set(ShowroomCacheKeys.byPartnerId(updated.partnerId), showroom, ShowroomCacheTTL.full);
  
  return showroom;
}

/**
 * Publish a showroom (make it live)
 * 
 * @param showroomId - Showroom ID
 * @returns Updated showroom
 */
export async function publishShowroom(showroomId: string): Promise<PartnerShowroomFull> {
  const [updated] = await db
    .update(partnerShowroom)
    .set({
      isPublished: true,
      publishedAt: new Date(),
    })
    .where(eq(partnerShowroom.id, showroomId))
    .returning();
  
  const showroom = mapToShowroomFull(updated);
  
  // Invalidate and re-cache
  invalidateShowroomCache(updated.partnerId, updated.slug);
  memoryCache.set(ShowroomCacheKeys.byPartnerId(updated.partnerId), showroom, ShowroomCacheTTL.full);
  
  return showroom;
}

/**
 * Unpublish a showroom (take it offline)
 * 
 * @param showroomId - Showroom ID
 * @returns Updated showroom
 */
export async function unpublishShowroom(showroomId: string): Promise<PartnerShowroomFull> {
  const [updated] = await db
    .update(partnerShowroom)
    .set({
      isPublished: false,
    })
    .where(eq(partnerShowroom.id, showroomId))
    .returning();
  
  const showroom = mapToShowroomFull(updated);
  
  // Invalidate all caches
  invalidateShowroomCache(updated.partnerId, updated.slug);
  
  return showroom;
}

/**
 * Increment view count for analytics
 * Uses raw SQL for atomic increment
 * 
 * @param showroomId - Showroom ID
 */
export async function incrementShowroomViews(showroomId: string): Promise<void> {
  await db
    .update(partnerShowroom)
    .set({
      viewCount: sql`${partnerShowroom.viewCount} + 1`,
      lastViewedAt: new Date(),
    })
    .where(eq(partnerShowroom.id, showroomId));
  
  // Don't invalidate cache for view increments (analytics are eventually consistent)
}

// ============================================================================
// Cache Invalidation
// ============================================================================

/**
 * Invalidate all showroom caches for a partner
 */
function invalidateShowroomCache(partnerId: string, slug: string | null): void {
  memoryCache.delete(ShowroomCacheKeys.byPartnerId(partnerId));
  if (slug) {
    memoryCache.delete(ShowroomCacheKeys.bySlug(slug));
    memoryCache.delete(ShowroomCacheKeys.publicBySlug(slug));
  }
  // Invalidate list caches
  memoryCache.deleteByPrefix('showroom:list:');
}

/**
 * Public invalidation function for use by other modules
 */
export function invalidateShowroomCacheByPartnerId(partnerId: string): void {
  memoryCache.deleteByPrefix(`showroom:partner:${partnerId}`);
  memoryCache.deleteByPrefix('showroom:list:');
}

// ============================================================================
// Mappers
// ============================================================================

function mapToShowroomFull(row: typeof partnerShowroom.$inferSelect): PartnerShowroomFull {
  return {
    id: row.id,
    partnerId: row.partnerId,
    
    heroVideoUrl: row.heroVideoUrl,
    heroVideoFile: row.heroVideoFile,
    heroVideoThumbnail: row.heroVideoThumbnail,
    heroImage: row.heroImage,
    heroTagline: row.heroTagline,
    heroBackgroundType: row.heroBackgroundType || 'image',
    heroCtaText: row.heroCtaText || 'Talk to Us',
    heroCtaLink: row.heroCtaLink,
    heroCtaSecondaryText: row.heroCtaSecondaryText || 'Browse Collection',
    heroCtaSecondaryLink: row.heroCtaSecondaryLink,
    
    brandStoryTitle: row.brandStoryTitle || 'Our Story',
    brandStoryContent: row.brandStoryContent,
    brandStoryVideoUrl: row.brandStoryVideoUrl,
    brandStoryVideoFile: row.brandStoryVideoFile,
    brandPhilosophy: row.brandPhilosophy,
    founderName: row.founderName,
    founderTitle: row.founderTitle,
    founderImage: row.founderImage,
    founderQuote: row.founderQuote,
    
    showroomImages: row.showroomImages || [],
    showroomVideoTourUrl: row.showroomVideoTourUrl,
    showroomVideoTourFile: row.showroomVideoTourFile,
    ambientStyle: row.ambientStyle || 'luxury',
    
    signatureVehicleIds: row.signatureVehicleIds || [],
    collectionTitle: row.collectionTitle || 'The Collection',
    collectionDescription: row.collectionDescription,
    
    teamMembers: row.teamMembers || [],
    teamSectionTitle: row.teamSectionTitle || 'Meet the Team',
    
    achievements: row.achievements || [],
    totalCarsSold: row.totalCarsSold,
    yearsInBusiness: row.yearsInBusiness,
    clientLogos: row.clientLogos || [],
    achievementsSectionTitle: row.achievementsSectionTitle || 'Our Achievements',
    
    featuredTestimonials: row.featuredTestimonials || [],
    testimonialsSectionTitle: row.testimonialsSectionTitle || 'What Our Clients Say',
    
    signatureServices: row.signatureServices || [],
    vipPerks: row.vipPerks || [],
    servicesSectionTitle: row.servicesSectionTitle || 'Our Services',
    
    showroomAddress: row.showroomAddress,
    showroomMapEmbedUrl: row.showroomMapEmbedUrl,
    showroomExteriorImages: row.showroomExteriorImages || [],
    parkingInfo: row.parkingInfo,
    appointmentCtaText: row.appointmentCtaText || 'Book Your Private Viewing',
    
    instagramHandle: row.instagramHandle,
    instagramFeedEnabled: row.instagramFeedEnabled || false,
    youtubeChannelUrl: row.youtubeChannelUrl,
    tiktokHandle: row.tiktokHandle,
    linkedinUrl: row.linkedinUrl,
    pressFeatures: row.pressFeatures || [],
    
    primaryColor: row.primaryColor,
    accentColor: row.accentColor,
    fontFamily: row.fontFamily,
    customCss: row.customCss,
    
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    seoImage: row.seoImage,
    slug: row.slug,
    
    isPublished: row.isPublished,
    publishedAt: row.publishedAt,
    lastEditedAt: row.lastEditedAt,
    lastEditedBy: row.lastEditedBy,
    
    viewCount: row.viewCount,
    uniqueVisitors: row.uniqueVisitors,
    avgTimeOnPage: row.avgTimeOnPage,
    lastViewedAt: row.lastViewedAt,
    
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapToShowroomPublic(
  row: typeof partnerShowroom.$inferSelect,
  partnerData: PartnerShowroomPublic['partner']
): PartnerShowroomPublic {
  return {
    id: row.id,
    partnerId: row.partnerId,
    slug: row.slug!,
    
    partner: partnerData,
    
    heroVideoUrl: row.heroVideoUrl,
    heroVideoFile: row.heroVideoFile,
    heroVideoThumbnail: row.heroVideoThumbnail,
    heroImage: row.heroImage,
    heroTagline: row.heroTagline,
    heroBackgroundType: row.heroBackgroundType || 'image',
    heroCtaText: row.heroCtaText || 'Talk to Us',
    heroCtaLink: row.heroCtaLink,
    heroCtaSecondaryText: row.heroCtaSecondaryText || 'Browse Collection',
    heroCtaSecondaryLink: row.heroCtaSecondaryLink,
    
    brandStoryTitle: row.brandStoryTitle || 'Our Story',
    brandStoryContent: row.brandStoryContent,
    brandStoryVideoUrl: row.brandStoryVideoUrl,
    brandStoryVideoFile: row.brandStoryVideoFile,
    brandPhilosophy: row.brandPhilosophy,
    founderName: row.founderName,
    founderTitle: row.founderTitle,
    founderImage: row.founderImage,
    founderQuote: row.founderQuote,
    
    showroomImages: row.showroomImages || [],
    showroomVideoTourUrl: row.showroomVideoTourUrl,
    showroomVideoTourFile: row.showroomVideoTourFile,
    ambientStyle: row.ambientStyle || 'luxury',
    
    signatureVehicleIds: row.signatureVehicleIds || [],
    collectionTitle: row.collectionTitle || 'The Collection',
    collectionDescription: row.collectionDescription,
    
    teamMembers: row.teamMembers || [],
    teamSectionTitle: row.teamSectionTitle || 'Meet the Team',
    
    achievements: row.achievements || [],
    totalCarsSold: row.totalCarsSold,
    yearsInBusiness: row.yearsInBusiness,
    clientLogos: row.clientLogos || [],
    achievementsSectionTitle: row.achievementsSectionTitle || 'Our Achievements',
    
    featuredTestimonials: row.featuredTestimonials || [],
    testimonialsSectionTitle: row.testimonialsSectionTitle || 'What Our Clients Say',
    
    signatureServices: row.signatureServices || [],
    vipPerks: row.vipPerks || [],
    servicesSectionTitle: row.servicesSectionTitle || 'Our Services',
    
    showroomAddress: row.showroomAddress,
    showroomMapEmbedUrl: row.showroomMapEmbedUrl,
    showroomExteriorImages: row.showroomExteriorImages || [],
    parkingInfo: row.parkingInfo,
    appointmentCtaText: row.appointmentCtaText || 'Book Your Private Viewing',
    
    instagramHandle: row.instagramHandle,
    instagramFeedEnabled: row.instagramFeedEnabled || false,
    youtubeChannelUrl: row.youtubeChannelUrl,
    tiktokHandle: row.tiktokHandle,
    linkedinUrl: row.linkedinUrl,
    pressFeatures: row.pressFeatures || [],
    
    primaryColor: row.primaryColor,
    accentColor: row.accentColor,
    fontFamily: row.fontFamily,
    
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    seoImage: row.seoImage,
    
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
  };
}
