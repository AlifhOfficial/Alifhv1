/**
 * Seller Location Section
 * 
 * Location display with map and directions actions.
 * Follows listings component patterns for consistency.
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { MapPin, ExternalLink, Navigation, Globe } from 'lucide-react-native';

import { Spacing, Radius, Sizes } from '@/constants/theme';
import { Label, Data, ButtonText } from '@/components/ui';
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
      <Label size="label" tone="muted">LOCATION</Label>
      
      {seller.location && (
        <View style={localStyles.locationRow}>
          <MapPin size={Sizes.iconMd} color={colors.text2} style={localStyles.mapIcon} />
          <View style={localStyles.locationText}>
            <Data size="body">{seller.location}</Data>
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
                { backgroundColor: colors.glassBg, borderColor: colors.glassBorder },
              ]}
              onPress={onViewMap}
            >
              <ExternalLink size={Sizes.iconXs} color={colors.text} />
              <ButtonText size="bodySm">View Map</ButtonText>
            </HapticPressable>
            <HapticPressable
              style={[
                localStyles.pill,
                { backgroundColor: colors.glassBg, borderColor: colors.glassBorder },
              ]}
              onPress={onGetDirections}
            >
              <Navigation size={Sizes.iconXs} color={colors.text} />
              <ButtonText size="bodySm">Directions</ButtonText>
            </HapticPressable>
          </>
        )}
        {seller.website && (
          <HapticPressable
            style={[
              localStyles.pill,
              { backgroundColor: colors.glassBg, borderColor: colors.glassBorder },
            ]}
            onPress={onWebsite}
          >
            <Globe size={Sizes.iconXs} color={colors.text} />
            <ButtonText size="bodySm">Website</ButtonText>
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
