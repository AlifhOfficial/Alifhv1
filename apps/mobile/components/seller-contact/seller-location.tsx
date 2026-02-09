/**
 * Seller Location Section
 * 
 * Location display with map and directions actions.
 */

import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MapPin, ExternalLink, Navigation, Globe } from 'lucide-react-native';

import type { SellerLocationProps } from './types';
import { styles } from './styles';

export const SellerLocation = memo(function SellerLocation({
  seller,
  onViewMap,
  onGetDirections,
  onWebsite,
  colors,
}: SellerLocationProps) {
  if (!seller.location && !seller.website) return null;

  return (
    <View style={styles.locationSection}>
      <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>LOCATION & LINKS</Text>
      
      {seller.location && (
        <View style={styles.locationTextRow}>
          <MapPin size={18} color={colors.textSecondary} />
          <Text style={[styles.locationText, { color: colors.text }]}>{seller.location}</Text>
        </View>
      )}
      
      {/* Compact action row */}
      <View style={styles.locationActionsCompact}>
        {seller.location && (
          <>
            <Pressable
              style={[styles.compactBtn, { borderColor: colors.border }]}
              onPress={onViewMap}
            >
              <ExternalLink size={15} color={colors.text} />
              <Text style={[styles.compactBtnText, { color: colors.text }]}>View Map</Text>
            </Pressable>
            <Pressable
              style={[styles.compactBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={onGetDirections}
            >
              <Navigation size={15} color="#FFF" />
              <Text style={[styles.compactBtnText, { color: '#FFF' }]}>Directions</Text>
            </Pressable>
          </>
        )}
        {seller.website && (
          <Pressable
            style={[styles.compactBtn, { borderColor: colors.border }]}
            onPress={onWebsite}
          >
            <Globe size={15} color={colors.text} />
            <Text style={[styles.compactBtnText, { color: colors.text }]}>Website</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
});
