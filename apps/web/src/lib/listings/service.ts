/**
 * Listings Service Layer
 * 
 * Business logic and workflows for listing operations.
 * Sits between API routes and database queries.
 */

import {
  getListingById,
  updateListing,
  getPartnerById,
} from '@alifh/database';

// ==================== TYPES ====================

interface PublishListingResult {
  success: boolean;
  listing?: any;
  error?: string;
  missingFields?: string[];
}

interface ListingValidationResult {
  isValid: boolean;
  missingFields: string[];
  errors: string[];
}

// ==================== VALIDATION ====================

/**
 * Validate listing has all required fields for publishing
 */
export function validateListingCompleteness(listing: any): ListingValidationResult {
  const errors: string[] = [];
  const missingFields: string[] = [];
  
  // Required text fields
  const requiredFields = [
    { field: 'title', label: 'Title' },
    { field: 'make', label: 'Make' },
    { field: 'model', label: 'Model' },
    { field: 'description', label: 'Description' },
    { field: 'emirate', label: 'Emirate/Location' },
  ];
  
  requiredFields.forEach(({ field, label }) => {
    if (!listing[field] || listing[field].trim() === '') {
      missingFields.push(field);
      errors.push(`${label} is required`);
    }
  });
  
  // Required numeric fields
  const requiredNumbers = [
    { field: 'year', label: 'Year', min: 1900, max: new Date().getFullYear() + 1 },
    { field: 'price', label: 'Price', min: 0 },
    { field: 'mileage', label: 'Mileage', min: 0 },
  ];
  
  requiredNumbers.forEach(({ field, label, min, max }) => {
    if (listing[field] === null || listing[field] === undefined) {
      missingFields.push(field);
      errors.push(`${label} is required`);
    } else if (typeof listing[field] !== 'number') {
      errors.push(`${label} must be a number`);
    } else if (listing[field] < min) {
      errors.push(`${label} must be at least ${min}`);
    } else if (max && listing[field] > max) {
      errors.push(`${label} must be at most ${max}`);
    }
  });
  
  // Required enum fields
  const requiredEnums = [
    { field: 'condition', label: 'Condition', values: ['new', 'used', 'certified'] },
    { field: 'bodyType', label: 'Body Type' },
    { field: 'fuelType', label: 'Fuel Type' },
    { field: 'transmission', label: 'Transmission' },
  ];
  
  requiredEnums.forEach(({ field, label, values }) => {
    if (!listing[field]) {
      missingFields.push(field);
      errors.push(`${label} is required`);
    } else if (values && !values.includes(listing[field])) {
      errors.push(`${label} must be one of: ${values.join(', ')}`);
    }
  });
  
  // Must have at least one image
  if (!listing.images || !Array.isArray(listing.images) || listing.images.length === 0) {
    missingFields.push('images');
    errors.push('At least one image is required');
  }
  
  // Optional but recommended validations
  if (listing.description && listing.description.length < 50) {
    errors.push('Description should be at least 50 characters for better visibility');
  }
  
  if (listing.images && listing.images.length < 3) {
    errors.push('At least 3 images are recommended for better engagement');
  }
  
  return {
    isValid: missingFields.length === 0 && errors.length === 0,
    missingFields,
    errors,
  };
}

/**
 * Generate SEO-friendly slug from listing data
 */
export function generateListingSlug(listing: any): string {
  const parts = [
    listing.year,
    listing.make,
    listing.model,
    listing.trim || '',
  ].filter(Boolean);
  
  const base = parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // Add short ID suffix for uniqueness
  const suffix = listing.id.slice(0, 8);
  
  return `${base}-${suffix}`;
}

// ==================== WORKFLOWS ====================

/**
 * Publish a listing workflow
 * 
 * Steps:
 * 1. Verify listing exists
 * 2. Verify partner ownership
 * 3. Validate listing completeness
 * 4. Check current status
 * 5. Generate slug if needed
 * 6. Update to published status
 * 7. Set published timestamp
 * 8. Optional: Send notifications
 * 
 * @param listingId - The listing ID to publish
 * @param partnerId - The partner requesting publication
 * @returns Result with success status and updated listing or error
 */
export async function publishListing(
  listingId: string,
  partnerId: string
): Promise<PublishListingResult> {
  try {
    // Step 1: Verify listing exists
    const listing = await getListingById(listingId);
    if (!listing) {
      return {
        success: false,
        error: 'Listing not found',
      };
    }
    
    // Step 2: Verify partner ownership
    const partner = await getPartnerById(partnerId);
    if (!partner) {
      return {
        success: false,
        error: 'Partner not found',
      };
    }
    
    if (listing.partnerId !== partner.id) {
      return {
        success: false,
        error: 'You do not have permission to publish this listing',
      };
    }
    
    // Step 3: Check current status
    if (listing.status === 'published') {
      return {
        success: false,
        error: 'Listing is already published',
      };
    }
    
    if (listing.status === 'archived') {
      return {
        success: false,
        error: 'Cannot publish archived listing. Please restore it first.',
      };
    }
    
    if (listing.status === 'sold') {
      return {
        success: false,
        error: 'Cannot publish sold listing',
      };
    }
    
    // Step 4: Validate completeness
    const validation = validateListingCompleteness(listing);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Listing is incomplete',
        missingFields: validation.missingFields,
      };
    }
    
    // Step 5: Generate slug if missing
    const slug = listing.slug || generateListingSlug(listing);
    
    // Step 6-7: Update to published
    const updatedListing = await updateListing(listingId, {
      status: 'published',
      slug,
      publishedAt: new Date(),
    });
    
    if (!updatedListing) {
      return {
        success: false,
        error: 'Failed to update listing status',
      };
    }
    
    // Step 8: Send notifications (future enhancement)
    // TODO: Implement notification system
    // - Notify partner of successful publication
    // - Send to moderation queue if needed
    // - Update search indexes
    // - Send to marketing channels
    
    return {
      success: true,
      listing: updatedListing,
    };
  } catch (error) {
    console.error('[publishListing] Failed:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while publishing the listing',
    };
  }
}

/**
 * Unpublish a listing (return to draft)
 * 
 * @param listingId - The listing ID to unpublish
 * @param partnerId - The partner requesting unpublish
 * @param reason - Optional reason for unpublishing
 */
export async function unpublishListing(
  listingId: string,
  partnerId: string,
  reason?: string
): Promise<PublishListingResult> {
  try {
    const listing = await getListingById(listingId);
    if (!listing) {
      return { success: false, error: 'Listing not found' };
    }
    
    const partner = await getPartnerById(partnerId);
    if (!partner || listing.partnerId !== partner.id) {
      return { success: false, error: 'Permission denied' };
    }
    
    if (listing.status !== 'published') {
      return { success: false, error: 'Listing is not published' };
    }
    
    const updatedListing = await updateListing(listingId, {
      status: 'draft',
      // Keep publishedAt for historical tracking
    });
    
    if (!updatedListing) {
      return { success: false, error: 'Failed to unpublish listing' };
    }
    
    // TODO: Send notification about unpublish
    
    return {
      success: true,
      listing: updatedListing,
    };
  } catch (error) {
    console.error('[unpublishListing] Failed:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Archive a listing
 * 
 * @param listingId - The listing ID to archive
 * @param partnerId - The partner requesting archive
 * @param reason - Optional reason for archiving
 */
export async function archiveListing(
  listingId: string,
  partnerId: string,
  reason?: string
): Promise<PublishListingResult> {
  try {
    const listing = await getListingById(listingId);
    if (!listing) {
      return { success: false, error: 'Listing not found' };
    }
    
    const partner = await getPartnerById(partnerId);
    if (!partner || listing.partnerId !== partner.id) {
      return { success: false, error: 'Permission denied' };
    }
    
    if (listing.status === 'archived') {
      return { success: false, error: 'Listing is already archived' };
    }
    
    const updatedListing = await updateListing(listingId, {
      status: 'archived',
      archivedAt: new Date(),
    });
    
    if (!updatedListing) {
      return { success: false, error: 'Failed to archive listing' };
    }
    
    return {
      success: true,
      listing: updatedListing,
    };
  } catch (error) {
    console.error('[archiveListing] Failed:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Mark listing as sold
 * 
 * @param listingId - The listing ID to mark as sold
 * @param partnerId - The partner confirming the sale
 * @param soldPrice - Optional final sale price
 * @param soldDate - Optional sale date
 */
export async function markListingAsSold(
  listingId: string,
  partnerId: string,
  soldPrice?: number,
  soldDate?: Date
): Promise<PublishListingResult> {
  try {
    const listing = await getListingById(listingId);
    if (!listing) {
      return { success: false, error: 'Listing not found' };
    }
    
    const partner = await getPartnerById(partnerId);
    if (!partner || listing.partnerId !== partner.id) {
      return { success: false, error: 'Permission denied' };
    }
    
    if (listing.status === 'sold') {
      return { success: false, error: 'Listing is already marked as sold' };
    }
    
    const updatedListing = await updateListing(listingId, {
      status: 'sold',
      soldAt: soldDate || new Date(),
      soldPrice: soldPrice || listing.price,
    });
    
    if (!updatedListing) {
      return { success: false, error: 'Failed to mark listing as sold' };
    }
    
    // TODO: Send congratulations notification
    // TODO: Update partner sales statistics
    
    return {
      success: true,
      listing: updatedListing,
    };
  } catch (error) {
    console.error('[markListingAsSold] Failed:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Calculate performance score for a listing
 * Based on engagement metrics, views, and lead quality
 * 
 * Score range: 0-100
 */
export function calculatePerformanceScore(listing: any): number {
  let score = 0;
  
  // View engagement (30 points max)
  const viewScore = Math.min((listing.viewCount || 0) / 100, 1) * 30;
  score += viewScore;
  
  // Lead generation (40 points max)
  const leadScore = (
    (listing.inquiryCount || 0) * 8 +
    (listing.callCount || 0) * 10 +
    (listing.whatsappCount || 0) * 8 +
    (listing.bookingCount || 0) * 14
  );
  score += Math.min(leadScore, 40);
  
  // Social engagement (20 points max)
  const socialScore = (
    (listing.favouriteCount || 0) * 5 +
    (listing.shareCount || 0) * 10
  );
  score += Math.min(socialScore, 20);
  
  // Quality indicators (10 points max)
  let qualityScore = 0;
  if (listing.images && listing.images.length >= 5) qualityScore += 3;
  if (listing.description && listing.description.length > 200) qualityScore += 2;
  if (listing.qiScore && listing.qiScore > 80) qualityScore += 5;
  score += qualityScore;
  
  return Math.min(Math.round(score), 100);
}
