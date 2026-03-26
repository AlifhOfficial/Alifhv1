/**
 * Listing Header - Title, Price, Actions, Highlights
 */

import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Text, Heading, Data, Label } from '@/components/ui';
import { SpecialNotes } from '@/lib/listing-api';
import { formatPrice } from './types';

interface ListingHeaderProps {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  price: number;
  isNegotiable?: boolean;
  isBlk?: boolean;
  specialNotes?: SpecialNotes;
  tags?: string[];
}

export const ListingHeader = memo(function ListingHeader({
  id,
  year,
  make,
  model,
  trim,
  price,
  isNegotiable,
  isBlk = false,
  specialNotes,
  tags = [],
}: ListingHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const carTitle = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;
  
  // Use standard theme colors (BLK branding shown via badge only)
  const textColor = colors.text;
  const priceColor = colors.primary;

  // Highlights from special notes and tags
  const highlights = useMemo(() => {
    const items: string[] = [...tags];
    if (specialNotes?.serviceHistory) items.push('Full Service History');
    if (specialNotes?.singleOwner) items.push('Single Owner');
    if (specialNotes?.accidentFree) items.push('Accident Free');
    if (specialNotes?.underWarranty) items.push('Under Warranty');
    return items;
  }, [tags, specialNotes]);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.textContainer}>
          <Heading size="medium" style={{ color: textColor }} numberOfLines={2}>
            {carTitle}
          </Heading>
          <View style={styles.priceRow}>
            <Text variant="price" style={{ color: priceColor }}>
              {formatPrice(price)}
            </Text>
            {isNegotiable && (
              <Data size="mini" tone="success">
                Negotiable
              </Data>
            )}
          </View>
        </View>

        {isBlk && (
          <View style={[styles.blkBadge, { backgroundColor: colors.blkBadgeBg }]}>
            <Label size="badge" uppercase={false} style={{ color: colors.blkBadgeFg }}>BLK</Label>
          </View>
        )}
      </View>

      {/* Highlights below price */}
      {highlights.length > 0 && (
        <View style={styles.highlightsRow}>
          {highlights.map((highlight, idx) => (
            <View key={idx} style={styles.highlightItem}>
              <CheckCircle2 size={Sizes.iconXs} color={colors.success} />
              <Data size="mini" style={{ color: textColor }}>
                {highlight}
              </Data>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  blkBadge: {
    paddingHorizontal: Sizes.badgePaddingH,
    paddingVertical: Sizes.badgePaddingV,
    borderRadius: Radius.none,
  },
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    rowGap: Spacing.xs,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
