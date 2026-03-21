/**
 * Seller Profile Card Component - Revvup Design System
 * 
 * Displays partner or user seller information on the listing detail page sidebar.
 * Uses data from existing getDealerBaseProfile, calculatePartnerStats, and getUserProfileByUserId queries.
 * 
 * Image handling:
 * - Uses getPublicUrl from @/utils for R2 storage key resolution
 * - Partner logos/heroes use BrandAvatar and BrandHero components
 * - User avatars use UserAvatar component
 * 
 * ============================================================================
 * GOOGLE REVIEWS INTEGRATION - V1 (Minimal Approach)
 * ============================================================================
 * 
 * Current State:
 * - googleRating and googleReviewCount fields already exist in partner_car_dealer table
 * - These are static values, manually entered
 * 
 * V1 Goal:
 * - Auto-sync rating + review count every 15 days
 * - No individual review display (just aggregate numbers)
 * - Centralized approach (no partner burden)
 * 
 * See partner-profile-card.tsx for full implementation details.
 */

'use client';

import { cn } from '@/utils';
import type { SellerData } from '@/hooks/listings';
import { PartnerProfileCard } from './partner-profile-card';
import { UserProfileCard } from './user-profile-card';
import { SellerProfileCardSkeleton } from './seller-profile-card-skeleton';

interface SellerProfileCardProps {
  sellerData: SellerData;
  className?: string;
}

function SellerProfileCardComponent({ sellerData, className }: SellerProfileCardProps) {
  if (sellerData.type === 'partner') return <PartnerProfileCard sellerData={sellerData} />;
  return <UserProfileCard sellerData={sellerData} />;
}

// Attach skeleton as static property
export const SellerProfileCard = Object.assign(SellerProfileCardComponent, {
  Skeleton: SellerProfileCardSkeleton,
});

// Re-export components for direct imports if needed
export { PartnerProfileCard } from './partner-profile-card';
export { UserProfileCard } from './user-profile-card';
export { SellerProfileCardSkeleton } from './seller-profile-card-skeleton';
