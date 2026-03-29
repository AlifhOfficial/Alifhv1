/**
 * Seller Location Section
 * 
 * Location display with map and directions actions.
 * Follows listings component patterns for consistency.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapPin, ExternalLink, Navigation, Globe } from 'lucide-react-native';

import { Spacing, Radius, Sizes } from '@/constants/theme';
import type { SellerLocationProps } from './types';

export const SellerLocation = memo(function SellerLocation({
  seller,
  onViewMap,
  onGetDirections,
  onWebsite,
  colors,
}: SellerLocationProps) {
  if (!seller.location && !seller.website) return null;

  return (
    <View style={localStyles.section}>
      <Text variant="label" tone="muted" uppercase>LOCATION</Text>
      
      {seller.location && (
        <View style={localStyles.locationRow}>
          <MapPin size={Sizes.iconMd} color={colors.labelSecondary} style={localStyles.mapIcon} />
          <View style={localStyles.locationText}>
            <Text variant="body">{seller.location}</Text>
          </View>
        </View>
      )}
      
      {/* Action Pills */}
      <View style={localStyles.actions}>
        {seller.location && (
          <>
            <HapticPressable
              style={[
                localStyles.pill,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}
              onPress={onViewMap}
            >
              <ExternalLink size={Sizes.iconXs} color={colors.label} />
              <Text variant="bodySm">View Map</Text>
            </HapticPressable>
            <HapticPressable
              style={[
                localStyles.pill,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}
              onPress={onGetDirections}
            >
              <Navigation size={Sizes.iconXs} color={colors.label} />
              <Text variant="bodySm">Directions</Text>
            </HapticPressable>
          </>
        )}
        {seller.website && (
          <HapticPressable
            style={[
              localStyles.pill,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
            onPress={onWebsite}
          >
            <Globe size={Sizes.iconXs} color={colors.label} />
            <Text variant="bodySm">Website</Text>
          </HapticPressable>
        )}
      </View>
    </View>
  );
});

const localStyles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  mapIcon: {
    marginTop: Spacing.xs / 2,
  },
  locationText: {
    flex: 1,
    gap: Spacing.xs / 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});
