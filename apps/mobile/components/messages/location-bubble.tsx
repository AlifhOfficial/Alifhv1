/**
 * Location Bubble - Mobile Native
 * Displays a shared location with a static map preview
 * Tappable to open in maps app
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, Linking, Platform, Image } from 'react-native';
import { MapPin, ExternalLink } from 'lucide-react-native';
import { HapticPressable, Body, Data } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';

interface LocationBubbleProps {
  latitude: number;
  longitude: number;
  address?: string;
  placeName?: string;
  isOwn: boolean;
}

// Static map tile URL (OpenStreetMap - free, no API key)
function getStaticMapUrl(lat: number, lng: number, zoom = 15, width = 300, height = 150) {
  // Using OpenStreetMap static tile server approximation
  // Center tile calculation
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const xTile = Math.floor(((lng + 180) / 360) * n);
  const yTile = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  
  // Return single tile as preview (simple approach)
  return `https://tile.openstreetmap.org/${zoom}/${xTile}/${yTile}.png`;
}

export function LocationBubble({
  latitude,
  longitude,
  address,
  placeName,
  isOwn,
}: LocationBubbleProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  // Open location in maps app
  const handleOpenMaps = useCallback(() => {
    const label = placeName || address || 'Shared Location';
    const encodedLabel = encodeURIComponent(label);
    
    // Platform-specific maps URL
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}(${encodedLabel})`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`,
      default: `https://maps.google.com/maps?q=${latitude},${longitude}`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback to Google Maps web
        Linking.openURL(`https://maps.google.com/maps?q=${latitude},${longitude}`);
      });
    }
  }, [latitude, longitude, address, placeName]);

  const mapPreviewUrl = getStaticMapUrl(latitude, longitude);

  return (
    <HapticPressable haptic="light" onPress={handleOpenMaps} style={styles.container}>
      {/* Map Preview */}
      <View style={styles.mapContainer}>
        <Image
          source={{ uri: mapPreviewUrl }}
          style={styles.mapImage}
          resizeMode="cover"
        />
        {/* Pin overlay */}
        <View style={[styles.pinOverlay, { backgroundColor: colors.primary }]}>
          <MapPin size={Sizes.iconSm} color={colors.primaryFg} strokeWidth={2.5} />
        </View>
      </View>

      {/* Location Info */}
      <View
        style={[
          styles.infoContainer,
          { backgroundColor: isOwn ? colors.primary : colors.surface2 },
        ]}
      >
        <View style={styles.textContainer}>
          {placeName && (
            <Body
              size="body"
              style={[
                styles.placeName,
                { color: isOwn ? colors.primaryFg : colors.text },
              ]}
              numberOfLines={1}
            >
              {placeName}
            </Body>
          )}
          {address && (
            <Data
              size="bodySm"
              style={{ color: isOwn ? 'rgba(255,255,255,0.8)' : colors.text2 }}
              numberOfLines={2}
            >
              {address}
            </Data>
          )}
          {!placeName && !address && (
            <Data
              size="bodySm"
              style={{ color: isOwn ? 'rgba(255,255,255,0.8)' : colors.text2 }}
            >
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Data>
          )}
        </View>
        <ExternalLink
          size={Sizes.iconSm}
          color={isOwn ? 'rgba(255,255,255,0.6)' : colors.text3}
          strokeWidth={1.5}
        />
      </View>
    </HapticPressable>
  );
}

const MAP_WIDTH = 200;
const MAP_HEIGHT = 100;

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    maxWidth: MAP_WIDTH,
  },
  mapContainer: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    backgroundColor: '#E5E3DF', // Map loading background
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  pinOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -Spacing.lg,
    marginLeft: -Spacing.md,
    width: Spacing["2xl"],
    height: Spacing["2xl"],
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  placeName: {},
});
