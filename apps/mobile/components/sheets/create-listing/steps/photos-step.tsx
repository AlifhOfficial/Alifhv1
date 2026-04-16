/**
 * PhotosStepContent — Upload listing images
 *
 * Content-only component for the unified flow.
 * Drag to reorder. First image is thumbnail.
 *
 * @module components/sheets/create-listing/steps/photos-step
 */

import { Text, HapticPressable } from "@/components/ui";
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  useWindowDimensions,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { Image } from "expo-image";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import * as Haptics from "expo-haptics";
import { GripVertical, X, ImagePlus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Colors,
  Spacing,
  Radius,
  Sizes,
  SheetChrome,
  SheetTypography,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import {
  pickAndUploadListingImage,
  deleteListingImageByUrl,
} from "@/components/user-inventory-management/utilities/image-upload";
import { getAppImageUrl, getThumbUrl } from "@/lib/config";

import { StepContainer } from "../step-container";
import type { StepContentProps } from "../types";

// ─────────────────────────────────────────────────────────────────────────────

const IMAGE_GAP = Spacing.md;
const GRID_COLUMNS = 2;
const MAX_IMAGES = 30;

function toAbsoluteUrl(url: string): string {
  return getAppImageUrl(url) ?? "";
}

// ─── Grid item types ─────────────────────────────────────────────────────────

/** Confirmed CDN image (draggable, deletable) */
type CdnItem = { type: "cdn"; url: string };
/** Optimistic image shown instantly; spinner overlay while uploading */
type UploadingItem = { type: "uploading"; localUri: string };
type GridItem = CdnItem | UploadingItem;

// ─────────────────────────────────────────────────────────────────────────────

export function PhotosStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const imageWidth =
    (width -
      SheetChrome.contentPaddingHorizontal * 2 -
      IMAGE_GAP * (GRID_COLUMNS - 1)) /
    GRID_COLUMNS;
  const imageHeight = Math.round((imageWidth * 9) / 16);
  const reorderModalHorizontalMargin = Spacing.lg;
  const reorderModalHorizontalPadding = Spacing.md;
  const reorderGridWidth =
    width -
    reorderModalHorizontalMargin * 2 -
    reorderModalHorizontalPadding * 2;
  const reorderImageWidth =
    (reorderGridWidth - IMAGE_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  const reorderImageHeight = Math.round((reorderImageWidth * 9) / 16);

  const [uploading, setUploading] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [isReorderDragging, setIsReorderDragging] = useState(false);
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
        const cap = Math.min(
          uploadProgress.total,
          Math.max(uploadProgress.done, Math.ceil(uploadProgress.total * 0.9)),
        );
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
      setError("Please verify your VIN before uploading images.");
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
        setError(result.errors.join("\n"));
      }

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
      setOptimisticUris([]);
    } finally {
      setUploading(false);
      setUploadProgress({ done: 0, total: 0 });
    }
  }, [data.vin, data.vinVerified, data.images, onUpdate]);

  const confirmDeleteIOS = useCallback(
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

  const handleDeleteImage = useCallback((url: string) => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Remove"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
          title: "Remove photo?",
          message: "This photo will be removed from the listing.",
          userInterfaceStyle: colorScheme === "dark" ? "dark" : "light",
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            void confirmDeleteIOS(url);
          }
        }
      );
    } else {
      setDeleteTarget(url);
    }
  }, [colorScheme, confirmDeleteIOS]);

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

  // Render image item for the main scroll surface (no drag to avoid gesture conflicts)
  const renderPreviewItem = useCallback(
    (item: GridItem, imageIndex: number) => {
      // Only the first CDN item is the cover; uploading items are not yet confirmed
      const isThumbnail = imageIndex === 0 && item.type === "cdn";
      // Show thumb in grid — full key is only written to DB, never fetched for display
      const imageUri =
        item.type === "cdn"
          ? (getThumbUrl(item.url) ?? toAbsoluteUrl(item.url))
          : item.localUri;
      const isUploading = item.type === "uploading";

      return (
        <View
          key={item.type === "cdn" ? item.url : `opt-${item.localUri}`}
          style={[
            styles.imageCard,
            { width: imageWidth, height: imageHeight },
          ]}
        >
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />

          {/* Spinner overlay while uploading */}
          {isUploading && (
            <View
              style={[
                styles.uploadingOverlay,
                { backgroundColor: colors.overlay },
              ]}
            >
              <ActivityIndicator
                size="small"
                color={colors.primaryForeground}
              />
            </View>
          )}

          {/* Thumbnail badge — only on confirmed CDN cover */}
          {isThumbnail && (
            <View
              style={[
                styles.thumbnailBadge,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text
                variant={SheetTypography.supporting}
                style={{ color: colors.primaryForeground }}
              >
                Cover
              </Text>
            </View>
          )}

          {/* Delete button — only for confirmed images */}
          {!isUploading && item.type === "cdn" && (
            <HapticPressable
              onPress={() => handleDeleteImage(item.url)}
              style={[
                styles.deleteBtn,
                { backgroundColor: colors.label + "CC" },
              ]}
            >
              <X size={12} color={colors.background} strokeWidth={2.5} />
            </HapticPressable>
          )}
        </View>
      );
    },
    [
      colors,
      handleDeleteImage,
      imageHeight,
      imageWidth,
    ],
  );

  const reorderData: CdnItem[] = data.images.map((url) => ({ type: "cdn", url }));

  const renderReorderItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<CdnItem>) => {
      const imageIndex = getIndex() ?? 0;
      const imageUri = getThumbUrl(item.url) ?? toAbsoluteUrl(item.url);
      const isThumbnail = imageIndex === 0;

      return (
        <ScaleDecorator>
          <Pressable
            onLongPress={() => {
              Haptics.selectionAsync();
              drag();
            }}
            delayLongPress={180}
            disabled={isActive}
            style={[
              styles.imageCard,
              { width: reorderImageWidth, height: reorderImageHeight },
              isActive && styles.imageCardActive,
            ]}
          >
            <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />

            {isThumbnail && (
              <View
                style={[
                  styles.thumbnailBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  variant={SheetTypography.supporting}
                  style={{ color: colors.primaryForeground }}
                >
                  Cover
                </Text>
              </View>
            )}

            <View
              pointerEvents="none"
              style={[styles.dragHandle, { backgroundColor: colors.overlay }]}
            >
              <GripVertical
                size={14}
                color={colors.primaryForeground}
                strokeWidth={2}
              />
            </View>
          </Pressable>
        </ScaleDecorator>
      );
    },
    [colors, reorderImageHeight, reorderImageWidth],
  );

  const handleReorderEnd = useCallback(
    ({ data: newData }: { data: CdnItem[] }) => {
      setIsReorderDragging(false);
      onUpdate({ images: newData.map((i) => i.url) });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [onUpdate],
  );

  // Combine confirmed CDN images + in-progress optimistic images into one grid
  const gridData: GridItem[] = [
    ...data.images.map((url): CdnItem => ({ type: "cdn", url })),
    ...optimisticUris.map(
      (localUri): UploadingItem => ({ type: "uploading", localUri }),
    ),
  ];

  const totalCount = data.images.length + optimisticUris.length;

  return (
    <>
      <StepContainer>
      {/* Upload Button */}
      <HapticPressable
        onPress={handlePickImages}
        disabled={uploading}
        style={[
          styles.uploadButton,
          { backgroundColor: colors.surfaceSecondary },
        ]}
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
            <ImagePlus
              size={Sizes.iconLg}
              color={colors.labelSecondary}
              strokeWidth={1.5}
            />
            <Text
              variant={SheetTypography.rowLabelSelected}
              style={{ color: colors.label, textAlign: "center" }}
            >
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
        <Text
          variant={SheetTypography.rowLabel}
          style={{ color: colors.error, marginBottom: Spacing.sm }}
          tone="secondary"
        >
          {error}
        </Text>
      )}

      {/* Image Grid — shows immediately after picker, spinners on in-progress */}
      {gridData.length > 0 && (
        <View style={[styles.gridWrapper, { minHeight: imageHeight }]}> 
          <View style={styles.previewGrid}>
            {gridData.map((item, index) => renderPreviewItem(item, index))}
          </View>
          {data.images.length > 1 && (
            <HapticPressable
              onPress={() => setIsReorderOpen(true)}
              style={[styles.reorderButton, { backgroundColor: colors.fill2, borderColor: colors.border }]}
            >
              <GripVertical size={14} color={colors.labelSecondary} strokeWidth={2} />
              <Text variant="subhead" style={{ color: colors.label }}>
                Reorder photos
              </Text>
            </HapticPressable>
          )}
          <Text
            variant={SheetTypography.supporting}
            tone="muted"
            style={{ marginTop: Spacing.sm }}
          >
            Scroll here is now independent from drag. Use Reorder photos to change order.
          </Text>
        </View>
      )}
      </StepContainer>

      <Modal
        transparent
        visible={isReorderOpen}
        animationType="slide"
        onRequestClose={() => setIsReorderOpen(false)}
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]} />
        <View
          style={[
            styles.reorderModalCard,
            {
              backgroundColor: colors.surfaceSecondary,
              marginTop: insets.top + Spacing.sm,
              marginBottom: insets.bottom + Spacing.md,
            },
          ]}
        >
          <View style={styles.reorderHeader}>
            <Text variant="subheadEmphasized" style={{ color: colors.label }}>
              Reorder photos
            </Text>
            <HapticPressable
              onPress={() => setIsReorderOpen(false)}
              style={[styles.closeReorderBtn, { backgroundColor: colors.fill2 }]}
            >
              <X size={14} color={colors.label} strokeWidth={2.5} />
            </HapticPressable>
          </View>

          <DraggableFlatList
            data={reorderData}
            keyExtractor={(item) => item.url}
            renderItem={renderReorderItem}
            onDragEnd={handleReorderEnd}
            onDragBegin={() => setIsReorderDragging(true)}
            onRelease={() => setIsReorderDragging(false)}
            numColumns={GRID_COLUMNS}
            columnWrapperStyle={styles.reorderRow}
            scrollEnabled={!isReorderDragging}
            activationDistance={8}
            autoscrollSpeed={120}
            dragItemOverflow={false}
            contentContainerStyle={[
              styles.reorderListContent,
              { paddingBottom: insets.bottom + Spacing.sm },
            ]}
          />
        </View>
      </Modal>

      {Platform.OS === "android" && (
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
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
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
                <Text
                  variant="subheadEmphasized"
                  style={{ color: colors.primaryForeground }}
                >
                  Remove
                </Text>
              </HapticPressable>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  uploadButton: {
    borderRadius: Radius.xl,
    paddingVertical: Spacing["4xl"],
    paddingHorizontal: Spacing.lg,
    minHeight: Sizes.actionButtonLg * 3.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  uploadContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    width: "100%",
  },
  uploadingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  gridWrapper: {
    marginTop: Spacing.xs,
  },
  previewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: IMAGE_GAP,
  },
  reorderButton: {
    marginTop: Spacing.sm,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  row: {
    gap: IMAGE_GAP,
    marginBottom: IMAGE_GAP,
  },
  reorderRow: {
    justifyContent: "space-between",
    marginBottom: IMAGE_GAP,
  },
  imageCard: {
    borderRadius: Radius.lg,
    overflow: "hidden",
  },
  imageCardActive: {
    opacity: 0.9,
    transform: [{ scale: 1.05 }],
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  thumbnailBadge: {
    position: "absolute",
    top: Spacing.xs,
    left: Spacing.xs,
    paddingHorizontal: Sizes.badgePaddingH,
    paddingVertical: Sizes.badgePaddingV,
    borderRadius: Radius.sm,
  },
  dragHandle: {
    position: "absolute",
    right: Spacing.sm,
    bottom: Spacing.sm,
    width: 34,
    height: 34,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    width: Spacing.xl,
    height: Spacing.xl,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  reorderModalCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flex: 1,
    gap: Spacing.sm,
  },
  reorderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeReorderBtn: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  reorderListContent: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  modalCard: {
    marginHorizontal: 24,
    marginTop: "auto",
    marginBottom: 32,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PhotosStepContent;
