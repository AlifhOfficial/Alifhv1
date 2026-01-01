/**
 * AI Valuation Update
 * 
 * Updates listing AI pricing fields after valuation is generated.
 * This is separate from regular updates to avoid triggering re-moderation.
 * 
 * @module queries/listings/car-listings/mutations/ai-valuation
 */

import { eq } from 'drizzle-orm';
import { db } from '../../../../dbclient';
import { carListing } from '../../../../schema/listing';

export interface AIValuationUpdateInput {
  fairValue: number;
  estimateMin: number;
  estimateMax: number;
  priceTrend: 'up' | 'down' | 'stable';
  qiScore: number;
  aiConfidenceScore: number;
  valueFactors?: {
    positives?: string[];
    considerations?: string[];
    marketContext?: string;
  };
}

/**
 * Update a listing with AI valuation data
 * Does not trigger re-moderation since it's system-generated data
 */
export async function updateListingAIValuation(
  listingId: string,
  valuation: AIValuationUpdateInput
): Promise<boolean> {
  try {
    const result = await db
      .update(carListing)
      .set({
        fairValue: valuation.fairValue,
        estimateMin: valuation.estimateMin,
        estimateMax: valuation.estimateMax,
        priceTrend: valuation.priceTrend,
        qiScore: valuation.qiScore,
        aiConfidenceScore: valuation.aiConfidenceScore,
        aiValueFactors: valuation.valueFactors || null,
        aiUpdatedAt: new Date(),
      })
      .where(eq(carListing.id, listingId))
      .returning({ id: carListing.id });
    
    return result.length > 0;
  } catch (error) {
    console.error('[updateListingAIValuation] Error:', error);
    return false;
  }
}

/**
 * Batch update multiple listings with AI valuation data
 * Useful for backfilling existing listings
 */
export async function batchUpdateListingAIValuations(
  updates: Array<{ listingId: string; valuation: AIValuationUpdateInput }>
): Promise<{ succeeded: number; failed: number }> {
  let succeeded = 0;
  let failed = 0;
  
  for (const { listingId, valuation } of updates) {
    const success = await updateListingAIValuation(listingId, valuation);
    if (success) {
      succeeded++;
    } else {
      failed++;
    }
  }
  
  return { succeeded, failed };
}
