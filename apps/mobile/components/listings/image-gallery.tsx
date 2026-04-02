/**
 * Image Gallery Component - Swipeable image viewer
 * Takes up ~40% of viewport height with gesture-based navigation
 * Includes grid modal and lightbox integration
 */

import { HapticPressable, Skeleton, Text } from '@/components/ui';
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { getAppListingImageUrls } from '@/lib/config';
import { ImageLightbox } from './image-lightbox';
import { ImageGridModal } from './image-grid-modal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GALLERY_SIDE_INSET = Spacing.lg;
const MAIN_IMAGE_WIDTH = SCREEN_WIDTH - GALLERY_SIDE_INSET * 2;
const MAIN_IMAGE_RADIUS = Radius['3xl'];
// 4:3 aspect ratio for main image
const MAIN_IMAGE_HEIGHT = MAIN_IMAGE_WIDTH * (3 / 4);
const GALLERY_HEIGHT = MAIN_IMAGE_HEIGHT;

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const mediaColors = Colors.dark;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [gridModalOpen, setGridModalOpen] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
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

  useEffect(() => {
    const firstThumb = thumbImages[0] ?? null;
    const firstFull = fullImages[0] ?? null;

    const getHost = (url: string | null) => {
      if (!url) return null;
      try {
        return new URL(url).hostname;
      } catch {
        return 'invalid-url';
      }
    };

    console.log(
      '[ImageGallery] Resolved listing images:',
      JSON.stringify({
        thumb: firstThumb,
        thumbHost: getHost(firstThumb),
        full: firstFull,
        fullHost: getHost(firstFull),
        count: validImages.length,
      })
    );
  }, [thumbImages, fullImages, validImages.length]);

  const onMomentumScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / MAIN_IMAGE_WIDTH);
    if (index !== currentIndex && index >= 0 && index < allImages.length) {
      setCurrentIndex(index);
    }
  }, [currentIndex, allImages.length]);

  const onMainImagePress = useCallback(() => {
    Haptics.selectionAsync();
    setLightboxOpen(true);
  }, []);

  const onViewAllPress = useCallback(() => {
    Haptics.selectionAsync();
    setGridModalOpen(true);
  }, []);

  if (allImages.length === 0) {
    return (
      <View style={[styles.placeholder, { backgroundColor: mediaColors.backgroundSecondary }]}>
        <Text variant="body" style={{ color: mediaColors.labelSecondary }}>
          No Images
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Image - Swipeable, tap to open lightbox */}
      <View style={[styles.mainImageWrapper, { backgroundColor: mediaColors.background }]}>
        <FlatList
          ref={flatListRef}
          data={allImages}
          style={styles.mainImageList}
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
            length: MAIN_IMAGE_WIDTH,
            offset: MAIN_IMAGE_WIDTH * index,
            index,
          })}
          renderItem={({ item }) => (
            <HapticPressable onPress={onMainImagePress} style={styles.mainImageContainer}>
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
        <View style={styles.bottomOverlayRow} pointerEvents="box-none">
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

          <HapticPressable
            onPress={onViewAllPress}
            style={[styles.overlayButton, { backgroundColor: mediaColors.fill, borderColor: mediaColors.border }]}
            accessibilityRole="button"
            accessibilityLabel="View all photos"
          >
            {({ pressed }) => (
              <Plus size={Sizes.iconSm} color={mediaColors.white} strokeWidth={2.2} style={{ opacity: pressed ? 0.7 : 1 }} />
            )}
          </HapticPressable>
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

      {/* Lightbox Modal - uses full-res images */}
      {lightboxOpen ? (
        <ImageLightbox
          images={fullImages}
          title={title}
          currentIndex={currentIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setCurrentIndex}
        />
      ) : null}
    </View>
  );
}

// Skeleton for loading state
export function ImageGallerySkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.mainImageWrapper}>
        <Skeleton width="100%" height={MAIN_IMAGE_HEIGHT} borderRadius={MAIN_IMAGE_RADIUS} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: GALLERY_HEIGHT,
  },
  placeholder: {
    marginHorizontal: GALLERY_SIDE_INSET,
    height: GALLERY_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MAIN_IMAGE_RADIUS,
  },
  
  // Main Image
  mainImageWrapper: {
    width: MAIN_IMAGE_WIDTH,
    alignSelf: 'center',
    flex: 1,
    borderRadius: MAIN_IMAGE_RADIUS,
    overflow: 'hidden',
  },
  mainImageList: {
    width: '100%',
  },
  mainImageContainer: {
    width: MAIN_IMAGE_WIDTH,
    flex: 1,
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
    left: Spacing.md,
    right: Spacing.md,
    bottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
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
  overlayButton: {
    width: Sizes.actionButtonSm,
    height: Sizes.actionButtonSm,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    color: Colors.dark.white,
  },
});
