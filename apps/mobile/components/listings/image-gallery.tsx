/**
 * Image Gallery Component - Swipeable image viewer
 * Takes up ~40% of viewport height with gesture-based navigation
 * Includes grid modal and lightbox integration
 */

import { HapticPressable, SkeletonImage, Text } from '@/components/ui';
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, FlatList, NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { getAppListingImageUrls } from '@/lib/config';
import { ImageGridModal } from './image-grid-modal';

const GALLERY_SIDE_INSET = Spacing.md;
const MAIN_IMAGE_RADIUS = Radius['3xl'];
const MAIN_IMAGE_ASPECT_RATIO = 16 / 10;

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const mediaColors = Colors.dark;
  const { width: screenWidth } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gridModalOpen, setGridModalOpen] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const mainImageWidth = useMemo(() => screenWidth - GALLERY_SIDE_INSET * 2, [screenWidth]);
  const mainImageHeight = useMemo(() => mainImageWidth / MAIN_IMAGE_ASPECT_RATIO, [mainImageWidth]);
  
  const validImages = useMemo(() => 
    images.filter(img => img && typeof img === 'string' && img.trim().length > 0),
    [images]
  );
  
  // Full URLs for lightbox (high-res viewing)
  const fullImages = useMemo(
    () => validImages.map((img) => getAppListingImageUrls(img).full).filter((img): img is string => Boolean(img)),
    [validImages]
  );
  
  // Thumb URLs for carousel and grid (optimized for bandwidth)
  const thumbImages = useMemo(
    () => validImages.map((img) => getAppListingImageUrls(img).thumb).filter((img): img is string => Boolean(img)),
    [validImages]
  );
  
  const allImages = thumbImages.length > 0 ? thumbImages : [];

  const onMomentumScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / mainImageWidth);
    if (index !== currentIndex && index >= 0 && index < allImages.length) {
      setCurrentIndex(index);
    }
  }, [currentIndex, allImages.length, mainImageWidth]);

  const onMainImagePress = useCallback(() => {
    Haptics.selectionAsync();
    setGridModalOpen(true);
  }, []);

  if (allImages.length === 0) {
    return (
      <View
        style={[
          styles.placeholder,
          {
            backgroundColor: mediaColors.backgroundSecondary,
            height: mainImageHeight,
          },
        ]}
      >
        <Text variant="body" style={{ color: mediaColors.labelSecondary }}>
          No Images
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: mainImageHeight }]}>
      {/* Main image stays swipeable; first tap opens the gallery grid. */}
      <View
        style={[
          styles.mainImageWrapper,
          {
            width: mainImageWidth,
            height: mainImageHeight,
            backgroundColor: mediaColors.background,
          },
        ]}
      >
        <FlatList
          ref={flatListRef}
          data={allImages}
          style={[styles.mainImageList, { height: mainImageHeight }]}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          keyExtractor={(_, idx) => `img-${idx}`}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews
          getItemLayout={(_, index) => ({
            length: mainImageWidth,
            offset: mainImageWidth * index,
            index,
          })}
          renderItem={({ item }) => (
            <HapticPressable
              onPress={onMainImagePress}
              style={[styles.mainImageContainer, { width: mainImageWidth, height: mainImageHeight }]}
              accessibilityRole="button"
              accessibilityLabel="Open photo gallery"
            >
              <Image
                source={{ uri: item }}
                style={styles.mainImage}
                contentFit="cover"
                transition={200}
                placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              />
            </HapticPressable>
          )}
        />
        
        <View style={styles.swipeCueLeft} pointerEvents="none">
          <ChevronLeft size={Sizes.iconMd} color={Colors.dark.white} strokeWidth={2.2} />
        </View>
        <View style={styles.swipeCueRight} pointerEvents="none">
          <ChevronRight size={Sizes.iconMd} color={Colors.dark.white} strokeWidth={2.2} />
        </View>
        <View style={styles.bottomOverlayRow} pointerEvents="none">
          <View
            style={[
              styles.counterPill,
              { backgroundColor: mediaColors.fill, borderColor: mediaColors.border },
            ]}
          >
            <Text variant="caption1" style={[styles.overlayText, { color: mediaColors.white }]}> 
              {currentIndex + 1}/{allImages.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Grid Modal - uses thumbs for grid, lightbox opens full-res */}
      {gridModalOpen ? (
        <ImageGridModal
          images={thumbImages}
          fullImages={fullImages}
          isOpen={gridModalOpen}
          title={title}
          currentIndex={currentIndex}
          onClose={() => setGridModalOpen(false)}
          onIndexChange={setCurrentIndex}
        />
      ) : null}
    </View>
  );
}

// Skeleton for loading state
export function ImageGallerySkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonWrapper}>
        <SkeletonImage aspectRatio={MAIN_IMAGE_ASPECT_RATIO} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  skeletonContainer: {
    width: '100%',
  },
  skeletonWrapper: {
    marginHorizontal: GALLERY_SIDE_INSET,
    aspectRatio: MAIN_IMAGE_ASPECT_RATIO,
    borderRadius: MAIN_IMAGE_RADIUS,
    overflow: 'hidden',
  },
  placeholder: {
    marginHorizontal: GALLERY_SIDE_INSET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MAIN_IMAGE_RADIUS,
  },
  
  // Main Image
  mainImageWrapper: {
    alignSelf: 'center',
    borderRadius: MAIN_IMAGE_RADIUS,
    overflow: 'hidden',
  },
  mainImageList: {
    width: '100%',
  },
  mainImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  swipeCueLeft: {
    position: 'absolute',
    left: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  swipeCueRight: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  bottomOverlayRow: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    alignItems: 'center',
  },
  counterPill: {
    minWidth: Sizes.actionButtonSm,
    height: Sizes.actionButtonSm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    color: Colors.dark.white,
  },
});
