/**
 * Quick Stats - Mileage, Specs, Location, VIN
 */

import React, { memo, useCallback, useState } from 'react';
import { StyleSheet, View, Pressable, Platform, Clipboard } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MapPin, Copy, Check } from 'lucide-react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Data, Supporting } from '@/components/ui';
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
        <Data size="medium" style={{ color: secondaryTextColor }}>
          {formatMileage(mileage)} km
        </Data>
        <Supporting size="small" tone="muted" style={styles.separator}>
          •
        </Supporting>
        <Data size="medium" style={{ color: secondaryTextColor }}>
          {displaySpecs} Specs
        </Data>
        <Supporting size="small" tone="muted" style={styles.separator}>
          •
        </Supporting>
        <View style={styles.locationRow}>
          <MapPin size={ICON_SIZE_SM} color={secondaryTextColor} />
          <Data size="medium" style={{ color: secondaryTextColor }}>
            {displayEmirate}
          </Data>
        </View>
      </View>

      {/* VIN - Copyable */}
      {vin && (
        <Pressable onPress={handleCopyVin} style={styles.vinRow}>
          {({ pressed }) => (
            <>
              <Data size="mini" tone="muted">VIN</Data>
              <Data size="medium" style={[styles.vinValue, { opacity: pressed ? 0.7 : 1 }]}>
                {vin}
              </Data>
              {copied ? (
                <Check size={ICON_SIZE_SM} color={colors.success} strokeWidth={2.5} />
              ) : (
                <Copy size={ICON_SIZE_SM} color={colors.textTertiary} strokeWidth={1.75} />
              )}
            </>
          )}
        </Pressable>
      )}
    </View>
  );
});

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZE_SM = 14;

// ============================================================================
// STYLES
// ============================================================================

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
  separator: {
    opacity: 0.4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  vinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  vinValue: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
});
