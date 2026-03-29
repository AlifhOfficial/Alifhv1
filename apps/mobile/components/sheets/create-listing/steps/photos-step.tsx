/**
 * PhotosStepContent — Upload listing images
 *
 * Content-only component for the unified flow.
 * Drag to reorder. First image is thumbnail.
 *
 * @module components/sheets/create-listing/steps/photos-step
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Dimensions, Alert } from 'react-native';
import DraggableFlatList, { 
  ScaleDecorator, 
  RenderItemParams 
} from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { X, ImagePlus, GripVertical } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Fonts } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { pickAndUploadListingImage, deleteListingImageByUrl } from '@/components/user-inventory-management/utilities/image-upload';
import { CDN_BASE, getThumbUrl } from '@/lib/config';

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

// ─── Grid item types ─────────────────────────────────────────────────────────

/** Confirmed CDN image (draggable, deletable) */
type CdnItem = { type: 'cdn'; url: string };
/** Optimistic image shown instantly; spinner overlay while uploading */
type UploadingItem = { type: 'uploading'; localUri: string };
type GridItem = CdnItem | UploadingItem;

// ─────────────────────────────────────────────────────────────────────────────

export function PhotosStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  // Optimistic: local file:// URIs shown in grid IMMEDIATELY after picker returns.
  // Each entry is removed once its upload succeeds (→ CDN key added to data.images)
  // or fails (→ removed with an error shown).
  const [optimisticUris, setOptimisticUris] = useState<string[]>([]);

  // Accumulates CDN keys during an in-progress upload batch to avoid stale closures.
  const cdnKeysRef = useRef<string[]>([]);

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
    cdnKeysRef.current = [...data.images];

    try {
      const result = await pickAndUploadListingImage({
        vin: data.vin,
        allowMultiple: true,
        maxImages: MAX_IMAGES - data.images.length,
        onProgress: (phase, done, total) => setUploadProgress({ done, total }),

        // ── Perception loader: images appear in grid the moment picker closes
        onImagesPicked: (localUris) => {
          setOptimisticUris((prev) => [...prev, ...localUris]);
        },

        // Swap optimistic → CDN as each image finishes (one at a time)
        onImageUploaded: (localUri, imgResult) => {
          setOptimisticUris((prev) => prev.filter((u) => u !== localUri));
          cdnKeysRef.current = [...cdnKeysRef.current, imgResult.url];
          onUpdate({ images: [...cdnKeysRef.current] });
        },

        // Remove placeholder on failure
        onImageFailed: (localUri) => {
          setOptimisticUris((prev) => prev.filter((u) => u !== localUri));
        },
      });

      if (result.errors.length > 0) {
        setError(result.errors.join('\n'));
      }

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
      setOptimisticUris([]);
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

  // Drag end — only CDN items participate in drag; reconstruct CDN-only order
  const handleDragEnd = useCallback(
    ({ data: newData }: { data: GridItem[] }) => {
      const cdnUrls = newData
        .filter((i): i is CdnItem => i.type === 'cdn')
        .map((i) => i.url);
      onUpdate({ images: cdnUrls });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [onUpdate]
  );
  // Render individual image item — handles both CDN (draggable) and uploading (spinner)
  const renderItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<GridItem>) => {
      const imageIndex = getIndex() ?? 0;
      // Only the first CDN item is the cover; uploading items are not yet confirmed
      const isThumbnail = imageIndex === 0 && item.type === 'cdn';
      // Show thumb in grid — full key is only written to DB, never fetched for display
      const imageUri = item.type === 'cdn'
        ? (getThumbUrl(item.url) ?? toAbsoluteUrl(item.url))
        : item.localUri;
      const isUploading = item.type === 'uploading';

      return (
        <ScaleDecorator>
          <View style={[styles.imageCard, isActive && styles.imageCardActive]}>
            <Image source={{ uri: imageUri }} style={styles.image} />

            {/* Spinner overlay while uploading */}
            {isUploading && (
              <View style={[styles.uploadingOverlay, { backgroundColor: colors.overlay }]}>
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              </View>
            )}

            {/* Thumbnail badge — only on confirmed CDN cover */}
            {isThumbnail && (
              <View style={[styles.thumbnailBadge, { backgroundColor: colors.primary }]}>
                <Text variant="bodySm" style={{ color: colors.primaryForeground, fontSize: Spacing.sm, fontWeight: Fonts.semiBold }}>
                  COVER
                </Text>
              </View>
            )}

            {/* Drag handle — only for confirmed images */}
            {!isUploading && (
              <HapticPressable
                onLongPress={drag}
                delayLongPress={100}
                disabled={isActive}
                style={[styles.dragHandle, { backgroundColor: colors.label + '80' }]}
              >
                <GripVertical size={12} color={colors.background} />
              </HapticPressable>
            )}

            {/* Delete button — only for confirmed images */}
            {!isUploading && item.type === 'cdn' && (
              <HapticPressable
                onPress={() => handleDeleteImage(item.url)}
                style={[styles.deleteBtn, { backgroundColor: colors.label + 'CC' }]}
              >
                <X size={12} color={colors.background} strokeWidth={2.5} />
              </HapticPressable>
            )}
          </View>
        </ScaleDecorator>
      );
    },
    [colors, handleDeleteImage]
  );

  // Combine confirmed CDN images + in-progress optimistic images into one grid
  const gridData: GridItem[] = [
    ...data.images.map((url): CdnItem => ({ type: 'cdn', url })),
    ...optimisticUris.map((localUri): UploadingItem => ({ type: 'uploading', localUri })),
  ];

  const totalCount = data.images.length + optimisticUris.length;

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
        {uploading && uploadProgress.total > 0 ? (
          <View style={styles.uploadingContent}>
            <ActivityIndicator size="small" color={colors.label} />
            <Text variant="body" tone="secondary">
              {`Uploading ${uploadProgress.done} of ${uploadProgress.total}...`}
            </Text>
          </View>
        ) : (
          <View style={styles.uploadContent}>
            <ImagePlus size={Sizes.iconLg} color={colors.labelQuaternary} strokeWidth={1.5} />
            <Text variant="bodySm" tone="muted">
              Add Photos ({totalCount}/{MAX_IMAGES})
            </Text>
          </View>
        )}
      </HapticPressable>

      {/* Error */}
      {error && (
        <Text variant="bodySm" style={{ color: colors.error, marginBottom: Spacing.sm }} tone="secondary">
          {error}
        </Text>
      )}

      {/* Image Grid — shows immediately after picker, spinners on in-progress */}
      {gridData.length > 0 && (
        <View style={styles.gridWrapper}>
          <DraggableFlatList
            data={gridData}
            keyExtractor={(item) => item.type === 'cdn' ? item.url : `opt-${item.localUri}`}
            renderItem={renderItem}
            onDragEnd={handleDragEnd}
            numColumns={GRID_COLUMNS}
            columnWrapperStyle={styles.row}
            scrollEnabled={false}
          />
          <Text variant="bodySm" tone="muted" style={{ marginTop: Spacing.sm }}>
            Hold and drag to reorder
          </Text>
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
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  thumbnailBadge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    paddingHorizontal: Sizes.badgePaddingH,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  dragHandle: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.xs,
    width: Spacing["2xl"],
    height: Spacing["2xl"],
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: Spacing.xl,
    height: Spacing.xl,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PhotosStepContent;
