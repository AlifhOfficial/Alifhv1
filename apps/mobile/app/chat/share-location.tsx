import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, RefreshCw, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { HapticPressable, SheetHeader, Text, useAlert } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Shadows, Sizes, Spacing, Stroke } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useLocation, type LocationResult } from '@/hooks/use-location';
import { sendLocationMessage } from '@/lib/messaging-api';

function getStaticMapUrl(lat: number, lng: number, zoom = 15) {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const xTile = Math.floor(((lng + 180) / 360) * n);
  const yTile = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return `https://tile.openstreetmap.org/${zoom}/${xTile}/${yTile}.png`;
}

export default function ShareLocationScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const params = useLocalSearchParams() as { conversationId?: string | string[] };
  const conversationId = Array.isArray(params.conversationId) ? params.conversationId[0] : params.conversationId;
  const { isLoading, error, getCurrentLocation } = useLocation({ showAlert });

  const [location, setLocation] = useState<LocationResult | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleRefreshLocation = useCallback(async () => {
    const result = await getCurrentLocation();
    if (result) {
      setLocation(result);
    }
  }, [getCurrentLocation]);

  useEffect(() => {
    queueMicrotask(() => {
      void handleRefreshLocation();
    });
  }, [handleRefreshLocation]);

  const handleConfirm = useCallback(async () => {
    if (!location || !conversationId) {
      return;
    }

    setIsSending(true);
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await sendLocationMessage(conversationId, location);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: '/chat/[conversationId]',
        params: {
          conversationId,
          locationRefresh: String(Date.now()),
        },
      });
    } catch (err) {
      console.error('[ShareLocationScreen] Send failed:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert('Error', 'Failed to send location. Please try again.');
      setIsSending(false);
    }
  }, [conversationId, location, showAlert]);

  const mapPreviewUrl = useMemo(() => {
    if (!location) {
      return null;
    }

    return getStaticMapUrl(location.latitude, location.longitude);
  }, [location]);

  return (
    <View style={styles.container}>
      <SheetHeader title="Share Location" />

      <View style={[styles.mapContainer, { backgroundColor: colors.sheetSurface }]}> 
        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabelMuted, marginTop: Spacing.sm }}>
              Getting your location...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.stateContainer}>
            <MapPin size={Sizes.iconXl} color={colors.sheetLabelMuted} />
            <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabelMuted, marginTop: Spacing.sm, textAlign: 'center' }}>
              {error}
            </Text>
            <HapticPressable
              onPress={handleRefreshLocation}
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
            >
              <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.primaryForeground }}>
                Try Again
              </Text>
            </HapticPressable>
          </View>
        ) : mapPreviewUrl ? (
          <>
            <Image source={{ uri: mapPreviewUrl }} style={styles.mapImage} resizeMode="cover" />
            <View style={[styles.pinOverlay, { backgroundColor: colors.primary }]}> 
              <MapPin size={Sizes.iconSm} color={colors.primaryForeground} strokeWidth={Stroke.icon} />
            </View>
          </>
        ) : null}
      </View>

      {location ? (
        <View style={[styles.locationInfo, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
          <View style={styles.locationTextContainer}>
            {location.placeName ? (
              <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }} numberOfLines={1}>
                {location.placeName}
              </Text>
            ) : null}
            <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabelMuted }} numberOfLines={2}>
              {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
            </Text>
          </View>
          <HapticPressable
            onPress={handleRefreshLocation}
            disabled={isLoading}
            style={[styles.refreshButton, { backgroundColor: colors.fill2 }]}
          >
            <RefreshCw size={Sizes.iconSm} color={colors.sheetLabelMuted} style={isLoading ? { opacity: 0.5 } : undefined} />
          </HapticPressable>
        </View>
      ) : null}

      <View style={styles.actions}>
        <HapticPressable
          onPress={() => router.back()}
          disabled={isSending}
          style={[styles.cancelButton, { backgroundColor: colors.fill2 }]}
        >
          <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabel }}>
            Cancel
          </Text>
        </HapticPressable>
        <HapticPressable
          onPress={handleConfirm}
          disabled={!location || isSending}
          style={[styles.sendButton, { backgroundColor: location && !isSending ? colors.primary : colors.fill2 }]}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <>
              <Send size={Sizes.iconSm} color={location ? colors.primaryForeground : colors.labelQuaternary} />
              <Text variant={SheetTypography.rowLabelSelected} style={{ color: location ? colors.primaryForeground : colors.labelQuaternary }}>
                Send Location
              </Text>
            </>
          )}
        </HapticPressable>
      </View>

      <View style={{ height: insets.bottom + SheetChrome.bottomSafeAreaSpacing }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
    paddingTop: SheetChrome.contentPaddingTop,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: SheetChrome.headerPaddingBottom,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: SheetChrome.headerMarginBottom,
    alignItems: 'center',
  },
  mapContainer: {
    height: Spacing['5xl'] * 3,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
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
    width: Spacing['2xl'],
    height: Spacing['2xl'],
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  locationTextContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  refreshButton: {
    width: Sizes.bubbleMd,
    height: Sizes.bubbleMd,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    paddingVertical: SheetChrome.rowPaddingVertical,
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.full,
    paddingVertical: SheetChrome.rowPaddingVertical,
  },
});