/**
 * Image Lightbox - Fullscreen image viewer with gestures
 * Native mobile implementation with pinch-to-zoom and swipe navigation
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { StyleSheet, View, Modal, Dimensions, FlatList, StatusBar, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Sizes, Layout, ZIndex} from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
interface ImageLightboxProps {
  images: string[];
  previewImages?: string[];
  title?: string;
  currentIndex: number;
  isOpen: boolean;
  useModal?: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function ImageLightbox({
  images,
  previewImages,
  title,
  currentIndex,
  isOpen,
  useModal = true,
  onClose,
  onIndexChange,
}: ImageLightboxProps) {
  const mediaColors = Colors.dark;
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [internalIndex, setInternalIndex] = useState(currentIndex);
  const internalIndexRef = useRef(currentIndex);
  const validImages = useMemo(() => 
    images.filter(img => img && typeof img === 'string' && img.trim().length > 0),
    [images]
  );

  const totalImages = validImages.length;
  const safeIndex = Math.min(Math.max(0, internalIndex), Math.max(0, totalImages - 1));
  const displayTitle = useMemo(() => {
    if (!title) {
      return '';
    }

    return title.replace(/^\d{4}\s+/, '').trim();
  }, [title]);

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
    }
  }, [totalImages, onIndexChange]);

  // Sync internal index with prop only when modal opens
  React.useEffect(() => {
    if (isOpen) {
      internalIndexRef.current = currentIndex;
      setInternalIndex(currentIndex);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: currentIndex, animated: false });
      }, 50);
    }
  }, [isOpen]); // Only trigger on isOpen change, not currentIndex

  if (!isOpen || totalImages === 0) {
    return null;
  }

  const content = (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.black} />
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <View style={styles.headerSpacer} />

          <View style={styles.titleWrapper} pointerEvents="none">
            {displayTitle ? (
              <Text
                variant="subhead"
                style={styles.titleText}
                numberOfLines={1}
              >
                {displayTitle}
              </Text>
            ) : null}
          </View>

          <HapticPressable
            onPress={onClose}
            style={styles.backButton}
            hitSlop={Layout.hitSlop}
          >
            {({ pressed }) => (
              <X size={Sizes.iconMd} color={mediaColors.white} strokeWidth={2.2} style={{ opacity: pressed ? 0.7 : 1 }} />
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
              <ZoomableImage
                uri={item}
                previewUri={previewImages?.[index]}
              />
            </View>
          )}
        />

        <View style={[styles.counterRow, { paddingBottom: insets.bottom + Spacing.md }]}>
          <View style={styles.counterBadge}>
            <Text variant="subhead" style={styles.counterText}>
              {safeIndex + 1} / {totalImages}
            </Text>
          </View>
        </View>
      </View>
    </>
  );

  if (!useModal) {
    return content;
  }

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {content}
    </Modal>
  );
}

function ZoomableImage({
  uri,
  previewUri,
}: {
  uri: string;
  previewUri?: string;
}) {
  return (
    <View style={styles.zoomContainer}>
      <Image
        source={{ uri }}
        placeholder={previewUri ? { uri: previewUri } : undefined}
        style={styles.fullImage}
        contentFit="contain"
        transition={100}
        cachePolicy="memory-disk"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.black,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: ZIndex.raised,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: Sizes.actionButtonMd,
    height: Sizes.actionButtonMd,
    borderRadius: Radius.full,
    backgroundColor: Colors.dark.fill,
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
  counterBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
    backgroundColor: Colors.dark.fill,
  },
  counterText: {
    color: Colors.dark.white,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  counterRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
