/**
 * ListingQuickNotes - Seller-provided notes displayed on the listing detail screen
 *
 * Renders: ownerRemarks, recentServices, customizations, knownIssues, registeredUntil
 * from the specialNotes object returned by the API.
 */

import { Text } from '@/components/ui';
import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import type { SpecialNotes } from '@/lib/listing-api';

interface NoteItem {
  text: string;
  isIssue?: boolean;
}

interface ListingQuickNotesProps {
  specialNotes?: SpecialNotes;
}

export const ListingQuickNotes = memo(function ListingQuickNotes({
  specialNotes,
}: ListingQuickNotesProps) {
  const { colors } = useTheme();

  const items = useMemo<NoteItem[]>(() => {
    if (!specialNotes) return [];
    const result: NoteItem[] = [];

    specialNotes.ownerRemarks?.forEach(r => result.push({ text: r }));
    if (specialNotes.registeredUntil) {
      result.push({ text: `Registered until ${specialNotes.registeredUntil}` });
    }
    specialNotes.recentServices?.forEach(r => result.push({ text: r }));
    specialNotes.customizations?.forEach(r => result.push({ text: r }));
    specialNotes.knownIssues?.forEach(r => result.push({ text: r, isIssue: true }));

    return result;
  }, [specialNotes]);

  if (items.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.delay(0).duration(350)}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.headerRow}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>Seller Notes</Text>
        </View>
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text variant="subhead" tone={item.isIssue ? 'error' : 'default'}>
                {item.text}
              </Text>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});
