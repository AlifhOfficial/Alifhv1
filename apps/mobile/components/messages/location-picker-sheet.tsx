/**
 * Location Picker Sheet - Mobile
 * Shows current location preview with confirm/cancel
 * Option to refresh location if not accurate
 */

import { Text, HapticPressable, useAlert } from '@/components/ui';
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { MapPin, RefreshCw, X, Send } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/theme-context';
import { Colors, Shadows, Spacing, Radius, Sizes, Layout, Stroke } from '@/constants/theme';
import { useLocation, type LocationResult } from '@/hooks/use-location';

interface LocationPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: LocationResult) => Promise<void>;
}

// Static map tile URL
function getStaticMapUrl(lat: number, lng: number, zoom = 15) {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const xTile = Math.floor(((lng + 180) / 360) * n);
  const yTile = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return `https://tile.openstreetmap.org/${zoom}/${xTile}/${yTile}.png`;
}

export function LocationPickerSheet({
  visible,
  onClose,
  onConfirm,
}: LocationPickerSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { showAlert } = useAlert();
  const { isLoading, error, getCurrentLocation } = useLocation({ showAlert });
  
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [isSending, setIsSending] = useState(false);

  const snapPoints = useMemo(() => ['55%'], []);

  // Present / dismiss based on visible prop
  useEffect(() => {
    if (visible) {
      setLocation(null);
      setIsSending(false);
      bottomSheetRef.current?.present();
      // Fetch location when sheet opens
      handleRefreshLocation();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose],
  );

  const handleRefreshLocation = useCallback(async () => {
    const result = await getCurrentLocation();
    if (result) {
      setLocation(result);
    }
  }, [getCurrentLocation]);

  const handleConfirm = useCallback(async () => {
    if (!location) return;
    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await onConfirm(location);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      bottomSheetRef.current?.dismiss();
    } catch (err) {
      console.error('[LocationPickerSheet] Send failed:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSending(false);
    }
  }, [location, onConfirm]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior={isSending ? 'none' : 'close'}
      />
    ),
    [isSending],
  );

  const mapPreviewUrl = location 
    ? getStaticMapUrl(location.latitude, location.longitude)
    : null;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose={!isSending}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: Radius['3xl'] }}
      handleIndicatorStyle={{ backgroundColor: colors.labelQuaternary, width: Sizes.bubble }}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="headline">Share Location</Text>
            <Text variant="subhead" style={{ color: colors.labelSecondary }}>
              Send your current location
            </Text>
          </View>
          <HapticPressable 
            haptic="light" 
            onPress={onClose} 
            disabled={isSending}
            style={[styles.closeButton, { backgroundColor: colors.error }]}
          >
            <X size={Sizes.iconSm} color={colors.primaryForeground} strokeWidth={Stroke.icon} />
          </HapticPressable>
        </View>

        {/* Map Preview */}
        <View style={[styles.mapContainer, { backgroundColor: colors.surfaceSecondary }]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text variant="subhead" style={{ color: colors.labelSecondary, marginTop: Spacing.sm }}>
                Getting your location...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MapPin size={Sizes.iconXl} color={colors.labelTertiary} />
              <Text variant="subhead" style={{ color: colors.labelSecondary, marginTop: Spacing.sm, textAlign: 'center' }}>
                {error}
              </Text>
              <HapticPressable
                haptic="medium"
                onPress={handleRefreshLocation}
                style={[styles.retryButton, { backgroundColor: colors.primary }]}
              >
                <Text variant="subhead" style={{ color: colors.primaryForeground }}>Try Again</Text>
              </HapticPressable>
            </View>
          ) : mapPreviewUrl ? (
            <>
              <Image
                source={{ uri: mapPreviewUrl }}
                style={styles.mapImage}
                resizeMode="cover"
              />
              {/* Pin overlay */}
              <View style={[styles.pinOverlay, { backgroundColor: colors.primary }]}>
                <MapPin size={Sizes.iconSm} color={colors.primaryForeground} strokeWidth={Stroke.icon} />
              </View>
            </>
          ) : null}
        </View>

        {/* Location Info */}
        {location && (
          <View style={[styles.locationInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.locationTextContainer}>
              {location.placeName && (
                <Text variant="body" numberOfLines={1}>
                  {location.placeName}
                </Text>
              )}
              {location.address ? (
                <Text variant="subhead" style={{ color: colors.labelSecondary }} numberOfLines={2}>
                  {location.address}
                </Text>
              ) : (
                <Text variant="subhead" style={{ color: colors.labelSecondary }}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              )}
            </View>
            <HapticPressable
              haptic="light"
              onPress={handleRefreshLocation}
              disabled={isLoading}
              style={[styles.refreshButton, { backgroundColor: colors.fill2 }]}
            >
              <RefreshCw
                size={Sizes.iconSm}
                color={colors.labelSecondary}
                style={isLoading ? { opacity: 0.5 } : undefined}
              />
            </HapticPressable>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <HapticPressable
            haptic="light"
            onPress={onClose}
            disabled={isSending}
            style={[styles.cancelButton, { backgroundColor: colors.fill2 }]}
          >
            <Text variant="body" style={{ color: colors.label }}>Cancel</Text>
          </HapticPressable>
          <HapticPressable
            haptic="medium"
            onPress={handleConfirm}
            disabled={!location || isSending}
            style={[
              styles.sendButton,
              { backgroundColor: location && !isSending ? colors.primary : colors.fill2 },
            ]}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <>
                <Send size={Sizes.iconSm} color={location ? colors.primaryForeground : colors.labelQuaternary} />
                <Text
                  variant="body"
                  style={{ color: location ? colors.primaryForeground : colors.labelQuaternary, marginLeft: Spacing.xs }}
                >
                  Send Location
                </Text>
              </>
            )}
          </HapticPressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Layout.screenPadding,
  },
  content: {
    padding: Layout.screenPadding,
    paddingTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  closeButton: {
    width: Sizes.avatarSm,
    height: Sizes.avatarSm,
    borderRadius: Sizes.avatarSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    height: Spacing["5xl"],
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
    width: Spacing["2xl"],
    height: Spacing["2xl"],
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  locationTextContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  refreshButton: {
    width: Sizes.bubbleMd,
    height: Sizes.bubbleMd,
    borderRadius: Sizes.bubbleMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: Sizes.actionButtonLg,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    flex: 2,
    height: Sizes.actionButtonLg,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
