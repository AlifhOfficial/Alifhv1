/**
 * Listing Highlights - Tags with CheckCircle2 icons
 * Positioned directly below the image gallery for prominent visibility
 */

import { Text } from '@/components/ui';
import React, { memo, useMemo } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

import { Colors, Spacing, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { SpecialNotes } from '@/lib/listing-api';

interface ListingHighlightsProps {
  specialNotes?: SpecialNotes;
  tags?: string[];
  isBlk?: boolean;
}

export const ListingHighlights = memo(function ListingHighlights({
  specialNotes,
  tags = [],
  isBlk = false,
}: ListingHighlightsProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const textColor = isBlk ? colors.label : colors.label;
  const bgColor = isBlk ? colors.background : colors.background;

  // Highlights from special notes and tags
  const highlights = useMemo(() => {
    const items: string[] = [...tags];
    if (specialNotes?.serviceHistory) items.push('Full Service History');
    if (specialNotes?.singleOwner) items.push('Single Owner');
    if (specialNotes?.accidentFree) items.push('Accident Free');
    if (specialNotes?.underWarranty) items.push('Under Warranty');
    return items;
  }, [tags, specialNotes]);

  if (highlights.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {highlights.map((highlight, idx) => (
          <View key={idx} style={styles.highlightItem}>
            <CheckCircle2 size={Sizes.iconXs} color={colors.success} />
            <Text variant="subhead" style={{ color: textColor }}>
              {highlight}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
