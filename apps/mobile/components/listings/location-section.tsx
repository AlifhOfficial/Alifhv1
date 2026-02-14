/**
 * Location Section - Address display with map actions
 * 
 * Clean, minimal location display following "Less is More" principle.
 * Opens Google Maps for directions and location viewing.
 */

import React, { memo, useCallback } from 'react';
import { StyleSheet, View, Linking } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { MapPin, ExternalLink, Navigation } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Skeleton, Label, Data, ButtonText } from '@/components/ui';

// ============================================================================
// TYPES
// ============================================================================

interface LocationSectionProps {
  /** Full address (for dealers) */
  address?: string | null;
  /** City name */
  city?: string | null;
  /** Emirate/State */
  emirate?: string | null;
  /** Latitude coordinate */
  lat?: number | null;
  /** Longitude coordinate */
  lng?: number | null;
  /** Seller/Location name for map search */
  locationName?: string;
  /** For BLK listings styling */
  isBlk?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const LocationSection = memo(function LocationSection({
  address,
  city,
  emirate,
  lat,
  lng,
  locationName,
  isBlk = false,
}: LocationSectionProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const textColor = isBlk ? colors.blkText : colors.text;
  const secondaryTextColor = isBlk ? colors.blkTextSecondary : colors.textSecondary;
  const borderColor = isBlk ? colors.blkBorder : colors.border;

  const hasCoordinates = lat != null && lng != null;
  const hasLocation = city || emirate || address;

  // Don't render if no location data
  if (!hasLocation && !hasCoordinates) {
    return null;
  }

  const locationParts = [city, emirate].filter(Boolean);
  const locationString = locationParts.join(', ');

  // Build map URLs
  const mapsSearchUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || locationString)}`;
  
  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address || locationString)}`;

  const handleViewMap = useCallback(() => {
    Haptics.selectionAsync();
    Linking.openURL(mapsSearchUrl);
  }, [mapsSearchUrl]);

  const handleGetDirections = useCallback(() => {
    Haptics.selectionAsync();
    Linking.openURL(directionsUrl);
  }, [directionsUrl]);

  return (
    <View style={styles.container}>
      {/* Section Label */}
      <Label size="small" tone="muted">
        LOCATION
      </Label>

      {/* Address Display */}
      <View style={styles.addressRow}>
        <MapPin size={Spacing.xl} color={secondaryTextColor} style={styles.mapIcon} />
        <View style={styles.addressText}>
          {address && (
            <Data size="medium" style={{ color: textColor }}>
              {address}
            </Data>
          )}
          {locationString && (
            <Data 
              size="small" 
              style={{ color: address ? secondaryTextColor : textColor }}
            >
              {locationString}
            </Data>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <HapticPressable
          onPress={handleViewMap}
          style={({ pressed }) => [
            styles.actionButton,
            { 
              borderColor,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <ExternalLink size={Spacing.lg} color={textColor} />
          <ButtonText size="small">View Map</ButtonText>
        </HapticPressable>

        <HapticPressable
          onPress={handleGetDirections}
          style={({ pressed }) => [
            styles.actionButton,
            { 
              borderColor,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Navigation size={Spacing.lg} color={textColor} />
          <ButtonText size="small">Directions</ButtonText>
        </HapticPressable>
      </View>
    </View>
  );
});

// ============================================================================
// SKELETON
// ============================================================================

export function LocationSectionSkeleton() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      {/* Label */}
      <Skeleton width={70} height={12} />

      {/* Address */}
      <View style={styles.addressRow}>
        <Skeleton width={20} height={20} borderRadius={10} />
        <View style={[styles.addressText, { gap: 6 }]}>
          <Skeleton width={180} height={16} />
          <Skeleton width={120} height={14} />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <Skeleton width="48%" height={40} borderRadius={Radius.full} />
        <Skeleton width="48%" height={40} borderRadius={Radius.full} />
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  mapIcon: {
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    gap: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});
