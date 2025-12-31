/**
 * Car Detailed Listing Query - Production
 * 
 * Fetches comprehensive listing data for detailed view pages.
 * Includes all specifications, features, pricing insights, and partner info.
 * 
 * @module queries/listings/car-detailed-query
 */

import { eq, sql } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { carListing } from '../../../schema/listing';
import { isPublicSql } from './sql-fragments';

function isMissingColumnError(err: unknown, columnName: string): boolean {
  const anyErr = err as any;
  const code = anyErr?.code ?? anyErr?.cause?.code;
  const message = String(anyErr?.message ?? anyErr?.cause?.message ?? '');
  return code === '42703' && message.includes(columnName);
}

/**
 * Technical features structure matching schema
 */
export interface TechnicalFeatures {
  abs?: boolean;
  airbags?: number;
  parkingSensors?: boolean;
  rearCamera?: boolean;
  blindSpotMonitor?: boolean;
  laneAssist?: boolean;
  adaptiveCruise?: boolean;
  collisionWarning?: boolean;
  leatherSeats?: boolean;
  heatedSeats?: boolean;
  ventilatedSeats?: boolean;
  sunroof?: boolean;
  panoramicRoof?: boolean;
  climateControl?: boolean;
  powerSeats?: boolean;
  memorySeats?: boolean;
  touchscreen?: boolean;
  screenSize?: string;
  appleCarPlay?: boolean;
  androidAuto?: boolean;
  bluetooth?: boolean;
  navigation?: boolean;
  soundSystem?: string;
  wirelessCharging?: boolean;
  sportMode?: boolean;
  paddleShifters?: boolean;
  allWheelDrive?: boolean;
  adjustableSuspension?: boolean;
  launchControl?: boolean;
}

/**
 * Special notes structure matching schema
 */
export interface SpecialNotes {
  // Owner notes (array of strings, max 10)
  ownerRemarks?: string[];
  
  // Legacy boolean tags (kept for backward compat)
  serviceHistory?: boolean;
  singleOwner?: boolean;
  accidentFree?: boolean;
  underWarranty?: boolean;
  registeredUntil?: string;
  customizations?: string[];
  recentServices?: string[];
  knownIssues?: string[];

  // Admin moderation fields (optional; present for rejected/suspended listings)
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  suspendedByName?: string;
  
  // AI moderation metadata (auto-populated by AI moderation service)
  aiModeration?: {
    decision: 'approve' | 'flag' | 'reject';
    confidence: number;
    flags: Array<{ code: string; severity: string; message: string }>;
    reasoning: string;
    processedAt: string;
    model: string;
  };
}

/**
 * Detailed car listing data structure
 */
export interface CarDetailedData {
  // Core identification
  id: string;
  vin: string | null;
  slug: string | null;
  
  // Owner/Seller
  userId: string;
  postedByRole: 'user' | 'staff';
  
  // Basic info
  make: string;
  model: string;
  year: number;
  trim: string | null;
  description: string | null;
  
  // Pricing
  price: number;
  currency: string;
  isNegotiable: boolean;
  
  // AI Pricing Insights
  aiEstimatedPrice: number | null;
  aiPriceMin: number | null;
  aiPriceMax: number | null;
  aiConfidenceScore: number | null;
  aiReasoning: string | null;
  fairValue: number | null;
  estimateMin: number | null;
  estimateMax: number | null;
  priceTrend: string | null;
  
  // Quality & Engagement
  qiScore: number | null;
  viewCount: number;
  favouriteCount: number;
  superlikeCount: number;
  heatScore: number;
  
  // Specifications
  bodyType: string | null;
  fuelType: string | null;
  transmission: string | null;
  specs: string;
  steeringSide: string;
  engineSize: string | null;
  engineType: string | null;
  cylinders: number | null;
  powerRange: string | null;
  torque: string | null;
  fuelEconomy: string | null;
  doors: string | null;
  seatingCapacity: string | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  mileage: number;
  
  // Moderation & Lifecycle
  moderationStatus: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected';
  lifecycleStatus: 'active' | 'archived' | 'sold' | 'expired' | 'deleted';
  isPublic: boolean;
  exportStatus: string;
  warrantyType: string | null;
  sellerType: string;
  rejectionReason: string | null;
  
  // Location
  emirate: string;
  city: string | null;
  
  // Media
  thumbnail: string | null;
  images: string[];
  videoUrl: string | null;
  
  // Features & Notes
  technicalFeatures: TechnicalFeatures;
  extras: string[];
  specialNotes: SpecialNotes;
  badges: string[];
  tags: string[];
  
  // Partner info (denormalized)
  partnerId: string | null;
  partnerBrandName: string | null;
  partnerVerified: boolean;
  isBlackMember: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastEditedAt: Date;
  submittedAt: Date | null;
  approvedAt: Date | null;
  lastModeratedAt: Date | null;
  needsRemoderation: boolean;
  publishedAt: Date | null;
  expiresAt: Date | null;
  extensionCount: number;
  extensionHistory: Array<{
    extendedAt: string;
    days: 7 | 14;
    previousExpiresAt: string;
    newExpiresAt: string;
    extendedBy: string | null;
  }>;
  lastExtendedAt: Date | null;
  deletedAt: Date | null;
}

/**
 * Get detailed listing data by ID
 * Includes full specifications and features
 */
export async function getListingDetailed(listingId: string): Promise<CarDetailedData | null> {
  const run = async (includeExpiry: boolean) => {
    return db.select({
      // Core identification
      id: carListing.id,
      vin: carListing.vin,
      slug: carListing.slug,
      
      // Owner/Seller
      userId: carListing.userId,
      postedByRole: carListing.postedByRole,
      
      // Basic info
      make: carListing.make,
      model: carListing.model,
      year: carListing.year,
      trim: carListing.trim,
      description: carListing.description,
      
      // Pricing
      price: carListing.price,
      currency: carListing.currency,
      isNegotiable: carListing.isNegotiable,
      
      // AI Pricing Insights
      aiEstimatedPrice: carListing.aiEstimatedPrice,
      aiPriceMin: carListing.aiPriceMin,
      aiPriceMax: carListing.aiPriceMax,
      aiConfidenceScore: carListing.aiConfidenceScore,
      aiReasoning: carListing.aiReasoning,
      fairValue: carListing.fairValue,
      estimateMin: carListing.estimateMin,
      estimateMax: carListing.estimateMax,
      priceTrend: carListing.priceTrend,
      
      // Quality & Engagement
      qiScore: carListing.qiScore,
      viewCount: carListing.viewCount,
      favouriteCount: carListing.favouriteCount,
      superlikeCount: carListing.superlikeCount,
      heatScore: carListing.heatScore,
      
      // Specifications
      bodyType: carListing.bodyType,
      fuelType: carListing.fuelType,
      transmission: carListing.transmission,
      specs: carListing.specs,
      steeringSide: carListing.steeringSide,
      engineSize: carListing.engineSize,
      engineType: carListing.engineType,
      cylinders: carListing.cylinders,
      powerRange: carListing.powerRange,
      torque: carListing.torque,
      fuelEconomy: carListing.fuelEconomy,
      doors: carListing.doors,
      seatingCapacity: carListing.seatingCapacity,
      exteriorColor: carListing.exteriorColor,
      interiorColor: carListing.interiorColor,
      mileage: carListing.mileage,
      
      // Moderation & Lifecycle
      moderationStatus: carListing.moderationStatus,
      lifecycleStatus: carListing.lifecycleStatus,
      isPublic: isPublicSql(),
      exportStatus: carListing.exportStatus,
      warrantyType: carListing.warrantyType,
      sellerType: carListing.sellerType,
      rejectionReason: carListing.rejectionReason,
      
      // Location
      emirate: carListing.emirate,
      city: carListing.city,
      
      // Media
      thumbnail: carListing.thumbnail,
      images: carListing.images,
      videoUrl: carListing.videoUrl,
      
      // Features & Notes
      technicalFeatures: carListing.technicalFeatures,
      extras: carListing.extras,
      specialNotes: carListing.specialNotes,
      badges: carListing.badges,
      tags: carListing.tags,
      
      // Partner info (denormalized)
      partnerId: carListing.partnerId,
      partnerBrandName: carListing.partnerBrandName,
      partnerVerified: carListing.partnerVerified,
      isBlackMember: carListing.isBlackMember,
      
      // Timestamps
      createdAt: carListing.createdAt,
      updatedAt: carListing.updatedAt,
      lastEditedAt: carListing.lastEditedAt,
      submittedAt: carListing.submittedAt,
      approvedAt: carListing.approvedAt,
      lastModeratedAt: carListing.lastModeratedAt,
      needsRemoderation: carListing.needsRemoderation,
      publishedAt: carListing.publishedAt,
      expiresAt: includeExpiry ? carListing.expiresAt : sql<null>`null`,
      extensionCount: includeExpiry ? carListing.extensionCount : sql<number>`0`,
      extensionHistory: includeExpiry ? carListing.extensionHistory : sql<any>`'[]'::jsonb`,
      lastExtendedAt: includeExpiry ? carListing.lastExtendedAt : sql<null>`null`,
      deletedAt: carListing.deletedAt,
    })
    .from(carListing)
    .where(eq(carListing.id, listingId))
    .limit(1);
  };

  let result: any[] = [];
  try {
    result = await run(true);
  } catch (err) {
    if (!isMissingColumnError(err, 'expires_at')) throw err;
    result = await run(false);
  }

  if (result.length === 0) {
    return null;
  }

  const row = result[0];

  return {
    // Core identification
    id: row.id,
    vin: row.vin,
    slug: row.slug,
    
    // Owner/Seller
    userId: row.userId,
    postedByRole: row.postedByRole,
    
    // Basic info
    make: row.make,
    model: row.model,
    year: row.year,
    trim: row.trim,
    description: row.description,
    
    // Pricing
    price: row.price,
    currency: row.currency,
    isNegotiable: row.isNegotiable,
    
    // AI Pricing Insights
    aiEstimatedPrice: row.aiEstimatedPrice,
    aiPriceMin: row.aiPriceMin,
    aiPriceMax: row.aiPriceMax,
    aiConfidenceScore: row.aiConfidenceScore,
    aiReasoning: row.aiReasoning,
    fairValue: row.fairValue,
    estimateMin: row.estimateMin,
    estimateMax: row.estimateMax,
    priceTrend: row.priceTrend,
    
    // Quality & Engagement
    qiScore: row.qiScore,
    viewCount: row.viewCount,
    favouriteCount: row.favouriteCount,
    superlikeCount: row.superlikeCount,
    heatScore: row.heatScore,
    
    // Specifications
    bodyType: row.bodyType,
    fuelType: row.fuelType,
    transmission: row.transmission,
    specs: row.specs,
    steeringSide: row.steeringSide,
    engineSize: row.engineSize,
    engineType: row.engineType,
    cylinders: row.cylinders,
    powerRange: row.powerRange,
    torque: row.torque,
    fuelEconomy: row.fuelEconomy,
    doors: row.doors,
    seatingCapacity: row.seatingCapacity,
    exteriorColor: row.exteriorColor,
    interiorColor: row.interiorColor,
    mileage: row.mileage,
    
    // Moderation & Lifecycle
    moderationStatus: row.moderationStatus,
    lifecycleStatus: row.lifecycleStatus,
    isPublic: row.isPublic,
    exportStatus: row.exportStatus,
    warrantyType: row.warrantyType,
    sellerType: row.sellerType,
    rejectionReason: row.rejectionReason,
    
    // Location
    emirate: row.emirate,
    city: row.city,
    
    // Media
    thumbnail: row.thumbnail,
    images: row.images ?? [],
    videoUrl: row.videoUrl,
    
    // Features & Notes
    technicalFeatures: (row.technicalFeatures ?? {}) as TechnicalFeatures,
    extras: (row.extras ?? []) as string[],
    specialNotes: (row.specialNotes ?? {}) as SpecialNotes,
    badges: (row.badges ?? []) as string[],
    tags: (row.tags ?? []) as string[],
    
    // Partner info (denormalized)
    partnerId: row.partnerId,
    partnerBrandName: row.partnerBrandName,
    partnerVerified: row.partnerVerified ?? false,
    isBlackMember: row.isBlackMember,
    
    // Timestamps
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lastEditedAt: row.lastEditedAt,
    submittedAt: row.submittedAt,
    approvedAt: row.approvedAt,
    lastModeratedAt: row.lastModeratedAt,
    needsRemoderation: row.needsRemoderation ?? false,
    publishedAt: row.publishedAt,
    expiresAt: row.expiresAt,
    extensionCount: row.extensionCount ?? 0,
    extensionHistory: (row.extensionHistory ?? []) as any,
    lastExtendedAt: row.lastExtendedAt,
    deletedAt: row.deletedAt,
  };
}

/**
 * Get detailed listing data by slug
 * Useful for SEO-friendly URLs
 */
export async function getListingDetailedBySlug(slug: string): Promise<CarDetailedData | null> {
  // First get the ID from the slug
  const idResult = await db
    .select({ id: carListing.id })
    .from(carListing)
    .where(eq(carListing.slug, slug))
    .limit(1);

  if (idResult.length === 0) {
    return null;
  }

  return getListingDetailed(idResult[0].id);
}
