/**
 * Profile Avatar Component
 * Tappable avatar with camera overlay for uploading
 * Uses expo-image-picker for photo selection
 */

import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Pressable, 
  Platform, 
  ActionSheetIOS,
} from 'react-native';
import Animated, { 
  FadeIn, 
  useAnimatedStyle, 
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Camera } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import { UserAvatar } from '@/components/ui/user-avatar';
import { Body, useAlert } from '@/components/ui';
import { Spacing, Radius, Sizes } from '@/constants/theme';
import type { ThemeColors } from './types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ProfileAvatarProps {
  imageUrl?: string | null;
  displayName: string;
  useGeneratedAvatar?: boolean;
  isUploading?: boolean;
  colors: ThemeColors;
  onPhotoSelected?: (uri: string) => Promise<void>;
  onRemovePhoto?: () => Promise<void>;
}

export function ProfileAvatar({
  imageUrl,
  displayName,
  useGeneratedAvatar = true,
  isUploading = false,
  colors,
  onPhotoSelected,
  onRemovePhoto,
}: ProfileAvatarProps) {
  const scale = useSharedValue(1);
  const { showAlert } = useAlert();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      showAlert(
        'Camera Access Required',
        'Please allow camera access in Settings to take photos.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {} },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1, // Full quality - server handles compression
    });

    if (!result.canceled && result.assets[0]) {
      await onPhotoSelected?.(result.assets[0].uri);
    }
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      showAlert(
        'Photo Library Access Required',
        'Please allow photo library access in Settings to choose photos.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {} },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1, // Full quality - server handles compression
    });

    if (!result.canceled && result.assets[0]) {
      await onPhotoSelected?.(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = async () => {
    if (!imageUrl) return;
    
    showAlert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => onRemovePhoto?.(),
        },
      ]
    );
  };

  const showOptions = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const options = [
      'Take Photo',
      'Choose from Library',
      ...(imageUrl ? ['Remove Photo'] : []),
      'Cancel',
    ];
    
    const destructiveButtonIndex = imageUrl ? 2 : undefined;
    const cancelButtonIndex = options.length - 1;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              pickFromCamera();
              break;
            case 1:
              pickFromLibrary();
              break;
            case 2:
              if (imageUrl) {
                handleRemovePhoto();
              }
              break;
          }
        }
      );
    } else {
      // Android fallback
      showAlert('Change Photo', 'Choose an option', [
        { text: 'Take Photo', onPress: pickFromCamera },
        { text: 'Choose from Library', onPress: pickFromLibrary },
        ...(imageUrl ? [{ 
          text: 'Remove Photo', 
          style: 'destructive' as const,
          onPress: () => onRemovePhoto?.(),
        }] : []),
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  // Loading animation
  const loadingOpacity = useSharedValue(1);

  useEffect(() => {
    if (isUploading) {
      loadingOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      loadingOpacity.value = 1;
    }
  }, [isUploading]);

  const loadingTextStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
  }));

  return (
    <AnimatedPressable
      onPress={showOptions}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isUploading}
      style={[styles.container, animatedStyle]}
    >
      <UserAvatar
        src={imageUrl}
        name={displayName}
        size="xl"
        useGeneratedAvatar={useGeneratedAvatar}
      />
      
      {/* Loading overlay */}
      {isUploading && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
          <Body size="small" style={[styles.loadingText, loadingTextStyle]}>
            Uploading
          </Body>
        </Animated.View>
      )}
      
      {/* Camera badge */}
      {!isUploading && (
        <View style={styles.cameraBadge}>
          <Camera size={Sizes.iconXs} color={colors.primaryForeground} strokeWidth={2.5} />
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Spacing['3xl'],
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    // White text on overlay - hardcoded for contrast
    color: '#FFFFFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: Spacing['2xl'],
    height: Spacing['2xl'],
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
