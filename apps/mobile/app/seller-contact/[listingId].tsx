/**
 * Seller Contact Screen - Full seller/contact flow
 * Route: /seller-contact/[listingId]
 * 
 * Dedicated screen for seller interactions.
 * UI follows listing detail patterns: unapologetic, content-first, minimal cards.
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Phone,
  MessageCircle,
  Calendar,
  MapPin,
  Navigation,
  ExternalLink,
  Star,
  CheckCircle2,
  Building2,
  User,
  Globe,
  ChevronRight,
  Car,
  Clock,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { getListingDetailed, ListingDetailed } from '@/lib/listing-api';
import { normalizeSellerData, SellerInfo, getSellerListings, SellerListingCard } from '@/lib/seller-api';
import { createConversation } from '@/lib/messaging-api';
import { Skeleton } from '@/components/ui';

// ============================================================================
// HELPERS
// ============================================================================

function formatPrice(price: number): string {
  return `AED ${price.toLocaleString('en-AE')}`;
}

function formatMemberSince(date: string): string {
  try {
    return new Date(date).toLocaleDateString('en-AE', { month: 'short', year: 'numeric' });
  } catch {
    return date;
  }
}

function calculateEMI(principal: number, rate: number, months: number): number {
  const r = rate / 100 / 12;
  return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

/** Safe URL opener with error handling */
async function safeOpenURL(url: string, fallbackMessage?: string): Promise<boolean> {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    } else {
      if (fallbackMessage) {
        Alert.alert('Unable to Open', fallbackMessage);
      }
      return false;
    }
  } catch (error) {
    console.log('[SellerContact] Failed to open URL:', url, error);
    if (fallbackMessage) {
      Alert.alert('Unable to Open', fallbackMessage);
    }
    return false;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SellerContactScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const { colorScheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme];

  const [listing, setListing] = useState<ListingDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [otherListings, setOtherListings] = useState<SellerListingCard[]>([]);
  const [otherListingsTotal, setOtherListingsTotal] = useState(0);
  
  // Calculator state
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTermMonths, setLoanTermMonths] = useState(48);
  const [interestRate, setInterestRate] = useState(3.5);

  // Fetch listing data
  const fetchListing = useCallback(async (showRefreshing = false) => {
    if (!listingId) return;
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await getListingDetailed(listingId);
      setListing(data);
      
      // Fetch other listings from this seller
      const sellerId = data.sellerData.partnerId || data.sellerData.userId;
      if (sellerId) {
        try {
          const otherListingsRes = await getSellerListings(
            sellerId,
            data.sellerData.type,
            { limit: 4, excludeListingId: listingId }
          );
          setOtherListings(otherListingsRes.listings);
          setOtherListingsTotal(otherListingsRes.meta.total);
        } catch (err) {
          console.log('[SellerScreen] Failed to fetch other listings:', err);
        }
      }
    } catch (err) {
      console.error('[SellerScreen] Failed to fetch listing:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  // Normalize seller data
  const seller = useMemo<SellerInfo | null>(() => {
    if (!listing) return null;
    return normalizeSellerData(listing.sellerData);
  }, [listing]);

  // EMI calculation - now reactive to user inputs
  const emi = useMemo(() => {
    if (!listing) return 0;
    const downPayment = listing.listing.price * (downPaymentPercent / 100);
    return calculateEMI(listing.listing.price - downPayment, interestRate, loanTermMonths);
  }, [listing, downPaymentPercent, interestRate, loanTermMonths]);
  
  const loanAmount = useMemo(() => {
    if (!listing) return 0;
    return listing.listing.price * (1 - downPaymentPercent / 100);
  }, [listing, downPaymentPercent]);
  
  const downPaymentAmount = useMemo(() => {
    if (!listing) return 0;
    return listing.listing.price * (downPaymentPercent / 100);
  }, [listing, downPaymentPercent]);

  // Handlers
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRevealPhone = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhoneRevealed(true);
  }, []);

  const handleCall = useCallback(async () => {
    if (!seller?.phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await safeOpenURL(
      `tel:${seller.phone}`,
      Platform.OS === 'ios' 
        ? 'Phone calls are not supported on this device.' 
        : 'Unable to make phone calls on this device.'
    );
    if (!success && Platform.OS === 'ios') {
      // On simulator, show the number to copy
      Alert.alert('Phone Number', seller.phone, [
        { text: 'OK' }
      ]);
    }
  }, [seller?.phone]);

  const handleWhatsApp = useCallback(async () => {
    if (!seller?.phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const cleanPhone = seller.phone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('971') ? cleanPhone : `971${cleanPhone}`;
    await safeOpenURL(
      `https://wa.me/${phone}`,
      'Unable to open WhatsApp. Please ensure WhatsApp is installed.'
    );
  }, [seller?.phone]);

  const handleChat = useCallback(async () => {
    if (!listing || !listingId) return;

    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to message the seller', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/profile') },
      ]);
      return;
    }

    const otherUserId = listing.sellerData.userId;
    if (!otherUserId) {
      Alert.alert('Error', 'Unable to contact seller at this time.');
      return;
    }

    setIsChatLoading(true);
    try {
      const response = await createConversation({
        otherUserId,
        listingId,
        partnerId: listing.sellerData.partnerId ?? undefined,
      });
      router.push({
        pathname: '/chat/[conversationId]',
        params: { conversationId: response.conversationId },
      });
    } catch (err) {
      console.error('Failed to start chat:', err);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    } finally {
      setIsChatLoading(false);
    }
  }, [listing, listingId, isAuthenticated, router]);

  const handleBookViewing = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to book a viewing', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/profile') },
      ]);
      return;
    }
    Alert.alert('Coming Soon', 'Viewing appointments will be available soon!');
  }, [isAuthenticated, router]);

  const handleViewOnMap = useCallback(async () => {
    if (!seller) return;
    const query = seller.lat && seller.lng
      ? `${seller.lat},${seller.lng}`
      : encodeURIComponent(seller.location || seller.name);
    await safeOpenURL(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      'Unable to open maps.'
    );
  }, [seller]);

  const handleGetDirections = useCallback(async () => {
    if (!seller) return;
    const dest = seller.lat && seller.lng
      ? `${seller.lat},${seller.lng}`
      : encodeURIComponent(seller.location || seller.name);
    await safeOpenURL(
      `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
      'Unable to open maps.'
    );
  }, [seller]);

  const handleWebsite = useCallback(async () => {
    if (!seller?.website) return;
    let url = seller.website;
    if (!url.startsWith('http')) url = `https://${url}`;
    await safeOpenURL(url, 'Unable to open website.');
  }, [seller?.website]);

  const handleViewListing = useCallback((id: string) => {
    router.push(`/listing/${id}`);
  }, [router]);

  const handleViewAllListings = useCallback(() => {
    // TODO: Navigate to seller's full listing page
    Alert.alert('Coming Soon', 'Full seller inventory page coming soon!');
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header colors={colors} insets={insets} onBack={handleBack} />
        <SellerScreenSkeleton colors={colors} />
      </View>
    );
  }

  // Error state
  if (!listing || !seller) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header colors={colors} insets={insets} onBack={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Unable to load seller information
          </Text>
        </View>
      </View>
    );
  }

  const listingPrice = listing.listing.price;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header colors={colors} insets={insets} onBack={handleBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchListing(true)}
            tintColor={colors.primary}
          />
        }
      >
        {/* Seller Identity - Hero Style */}
        <View style={styles.heroSection}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.surfaceSecondary }]}>
            {seller.avatar ? (
              <Image source={{ uri: seller.avatar }} style={styles.avatarImg} contentFit="cover" />
            ) : seller.isDealer ? (
              <Building2 size={40} color={colors.textTertiary} />
            ) : (
              <User size={40} color={colors.textTertiary} />
            )}
          </View>
          
          <View style={styles.heroInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.sellerName, { color: colors.text }]}>{seller.name}</Text>
              {seller.isVerified && (
                <CheckCircle2 size={18} color={colors.primary} />
              )}
            </View>
            
            <View style={styles.metaRow}>
              {!seller.isDealer && (
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>Private Seller</Text>
              )}
              
              {seller.tier?.toLowerCase() === 'blk' && (
                <View style={[styles.tierPill, { backgroundColor: colors.blkBackground }]}>
                  <Text style={[styles.tierText, { color: colors.blkText }]}>BLK</Text>
                </View>
              )}
            </View>

            {/* Rating */}
            {seller.rating && (
              <View style={styles.ratingRow}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text style={[styles.ratingValue, { color: colors.text }]}>{seller.rating.toFixed(1)}</Text>
                {seller.reviewCount && (
                  <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
                    ({seller.reviewCount} reviews)
                  </Text>
                )}
              </View>
            )}

            {/* Member Since - Only for BLK tier */}
            {seller.memberSince && seller.tier?.toLowerCase() === 'blk' && (
              <View style={styles.memberRow}>
                <Clock size={13} color={colors.textTertiary} />
                <Text style={[styles.memberText, { color: colors.textTertiary }]}>
                  Member since {formatMemberSince(seller.memberSince)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* About - Now first after hero */}
        {seller.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ABOUT</Text>
            <Text style={[styles.descriptionText, { color: colors.text }]}>{seller.description}</Text>
          </View>
        )}

        {/* CTA Row - Chat and Book together */}
        <View style={styles.ctaRow}>
          <Pressable
            style={[styles.primaryCta, { backgroundColor: colors.primary, flex: seller.isDealer ? 1 : undefined }]}
            onPress={handleChat}
            disabled={isChatLoading}
          >
            {isChatLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <MessageCircle size={20} color="#FFF" strokeWidth={2} />
                <Text style={styles.primaryCtaText}>Chat</Text>
              </>
            )}
          </Pressable>
          
          {seller.isDealer && (
            <Pressable
              style={[styles.secondaryCta, { borderColor: colors.border }]}
              onPress={handleBookViewing}
            >
              <Calendar size={20} color={colors.text} strokeWidth={2} />
              <Text style={[styles.secondaryCtaText, { color: colors.text }]}>Book</Text>
            </Pressable>
          )}
        </View>

        {/* Phone Number as text */}
        {seller.phone && (
          <Pressable
            style={styles.phoneRow}
            onPress={phoneRevealed ? handleCall : handleRevealPhone}
          >
            {phoneRevealed ? (
              <>
                <Phone size={16} color={colors.textSecondary} />
                <Text style={[styles.phoneText, { color: colors.text }]}>{seller.phone}</Text>
                <Text style={[styles.phoneCta, { color: colors.primary }]}>Call</Text>
                <Pressable onPress={handleWhatsApp}>
                  <Text style={[styles.phoneCta, { color: '#25D366' }]}>WhatsApp</Text>
                </Pressable>
              </>
            ) : (
              <Text style={[styles.phoneText, { color: colors.primary }]}>Show phone number</Text>
            )}
          </Pressable>
        )}

        {/* Specialties & Badges */}
        {(seller.specialties.length > 0 || seller.badges.length > 0) && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
              {seller.isDealer ? 'SPECIALTIES' : 'BADGES'}
            </Text>
            <View style={styles.tagsRow}>
              {seller.specialties.map((s, i) => (
                <View key={`s-${i}`} style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>{s}</Text>
                </View>
              ))}
              {seller.badges.map((b, i) => (
                <View key={`b-${i}`} style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Other Listings */}
        {otherListings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>MORE FROM THIS SELLER</Text>
            <View style={styles.listingsRow}>
              {otherListings.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.listingItem, { backgroundColor: colors.surface }]}
                  onPress={() => handleViewListing(item.id)}
                >
                  <View style={[styles.listingThumb, { backgroundColor: colors.surfaceSecondary }]}>
                    {item.thumbnail ? (
                      <Image source={{ uri: item.thumbnail }} style={styles.thumbImg} contentFit="cover" />
                    ) : (
                      <Car size={20} color={colors.textTertiary} />
                    )}
                  </View>
                  <Text style={[styles.listingTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.year} {item.make}
                  </Text>
                  <Text style={[styles.listingModel, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.model}
                  </Text>
                  <Text style={[styles.listingPrice, { color: colors.text }]}>
                    {formatPrice(item.price)}
                  </Text>
                </Pressable>
              ))}
            </View>
            
            {/* View All Footer */}
            <Pressable
              style={[styles.viewAllBtn, { borderColor: colors.border }]}
              onPress={handleViewAllListings}
            >
              <Text style={[styles.viewAllBtnText, { color: colors.text }]}>
                View All {otherListingsTotal} Listings
              </Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}

        {/* Financing Calculator - Subtle */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>FINANCING ESTIMATE</Text>
          
          {/* Compact Monthly Display */}
          <View style={styles.emiCompact}>
            <Text style={[styles.emiCompactLabel, { color: colors.textSecondary }]}>Est. Monthly</Text>
            <Text style={[styles.emiCompactValue, { color: colors.text }]}>{formatPrice(emi)}/mo</Text>
          </View>
          
          {/* Inline Controls */}
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Down</Text>
            <View style={styles.calcOptions}>
              {[10, 20, 30].map((dp) => (
                <Pressable
                  key={dp}
                  style={[
                    styles.calcChip,
                    { borderColor: downPaymentPercent === dp ? colors.text : colors.border },
                    downPaymentPercent === dp && { backgroundColor: colors.text },
                  ]}
                  onPress={() => setDownPaymentPercent(dp)}
                >
                  <Text style={[styles.calcChipText, { color: downPaymentPercent === dp ? colors.background : colors.textSecondary }]}>
                    {dp}%
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Term</Text>
            <View style={styles.calcOptions}>
              {[36, 48, 60].map((term) => (
                <Pressable
                  key={term}
                  style={[
                    styles.calcChip,
                    { borderColor: loanTermMonths === term ? colors.text : colors.border },
                    loanTermMonths === term && { backgroundColor: colors.text },
                  ]}
                  onPress={() => setLoanTermMonths(term)}
                >
                  <Text style={[styles.calcChipText, { color: loanTermMonths === term ? colors.background : colors.textSecondary }]}>
                    {term}mo
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          
          <Text style={[styles.calcDisclaimer, { color: colors.textTertiary }]}>
            @ {interestRate}% APR · {formatPrice(loanAmount)} financed
          </Text>
        </View>

        {/* Location & Website - Bottom section */}
        {(seller.location || seller.website) && (
          <View style={styles.locationSection}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>LOCATION & LINKS</Text>
            
            {seller.location && (
              <View style={styles.locationTextRow}>
                <MapPin size={18} color={colors.textSecondary} />
                <Text style={[styles.locationText, { color: colors.text }]}>{seller.location}</Text>
              </View>
            )}
            
            {/* Compact action row */}
            <View style={styles.locationActionsCompact}>
              {seller.location && (
                <>
                  <Pressable
                    style={[styles.compactBtn, { borderColor: colors.border }]}
                    onPress={handleViewOnMap}
                  >
                    <ExternalLink size={15} color={colors.text} />
                    <Text style={[styles.compactBtnText, { color: colors.text }]}>View Map</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.compactBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                    onPress={handleGetDirections}
                  >
                    <Navigation size={15} color="#FFF" />
                    <Text style={[styles.compactBtnText, { color: '#FFF' }]}>Directions</Text>
                  </Pressable>
                </>
              )}
              {seller.website && (
                <Pressable
                  style={[styles.compactBtn, { borderColor: colors.border }]}
                  onPress={handleWebsite}
                >
                  <Globe size={15} color={colors.text} />
                  <Text style={[styles.compactBtnText, { color: colors.text }]}>Website</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

function Header({
  colors,
  insets,
  onBack,
}: {
  colors: typeof Colors.light;
  insets: { top: number };
  onBack: () => void;
}) {
  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <Pressable style={styles.backBtn} onPress={onBack} hitSlop={12}>
        <ChevronLeft size={24} color={colors.text} />
      </Pressable>
    </View>
  );
}

function EmiRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={styles.emiRow}>
      <Text style={[styles.emiRowLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.emiRowValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function SellerScreenSkeleton({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.heroSection}>
        <Skeleton width={80} height={80} borderRadius={40} />
        <View style={[styles.heroInfo, { gap: 8 }]}>
          <Skeleton width="60%" height={24} />
          <Skeleton width={100} height={16} />
          <Skeleton width={80} height={14} />
        </View>
      </View>
      
      {/* CTA */}
      <Skeleton width="100%" height={52} style={{ borderRadius: Radius.lg }} />
      
      {/* Contact Grid */}
      <View style={styles.contactGrid}>
        <Skeleton width="48%" height={72} style={{ borderRadius: Radius.md }} />
        <Skeleton width="48%" height={72} style={{ borderRadius: Radius.md }} />
      </View>
      
      {/* Section */}
      <View style={styles.section}>
        <Skeleton width={80} height={12} />
        <Skeleton width="100%" height={60} style={{ marginTop: Spacing.sm }} />
      </View>
    </ScrollView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },

  // Hero Section
  heroSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  heroInfo: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sellerName: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    ...Typography.link,
    fontFamily: 'Inter_500Medium',
  },
  tierPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  tierText: {
    ...Typography.labelBadge,
    fontFamily: 'Inter_800ExtraBold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  ratingValue: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  reviewCount: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  memberText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },

  // CTA Row
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
  primaryCtaText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFF',
  },
  secondaryCta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  secondaryCtaText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },

  // Phone Row
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  phoneText: {
    ...Typography.valueMedium,
    flex: 1,
  },
  phoneCta: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    paddingHorizontal: Spacing.sm,
  },

  // Contact Grid (kept for backwards compat)
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  contactBtn: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  contactBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  phoneNumber: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },

  // Section
  section: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
    marginBottom: Spacing.xs,
  },
  viewAllLink: {
    ...Typography.link,
    fontFamily: 'Inter_500Medium',
  },

  // Location
  locationSection: {
    gap: Spacing.md,
  },
  locationContent: {
    gap: Spacing.sm,
  },
  locationTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  locationActionsCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  compactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  compactBtnText: {
    ...Typography.labelMedium,
  },
  mapActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  mapBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  mapBtnText: {
    ...Typography.link,
    fontFamily: 'Inter_500Medium',
  },

  // Description
  descriptionText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  tagText: {
    ...Typography.labelMedium,
  },

  // Listings
  listingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  listingItem: {
    width: '47%',
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  listingThumb: {
    aspectRatio: 16 / 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  listingTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  listingModel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: Spacing.sm,
    marginTop: 2,
  },
  listingPrice: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
    paddingTop: 6,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  viewAllBtnText: {
    ...Typography.link,
    fontFamily: 'Inter_500Medium',
  },

  // EMI
  emiContent: {
    gap: Spacing.lg,
  },
  emiMain: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  emiLabel: {
    ...Typography.labelMedium,
  },
  emiValue: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    marginTop: 6,
  },
  emiPeriod: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  emiDivider: {
    height: 1,
  },
  emiBreakdown: {
    gap: Spacing.sm,
  },
  emiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emiRowLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  emiRowValue: {
    ...Typography.link,
    fontFamily: 'Inter_500Medium',
  },
  emiDisclaimer: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  
  // Compact Calculator
  emiCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emiCompactLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  emiCompactValue: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  calcLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    width: 40,
  },
  calcOptions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flex: 1,
  },
  calcChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  calcChipText: {
    ...Typography.labelMedium,
    fontSize: 12,
  },
  calcDisclaimer: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: Spacing.xs,
  },

  // Website
  websiteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  websiteBtnText: {
    ...Typography.valueMedium,
  },
});
