/**
 * Seller Card - Seller info with avatar
 */

import React, { memo, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { CheckCircle2 } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Text, Data, Supporting, Label } from '@/components/ui';
import { SellerData } from '@/lib/listing-api';

interface SellerCardProps {
  sellerData: SellerData | undefined | null;
  isBlk?: boolean;
  action?: ReactNode;
}

function formatMemberSince(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  return `Member since ${d.getFullYear()}`;
}

export const SellerCard = memo(function SellerCard({
  sellerData,
  isBlk = false,
  action,
}: SellerCardProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  // Handle undefined sellerData gracefully
  if (!sellerData) {
    return null;
  }

  const isPartner = sellerData.type === 'partner';
  const partner = isPartner ? sellerData.partner : null;
  const userProfile = !isPartner ? sellerData.userProfile : null;

  const sellerName = isPartner
    ? partner?.brandName || 'Dealer'
    : userProfile?.displayName || 'Private Seller';
  
  const sellerLogo = isPartner
    ? partner?.logo
    : userProfile?.avatarUrl;
  
  const isVerified = isPartner
    ? partner?.isVerified
    : userProfile?.isKycVerified;
  
  const isBlackTier = isPartner && partner?.tier === 'black';
  
  const textColor = isBlk ? colors.blkText : colors.text;

  // Private seller extra info
  const memberSince = !isPartner ? formatMemberSince(userProfile?.memberSince) : null;

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
            <Text variant="avatarInitial" tone="secondary">
              {sellerName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        
        <View style={styles.details}>
          <View style={styles.nameRow}>
            <Data size="medium" style={{ color: textColor }}>{sellerName}</Data>
            {isVerified && !isBlackTier && (
              <CheckCircle2 size={ICON_SIZE} color={colors.primary} />
            )}
            {isBlackTier && (
              <View style={[styles.blkBadge, { backgroundColor: colors.blkBadgeBackground }]}>
                <Label size="badge" uppercase={false} style={[styles.blkBadgeText, { color: colors.blkBadgeText }]}>BLK</Label>
              </View>
            )}
          </View>
          
          {/* Subtitle: Dealer type or member since */}
          <Supporting size="small">
            {isPartner ? 'Verified Dealer' : (memberSince || 'Private Seller')}
          </Supporting>
        </View>
      </View>
      {action}
    </View>
  );
});

// ============================================================================
// CONSTANTS
// ============================================================================

const AVATAR_SIZE = 48;
const ICON_SIZE = 16;

// ============================================================================
// STYLES
// ============================================================================

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
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  details: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm - 2,
  },
  blkBadge: {
    paddingHorizontal: Spacing.sm - 2,
    paddingVertical: 2,
    borderRadius: Radius.none,
  },
  blkBadgeText: {
    fontSize: 8,
  },
});
