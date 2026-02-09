/**
 * Seller Contact Shared Styles
 * 
 * Clean, minimal styles following listings component patterns.
 * Uses theme constants only - no Typography spreads.
 */

import { StyleSheet, Dimensions } from 'react-native';
import { Spacing, Radius } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_IMAGE_HEIGHT = SCREEN_WIDTH * (9 / 16);

// ============================================================================
// CONSTANTS
// ============================================================================

export const AVATAR_SIZE = 56;
export const LOGO_SIZE = 64;
export const ICON_SIZE = 20;
export const ICON_SIZE_SM = 16;
export const ICON_SIZE_XS = 14;

// ============================================================================
// STYLES
// ============================================================================

export const styles = StyleSheet.create({
  // ─────────────────────────────────────────────────────
  // Hero Image - Full-width cinematic cover
  // ─────────────────────────────────────────────────────
  heroImageContainer: {
    marginHorizontal: -Spacing.lg,
    marginBottom: Spacing.md,
    height: HERO_IMAGE_HEIGHT,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  // ─────────────────────────────────────────────────────
  // Hero Section - Seller info with avatar
  // ─────────────────────────────────────────────────────
  heroSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  tierBadge: {
    paddingHorizontal: Spacing.sm - 2,
    paddingVertical: 2,
    borderRadius: Radius.none,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },

  // ─────────────────────────────────────────────────────
  // CTA / Actions Row
  // ─────────────────────────────────────────────────────
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.full,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  phoneLink: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },

  // ─────────────────────────────────────────────────────
  // Section Container
  // ─────────────────────────────────────────────────────
  section: {
    gap: Spacing.md,
  },

  // ─────────────────────────────────────────────────────
  // Stats Grid - Private seller stats
  // ─────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  statItem: {
    width: '45%',
    gap: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // ─────────────────────────────────────────────────────
  // Tags Row
  // ─────────────────────────────────────────────────────
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },

  // ─────────────────────────────────────────────────────
  // Seller Listings Grid
  // ─────────────────────────────────────────────────────
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  listingCard: {
    width: '47%',
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  listingThumb: {
    aspectRatio: 16 / 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  listingThumbImage: {
    width: '100%',
    height: '100%',
  },
  listingBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm - 2,
    paddingVertical: 2,
    borderRadius: Radius.none,
  },
  listingContent: {
    padding: Spacing.sm,
    gap: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },

  // ─────────────────────────────────────────────────────
  // Financing Calculator
  // ─────────────────────────────────────────────────────
  emiDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  calcLabel: {
    width: 40,
  },
  calcOptions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flex: 1,
  },
  calcChip: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },

  // ─────────────────────────────────────────────────────
  // Location Section
  // ─────────────────────────────────────────────────────
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  locationText: {
    flex: 1,
    gap: 2,
  },
  locationActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});
