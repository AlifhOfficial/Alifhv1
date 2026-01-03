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
 * Uses controlled parallelism (5 at a time) to balance speed vs DB load
 */
export async function batchUpdateListingAIValuations(
  updates: Array<{ listingId: string; valuation: AIValuationUpdateInput }>,
  options?: { batchSize?: number }
): Promise<{ succeeded: number; failed: number }> {
  const batchSize = options?.batchSize ?? 5;
  let succeeded = 0;
  let failed = 0;
  
  // Process in parallel batches
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(({ listingId, valuation }) => updateListingAIValuation(listingId, valuation))
    );
    
    for (const success of results) {
      if (success) succeeded++;
      else failed++;
    }
  }
  
  return { succeeded, failed };
}
