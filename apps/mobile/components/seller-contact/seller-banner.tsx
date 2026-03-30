/**
 * Seller Banner Component
 * 
 * Displays dealer hero/cover image as a rounded banner.
 * Only shown for dealers with a hero image.
 */

import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Spacing, Radius, Timing } from '@/constants/theme';
import { getAppThumbUrl } from '@/lib/config';
import type { SellerContactColors } from './types';
import type { SellerInfo } from '@/lib/seller-api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_WIDTH * 0.55;

interface SellerBannerProps extends SellerContactColors {
  seller: SellerInfo;
}

export const SellerBanner = memo(function SellerBanner({
  seller,
}: SellerBannerProps) {
  const heroImageUrl = getAppThumbUrl(seller.heroImage);
  const hasHeroImage = heroImageUrl && seller.isDealer;

  if (!hasHeroImage) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(150).duration(350)}
      style={styles.container}
    >
      <Image
        source={{ uri: heroImageUrl! }}
        style={styles.image}
        contentFit="cover"
        transition={Timing.imageTransition}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    borderRadius: Radius['3xl'],
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
