/**
 * PhotosStepContent — Upload listing images
 *
 * Content-only component for the unified flow.
 * Drag to reorder. First image is thumbnail.
 *
 * @module components/sheets/create-listing/steps/photos-step
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Dimensions, Modal, Pressable } from 'react-native';
import DraggableFlatList, { 
  ScaleDecorator, 
  RenderItemParams 
} from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { X, ImagePlus } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, SheetChrome, SheetTypography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { pickAndUploadListingImage, deleteListingImageByUrl } from '@/components/user-inventory-management/utilities/image-upload';
import { CDN_BASE, getThumbUrl } from '@/lib/config';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_GAP = Spacing.md;
const GRID_COLUMNS = 2;
const IMAGE_SIZE =
  (SCREEN_WIDTH - SheetChrome.contentPaddingHorizontal * 2 - IMAGE_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
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
  const [perceivedDone, setPerceivedDone] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Optimistic: local file:// URIs shown in grid IMMEDIATELY after picker returns.
  // Each entry is removed once its upload succeeds (→ CDN key added to data.images)
  // or fails (→ removed with an error shown).
  const [optimisticUris, setOptimisticUris] = useState<string[]>([]);

  // Accumulates CDN keys during an in-progress upload batch to avoid stale closures.
  const cdnKeysRef = useRef<string[]>([]);

  useEffect(() => {
    if (!uploading) {
      setPerceivedDone(0);
      return;
    }

    if (!uploadProgress.total) {
      setPerceivedDone(0);
      return;
    }

    setPerceivedDone((prev) => Math.max(prev, uploadProgress.done));

    const interval = setInterval(() => {
      setPerceivedDone((prev) => {
        const cap = Math.min(uploadProgress.total, Math.max(uploadProgress.done, Math.ceil(uploadProgress.total * 0.9)));
        if (prev >= cap) return prev;
        return Math.min(cap, prev + 1);
      });
    }, 450);

    return () => clearInterval(interval);
  }, [uploading, uploadProgress.done, uploadProgress.total]);

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

  const handleDeleteImage = useCallback((url: string) => {
    setDeleteTarget(url);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);

    try {
      await deleteListingImageByUrl(target);
    } catch {
      /* best-effort */
    }
    onUpdate({ images: data.images.filter((u) => u !== target) });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [data.images, deleteTarget, onUpdate]);

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
                <Text variant={SheetTypography.supporting} style={{ color: colors.primaryForeground }}>
                  Cover
                </Text>
              </View>
            )}

            {/* Drag affordance — long press anywhere */}
            {!isUploading && (
              <HapticPressable
                onLongPress={drag}
                delayLongPress={120}
                disabled={isActive}
                style={styles.dragHotspot}
              />
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
        style={[styles.uploadButton, { backgroundColor: colors.surfaceSecondary }]}
      >
        {uploading && uploadProgress.total > 0 ? (
          <View style={styles.uploadingContent}>
            <ActivityIndicator size="small" color={colors.label} />
            <Text variant={SheetTypography.rowLabel} tone="secondary">
              {`Uploading ${perceivedDone} of ${uploadProgress.total}`}
            </Text>
          </View>
        ) : (
          <View style={styles.uploadContent}>
            <ImagePlus size={Sizes.iconLg} color={colors.labelSecondary} strokeWidth={1.5} />
            <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.label, textAlign: 'center' }}>
              Add photos
            </Text>
            <Text variant={SheetTypography.supporting} tone="muted">
              {totalCount}/{MAX_IMAGES} uploaded
            </Text>
          </View>
        )}
      </HapticPressable>

      {/* Error */}
      {error && (
        <Text variant={SheetTypography.rowLabel} style={{ color: colors.error, marginBottom: Spacing.sm }} tone="secondary">
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
          <Text variant={SheetTypography.supporting} tone="muted" style={{ marginTop: Spacing.sm }}>
            Long press a photo to reorder
          </Text>
        </View>
      )}

      <Modal
        transparent
        visible={!!deleteTarget}
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          onPress={() => setDeleteTarget(null)}
        />
        <View style={[styles.modalCard, { backgroundColor: colors.surfaceSecondary }]}>
          <Text variant="subheadEmphasized" style={{ color: colors.label }}>
            Remove photo?
          </Text>
          <Text variant="footnote" tone="secondary">
            This photo will be removed from the listing.
          </Text>
          <View style={styles.modalActions}>
            <HapticPressable
              onPress={() => setDeleteTarget(null)}
              style={[styles.modalButton, { backgroundColor: colors.surface }]}
            >
              <Text variant="subhead" style={{ color: colors.label }}>
                Keep
              </Text>
            </HapticPressable>
            <HapticPressable
              onPress={confirmDelete}
              style={[styles.modalButton, { backgroundColor: colors.error }]}
            >
              <Text variant="subheadEmphasized" style={{ color: colors.primaryForeground }}>
                Remove
              </Text>
            </HapticPressable>
          </View>
        </View>
      </Modal>
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  uploadButton: {
    borderRadius: Radius.xl,
    paddingVertical: Spacing["4xl"],
    paddingHorizontal: Spacing.lg,
    minHeight: Sizes.actionButtonLg * 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  uploadContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
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
    borderRadius: Radius.lg,
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
    paddingVertical: Sizes.badgePaddingV,
    borderRadius: Radius.sm,
  },
  dragHotspot: {
    ...StyleSheet.absoluteFillObject,
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    marginHorizontal: 24,
    marginTop: 'auto',
    marginBottom: 32,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PhotosStepContent;
