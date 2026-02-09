/**
 * Image Gallery Component - Swipeable image viewer with thumbnails
 * Takes up ~40% of viewport height with gesture-based navigation
 * Includes View All button and lightbox/grid modal integration
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { Grid3x3 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Skeleton } from '@/components/ui';
import { ImageLightbox } from './image-lightbox';
import { ImageGridModal } from './image-grid-modal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GALLERY_HEIGHT = SCREEN_HEIGHT * 0.38;
const THUMBNAIL_SIZE = 48;

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
  
  const allImages = validImages.length > 0 ? validImages : [];

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
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

  const onGridImageClick = useCallback((index: number) => {
    setGridModalOpen(false);
    setCurrentIndex(index);
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index, animated: false });
      setLightboxOpen(true);
    }, 100);
  }, []);

  if (allImages.length === 0) {
    return (
      <View style={[styles.placeholder, { backgroundColor: colors.skeleton }]}>
        <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
          No Images
        </Text>
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
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyExtractor={(_, idx) => `img-${idx}`}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item }) => (
            <Pressable onPress={onMainImagePress} style={styles.mainImageContainer}>
              <Image
                source={{ uri: item }}
                style={styles.mainImage}
                contentFit="cover"
                transition={200}
                placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              />
            </Pressable>
          )}
        />
        
        {/* Image Counter Overlay */}
        <View style={styles.counterOverlay} pointerEvents="none">
          <Text style={styles.counterOverlayText}>
            {currentIndex + 1}/{allImages.length}
          </Text>
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
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => onThumbnailPress(index)}
              style={[
                styles.thumbnail,
                { 
                  borderColor: index === currentIndex ? colors.primary : colors.border,
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
            </Pressable>
          )}
        />

        {/* View All Button */}
        <Pressable
          onPress={onViewAllPress}
          style={[styles.viewAllButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          {({ pressed }) => (
            <View style={[styles.viewAllContent, { opacity: pressed ? 0.7 : 1 }]}>
              <Grid3x3 size={16} color={colors.text} strokeWidth={1.75} />
              <Text style={[styles.viewAllText, { color: colors.text }]}>All</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Lightbox Modal */}
      <ImageLightbox
        images={allImages}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        title={title}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setCurrentIndex}
      />

      {/* Grid Modal */}
      <ImageGridModal
        images={allImages}
        isOpen={gridModalOpen}
        title={title}
        onClose={() => setGridModalOpen(false)}
        onImageClick={onGridImageClick}
      />
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
      <Skeleton width="100%" height={GALLERY_HEIGHT - 60} borderRadius={0} />
      
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
  placeholderText: {
    ...Typography.stat,
    fontFamily: 'Inter_400Regular',
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
    bottom: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  counterOverlayText: {
    ...Typography.valueSmall,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  viewAllContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewAllText: {
    ...Typography.buttonSmall,
  },
});
