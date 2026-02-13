/**
 * Widget Configurations
 *
 * Ordered feed with varied layouts & sizing:
 *
 *  1. BLK Signature Collection   — banner  (dark, premium opener)
 *  2. Revvup First               — brandGrid (partner brand logos)
 *  3. Audi Collection            — brand   (partner spotlight)
 *  4. German Excellence          — grid    (2-col grid)
 *  5. New on Revvup              — slider  (horizontal scroll)
 *  6. Moving Fast                — banner  (trending hero)
 *  7. Hidden Gems                — grid    (least viewed)
 *  8. Japanese Icons             — brand   (brand spotlight)
 *  9. SUV & 4×4                  — slider  (compact scroll)
 * 10. Been Around                — slider  (oldest listings)
 *
 * All blurred backgrounds. bodyType values MUST be lowercase.
 */

import type { WidgetConfig } from './types';

// ============================================================================
// CONFIGS
// ============================================================================

export const WIDGET_CONFIGS: WidgetConfig[] = [
  // ─────────────────────────────────────────
  // 1. BLK SIGNATURE COLLECTION — banner
  // ─────────────────────────────────────────
  {
    id: 'blk-signature',
    title: 'BLK Signature',
    subtitle: 'The black-tier collection',
    layout: 'banner',
    emoji: '🖤',
    colorLight: '#0D0D0D',
    colorDark: '#080808',
    titleColorLight: '#FAFAFA',
    titleColorDark: '#FAFAFA',
    searchParams: {
      isBlkListing: true,
      limit: 8,
      sortBy: 'popular',
    },
  },

  // ─────────────────────────────────────────
  // 2. REVVUP FIRST — brandGrid
  // ─────────────────────────────────────────
  {
    id: 'revvup-first',
    title: 'Revvup First',
    subtitle: 'Our founding partners',
    layout: 'brandGrid',
    emoji: '⚡',
    colorLight: '#111111',
    colorDark: '#0A0A0A',
    titleColorLight: '#FAFAFA',
    titleColorDark: '#FAFAFA',
    searchParams: null,
    brands: [], // Populated at runtime from partner API
  },

  // ─────────────────────────────────────────
  // 3. AUDI COLLECTION — brand
  // ─────────────────────────────────────────
  {
    id: 'audi-collection',
    title: 'Audi Collection',
    layout: 'brand',
    colorLight: '#1A1A1A',
    colorDark: '#0F0F0F',
    titleColorLight: '#FAFAFA',
    titleColorDark: '#FAFAFA',
    brand: {
      name: 'Audi',
      logo: 'https://cdn.alifh.ae/brands/audi.png',
    },
    searchParams: {
      make: ['Audi'],
      limit: 10,
      sortBy: 'popular',
    },
  },

  // ─────────────────────────────────────────
  // 4. GERMAN EXCELLENCE — grid
  // ─────────────────────────────────────────
  {
    id: 'german-excellence',
    title: 'German Excellence',
    subtitle: 'BMW · Mercedes · Audi · Porsche',
    layout: 'grid',
    emoji: '🇩🇪',
    colorLight: '#1A2744',
    colorDark: '#0F1A30',
    titleColorLight: '#E0ECFF',
    titleColorDark: '#C5D8F5',
    searchParams: {
      make: ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Volkswagen'],
      limit: 6,
      sortBy: 'popular',
    },
  },

  // ─────────────────────────────────────────
  // 5. NEW ON REVVUP — slider
  // ─────────────────────────────────────────
  {
    id: 'new-on-revvup',
    title: 'New on Revvup',
    subtitle: 'Just listed',
    layout: 'slider',
    emoji: '✨',
    colorLight: '#1C1917',
    colorDark: '#141210',
    titleColorLight: '#FDE68A',
    titleColorDark: '#FCD34D',
    searchParams: {
      sortBy: 'newest',
      limit: 10,
    },
  },

  // ─────────────────────────────────────────
  // 6. MOVING FAST — banner
  // ─────────────────────────────────────────
  {
    id: 'moving-fast',
    title: 'Moving Fast',
    subtitle: 'Trending in the UAE',
    layout: 'banner',
    emoji: '🔥',
    colorLight: '#1C1C1C',
    colorDark: '#111111',
    titleColorLight: '#FAFAFA',
    titleColorDark: '#F5F5F5',
    searchParams: {
      sortBy: 'popular',
      limit: 8,
    },
  },

  // ─────────────────────────────────────────
  // 7. HIDDEN GEMS — grid
  // ─────────────────────────────────────────
  {
    id: 'hidden-gems',
    title: 'Hidden Gems',
    subtitle: 'Overlooked, underpriced',
    layout: 'grid',
    emoji: '💎',
    colorLight: '#1A1A2E',
    colorDark: '#12122A',
    titleColorLight: '#C4B5FD',
    titleColorDark: '#A78BFA',
    searchParams: {
      sortBy: 'oldest',
      limit: 6,
    },
  },

  // ─────────────────────────────────────────
  // 8. JAPANESE ICONS — brand
  // ─────────────────────────────────────────
  {
    id: 'japanese-icons',
    title: 'Toyota Collection',
    layout: 'brand',
    colorLight: '#1A1A1A',
    colorDark: '#0F0F0F',
    titleColorLight: '#FAFAFA',
    titleColorDark: '#FAFAFA',
    brand: {
      name: 'Toyota',
      logo: 'https://cdn.alifh.ae/brands/toyota.png',
    },
    searchParams: {
      make: ['Toyota'],
      limit: 10,
      sortBy: 'popular',
    },
  },

  // ─────────────────────────────────────────
  // 9. SUV & 4×4 — slider
  // ─────────────────────────────────────────
  {
    id: 'suv-collection',
    title: 'SUV & 4×4',
    subtitle: 'Built for the terrain',
    layout: 'slider',
    emoji: '🏔️',
    colorLight: '#1E293B',
    colorDark: '#141C28',
    titleColorLight: '#CBD5E1',
    titleColorDark: '#94A3B8',
    searchParams: {
      bodyType: ['suv'],
      limit: 10,
      sortBy: 'popular',
    },
  },

  // ─────────────────────────────────────────
  // 10. BEEN AROUND — slider
  // ─────────────────────────────────────────
  {
    id: 'been-around',
    title: 'Been Around',
    subtitle: 'Still holding value',
    layout: 'slider',
    emoji: '⏳',
    colorLight: '#27272A',
    colorDark: '#1C1C1F',
    titleColorLight: '#A1A1AA',
    titleColorDark: '#71717A',
    searchParams: {
      sortBy: 'oldest',
      limit: 10,
    },
  },
];
