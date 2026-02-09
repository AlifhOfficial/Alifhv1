/**
 * Seller Location Section
 * 
 * Location display with map and directions actions.
 * Follows listings component patterns for consistency.
 */

import React, { memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
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
      <Label size="small" tone="muted">LOCATION & LINKS</Label>
      
      {seller.location && (
        <View style={localStyles.locationRow}>
          <MapPin size={ICON_SIZE} color={colors.icon} style={{ marginTop: 2 }} />
          <View style={localStyles.locationText}>
            <Data size="medium">{seller.location}</Data>
          </View>
        </View>
      )}
      
      {/* Action Buttons */}
      <View style={localStyles.actions}>
        {seller.location && (
          <>
            <Pressable
              style={({ pressed }) => [
                localStyles.button,
                { 
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={onViewMap}
            >
              <ExternalLink size={ICON_SIZE_SM} color={colors.icon} />
              <ButtonText size="small">View Map</ButtonText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                localStyles.button,
                { 
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={onGetDirections}
            >
              <Navigation size={ICON_SIZE_SM} color={colors.icon} />
              <ButtonText size="small">Directions</ButtonText>
            </Pressable>
          </>
        )}
        {seller.website && (
          <Pressable
            style={({ pressed }) => [
              localStyles.button,
              { 
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={onWebsite}
          >
            <Globe size={ICON_SIZE_SM} color={colors.icon} />
            <ButtonText size="small">Website</ButtonText>
          </Pressable>
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
  locationText: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});
