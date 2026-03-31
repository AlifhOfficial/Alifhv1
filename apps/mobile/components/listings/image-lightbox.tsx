/**
 * Image Lightbox - Fullscreen image viewer with gestures
 * Native mobile implementation with pinch-to-zoom and swipe navigation
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { StyleSheet, View, Modal, Dimensions, FlatList, StatusBar, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Colors, Spacing, Radius, Sizes, Layout, ZIndex} from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
interface ImageLightboxProps {
  images: string[];
  previewImages?: string[];
  currentIndex: number;
  isOpen: boolean;
  useModal?: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function ImageLightbox({
  images,
  previewImages,
  currentIndex,
  isOpen,
  useModal = true,
  onClose,
  onIndexChange,
}: ImageLightboxProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [internalIndex, setInternalIndex] = useState(currentIndex);
  const internalIndexRef = useRef(currentIndex);
  const [isZoomed, setIsZoomed] = useState(false);

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
          <HapticPressable
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={Layout.hitSlop}
          >
            {({ pressed }) => (
              <X size={Sizes.iconMd} color={colors.white} strokeWidth={2} style={{ opacity: pressed ? 0.7 : 1 }} />
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
          scrollEnabled={!isZoomed}
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
                onZoomChange={(zoomed) => {
                  if (index === safeIndex) {
                    setIsZoomed(zoomed);
                  }
                }}
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
  onZoomChange,
}: {
  uri: string;
  previewUri?: string;
  onZoomChange?: (zoomed: boolean) => void;
}) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const reportZoom = useCallback(
    (zoomed: boolean) => {
      onZoomChange?.(zoomed);
    },
    [onZoomChange],
  );

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      const nextScale = Math.min(Math.max(savedScale.value * event.scale, 1), 4);
      scale.value = nextScale;
      if (onZoomChange) {
        runOnJS(reportZoom)(nextScale > 1.01);
      }
    })
    .onEnd(() => {
      if (scale.value <= 1.01) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        if (onZoomChange) {
          runOnJS(reportZoom)(false);
        }
      }
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (scale.value <= 1) {
        return;
      }
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(250)
    .onEnd(() => {
      const nextScale = scale.value > 1.01 ? 1 : 2;
      scale.value = withTiming(nextScale, { duration: 180 });
      if (nextScale <= 1.01) {
        translateX.value = withTiming(0, { duration: 180 });
        translateY.value = withTiming(0, { duration: 180 });
      }
      if (onZoomChange) {
        runOnJS(reportZoom)(nextScale > 1.01);
      }
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={styles.zoomContainer}>
        <Animated.View style={animatedStyle}>
          <Image
            source={{ uri }}
            placeholder={previewUri ? { uri: previewUri } : undefined}
            style={styles.fullImage}
            contentFit="contain"
            transition={100}
            cachePolicy="memory-disk"
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
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
    justifyContent: 'flex-end',
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
  },
  closeButton: {
    width: Sizes.actionButtonMd,
    height: Sizes.actionButtonMd,
    borderRadius: Radius.full,
    backgroundColor: Colors.dark.fill,
    alignItems: 'center',
    justifyContent: 'center',
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
