/**
 * Seller Card - Seller info with avatar
 */

import React, { memo, ReactNode } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { CheckCircle2 } from 'lucide-react-native';

import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { SellerData } from '@/lib/api';

interface SellerCardProps {
  sellerData: SellerData;
  isBlk?: boolean;
  action?: ReactNode;
}

export const SellerCard = memo(function SellerCard({
  sellerData,
  isBlk = false,
  action,
}: SellerCardProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const sellerName = sellerData.type === 'partner' 
    ? sellerData.partner?.brandName || 'Dealer'
    : sellerData.userProfile?.displayName || 'Private Seller';
  
  const sellerLogo = sellerData.type === 'partner'
    ? sellerData.partner?.logo
    : sellerData.userProfile?.avatarUrl;
  
  const isVerified = sellerData.type === 'partner'
    ? sellerData.partner?.isVerified
    : sellerData.userProfile?.isKycVerified;
  
  const isBlackTier = sellerData.type === 'partner' && sellerData.partner?.tier === 'black';
  
  const textColor = isBlk ? colors.blkText : colors.text;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.avatar, { backgroundColor: colors.backgroundSecondary }]}>
          {sellerLogo ? (
            <Image
              source={{ uri: sellerLogo }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <Text style={[styles.avatarInitial, { color: colors.textSecondary }]}>
              {sellerName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        
        <View style={styles.details}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: textColor }]}>{sellerName}</Text>
            {isVerified && !isBlackTier && (
              <CheckCircle2 size={16} color={colors.primary} />
            )}
            {isBlackTier && (
              <View style={[styles.blkBadge, { backgroundColor: colors.blkBackground }]}>
                <Text style={[styles.blkBadgeText, { color: colors.blkText }]}>BLK</Text>
              </View>
            )}
          </View>
          <Text style={[styles.type, { color: colors.textSecondary }]}>
            {sellerData.type === 'partner' ? 'Verified Dealer' : 'Private Seller'}
          </Text>
        </View>
      </View>
      {action}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    ...Typography.initial,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    ...Typography.value,
  },
  type: {
    ...Typography.secondary,
  },
  blkBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  blkBadgeText: {
    ...Typography.labelBadge,
    fontSize: 8,
  },
});
