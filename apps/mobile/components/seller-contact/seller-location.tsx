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

import { Spacing, Radius } from '@/constants/theme';
import { Label, Data, ButtonText } from '@/components/ui';
import type { SellerLocationProps } from './types';

const ICON_SIZE = 20;
const ICON_SIZE_SM = 16;

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
      <Label size="small" tone="muted">LOCATION</Label>
      
      {seller.location && (
        <View style={localStyles.locationRow}>
          <MapPin size={ICON_SIZE} color={colors.textSecondary} style={localStyles.mapIcon} />
          <View style={localStyles.locationText}>
            <Data size="medium">{seller.location}</Data>
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
                { backgroundColor: colors.fill },
              ]}
              onPress={onViewMap}
            >
              <ExternalLink size={ICON_SIZE_SM} color={colors.text} />
              <ButtonText size="small">View Map</ButtonText>
            </HapticPressable>
            <HapticPressable
              style={[
                localStyles.pill,
                { backgroundColor: colors.fill },
              ]}
              onPress={onGetDirections}
            >
              <Navigation size={ICON_SIZE_SM} color={colors.text} />
              <ButtonText size="small">Directions</ButtonText>
            </HapticPressable>
          </>
        )}
        {seller.website && (
          <HapticPressable
            style={[
              localStyles.pill,
              { backgroundColor: colors.fill },
            ]}
            onPress={onWebsite}
          >
            <Globe size={ICON_SIZE_SM} color={colors.text} />
            <ButtonText size="small">Website</ButtonText>
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
    marginTop: 2,
  },
  locationText: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
  },
});
