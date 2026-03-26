/**
 * Location Picker Sheet - Mobile
 * Shows current location preview with confirm/cancel
 * Option to refresh location if not accurate
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { MapPin, RefreshCw, X, Send } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { HapticPressable, Body, Data, Heading, useAlert } from '@/components/ui';
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
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
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
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: 36 }}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Heading size="small">Share Location</Heading>
            <Data size="small" style={{ color: colors.text2 }}>
              Send your current location
            </Data>
          </View>
          <HapticPressable 
            haptic="light" 
            onPress={onClose} 
            disabled={isSending}
            style={[styles.closeButton, { backgroundColor: colors.error }]}
          >
            <X size={Sizes.iconSm} color="#FFFFFF" strokeWidth={2} />
          </HapticPressable>
        </View>

        {/* Map Preview */}
        <View style={[styles.mapContainer, { backgroundColor: colors.surface2 }]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Data size="small" style={{ color: colors.text2, marginTop: Spacing.sm }}>
                Getting your location...
              </Data>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MapPin size={Sizes.iconXl} color={colors.text3} />
              <Data size="small" style={{ color: colors.text2, marginTop: Spacing.sm, textAlign: 'center' }}>
                {error}
              </Data>
              <HapticPressable
                haptic="medium"
                onPress={handleRefreshLocation}
                style={[styles.retryButton, { backgroundColor: colors.primary }]}
              >
                <Data size="small" style={{ color: colors.primaryFg }}>Try Again</Data>
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
                <MapPin size={Sizes.iconSm} color={colors.primaryFg} strokeWidth={2.5} />
              </View>
            </>
          ) : null}
        </View>

        {/* Location Info */}
        {location && (
          <View style={[styles.locationInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.locationTextContainer}>
              {location.placeName && (
                <Body size="medium" style={{ fontWeight: '600' }} numberOfLines={1}>
                  {location.placeName}
                </Body>
              )}
              {location.address ? (
                <Data size="small" style={{ color: colors.text2 }} numberOfLines={2}>
                  {location.address}
                </Data>
              ) : (
                <Data size="small" style={{ color: colors.text2 }}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Data>
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
                color={colors.text2}
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
            <Body size="medium" style={{ color: colors.text }}>Cancel</Body>
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
              <ActivityIndicator size="small" color={colors.primaryFg} />
            ) : (
              <>
                <Send size={Sizes.iconSm} color={location ? colors.primaryFg : colors.textMuted} />
                <Body
                  size="medium"
                  style={{ color: location ? colors.primaryFg : colors.textMuted, marginLeft: Spacing.xs }}
                >
                  Send Location
                </Body>
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    height: 160,
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
    marginTop: -16,
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
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
    gap: 2,
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
