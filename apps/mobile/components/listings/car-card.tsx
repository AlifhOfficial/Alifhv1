/**
 * Car Card Component - Mobile
 * 
 * Alifh Design System - "Less is More"
 * Uses Text component variants for consistent typography
 * 
 * Visual Hierarchy:
 * 1. Image - Primary visual hook
 * 2. Price - Hero data point (stat variant)
 * 3. Title - Make Model Year (section-like but smaller)
 * 4. Metadata - Supporting specs (captionMuted)
 * 5. Seller - Trust signal in footer (caption)
 */

import { View } from '@/components/ui/view';
import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/useColor';
import { API_BASE_URL } from '@/lib/api-config';
import { FONT_FAMILY, FONT_FAMILY_MEDIUM, FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD } from '@/theme/globals';
import { Image, Pressable, StyleSheet, Text as RNText } from 'react-native';
import { Heart, Sparkles, BadgeCheck, Share2 } from 'lucide-react-native';

// ============================================================================
// IMAGE URL UTILITIES
// ============================================================================

const CDN_URL = 'https://cdn.alifh.ae';
const WEB_URL = 'https://alifh.ae';

function getImageUrl(url: string | null | undefined): string {
  if (!url) return 'https://via.placeholder.com/400x260/F5F5F5/D4D4D4?text=';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) {
    return `${__DEV__ ? API_BASE_URL : WEB_URL}${url}`;
  }
  return `${CDN_URL}/${url}`;
}

// ============================================================================
// FORMAT UTILITIES
// ============================================================================

function formatPrice(amount: number): string {
  const formatter = new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}

function formatMileage(km: number): string {
  if (km >= 1000) return `${Math.round(km / 1000)}k`;
  return km.toString();
}

const EMIRATE_LABELS: Record<string, string> = {
  dubai: 'Dubai',
  abu_dhabi: 'Abu Dhabi',
  sharjah: 'Sharjah',
  ajman: 'Ajman',
  ras_al_khaimah: 'RAK',
  fujairah: 'Fujairah',
  umm_al_quwain: 'UAQ',
};

const SPECS_LABELS: Record<string, string> = {
  gcc: 'GCC',
  us: 'US',
  european: 'EU',
  japanese: 'JP',
  canadian: 'CA',
  american: 'US',
  other: 'Import',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================================================
// TYPES
// ============================================================================

export interface CarCardProps {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  price: number;
  mileage: number;
  emirate: string;
  specs?: string | null;
  thumbnail?: string | null;
  isBlkListing?: boolean;
  partnerName?: string | null;
  partnerLogo?: string | null;
  partnerVerified?: boolean;
  isBlackTierPartner?: boolean;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  kycVerified?: boolean;
  onPress?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CarCard({
  make,
  model,
  year,
  price,
  mileage,
  emirate,
  specs = 'gcc',
  thumbnail,
  isBlkListing = false,
  partnerName,
  partnerLogo,
  partnerVerified,
  isBlackTierPartner,
  sellerName,
  sellerAvatarUrl,
  kycVerified,
  onPress,
}: CarCardProps) {
  // Theme colors
  const sidebar = useColor('sidebar');
  const border = useColor('border');
  const fg = useColor('foreground');
  const mutedFg = useColor('mutedForeground');
  const primary = useColor('primary');
  const blue = '#3B82F6'; // Tailwind blue-600 equivalent

  // Derived
  const imageUrl = getImageUrl(thumbnail);
  const displaySeller = partnerName || sellerName || 'Private Seller';
  const isVerified = partnerVerified || kycVerified;
  const avatarUrl = partnerLogo || sellerAvatarUrl;
  const hasAvatar = Boolean(avatarUrl);
  const initials = getInitials(displaySeller);

  // Theme palette - matches web exactly
  const isBlk = isBlkListing;
  const t = {
    cardBg: isBlk ? '#000000' : sidebar,
    cardBorder: isBlk ? '#27272A' : border,
    title: isBlk ? '#FAFAFA' : fg,
    year: isBlk ? '#71717A' : `${mutedFg}B3`, // 70% opacity
    price: isBlk ? '#FAFAFA' : blue,
    meta: isBlk ? '#71717A' : `${mutedFg}B3`, // 70% opacity
    seller: isBlk ? '#E4E4E7' : fg,
    // Avatar - web uses bg-muted/40 border-border/40 text-muted-foreground/70
    avatarBg: isBlk ? '#27272A' : `${mutedFg}10`, // muted/40 equivalent
    avatarText: isBlk ? '#71717A' : `${mutedFg}B3`, // 70% opacity
    avatarBorder: isBlk ? '#3F3F46' : `${border}66`, // 40% opacity
    divider: isBlk ? '#27272A' : `${border}40`,
    icon: isBlk ? '#52525B' : `${mutedFg}80`, // 50% opacity
  };

  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
      {/* ===== IMAGE ===== */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      </View>

      {/* ===== CONTENT ===== */}
      <View style={styles.body}>
        {/* TITLE ROW - Make Model left, Year right (web pattern) */}
        <View style={styles.titleRow}>
          <RNText 
            style={[styles.titleText, { color: t.title }]} 
            numberOfLines={1}
          >
            {make} {model}
          </RNText>
          <RNText style={[styles.yearText, { color: t.year }]}>
            {year}
          </RNText>
        </View>

        {/* PRICE - Hero element */}
        <RNText style={[styles.priceText, { color: t.price }]}>
          {formatPrice(price)}
        </RNText>

        {/* META - Specs (all on one line) */}
        <View style={styles.metaRow}>
          <RNText style={[styles.metaText, { color: t.meta }]}>{formatMileage(mileage)} km</RNText>
          <RNText style={[styles.dotText, { color: t.meta }]}>·</RNText>
          <RNText style={[styles.metaText, { color: t.meta }]}>{SPECS_LABELS[specs?.toLowerCase() ?? 'gcc'] || specs}</RNText>
          <RNText style={[styles.dotText, { color: t.meta }]}>·</RNText>
          <RNText style={[styles.metaText, { color: t.meta }]}>{EMIRATE_LABELS[emirate?.toLowerCase()] || emirate}</RNText>
        </View>

        {/* FOOTER - Seller + Actions */}
        <View style={[styles.footer, { borderTopColor: t.divider }]}>
          {/* Seller with proper Avatar */}
          <View style={styles.sellerWrap}>
            <View style={[styles.avatar, { backgroundColor: t.avatarBg, borderColor: t.avatarBorder }]}>
              {hasAvatar ? (
                <Image source={{ uri: getImageUrl(avatarUrl) }} style={styles.avatarImg} />
              ) : (
                <Text style={[styles.avatarInitials, { color: t.avatarText }]}>{initials}</Text>
              )}
            </View>
            <RNText 
              style={[styles.sellerText, { color: t.seller }]} 
              numberOfLines={1}
            >
              {displaySeller}
            </RNText>
            {isVerified && !isBlackTierPartner && (
              <BadgeCheck size={14} color={primary} fill={primary} style={{ marginLeft: -4 }} />
            )}
            {isBlackTierPartner && (
              <View style={styles.blkTag}>
                <Text style={styles.blkTagText}>BLK</Text>
              </View>
            )}
          </View>

          {/* Actions - Share, Favorite, Superlike */}
          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} hitSlop={10}>
              <Share2 size={16} color={t.icon} strokeWidth={1.5} />
            </Pressable>
            <Pressable style={styles.actionBtn} hitSlop={10}>
              <Heart size={16} color={t.icon} strokeWidth={1.5} />
            </Pressable>
            <Pressable style={styles.actionBtn} hitSlop={10}>
              <Sparkles size={16} color={t.icon} strokeWidth={1.5} />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ============================================================================
// SKELETON
// ============================================================================

export function CarCardSkeleton() {
  const sidebar = useColor('sidebar');
  const border = useColor('border');
  const muted = useColor('muted');

  return (
    <View style={[styles.card, { backgroundColor: sidebar, borderColor: border }]}>
      <View style={[styles.imageWrap, { backgroundColor: muted }]} />
      <View style={styles.body}>
        {/* Title + Year row */}
        <View style={styles.titleRow}>
          <View style={[styles.skel, { width: '60%', height: 18, backgroundColor: muted }]} />
          <View style={[styles.skel, { width: 32, height: 14, backgroundColor: muted }]} />
        </View>
        {/* Price skeleton */}
        <View style={[styles.skel, { width: 100, height: 20, backgroundColor: muted, marginTop: 6 }]} />
        {/* Meta skeleton */}
        <View style={[styles.metaRow, { marginTop: 8 }]}>
          <View style={[styles.skel, { width: 44, height: 13, backgroundColor: muted }]} />
          <View style={[styles.skel, { width: 28, height: 13, backgroundColor: muted }]} />
          <View style={[styles.skel, { width: 40, height: 13, backgroundColor: muted }]} />
        </View>
        {/* Footer skeleton */}
        <View style={[styles.footer, { borderTopColor: `${border}40`, marginTop: 14 }]}>
          <View style={styles.sellerWrap}>
            <View style={[styles.avatar, { backgroundColor: muted }]} />
            <View style={[styles.skel, { width: 80, height: 13, backgroundColor: muted }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Card
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },

  // Image - 16/10 ratio (shorter than 4/3)
  imageWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: '#F4F4F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },

  // Body
  body: {
    padding: 12,
    paddingTop: 10,
    gap: 4,
  },

  // Title row - web pattern
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleText: {
    fontSize: 15,
    fontFamily: FONT_FAMILY_BOLD,
    letterSpacing: -0.3,
    flex: 1,
    lineHeight: 20,
  },
  yearText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY_SEMIBOLD,
    letterSpacing: -0.2,
    lineHeight: 16,
  },

  // Price
  priceText: {
    fontSize: 18,
    fontFamily: FONT_FAMILY_BOLD,
    letterSpacing: -0.3,
    lineHeight: 22,
  },

  // Meta - single line stats row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY_SEMIBOLD,
    letterSpacing: -0.2,
  },
  dotText: {
    fontSize: 13,
    opacity: 0.3,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
  },

  // Seller
  sellerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  sellerText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY_MEDIUM,
    letterSpacing: -0.2,
    flex: 1,
    lineHeight: 18,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontSize: 11,
    fontFamily: FONT_FAMILY_SEMIBOLD,
    letterSpacing: 0.5,
  },
  blkTag: {
    backgroundColor: '#18181B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  blkTagText: {
    color: '#FAFAFA',
    fontSize: 8,
    fontFamily: FONT_FAMILY_BOLD,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    marginRight: -6,
  },
  actionBtn: {
    padding: 6,
  },

  // Skeleton
  skel: {
    borderRadius: 6,
  },
});
