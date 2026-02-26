/**
 * PhotosStepContent — Upload listing images
 *
 * Content-only component for the unified flow.
 * Tap star to set thumbnail. Simple grid layout.
 *
 * @module components/sheets/create-listing/steps/photos-step
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Dimensions, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, ImagePlus, Star } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { pickAndUploadListingImage, deleteListingImageByUrl } from '@/components/user-inventory-management/utilities/image-upload';
import { CDN_BASE } from '@/lib/config';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../create-listing-flow';

// ─────────────────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_GAP = Spacing.sm;
const GRID_COLUMNS = 3;
const IMAGE_SIZE = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md * 2 - IMAGE_GAP * 2) / GRID_COLUMNS;
const MAX_IMAGES = 30;

function toAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${CDN_BASE}/${url.startsWith('/') ? url.slice(1) : url}`;
}

// ─────────────────────────────────────────────────────────────────────────────

export function PhotosStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const handlePickImages = useCallback(async () => {
    setError(null);

    if (data.images.length >= MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (!data.vinVerified) {
      setError('Please verify your VIN before uploading images.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setUploading(true);
    try {
      const result = await pickAndUploadListingImage({
        vin: data.vin,
        allowMultiple: true,
        maxImages: MAX_IMAGES - data.images.length,
        onProgress: (phase, done, total) => setUploadProgress({ done, total }),
      });

      if (result.success && result.images.length > 0) {
        const newUrls = result.images.map((img) => img.url);
        onUpdate({ images: [...data.images, ...newUrls] });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      if (result.errors.length > 0) {
        setError(result.errors.join('\n'));
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setUploading(false);
      setUploadProgress({ done: 0, total: 0 });
    }
  }, [data.vin, data.vinVerified, data.images, onUpdate]);

  const handleDeleteImage = useCallback(
    (url: string) => {
      Alert.alert('Remove Photo', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteListingImageByUrl(url);
            } catch {
              /* best-effort */
            }
            onUpdate({ images: data.images.filter((u) => u !== url) });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]);
    },
    [data.images, onUpdate]
  );

  const handleSetThumbnail = useCallback(
    (url: string) => {
      const currentIndex = data.images.indexOf(url);
      if (currentIndex === 0) return; // Already thumbnail
      
      // Move to front
      const newImages = [url, ...data.images.filter((u) => u !== url)];
      onUpdate({ images: newImages });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [data.images, onUpdate]
  );

  // Build rows of 3
  const rows: string[][] = [];
  for (let i = 0; i < data.images.length; i += GRID_COLUMNS) {
    rows.push(data.images.slice(i, i + GRID_COLUMNS));
  }

  return (
    <StepContainer>
      {/* Upload Button */}
      <HapticPressable
        onPress={handlePickImages}
        disabled={uploading}
        style={[
          styles.uploadButton,
          { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
        ]}
      >
        {uploading ? (
          <View style={styles.uploadingContent}>
            <ActivityIndicator size="small" color={colors.text} />
            <Body size="medium" tone="secondary">
              Uploading {uploadProgress.done}/{uploadProgress.total}...
            </Body>
          </View>
        ) : (
          <View style={styles.uploadContent}>
            <ImagePlus size={Sizes.iconLg} color={colors.textMuted} strokeWidth={1.5} />
            <Body size="small" tone="muted">
              Add Photos ({data.images.length}/{MAX_IMAGES})
            </Body>
          </View>
        )}
      </HapticPressable>

      {/* Error */}
      {error && (
        <Supporting size="small" style={{ color: colors.error, marginBottom: Spacing.sm }}>
          {error}
        </Supporting>
      )}

      {/* Image Grid */}
      {rows.length > 0 && (
        <View style={styles.gridWrapper}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((url, colIndex) => {
                const imageIndex = rowIndex * GRID_COLUMNS + colIndex;
                const isThumbnail = imageIndex === 0;

                return (
                  <View key={url} style={styles.imageCard}>
                    <Image source={{ uri: toAbsoluteUrl(url) }} style={styles.image} />

                    {/* Thumbnail badge / button */}
                    <HapticPressable
                      onPress={() => handleSetThumbnail(url)}
                      style={[
                        styles.starBtn,
                        { backgroundColor: isThumbnail ? colors.primary : colors.text + '80' },
                      ]}
                    >
                      <Star
                        size={10}
                        color={isThumbnail ? colors.primaryForeground : colors.background}
                        fill={isThumbnail ? colors.primaryForeground : 'transparent'}
                      />
                    </HapticPressable>

                    {/* Delete button */}
                    <HapticPressable
                      onPress={() => handleDeleteImage(url)}
                      style={[styles.deleteBtn, { backgroundColor: colors.text + 'CC' }]}
                    >
                      <X size={12} color={colors.background} strokeWidth={2.5} />
                    </HapticPressable>
                  </View>
                );
              })}
            </View>
          ))}
          <Supporting size="small" tone="muted" style={{ marginTop: Spacing.sm }}>
            Tap star to set thumbnail
          </Supporting>
        </View>
      )}
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  uploadButton: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  uploadContent: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  uploadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  gridWrapper: {
    marginTop: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: IMAGE_GAP,
    marginBottom: IMAGE_GAP,
  },
  imageCard: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  starBtn: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PhotosStepContent;
