/**
 * AI Moderation Database Operations
 * 
 * Updates listing moderation status based on AI moderation results.
 * Tracks AI decisions in specialNotes for audit trail.
 * 
 * @module queries/listings/car-listings/mutations/ai-moderation
 */

import { eq } from 'drizzle-orm';
import { db } from '../../../../dbclient';
import { carListing } from '../../../../schema/listing';
import { invalidateListingDetail, invalidateSearchCaches } from '../../../../caches/invalidation';
import type { SpecialNotes } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface AIModerationUpdateInput {
  decision: 'approve' | 'flag' | 'reject';
  confidence: number;
  flags: Array<{ code: string; severity: string; message: string }>;
  reasoning: string;
  processingTimeMs: number;
  model: string;
}

export interface AIModerationResult {
  success: boolean;
  newModerationStatus: string;
  autoApproved: boolean;
  autoRejected: boolean;
}

// ============================================================================
// UPDATE FUNCTIONS
// ============================================================================

/**
 * Update a listing's moderation status based on AI decision
 * 
 * Decision mapping:
 * - approve (high confidence) -> moderationStatus: 'approved', auto-publish
 * - approve (low confidence) -> moderationStatus: 'submitted', manual review
 * - flag -> moderationStatus: 'submitted', manual review
 * - reject (high confidence) -> moderationStatus: 'rejected', auto-reject
 * - reject (low confidence) -> moderationStatus: 'submitted', manual review
 */
export async function updateListingAIModeration(
  listingId: string,
  aiResult: AIModerationUpdateInput
): Promise<AIModerationResult> {
  const now = new Date();
  
  // Determine thresholds
  const AUTO_APPROVE_THRESHOLD = 0.85;
  const AUTO_REJECT_THRESHOLD = 0.9;
  const hasHighSeverityFlag = aiResult.flags.some(f => f.severity === 'high');
  
  // Determine final status
  let newModerationStatus: string;
  let autoApproved = false;
  let autoRejected = false;
  let lifecycleStatus: string | undefined;
  let publishedAt: Date | undefined;
  let expiresAt: Date | undefined;
  let rejectionReason: string | null = null;
  
  if (aiResult.decision === 'approve' && aiResult.confidence >= AUTO_APPROVE_THRESHOLD && !hasHighSeverityFlag) {
    // Auto-approve
    newModerationStatus = 'approved';
    autoApproved = true;
    publishedAt = now;
    // 24-day listing duration
    expiresAt = new Date(now.getTime() + 24 * 24 * 60 * 60 * 1000);
  } else if (aiResult.decision === 'reject' && aiResult.confidence >= AUTO_REJECT_THRESHOLD) {
    // Auto-reject
    newModerationStatus = 'rejected';
    autoRejected = true;
    lifecycleStatus = 'archived';
    rejectionReason = `AI Auto-Reject: ${aiResult.reasoning}`;
  } else {
    // Flag for manual review
    newModerationStatus = 'submitted';
  }
  
  try {
    // Get current listing to merge specialNotes
    const [current] = await db
      .select({ specialNotes: carListing.specialNotes })
      .from(carListing)
      .where(eq(carListing.id, listingId))
      .limit(1);
    
    // Build AI moderation metadata
    const aiModerationMeta = {
      decision: aiResult.decision,
      confidence: aiResult.confidence,
      flags: aiResult.flags,
      reasoning: aiResult.reasoning,
      processingTimeMs: aiResult.processingTimeMs,
      model: aiResult.model,
      processedAt: now.toISOString(),
      autoApproved,
      autoRejected,
    };
    
    // Merge with existing specialNotes
    const existingNotes = (current?.specialNotes as SpecialNotes) || {};
    const updatedNotes: SpecialNotes = {
      ...existingNotes,
      aiModeration: aiModerationMeta,
    };
    
    // Build update data
    const updateData: Record<string, any> = {
      moderationStatus: newModerationStatus,
      specialNotes: updatedNotes,
      lastModeratedAt: now,
      needsRemoderation: false,
    };
    
    if (autoApproved) {
      updateData.approvedAt = now;
      updateData.publishedAt = publishedAt;
      updateData.expiresAt = expiresAt;
      updateData.rejectionReason = null;
    }
    
    if (autoRejected) {
      updateData.lifecycleStatus = lifecycleStatus;
      updateData.archivedAt = now;
      updateData.rejectionReason = rejectionReason;
    }
    
    // Execute update
    await db
      .update(carListing)
      .set(updateData)
      .where(eq(carListing.id, listingId));
    
    // Invalidate caches when AI moderation changes listing status
    // This is critical: the listing may have been fetched (and cached)
    // with isPublic=false while in 'submitted' status. After auto-approval,
    // the cached result becomes stale and would return 404.
    if (autoApproved || autoRejected) {
      invalidateListingDetail(listingId);
      invalidateSearchCaches();
      console.log(`[AI Moderation] Cache invalidated for ${listingId} (${autoApproved ? 'auto-approved' : 'auto-rejected'})`);
    }
    
    return {
      success: true,
      newModerationStatus,
      autoApproved,
      autoRejected,
    };
  } catch (error) {
    console.error('[updateListingAIModeration] Error:', error);
    return {
      success: false,
      newModerationStatus: 'submitted',
      autoApproved: false,
      autoRejected: false,
    };
  }
}

/**
 * Check if a listing should skip AI moderation
 * (e.g., already moderated, staff listing, etc.)
 */
export async function shouldSkipAIModeration(listingId: string): Promise<boolean> {
  try {
    const [listing] = await db
      .select({
        postedByRole: carListing.postedByRole,
        moderationStatus: carListing.moderationStatus,
      })
      .from(carListing)
      .where(eq(carListing.id, listingId))
      .limit(1);
    
    if (!listing) return true;
    
    // Skip if staff listing (already auto-approved)
    if (listing.postedByRole === 'staff') return true;
    
    // Skip if already approved or rejected
    if (listing.moderationStatus === 'approved' || listing.moderationStatus === 'rejected') {
      return true;
    }
    
    return false;
  } catch {
    return true; // Skip on error
  }
}
