/**
 * PhotosStepContent — Upload listing images
 *
 * Content-only component for the unified flow.
 * Drag to reorder. First image is thumbnail.
 *
 * @module components/sheets/create-listing/steps/photos-step
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Dimensions, Alert } from 'react-native';
import DraggableFlatList, { 
  ScaleDecorator, 
  RenderItemParams 
} from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { X, ImagePlus, GripVertical } from 'lucide-react-native';

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

  // Handle drag end - reorder images
  const handleDragEnd = useCallback(
    ({ data: newData }: { data: string[] }) => {
      onUpdate({ images: newData });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [onUpdate]
  );

  // Render individual image item
  const renderItem = useCallback(
    ({ item: url, drag, isActive, getIndex }: RenderItemParams<string>) => {
      const imageIndex = getIndex() ?? 0;
      const isThumbnail = imageIndex === 0;
      
      return (
        <ScaleDecorator>
          <View style={[styles.imageCard, isActive && styles.imageCardActive]}>
            <Image source={{ uri: toAbsoluteUrl(url) }} style={styles.image} />
            
            {/* Thumbnail badge */}
            {isThumbnail && (
              <View style={[styles.thumbnailBadge, { backgroundColor: colors.primary }]}>
                <Body size="small" style={{ color: colors.primaryForeground, fontSize: 8, fontWeight: '600' }}>
                  COVER
                </Body>
              </View>
            )}

            {/* Drag handle */}
            <HapticPressable
              onLongPress={drag}
              delayLongPress={100}
              disabled={isActive}
              style={[styles.dragHandle, { backgroundColor: colors.text + '80' }]}
            >
              <GripVertical size={12} color={colors.background} />
            </HapticPressable>

            {/* Delete button */}
            <HapticPressable
              onPress={() => handleDeleteImage(url)}
              style={[styles.deleteBtn, { backgroundColor: colors.text + 'CC' }]}
            >
              <X size={12} color={colors.background} strokeWidth={2.5} />
            </HapticPressable>
          </View>
        </ScaleDecorator>
      );
    },
    [colors, handleDeleteImage]
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
              {uploadProgress.total > 0
                ? `Uploading ${uploadProgress.done} of ${uploadProgress.total}...`
                : 'Preparing...'}
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

      {/* Image Grid - Draggable */}
      {data.images.length > 0 && (
        <View style={styles.gridWrapper}>
          <DraggableFlatList
            data={data.images}
            keyExtractor={(item) => item}
            renderItem={renderItem}
            onDragEnd={handleDragEnd}
            numColumns={GRID_COLUMNS}
            columnWrapperStyle={styles.row}
            scrollEnabled={false}
          />
          <Supporting size="small" tone="muted" style={{ marginTop: Spacing.sm }}>
            Hold and drag to reorder
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
    gap: IMAGE_GAP,
    marginBottom: IMAGE_GAP,
  },
  imageCard: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  imageCardActive: {
    opacity: 0.9,
    transform: [{ scale: 1.05 }],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  thumbnailBadge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dragHandle: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
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
