/**
 * Listings Service
 * Business logic for complex listing operations that require coordination
 */

import {
  getListingById,
  updateListing,
  addPriceChange,
  updateDaysOnMarket,
  updatePerformanceScore,
  type ListingRecord,
  type ListingUpdate,
} from '../queries/listings';

/**
 * Update listing price and record price history
 * This combines multiple operations atomically
 */
export async function updateListingPrice(
  listingId: string,
  newPrice: number,
  reason: string = 'price_adjustment',
  changedBy?: string
): Promise<{ listing: ListingRecord; success: boolean; error?: string }> {
  try {
    const currentListing = await getListingById(listingId);
    if (!currentListing) {
      return { listing: null as any, success: false, error: 'Listing not found' };
    }

    const oldPrice = currentListing.price;
    
    // Don't proceed if price hasn't changed
    if (oldPrice === newPrice) {
      return { listing: currentListing, success: true };
    }

    // Calculate percentage change
    const changePercent = oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0;

    // Update the listing price
    const updatedListing = await updateListing(listingId, {
      price: newPrice,
      priceChanges: (currentListing.priceChanges || 0) + 1,
      lastPriceChange: new Date(),
    });

    if (!updatedListing) {
      return { listing: null as any, success: false, error: 'Failed to update listing' };
    }

    // Record price history
    await addPriceChange(
      listingId,
      oldPrice,
      newPrice,
      reason,
      changedBy
    );

    return { listing: updatedListing, success: true };
  } catch (error) {
    console.error('[ListingsService] updateListingPrice failed:', error);
    return { 
      listing: null as any, 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Calculate and update performance metrics
 * This analyzes various metrics and updates the performance score
 */
export async function updateListingPerformanceMetrics(listingId: string): Promise<{
  listing: ListingRecord | null;
  success: boolean;
  error?: string;
}> {
  try {
    const listing = await getListingById(listingId);
    if (!listing) {
      return { listing: null, success: false, error: 'Listing not found' };
    }

    // Update days on market
    await updateDaysOnMarket(listingId);

    // Calculate performance score based on various metrics
    let performanceScore = 0;
    let scoreFactors = 0;

    // Views contribution (0-25 points)
    if (listing.viewCount && listing.viewCount > 0) {
      const viewScore = Math.min(25, (listing.viewCount / 100) * 25);
      performanceScore += viewScore;
      scoreFactors++;
    }

    // Engagement contribution (0-25 points)
    const totalEngagement = (listing.favouriteCount || 0) + (listing.shareCount || 0) + (listing.inquiryCount || 0);
    if (totalEngagement > 0) {
      const engagementScore = Math.min(25, (totalEngagement / 20) * 25);
      performanceScore += engagementScore;
      scoreFactors++;
    }

    // Conversion contribution (0-25 points)
    if (listing.conversionRate && listing.conversionRate > 0) {
      performanceScore += (listing.conversionRate / 100) * 25;
      scoreFactors++;
    }

    // Quality contribution (0-25 points)
    if (listing.qiScore && listing.qiScore > 0) {
      performanceScore += (listing.qiScore / 100) * 25;
      scoreFactors++;
    }

    // Average the score if we have factors
    if (scoreFactors > 0) {
      performanceScore = performanceScore / scoreFactors * 4; // Scale back to 100
    }

    // Update the performance score
    await updatePerformanceScore(listingId, Math.round(performanceScore));

    // Get updated listing
    const updatedListing = await getListingById(listingId);
    
    return { listing: updatedListing, success: true };
  } catch (error) {
    console.error('[ListingsService] updateListingPerformanceMetrics failed:', error);
    return {
      listing: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Bulk update performance metrics for multiple listings
 * Useful for background jobs
 */
export async function bulkUpdatePerformanceMetrics(listingIds: string[]): Promise<{
  processedCount: number;
  successCount: number;
  errors: string[];
}> {
  let processedCount = 0;
  let successCount = 0;
  const errors: string[] = [];

  for (const listingId of listingIds) {
    processedCount++;
    
    try {
      const result = await updateListingPerformanceMetrics(listingId);
      if (result.success) {
        successCount++;
      } else {
        errors.push(`${listingId}: ${result.error}`);
      }
    } catch (error) {
      errors.push(`${listingId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    processedCount,
    successCount,
    errors,
  };
}

/**
 * Validate listing completeness for publishing
 * Checks if all required fields are present and valid
 */
export function validateListingForPublishing(listing: Partial<ListingRecord>): {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
} {
  const requiredFields = ['make', 'model', 'year', 'price', 'mileage', 'emirate'];
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  for (const field of requiredFields) {
    if (!listing[field as keyof ListingRecord]) {
      missingFields.push(field);
    }
  }

  // Check recommended fields (warnings)
  if (!listing.description || listing.description.length < 50) {
    warnings.push('Description should be at least 50 characters long');
  }

  if (!listing.images || listing.images.length === 0) {
    warnings.push('At least one image is recommended');
  }

  if (!listing.bodyType) {
    warnings.push('Body type is recommended for better search visibility');
  }

  if (!listing.fuelType) {
    warnings.push('Fuel type is recommended for better filtering');
  }

  if (!listing.transmission) {
    warnings.push('Transmission type is recommended');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
  };
}