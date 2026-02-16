/**
 * PhotosSheet — Upload listing images
 *
 * Image picker grid with upload progress.
 * Optional but highly recommended.
 *
 * @module components/sheets/create-listing/sheets/photos-sheet
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, ImagePlus } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { pickAndUploadListingImage, deleteListingImageByUrl } from '@/components/user-inventory-management/utilities/image-upload';

import { CreateFlowSheet, CreateFlowScrollContent } from '../base-sheet';
import { ResponseSheet, type ResponseType } from '../response-sheet';
import type { SheetStepProps } from '../types';
import { getProgress, SHEET_STEPS } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_GAP = Spacing.xs;
const GRID_COLUMNS = 3;
const IMAGE_SIZE = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md * 2 - IMAGE_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
const MAX_IMAGES = 20;

// ─────────────────────────────────────────────────────────────────────────────

export function PhotosSheet({
  visible,
  data,
  onUpdate,
  onNext,
  onSkip,
  onBack,
  onClose,
}: SheetStepProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  // Response sheet state
  const [response, setResponse] = useState<{
    visible: boolean;
    type: ResponseType;
    title: string;
    message?: string;
    onRetry?: () => void;
  }>({ visible: false, type: 'error', title: '' });

  const showResponse = useCallback((opts: Omit<typeof response, 'visible'>) => {
    setResponse({ ...opts, visible: true });
  }, []);

  const hideResponse = useCallback(() => {
    setResponse((prev) => ({ ...prev, visible: false }));
  }, []);

  const handlePickImages = useCallback(async () => {
    // Show error if limit reached
    if (data.images.length >= MAX_IMAGES) {
      showResponse({
        type: 'warning',
        title: 'Limit Reached',
        message: `Maximum ${MAX_IMAGES} images allowed.`,
      });
      return;
    }

    // Show error if VIN not verified
    if (!data.vinVerified) {
      showResponse({
        type: 'warning',
        title: 'VIN Required',
        message: 'Please verify your VIN before uploading images.',
      });
      return;
    }

    setUploading(true);
    try {
      const result = await pickAndUploadListingImage({
        vin: data.vin,
        allowMultiple: true,
        maxImages: MAX_IMAGES - data.images.length,
        onProgress: (done, total) => setUploadProgress({ done, total }),
      });

      if (result.success && result.images.length > 0) {
        const newUrls = result.images.map((img) => img.url);
        onUpdate({ images: [...data.images, ...newUrls] });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      if (result.errors.length > 0) {
        showResponse({
          type: 'warning',
          title: 'Upload Issues',
          message: result.errors.join('\n'),
        });
      }
    } catch (err: any) {
      showResponse({
        type: 'error',
        title: 'Upload Failed',
        message: err.message ?? 'Something went wrong.',
        onRetry: handlePickImages,
      });
    } finally {
      setUploading(false);
      setUploadProgress({ done: 0, total: 0 });
    }
  }, [data.vin, data.vinVerified, data.images, onUpdate, showResponse]);

  const handleDeleteImage = useCallback(
    async (url: string) => {
      // Direct delete without confirmation
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

  const stepIndex = SHEET_STEPS.findIndex((s) => s.id === 'photos');
  const progress = getProgress(stepIndex + 1);

  const hasPhotos = data.images.length > 0;

  return (
    <CreateFlowSheet
      visible={visible}
      onClose={onClose}
      title={`Photos (${data.images.length}/${MAX_IMAGES})`}
      showBack
      onBack={onBack}
      canSkip
      onSkip={onSkip}
      primaryLabel={hasPhotos ? 'Next' : 'Skip'}
      onPrimary={hasPhotos ? onNext : onSkip}
      progress={progress}
    >
      <CreateFlowScrollContent>
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

        {/* Image Grid */}
        {data.images.length > 0 && (
          <View style={styles.imageGrid}>
            {data.images.map((url, index) => (
              <View key={url} style={styles.imageWrapper}>
                <Image source={{ uri: url }} style={styles.image} />
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
          <Supporting size="small" tone="muted">
            Tips: Use natural lighting, show all angles, include interior. First photo becomes the cover.
          </Supporting>
        </View>
      </CreateFlowScrollContent>

      {/* Response Sheet for errors/warnings */}
      <ResponseSheet
        visible={response.visible}
        type={response.type}
        title={response.title}
        message={response.message}
        onDismiss={hideResponse}
        onRetry={response.onRetry}
      />
    </CreateFlowSheet>
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
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: IMAGE_GAP,
    marginTop: Spacing.md,
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
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
  },
});

export default PhotosSheet;
