/**
 * PhotosStepContent — Upload listing images
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/photos-step
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, ImagePlus, Camera } from 'lucide-react-native';

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
const IMAGE_GAP = Spacing.xs;
const GRID_COLUMNS = 3;
const IMAGE_SIZE = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md * 2 - IMAGE_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
const MAX_IMAGES = 30;

/** Ensure URL is absolute for Image component */
function toAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Prepend CDN base for relative paths
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
    // Clear any previous error
    setError(null);

    // Check limits
    if (data.images.length >= MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    // Check VIN verification
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
        // Store relative URLs for API submission, toAbsoluteUrl handles display
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
    async (url: string) => {
      try {
        await deleteListingImageByUrl(url);
      } catch {
        /* best-effort */
      }
      onUpdate({ images: data.images.filter((u) => u !== url) });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [data.images, onUpdate]
  );

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
            <ImagePlus size={Sizes.iconMd} color={colors.text} strokeWidth={2} />
            <Body size="medium" style={{ color: colors.text }}>
              Add Photos
            </Body>
            <Supporting size="small" tone="muted">
              Tap to select from gallery
            </Supporting>
          </View>
        )}
      </HapticPressable>

      {/* Error Message */}
      {error && (
        <View style={[styles.errorBox, { backgroundColor: (colors.error ?? '#EF4444') + '15' }]}>
          <Supporting size="small" style={{ color: colors.error ?? '#EF4444' }}>
            {error}
          </Supporting>
        </View>
      )}

      {/* Image Grid */}
      {data.images.length > 0 && (
        <View style={styles.imageGrid}>
          {data.images.map((url, index) => (
            <View key={url} style={styles.imageWrapper}>
              <Image source={{ uri: toAbsoluteUrl(url) }} style={styles.image} />
              {index === 0 && (
                <View style={[styles.coverBadge, { backgroundColor: colors.text }]}>
                  <Supporting size="small" style={{ color: colors.background }}>
                    Cover
                  </Supporting>
                </View>
              )}
              <HapticPressable
                onPress={() => handleDeleteImage(url)}
                style={[styles.deleteButton, { backgroundColor: colors.error ?? '#EF4444' }]}
              >
                <X size={14} color="#FFF" strokeWidth={2} />
              </HapticPressable>
            </View>
          ))}
        </View>
      )}

      {/* Tips */}
      <View style={[styles.tipsBox, { backgroundColor: colors.fillSecondary }]}>
        <Camera size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
        <Supporting size="small" tone="muted" style={{ flex: 1 }}>
          Tips: Use natural lighting, show all angles, include interior. First photo becomes the cover.
        </Supporting>
      </View>

      {/* Count indicator */}
      <Supporting size="small" tone="muted" style={{ textAlign: 'center' }}>
        {data.images.length}/{MAX_IMAGES} photos
      </Supporting>
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
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
  errorBox: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: IMAGE_GAP,
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  deleteButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
});

export default PhotosStepContent;
