import { Text } from '@/components/ui';
import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';

import { Spacing, Radius, Sizes, Stroke } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { SpecialNotes } from '@/lib/listing-api';

interface ListingHighlightsProps {
  specialNotes?: SpecialNotes;
  tags?: string[];
}

export const ListingHighlights = memo(function ListingHighlights({
  specialNotes,
  tags = [],
}: ListingHighlightsProps) {
  const { colors } = useTheme();

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
    <Animated.View entering={FadeInDown.delay(0).duration(350)}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.headerRow}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>Highlights</Text>
        </View>
        {highlights.map((highlight, idx) => (
          <React.Fragment key={idx}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text variant="subhead">{highlight}</Text>
              <CheckCircle2 size={Sizes.iconXs} color={colors.success} strokeWidth={Stroke.icon} />
            </View>
          </React.Fragment>
        ))}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  headerRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});
