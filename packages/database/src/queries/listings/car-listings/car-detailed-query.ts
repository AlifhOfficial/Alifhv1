/**
 * Car Detailed Listing Query - Production
 * 
 * Fetches comprehensive listing data for detailed view pages.
 * Includes all specifications, features, pricing insights, and partner info.
 * 
 * @module queries/listings/car-detailed-query
 */

import { eq, sql, SQL } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { carListing } from '../../../schema/listing';
import { isPublicSql } from './sql-fragments';
import { isMissingColumnError } from './error-utils';

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
  ownerRemarks?: string[];
  serviceHistory?: boolean;
  singleOwner?: boolean;
  accidentFree?: boolean;
  underWarranty?: boolean;
  registeredUntil?: string;
  customizations?: string[];
  recentServices?: string[];
  knownIssues?: string[];
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  suspendedByName?: string;
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
  id: string;
  vin: string | null;
  vinVisibility: 'public' | 'private';
  slug: string | null;
  userId: string;
  postedByRole: 'user' | 'staff';
  postedByStaffId: string | null;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  condition: 'new' | 'used';
  description: string | null;
  price: number;
  currency: string;
  isNegotiable: boolean;
  viewCount: number;
  favouriteCount: number;
  superlikeCount: number;
  heatScore: number;
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
  moderationStatus: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected';
  lifecycleStatus: 'active' | 'archived' | 'sold' | 'expired' | 'deleted';
  isPublic: boolean;
  exportStatus: string;
  warrantyType: string | null;
  sellerType: string;
  rejectionReason: string | null;
  emirate: string;
  city: string | null;
  thumbnail: string | null;
  images: string[];
  videoUrl: string | null;
  technicalFeatures: TechnicalFeatures;
  extras: string[];
  specialNotes: SpecialNotes;
  badges: string[];
  tags: string[];
  partnerId: string | null;
  partnerBrandName: string | null;
  partnerVerified: boolean;
  isBlkListing: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastEditedAt: Date;
  submittedAt: Date | null;
  approvedAt: Date | null;
  lastModeratedAt: Date | null;
  needsRemoderation: boolean;
  publishedAt: Date | null;
  originalPublishedAt: Date | null;
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
 * Build select fields for detailed query
 * Optimized: Single table query, no joins - seller data fetched separately
 */
function buildDetailedSelectFields(includeExpiry: boolean) {
  return {
    id: carListing.id,
    vin: carListing.vin,
    vinVisibility: carListing.vinVisibility,
    slug: carListing.slug,
    userId: carListing.userId,
    postedByRole: carListing.postedByRole,
    postedByStaffId: carListing.postedByStaffId,
    make: carListing.make,
    model: carListing.model,
    year: carListing.year,
    trim: carListing.trim,
    condition: carListing.condition,
    description: carListing.description,
    price: carListing.price,
    currency: carListing.currency,
    isNegotiable: carListing.isNegotiable,
    viewCount: carListing.viewCount,
    favouriteCount: carListing.favouriteCount,
    superlikeCount: carListing.superlikeCount,
    heatScore: carListing.heatScore,
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
    moderationStatus: carListing.moderationStatus,
    lifecycleStatus: carListing.lifecycleStatus,
    isPublic: isPublicSql(),
    exportStatus: carListing.exportStatus,
    warrantyType: carListing.warrantyType,
    sellerType: carListing.sellerType,
    rejectionReason: carListing.rejectionReason,
    emirate: carListing.emirate,
    city: carListing.city,
    thumbnail: carListing.thumbnail,
    images: carListing.images,
    videoUrl: carListing.videoUrl,
    technicalFeatures: carListing.technicalFeatures,
    extras: carListing.extras,
    specialNotes: carListing.specialNotes,
    badges: carListing.badges,
    tags: carListing.tags,
    partnerId: carListing.partnerId,
    partnerBrandName: carListing.partnerBrandName,
    partnerVerified: carListing.partnerVerified,
    isBlkListing: carListing.isBlkListing,
    createdAt: carListing.createdAt,
    updatedAt: carListing.updatedAt,
    lastEditedAt: carListing.lastEditedAt,
    submittedAt: carListing.submittedAt,
    approvedAt: carListing.approvedAt,
    lastModeratedAt: carListing.lastModeratedAt,
    needsRemoderation: carListing.needsRemoderation,
    publishedAt: carListing.publishedAt,
    originalPublishedAt: carListing.originalPublishedAt,
    expiresAt: includeExpiry ? carListing.expiresAt : sql<null>`null`,
    extensionCount: includeExpiry ? carListing.extensionCount : sql<number>`0`,
    extensionHistory: includeExpiry ? carListing.extensionHistory : sql<any>`'[]'::jsonb`,
    lastExtendedAt: includeExpiry ? carListing.lastExtendedAt : sql<null>`null`,
    deletedAt: carListing.deletedAt,
  } as const;
}

/**
 * Transform database row to CarDetailedData with defaults
 */
function transformToDetailedData(row: any): CarDetailedData {
  return {
    ...row,
    // Apply defaults for nullable fields
    images: row.images ?? [],
    technicalFeatures: row.technicalFeatures ?? {},
    extras: row.extras ?? [],
    specialNotes: row.specialNotes ?? {},
    badges: row.badges ?? [],
    tags: row.tags ?? [],
    partnerVerified: row.partnerVerified ?? false,
    needsRemoderation: row.needsRemoderation ?? false,
    extensionCount: row.extensionCount ?? 0,
    extensionHistory: row.extensionHistory ?? [],
  };
}

/**
 * Execute detailed listing query with where clause
 * Optimized: Single table query with primary key lookup - no joins
 */
async function executeDetailedQuery(whereClause: SQL): Promise<CarDetailedData | null> {
  const runQuery = (includeExpiry: boolean) => 
    db.select(buildDetailedSelectFields(includeExpiry))
      .from(carListing)
      .where(whereClause)
      .limit(1);

  let result: any[];
  try {
    result = await runQuery(true);
  } catch (err) {
    if (!isMissingColumnError(err, 'expires_at')) throw err;
    result = await runQuery(false);
  }

  return result.length > 0 ? transformToDetailedData(result[0]) : null;
}

/**
 * Get detailed listing data by ID
 */
export async function getListingDetailed(listingId: string): Promise<CarDetailedData | null> {
  return executeDetailedQuery(eq(carListing.id, listingId));
}

/**
 * Get detailed listing data by slug
 * Single query instead of 2 separate queries
 * Note: Not cached by slug - slug lookups are less common, use ID when possible
 */
export async function getListingDetailedBySlug(slug: string): Promise<CarDetailedData | null> {
  return executeDetailedQuery(eq(carListing.slug, slug));
}
