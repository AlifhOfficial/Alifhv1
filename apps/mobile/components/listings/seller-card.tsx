/**
 * Seller Card - Seller info with avatar
 */

import React, { memo, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { CheckCircle2 } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getThumbUrl } from '@/lib/config';
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
  
  const rawSellerLogo = isPartner
    ? partner?.logo
    : userProfile?.avatarUrl;
  const sellerLogo = getThumbUrl(rawSellerLogo) || rawSellerLogo;
  
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
        <View style={[styles.avatar, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
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
              <CheckCircle2 size={Sizes.iconXs} color={colors.primary} />
            )}
            {isBlackTier && (
              <View style={[styles.blkBadge, { backgroundColor: colors.blkBadgeBackground }]}>
                <Label size="badge" uppercase={false} style={{ color: colors.blkBadgeText }}>BLK</Label>
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
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  avatar: {
    width: Sizes.avatarLg,
    height: Sizes.avatarLg,
    borderRadius: Sizes.avatarLg / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: Sizes.avatarLg,
    height: Sizes.avatarLg,
    borderRadius: Sizes.avatarLg / 2,
  },
  details: {
    flex: 1,
    gap: Spacing.xs / 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  blkBadge: {
    paddingHorizontal: Sizes.badgePaddingH,
    paddingVertical: Sizes.badgePaddingV,
    borderRadius: Radius.none,
  },
});
