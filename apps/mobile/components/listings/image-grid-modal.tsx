/**
 * Image Grid Modal - Full screen bento-style gallery view
 * Native mobile implementation
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Modal, ScrollView, Dimensions, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { ImageLightbox } from './image-lightbox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = Spacing.sm;
const PADDING = Spacing.md;

interface ImageGridModalProps {
  images: string[];
  fullImages?: string[];
  isOpen: boolean;
  title?: string;
  currentIndex?: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

export function ImageGridModal({
  images,
  fullImages,
  isOpen,
  title = 'All Photos',
  currentIndex = 0,
  onClose,
  onIndexChange,
}: ImageGridModalProps) {
  const mediaColors = Colors.dark;
  const insets = useSafeAreaInsets();
  const [selectedIndex, setSelectedIndex] = useState(currentIndex);
  const [showLightbox, setShowLightbox] = useState(false);
  const displayTitle = useMemo(() => {
    if (!title) {
      return '';
    }

    return title.replace(/^\d{4}\s+/, '').trim();
  }, [title]);

  const validImages = useMemo(() => 
    images.filter(img => img && typeof img === 'string' && img.trim().length > 0),
    [images]
  );
  const validFullImages = useMemo(
    () => (fullImages ?? images).filter(img => img && typeof img === 'string' && img.trim().length > 0),
    [fullImages, images]
  );

  const totalImages = validImages.length;

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(currentIndex);
      setShowLightbox(false);
    }
  }, [isOpen, currentIndex]);

  const handleImagePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setSelectedIndex(index);
    onIndexChange?.(index);
    setShowLightbox(true);
  }, [onIndexChange]);

  const handleLightboxIndexChange = useCallback((index: number) => {
    setSelectedIndex(index);
    onIndexChange?.(index);
  }, [onIndexChange]);

  // Build bento grid rows
  const buildRows = () => {
    const rows: React.ReactNode[] = [];
    let i = 0;
    const contentWidth = SCREEN_WIDTH - (PADDING * 2);
    const largeWidth = contentWidth * 0.65;
    const smallWidth = contentWidth * 0.35 - GRID_GAP;

    while (i < totalImages) {
      const remaining = totalImages - i;
      const rowIndex = rows.length;
      const baseIndex = i;

      if (remaining >= 3 && rowIndex % 3 === 0) {
        // Pattern A: Large left + 2 stacked right
        rows.push(
          <View key={`row-${rowIndex}`} style={styles.row}>
            <HapticPressable
              onPress={() => handleImagePress(baseIndex)}
              style={[styles.largeImage, { width: largeWidth }]}
            >
              <Image
                source={{ uri: validImages[baseIndex] }}
                style={styles.image}
                contentFit="cover"
                transition={150}
              />
              <View style={styles.indexBadge}>
                <Text variant="subhead" style={styles.indexText}>{baseIndex + 1}</Text>
              </View>
            </HapticPressable>
            <View style={[styles.stackedColumn, { width: smallWidth }]}>
              {[1, 2].map((offset) => {
                const imgIdx = baseIndex + offset;
                if (imgIdx >= totalImages) return null;
                return (
                  <HapticPressable
                    key={imgIdx}
                    onPress={() => handleImagePress(imgIdx)}
                    style={styles.smallImage}
                  >
                    <Image
                      source={{ uri: validImages[imgIdx] }}
                      style={styles.image}
                      contentFit="cover"
                      transition={150}
                    />
                    <View style={styles.indexBadge}>
                      <Text variant="subhead" style={styles.indexText}>{imgIdx + 1}</Text>
                    </View>
                  </HapticPressable>
                );
              })}
            </View>
          </View>
        );
        i += 3;
      } else if (remaining >= 3 && rowIndex % 3 === 1) {
        // Pattern B: 3 equal
        const thirdWidth = (contentWidth - GRID_GAP * 2) / 3;
        rows.push(
          <View key={`row-${rowIndex}`} style={styles.row}>
            {[0, 1, 2].map((offset) => {
              const imgIdx = baseIndex + offset;
              if (imgIdx >= totalImages) return null;
              return (
                <HapticPressable
                  key={imgIdx}
                  onPress={() => handleImagePress(imgIdx)}
                  style={[styles.equalImage, { width: thirdWidth }]}
                >
                  <Image
                    source={{ uri: validImages[imgIdx] }}
                    style={styles.image}
                    contentFit="cover"
                    transition={150}
                  />
                  <View style={styles.indexBadge}>
                    <Text variant="subhead" style={styles.indexText}>{imgIdx + 1}</Text>
                  </View>
                </HapticPressable>
              );
            })}
          </View>
        );
        i += 3;
      } else if (remaining >= 3 && rowIndex % 3 === 2) {
        // Pattern C: 2 stacked left + Large right
        rows.push(
          <View key={`row-${rowIndex}`} style={styles.row}>
            <View style={[styles.stackedColumn, { width: smallWidth }]}>
              {[0, 1].map((offset) => {
                const imgIdx = baseIndex + offset;
                if (imgIdx >= totalImages) return null;
                return (
                  <HapticPressable
                    key={imgIdx}
                    onPress={() => handleImagePress(imgIdx)}
                    style={styles.smallImage}
                  >
                    <Image
                      source={{ uri: validImages[imgIdx] }}
                      style={styles.image}
                      contentFit="cover"
                      transition={150}
                    />
                    <View style={styles.indexBadge}>
                      <Text variant="subhead" style={styles.indexText}>{imgIdx + 1}</Text>
                    </View>
                  </HapticPressable>
                );
              })}
            </View>
            <HapticPressable
              onPress={() => handleImagePress(baseIndex + 2)}
              style={[styles.largeImage, { width: largeWidth }]}
            >
              <Image
                source={{ uri: validImages[baseIndex + 2] }}
                style={styles.image}
                contentFit="cover"
                transition={150}
              />
              <View style={styles.indexBadge}>
                <Text variant="subhead" style={styles.indexText}>{baseIndex + 3}</Text>
              </View>
            </HapticPressable>
          </View>
        );
        i += 3;
      } else if (remaining === 2) {
        // 2 remaining: side by side
        const halfWidth = (contentWidth - GRID_GAP) / 2;
        rows.push(
          <View key={`row-${rowIndex}`} style={styles.row}>
            {[0, 1].map((offset) => {
              const imgIdx = baseIndex + offset;
              return (
                <HapticPressable
                  key={imgIdx}
                  onPress={() => handleImagePress(imgIdx)}
                  style={[styles.halfImage, { width: halfWidth }]}
                >
                  <Image
                    source={{ uri: validImages[imgIdx] }}
                    style={styles.image}
                    contentFit="cover"
                    transition={150}
                  />
                  <View style={styles.indexBadge}>
                    <Text variant="subhead" style={styles.indexText}>{imgIdx + 1}</Text>
                  </View>
                </HapticPressable>
              );
            })}
          </View>
        );
        i += 2;
      } else if (remaining === 1) {
        // 1 remaining: full width
        rows.push(
          <View key={`row-${rowIndex}`} style={styles.row}>
            <HapticPressable
              onPress={() => handleImagePress(baseIndex)}
              style={[styles.fullImage, { width: contentWidth }]}
            >
              <Image
                source={{ uri: validImages[baseIndex] }}
                style={styles.image}
                contentFit="cover"
                transition={150}
              />
              <View style={styles.indexBadge}>
                <Text variant="subhead" style={styles.indexText}>{baseIndex + 1}</Text>
              </View>
            </HapticPressable>
          </View>
        );
        i += 1;
      } else {
        i += 1;
      }
    }

    return rows;
  };

  if (!isOpen || totalImages === 0) {
    return null;
  }

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor={mediaColors.background} />
      <View style={[styles.container, { backgroundColor: mediaColors.background }]}> 
        {showLightbox ? (
          <ImageLightbox
            images={validFullImages}
            previewImages={validImages}
            title={title}
            currentIndex={selectedIndex}
            isOpen={showLightbox}
            useModal={false}
            onClose={() => setShowLightbox(false)}
            onIndexChange={handleLightboxIndexChange}
          />
        ) : (
          <>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor: mediaColors.background, borderBottomColor: mediaColors.border }]}> 
              <View style={styles.headerSpacer} />

              <View style={styles.titleWrapper} pointerEvents="none">
                {displayTitle ? (
                  <Text variant="subhead" style={styles.titleText} numberOfLines={1}>
                    {displayTitle}
                  </Text>
                ) : (
                  <Text variant="subhead" style={styles.titleText} numberOfLines={1}>
                    {totalImages} photos
                  </Text>
                )}
              </View>

              <HapticPressable
                onPress={onClose}
                style={[styles.backButton, { backgroundColor: mediaColors.fill }]}
                hitSlop={Layout.hitSlop}
              >
                {({ pressed }) => (
                  <X size={Sizes.iconMd} color={mediaColors.white} strokeWidth={2.2} style={{ opacity: pressed ? 0.7 : 1 }} />
                )}
              </HapticPressable>
            </View>

            {/* Image Grid */}
            <ScrollView
              style={styles.scrollView}
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
              showsVerticalScrollIndicator={false}
            >
              {buildRows()}
            </ScrollView>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: Sizes.actionButtonMd,
    height: Sizes.actionButtonMd,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  titleText: {
    color: Colors.dark.white,
  },
  headerSpacer: {
    width: Sizes.actionButtonMd,
    height: Sizes.actionButtonMd,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    padding: PADDING,
    gap: GRID_GAP,
  },
  row: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  largeImage: {
    aspectRatio: 4 / 3,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  stackedColumn: {
    gap: GRID_GAP,
  },
  smallImage: {
    flex: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  equalImage: {
    aspectRatio: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  halfImage: {
    aspectRatio: 4 / 3,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  fullImage: {
    aspectRatio: 16 / 9,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  indexBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Radius.sm,
    backgroundColor: Colors.dark.overlay,
  },
  indexText: {
    color: Colors.dark.white,
  },
});
