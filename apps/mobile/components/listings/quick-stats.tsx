/**
 * Quick Stats - Mileage, Specs, Location, VIN
 */

import React, { memo, useCallback, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform, Clipboard } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MapPin, Copy, Check } from 'lucide-react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { formatMileage, formatSpecs, formatEmirate } from './types';

interface QuickStatsProps {
  mileage: number;
  specs: string;
  emirate: string;
  city?: string | null;
  vin?: string | null;
  isBlk?: boolean;
}

export const QuickStats = memo(function QuickStats({
  mileage,
  specs,
  emirate,
  city,
  vin,
  isBlk = false,
}: QuickStatsProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [copied, setCopied] = useState(false);

  const displaySpecs = formatSpecs(specs);
  const displayEmirate = city ? `${city}, ${formatEmirate(emirate)}` : formatEmirate(emirate);
  
  const secondaryTextColor = isBlk ? colors.blkTextSecondary : colors.textSecondary;

  const handleCopyVin = useCallback(async () => {
    if (!vin) return;
    try {
      Clipboard.setString(vin);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy VIN:', error);
    }
  }, [vin]);

  return (
    <View style={styles.container}>
      {/* Quick Details Row */}
      <View style={styles.statsRow}>
        <Text style={[styles.statText, { color: secondaryTextColor }]}>
          {formatMileage(mileage)} km
        </Text>
        <Text style={[styles.separator, { color: colors.textTertiary }]}>•</Text>
        <Text style={[styles.statText, { color: secondaryTextColor }]}>
          {displaySpecs} Specs
        </Text>
        <Text style={[styles.separator, { color: colors.textTertiary }]}>•</Text>
        <View style={styles.locationRow}>
          <MapPin size={14} color={secondaryTextColor} />
          <Text style={[styles.statText, { color: secondaryTextColor }]}>
            {displayEmirate}
          </Text>
        </View>
      </View>

      {/* VIN - Copyable */}
      {vin && (
        <Pressable onPress={handleCopyVin} style={styles.vinRow}>
          {({ pressed }) => (
            <>
              <Text style={[styles.vinLabel, { color: colors.textTertiary }]}>VIN</Text>
              <Text 
                style={[
                  styles.vinValue, 
                  { color: colors.text, opacity: pressed ? 0.7 : 1 }
                ]}
              >
                {vin}
              </Text>
              {copied ? (
                <Check size={14} color={colors.success} strokeWidth={2.5} />
              ) : (
                <Copy size={14} color={colors.textTertiary} strokeWidth={1.75} />
              )}
            </>
          )}
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statText: {
    ...Typography.stat,
  },
  separator: {
    ...Typography.helperMedium,
    opacity: 0.4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  vinLabel: {
    ...Typography.valueSmall,
  },
  vinValue: {
    ...Typography.stat,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
});
