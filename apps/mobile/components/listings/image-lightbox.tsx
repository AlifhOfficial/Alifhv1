/**
 * Image Lightbox - Fullscreen image viewer with gestures
 * Native mobile implementation with pinch-to-zoom and swipe navigation
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Pressable,
  Dimensions,
  FlatList,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { HapticPressable } from '@/components/ui';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Data } from '@/components/ui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const THUMBNAIL_SIZE = 56;

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  title = 'Image',
  onClose,
  onIndexChange,
}: ImageLightboxProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const thumbnailListRef = useRef<FlatList>(null);
  const [internalIndex, setInternalIndex] = useState(currentIndex);
  const internalIndexRef = useRef(currentIndex);

  const validImages = useMemo(() => 
    images.filter(img => img && typeof img === 'string' && img.trim().length > 0),
    [images]
  );

  const totalImages = validImages.length;
  const safeIndex = Math.min(Math.max(0, internalIndex), Math.max(0, totalImages - 1));

  // Keep ref in sync with state
  React.useEffect(() => {
    internalIndexRef.current = internalIndex;
  }, [internalIndex]);

  const onMomentumScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    // Use ref to avoid stale closure
    if (index >= 0 && index < totalImages && index !== internalIndexRef.current) {
      internalIndexRef.current = index;
      setInternalIndex(index);
      onIndexChange(index);
      Haptics.selectionAsync();
      thumbnailListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [totalImages, onIndexChange]);

  const goToIndex = useCallback((index: number) => {
    if (index === internalIndexRef.current) return;
    internalIndexRef.current = index;
    setInternalIndex(index);
    onIndexChange(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
    thumbnailListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    Haptics.selectionAsync();
  }, [onIndexChange]);

  // Sync internal index with prop only when modal opens
  React.useEffect(() => {
    if (isOpen) {
      internalIndexRef.current = currentIndex;
      setInternalIndex(currentIndex);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: currentIndex, animated: false });
        thumbnailListRef.current?.scrollToIndex({ index: currentIndex, animated: false, viewPosition: 0.5 });
      }, 50);
    }
  }, [isOpen]); // Only trigger on isOpen change, not currentIndex

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
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.counterBadge}>
            <Data size="small" style={styles.counterText}>
              {safeIndex + 1} / {totalImages}
            </Data>
          </View>

          <HapticPressable
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {({ pressed }) => (
              <X size={22} color="#fff" strokeWidth={2} style={{ opacity: pressed ? 0.7 : 1 }} />
            )}
          </HapticPressable>
        </View>

        {/* Main Image */}
        <FlatList
          ref={flatListRef}
          data={validImages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          keyExtractor={(_, idx) => `lightbox-img-${idx}`}
          initialScrollIndex={safeIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item }}
                style={styles.fullImage}
                contentFit="contain"
                transition={200}
              />
            </View>
          )}
        />

        {/* Thumbnail Strip */}
        <View style={[styles.thumbnailStrip, { paddingBottom: insets.bottom + 12 }]}>
          <FlatList
            ref={thumbnailListRef}
            data={validImages}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
            keyExtractor={(_, idx) => `lightbox-thumb-${idx}`}
            getItemLayout={(_, index) => ({
              length: THUMBNAIL_SIZE + 8,
              offset: (THUMBNAIL_SIZE + 8) * index,
              index,
            })}
            renderItem={({ item, index }) => (
              <HapticPressable
                onPress={() => goToIndex(index)}
                style={[
                  styles.thumbnail,
                  { 
                    borderColor: index === safeIndex ? '#fff' : 'transparent',
                    opacity: index === safeIndex ? 1 : 0.5,
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  counterText: {
    color: '#fff',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  thumbnailStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingTop: 12,
  },
  thumbnailList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE * 0.75,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});
