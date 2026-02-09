/**
 * Seller Contact Shared Styles
 */

import { StyleSheet, Dimensions } from 'react-native';
import { Spacing, Radius, Typography } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// 16:9 aspect ratio for hero image - cinematic look
const HERO_IMAGE_HEIGHT = SCREEN_WIDTH * (9 / 16);

export const styles = StyleSheet.create({
  // Hero Image - Full-width cinematic cover (edge-to-edge)
  heroImageContainer: {
    marginHorizontal: -Spacing.lg,
    // marginTop is set dynamically to -(topInset + Spacing.lg)
    marginBottom: Spacing.md,
    height: HERO_IMAGE_HEIGHT,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_IMAGE_HEIGHT * 0.6,
  },

  // Hero Section
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
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    ...Typography.headingLarge,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  sellerName: {
    ...Typography.headingMedium,
    flexShrink: 1,
  },
  metaText: {
    ...Typography.supportingSmall,
    marginTop: 2,
  },
  tierPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  tierText: {
    ...Typography.labelBadge,
    fontSize: 9,
    letterSpacing: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingValue: {
    ...Typography.dataSmall,
  },
  reviewCount: {
    ...Typography.supportingSmall,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  memberText: {
    ...Typography.supportingSmall,
  },

  // CTA Row
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
  primaryCtaText: {
    ...Typography.buttonMedium,
    color: '#FFF',
  },
  secondaryCta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  secondaryCtaText: {
    ...Typography.buttonMedium,
  },
  phoneText: {
    ...Typography.dataMedium,
  },

  // Section
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.labelMedium,
    marginBottom: Spacing.xs,
  },
  descriptionText: {
    ...Typography.bodyMedium,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    gap: Spacing.md,
    marginBottom: Spacing.md,
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
  statLabel: {
    ...Typography.labelSmall,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    ...Typography.dataMedium,
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  tagText: {
    ...Typography.chip,
  },

  // Listings
  listingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  listingItem: {
    width: '47%',
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  listingThumb: {
    aspectRatio: 16 / 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  listingTitle: {
    ...Typography.dataMini,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  listingModel: {
    ...Typography.supportingSmall,
    paddingHorizontal: Spacing.sm,
    marginTop: 2,
  },
  listingPrice: {
    ...Typography.dataMedium,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
    paddingTop: 6,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  viewAllBtnText: {
    ...Typography.buttonMedium,
  },

  // Financing Calculator
  emiCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emiCompactLabel: {
    ...Typography.supportingSmall,
  },
  emiCompactValue: {
    ...Typography.priceTag,
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  calcLabel: {
    ...Typography.supportingSmall,
    width: 40,
  },
  calcOptions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flex: 1,
  },
  calcChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  calcChipText: {
    ...Typography.chip,
  },
  calcDisclaimer: {
    ...Typography.supportingSmall,
    marginTop: Spacing.xs,
  },

  // Location
  locationSection: {
    gap: Spacing.md,
  },
  locationTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  locationText: {
    ...Typography.bodyMedium,
    flex: 1,
  },
  locationActionsCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  compactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  compactBtnText: {
    ...Typography.buttonSmall,
  },
});
