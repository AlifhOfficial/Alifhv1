/**
 * Image Gallery Component - Swipeable image viewer with thumbnails
 * Takes up ~40% of viewport height with gesture-based navigation
 * Includes View All button and lightbox/grid modal integration
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { HapticPressable } from '@/components/ui';
import { Image } from 'expo-image';
import { Grid3x3 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppListingImageUrls } from '@/lib/config';
import { Skeleton, Data, ButtonText } from '@/components/ui';
import { ImageLightbox } from './image-lightbox';
import { ImageGridModal } from './image-grid-modal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// 4:3 aspect ratio for main image + thumbnail strip
const MAIN_IMAGE_HEIGHT = SCREEN_WIDTH * (3 / 4);
const THUMBNAIL_SIZE = Sizes.cardThumbnailWidth * 0.35; // ~56
const THUMBNAIL_STRIP_HEIGHT = THUMBNAIL_SIZE + Spacing.lg;
const GALLERY_HEIGHT = MAIN_IMAGE_HEIGHT + THUMBNAIL_STRIP_HEIGHT;

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [gridModalOpen, setGridModalOpen] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const thumbnailListRef = useRef<FlatList>(null);
  
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
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < allImages.length) {
      setCurrentIndex(index);
    }
  }, [currentIndex, allImages.length]);

  const onMainImagePress = useCallback(() => {
    Haptics.selectionAsync();
    setLightboxOpen(true);
  }, []);

  const onThumbnailPress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const onViewAllPress = useCallback(() => {
    Haptics.selectionAsync();
    setGridModalOpen(true);
  }, []);

  if (allImages.length === 0) {
    return (
      <View style={[styles.placeholder, { backgroundColor: colors.skeleton }]}>
        <Data size="medium" tone="muted">
          No Images
        </Data>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Image - Swipeable, tap to open lightbox */}
      <View style={styles.mainImageWrapper}>
        <FlatList
          ref={flatListRef}
          data={allImages}
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
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
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
        
        {/* Image Counter Overlay */}
        <View style={styles.counterOverlay} pointerEvents="none">
          <Data size="mini" style={styles.counterOverlayText}>
            {currentIndex + 1}/{allImages.length}
          </Data>
        </View>
      </View>

      {/* Thumbnail Strip with View All */}
      <View style={[styles.thumbnailStrip, { backgroundColor: colors.background }]}>
        <FlatList
          ref={thumbnailListRef}
          data={allImages}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailList}
          keyExtractor={(_, idx) => `thumb-${idx}`}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={4}
          removeClippedSubviews
          getItemLayout={(_, index) => ({
            length: THUMBNAIL_SIZE + Spacing.xs,
            offset: (THUMBNAIL_SIZE + Spacing.xs) * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <HapticPressable
              onPress={() => onThumbnailPress(index)}
              style={[
                styles.thumbnail,
                { 
                  borderColor: index === currentIndex ? colors.primary : colors.glassBorder,
                  opacity: index === currentIndex ? 1 : 0.6,
                },
              ]}
            >
              <Image
                source={{ uri: item }}
                style={styles.thumbnailImage}
                contentFit="cover"
                transition={100}
              />
            </HapticPressable>
          )}
        />

        {/* View All Button */}
        <HapticPressable
          onPress={onViewAllPress}
          style={[styles.viewAllButton, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}
        >
          {({ pressed }) => (
            <View style={[styles.viewAllContent, { opacity: pressed ? 0.7 : 1 }]}>
              <Grid3x3 size={Sizes.iconXs} color={colors.text} strokeWidth={1.75} />
              <ButtonText size="small">All</ButtonText>
            </View>
          )}
        </HapticPressable>
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
          previewImages={thumbImages}
          currentIndex={currentIndex}
          isOpen={lightboxOpen}
          title={title}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setCurrentIndex}
        />
      ) : null}
    </View>
  );
}

// Skeleton for loading state
export function ImageGallerySkeleton() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      {/* Main image skeleton */}
      <Skeleton width="100%" height={MAIN_IMAGE_HEIGHT} borderRadius={0} />
      
      {/* Thumbnails skeleton */}
      <View style={[styles.thumbnailStrip, { backgroundColor: colors.background }]}>
        <View style={styles.thumbnailList}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton 
              key={i} 
              width={THUMBNAIL_SIZE}
              height={THUMBNAIL_SIZE * 0.75}
              borderRadius={Radius.sm}
            />
          ))}
        </View>
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
    height: GALLERY_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Main Image
  mainImageWrapper: {
    flex: 1,
  },
  mainImageContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  counterOverlay: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  counterOverlayText: {
    color: '#FAFAFA',
  },
  
  // Thumbnails
  thumbnailStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  thumbnailList: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE * 0.75,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailSkeleton: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE * 0.75,
    borderRadius: Radius.sm,
  },
  
  // View All Button
  viewAllButton: {
    marginLeft: 'auto',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  viewAllContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
