/**
 * Widget Card — 5 Layout Variants
 *
 * All layouts use blurred car-image backgrounds.
 * Car cards themselves are quiet / glass-like.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * BANNER — Full-width hero opener
 * ┌──────────────────────────────────────────────┐
 * │  blurred bg                                  │
 * │  🖤  BLK Signature                           │
 * │      The black-tier collection               │
 * │                                              │
 * │  ┌──────────────────────────────────────────┐│
 * │  │       large car card (slider)            ││
 * │  └──────────────────────────────────────────┘│
 * │  Browse all                            →     │
 * └──────────────────────────────────────────────┘
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * BRAND — Partner showcase with logo & breathing space
 * ┌──────────────────────────────────────────────┐
 * │  blurred bg                                  │
 * │                                              │
 * │        [  AUDI LOGO  ]                       │
 * │        Audi Collection                       │
 * │                                              │
 * │  ┌───────────┐ ┌───────────┐                 │
 * │  │  med card  │ │  med card  │ ← slider      │
 * │  └───────────┘ └───────────┘                 │
 * │  Browse all                            →     │
 * └──────────────────────────────────────────────┘
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * BRAND GRID — Grid of partner logos
 * ┌──────────────────────────────────────────────┐
 * │  ⚡ Revvup First                             │
 * │     Our founding partners                    │
 * │                                              │
 * │  ┌──┐ ┌──┐ ┌──┐ ┌──┐                        │
 * │  │Au│ │BM│ │MB│ │Po│                         │
 * │  └──┘ └──┘ └──┘ └──┘                        │
 * │  ┌──┐ ┌──┐ ┌──┐ ┌──┐                        │
 * │  │To│ │Lx│ │RR│ │Ni│                         │
 * │  └──┘ └──┘ └──┘ └──┘                        │
 * └──────────────────────────────────────────────┘
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * GRID — 2-column car card grid
 * ┌──────────────────────────────────────────────┐
 * │  blurred bg                                  │
 * │  🇩🇪 German Excellence                       │
 * │                                              │
 * │  ┌─────┐  ┌─────┐                           │
 * │  │card │  │card │                            │
 * │  └─────┘  └─────┘                           │
 * │  ┌─────┐  ┌─────┐                           │
 * │  │card │  │card │                            │
 * │  └─────┘  └─────┘                           │
 * │  Browse all                            →     │
 * └──────────────────────────────────────────────┘
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SLIDER — Compact horizontal scroll
 * ┌──────────────────────────────────────────────┐
 * │  blurred bg                                  │
 * │  ✨ New on Revvup                            │
 * │                                              │
 * │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ← scroll          │
 * │  │sm │ │sm │ │sm │ │sm │                     │
 * │  └───┘ └───┘ └───┘ └───┘                    │
 * │  Browse all                            →     │
 * └──────────────────────────────────────────────┘
 */

import React, { useCallback, useMemo, memo } from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { ArrowRight } from 'lucide-react-native';
import { HapticPressable, Data, Supporting, Heading } from '@/components/ui';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

import { WidgetThumbnail, WidgetThumbnailSkeleton, THUMB_SM, THUMB_MD, THUMB_LG, THUMB_GRID } from './widget-thumbnail';
import type { WidgetContainerProps } from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_MARGIN = 14;
const GAP = 10;

// ============================================================================
// COMPONENT
// ============================================================================

export const WidgetCard = memo(function WidgetCard({
  config,
  listings,
  isLoading,
  onViewAll,
  onListingPress,
  onFavoritePress,
  onBrandPress,
}: WidgetContainerProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const bgColor = colorScheme === 'dark' ? config.colorDark : config.colorLight;
  const titleColor = (colorScheme === 'dark' ? config.titleColorDark : config.titleColorLight) ?? '#FAFAFA';
  const subtitleColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.65)';

  const handleViewAll = useCallback(() => onViewAll?.(config), [config, onViewAll]);

  // Pick hero image for blur bg
  const heroImg = listings[0]?.thumbnail ?? listings[1]?.thumbnail ?? null;

  // ================================================================
  // SHARED: Blurred background layer
  // ================================================================
  const BlurBg = useMemo(() => {
    if (!heroImg) return null;
    return (
      <View style={styles.blurWrap}>
        <Image
          source={{ uri: heroImg }}
          style={styles.blurImage}
          contentFit="cover"
          blurRadius={50}
        />
        <View style={[styles.blurOverlay, { backgroundColor: bgColor, opacity: 0.6 }]} />
      </View>
    );
  }, [heroImg, bgColor]);

  // ================================================================
  // BANNER LAYOUT
  // ================================================================
  if (config.layout === 'banner') {
    return (
      <View style={[styles.card, { backgroundColor: bgColor }]}>
        {BlurBg}

        {/* Header */}
        <View style={styles.headerBanner}>
          {config.emoji && (
            <View style={styles.emojiWrap}>
              <Data size="large">{config.emoji}</Data>
            </View>
          )}
          <Heading size="mini" style={{ color: titleColor }}>{config.title}</Heading>
          {config.subtitle && (
            <Supporting size="small" style={{ color: subtitleColor, marginTop: 2 }}>
              {config.subtitle}
            </Supporting>
          )}
        </View>

        {/* Large car card slider */}
        <View style={styles.sliderSection}>
          {isLoading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sliderContent}>
              {[0, 1].map((i) => <WidgetThumbnailSkeleton key={i} width={THUMB_LG} />)}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sliderContent}
              decelerationRate="fast"
              snapToInterval={THUMB_LG + GAP}
              pagingEnabled={false}
            >
              {listings.slice(0, 8).map((item) => (
                <WidgetThumbnail key={item.id} listing={item} width={THUMB_LG} onPress={onListingPress} onFavoritePress={onFavoritePress} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Footer */}
        <Footer label="Browse all" color={titleColor} onPress={handleViewAll} />
      </View>
    );
  }

  // ================================================================
  // BRAND LAYOUT
  // ================================================================
  if (config.layout === 'brand') {
    const logo = config.brand?.logo;
    const brandName = config.brand?.name ?? config.title;

    return (
      <View style={[styles.card, { backgroundColor: bgColor }]}>
        {BlurBg}

        {/* Brand header — logo + name with generous spacing */}
        <View style={styles.headerBrand}>
          {logo && (
            <View style={styles.brandLogoWrap}>
              <Image
                source={{ uri: logo }}
                style={styles.brandLogo}
                contentFit="contain"
                transition={200}
              />
            </View>
          )}
          <Heading size="mini" style={{ color: titleColor, marginTop: logo ? 10 : 0 }}>
            {config.title}
          </Heading>
        </View>

        {/* Medium car card slider */}
        <View style={styles.sliderSection}>
          {isLoading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sliderContent}>
              {[0, 1, 2].map((i) => <WidgetThumbnailSkeleton key={i} width={THUMB_MD} />)}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sliderContent}
              decelerationRate="fast"
              snapToInterval={THUMB_MD + GAP}
            >
              {listings.slice(0, 10).map((item) => (
                <WidgetThumbnail key={item.id} listing={item} width={THUMB_MD} onPress={onListingPress} onFavoritePress={onFavoritePress} />
              ))}
            </ScrollView>
          )}
        </View>

        <Footer label="Browse all" color={titleColor} onPress={handleViewAll} />
      </View>
    );
  }

  // ================================================================
  // BRAND GRID LAYOUT — Partner logos
  // ================================================================
  if (config.layout === 'brandGrid') {
    const brands = config.brands ?? [];

    return (
      <View style={[styles.card, { backgroundColor: bgColor }]}>
        {/* Header */}
        <View style={styles.headerStandard}>
          {config.emoji && (
            <View style={styles.emojiWrap}>
              <Data size="large">{config.emoji}</Data>
            </View>
          )}
          <Heading size="mini" style={{ color: titleColor }}>{config.title}</Heading>
          {config.subtitle && (
            <Supporting size="small" style={{ color: subtitleColor, marginTop: 2 }}>
              {config.subtitle}
            </Supporting>
          )}
        </View>

        {/* Logo grid — 4 columns */}
        <View style={styles.brandGridContainer}>
          {brands.map((b) => (
            <HapticPressable key={b.id} style={styles.brandGridItem} onPress={() => onBrandPress?.(b)}>
              <View style={[styles.brandGridLogoCircle, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)' }]}>
                <Image
                  source={{ uri: b.logo }}
                  style={styles.brandGridLogoImg}
                  contentFit="contain"
                  transition={200}
                />
              </View>
              <Supporting size="small" style={{ color: subtitleColor, marginTop: 5, textAlign: 'center' }} numberOfLines={1}>
                {b.name}
              </Supporting>
            </HapticPressable>
          ))}
        </View>
      </View>
    );
  }

  // ================================================================
  // GRID LAYOUT — 2 columns
  // ================================================================
  if (config.layout === 'grid') {
    const gridItems = listings.slice(0, 6);
    // Build row pairs
    const rows: typeof gridItems[] = [];
    for (let i = 0; i < gridItems.length; i += 2) {
      rows.push(gridItems.slice(i, i + 2));
    }

    return (
      <View style={[styles.card, { backgroundColor: bgColor }]}>
        {BlurBg}

        {/* Header */}
        <View style={styles.headerStandard}>
          {config.emoji && (
            <View style={styles.emojiWrap}>
              <Data size="large">{config.emoji}</Data>
            </View>
          )}
          <Heading size="mini" style={{ color: titleColor }}>{config.title}</Heading>
          {config.subtitle && (
            <Supporting size="small" style={{ color: subtitleColor, marginTop: 2 }}>
              {config.subtitle}
            </Supporting>
          )}
        </View>

        {/* Grid */}
        <View style={styles.gridContainer}>
          {isLoading
            ? [0, 1, 2, 3].map((i) => <WidgetThumbnailSkeleton key={i} width={THUMB_GRID} />)
            : rows.map((row, ri) => (
                <View key={ri} style={styles.gridRow}>
                  {row.map((item) => (
                    <WidgetThumbnail key={item.id} listing={item} width={THUMB_GRID} onPress={onListingPress} onFavoritePress={onFavoritePress} />
                  ))}
                </View>
              ))
          }
        </View>

        <Footer label="Browse all" color={titleColor} onPress={handleViewAll} />
      </View>
    );
  }

  // ================================================================
  // SLIDER LAYOUT (default) — Compact horizontal scroll
  // ================================================================
  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      {BlurBg}

      {/* Header */}
      <View style={styles.headerStandard}>
        {config.emoji && (
          <View style={styles.emojiWrap}>
            <Data size="large">{config.emoji}</Data>
          </View>
        )}
        <Heading size="mini" style={{ color: titleColor }}>{config.title}</Heading>
        {config.subtitle && (
          <Supporting size="small" style={{ color: subtitleColor, marginTop: 2 }}>
            {config.subtitle}
          </Supporting>
        )}
      </View>

      {/* Compact thumbnails */}
      <View style={styles.sliderSection}>
        {isLoading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sliderContent}>
            {[0, 1, 2, 3].map((i) => <WidgetThumbnailSkeleton key={i} width={THUMB_SM} />)}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sliderContent}
            decelerationRate="fast"
            snapToInterval={THUMB_SM + GAP}
          >
            {listings.slice(0, 10).map((item) => (
              <WidgetThumbnail key={item.id} listing={item} width={THUMB_SM} onPress={onListingPress} onFavoritePress={onFavoritePress} />
            ))}
          </ScrollView>
        )}
      </View>

      <Footer label="Browse all" color={titleColor} onPress={handleViewAll} />
    </View>
  );
});

// ============================================================================
// FOOTER SUB-COMPONENT
// ============================================================================

function Footer({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <HapticPressable onPress={onPress} style={styles.footer}>
      <Heading size="mini" style={{ color }}>{label}</Heading>
      <View style={[styles.arrowCircle, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
        <ArrowRight size={15} color={color} strokeWidth={2.5} />
      </View>
    </HapticPressable>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // ── Card Shell ──
  card: {
    marginHorizontal: CARD_MARGIN,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    position: 'relative',
  },

  // ── Blur Background ──
  blurWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: Radius['2xl'],
  },
  blurImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.4 }],
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // ── Headers ──
  headerBanner: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.sm,
    zIndex: 2,
  },
  headerBrand: {
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    zIndex: 2,
  },
  headerStandard: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
    zIndex: 2,
  },

  emojiWrap: {
    marginBottom: 4,
  },

  // ── Brand Logo ──
  brandLogoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandLogo: {
    width: 48,
    height: 48,
  },

  // ── Brand Grid ──
  brandGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    zIndex: 2,
  },
  brandGridItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  brandGridLogoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandGridLogoImg: {
    width: 34,
    height: 34,
  },

  // ── Slider Section ──
  sliderSection: {
    paddingVertical: Spacing.md,
    zIndex: 2,
  },
  sliderContent: {
    paddingHorizontal: Spacing.lg,
    gap: GAP,
  },

  // ── Grid Section ──
  gridContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: GAP,
    zIndex: 2,
  },
  gridRow: {
    flexDirection: 'row',
    gap: GAP,
  },

  // ── Footer ──
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
    zIndex: 2,
  },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
