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
import { Label, Body, ButtonText } from '@/components/ui';
import type { SellerLocationProps } from './types';

const ICON_SIZE = 22;
const ICON_SIZE_SM = 18;

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
      <Label size="medium" tone="muted">LOCATION & LINKS</Label>
      
      {seller.location && (
        <View style={localStyles.locationRow}>
          <MapPin size={ICON_SIZE} color={colors.icon} style={{ marginTop: 2 }} />
          <View style={localStyles.locationText}>
            <Body size="medium">{seller.location}</Body>
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
              <ExternalLink size={ICON_SIZE_SM} color={colors.text} />
              <ButtonText size="medium">View Map</ButtonText>
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
              <Navigation size={ICON_SIZE_SM} color={colors.text} />
              <ButtonText size="medium">Directions</ButtonText>
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
            <Globe size={ICON_SIZE_SM} color={colors.text} />
            <ButtonText size="medium">Website</ButtonText>
          </Pressable>
        )}
      </View>
    </View>
  );
});

const localStyles = StyleSheet.create({
  section: {
    gap: Spacing.lg,
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
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
  },
});
