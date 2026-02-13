/**
 * Home Widget Types
 *
 * Five widget layout variants — each creates a distinct visual rhythm:
 *
 *  • banner    — Full-width hero opener (BLK Signature, big bold)
 *  • brand     — Partner brand card with logo, breathing space, car slider
 *  • brandGrid — Grid of partner brand logos (Revvup First)
 *  • grid      — 2-column grid of car cards
 *  • slider    — Horizontal scroll of compact car thumbnails
 *
 * All blurred backgrounds. Quiet car cards (no loud colors on cards).
 */

import type { SearchParams, ListingCard } from '@/lib/search-api';

// ============================================================================
// LAYOUT SYSTEM
// ============================================================================

export type WidgetLayout = 'banner' | 'brand' | 'brandGrid' | 'grid' | 'slider';

// ============================================================================
// PARTNER BRAND (for brandGrid logos)
// ============================================================================

export interface PartnerBrand {
  id: string;
  slug: string;
  name: string;
  logo: string;
  tier?: string;
  isVerified?: boolean;
}

// ============================================================================
// WIDGET CONFIGURATION
// ============================================================================

export interface WidgetConfig {
  id: string;
  title: string;
  subtitle?: string;
  /** Search params for data fetch — null for static widgets like brandGrid */
  searchParams: SearchParams | null;
  layout: WidgetLayout;
  /** Card background — light mode */
  colorLight: string;
  /** Card background — dark mode */
  colorDark: string;
  /** Emoji icon */
  emoji?: string;
  /** Title text color override — light mode */
  titleColorLight?: string;
  /** Title text color override — dark mode */
  titleColorDark?: string;
  /** Partner brand info (for 'brand' layout) */
  brand?: {
    name: string;
    logo: string;
  };
  /** Array of brands (for 'brandGrid' layout) */
  brands?: PartnerBrand[];
  viewAllParams?: SearchParams;
}

// ============================================================================
// WIDGET DATA STATE
// ============================================================================

export interface WidgetData {
  config: WidgetConfig;
  listings: ListingCard[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface WidgetThumbnailProps {
  listing: ListingCard;
  width: number;
  onPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
}

export interface WidgetContainerProps {
  config: WidgetConfig;
  listings: ListingCard[];
  isLoading: boolean;
  onViewAll?: (config: WidgetConfig) => void;
  onListingPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
  onBrandPress?: (brand: PartnerBrand) => void;
}
