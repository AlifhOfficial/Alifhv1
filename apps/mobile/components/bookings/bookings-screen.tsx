/**
 * BookingsScreen — My Bookings Management
 *
 * Redesigned with CarCardList-level polish:
 *   • BrowseHeader-style header (back + title, safe-area aware)
 *   • FilterPills-style floating status tabs
 *   • CarCardList-style booking cards — expo-image, proper sizing,
 *     status badge, date/time meta, countdown pill
 *   • Tap card → BookingDetailsSheet (full booking info)
 *   • Cancel booking via CancelBookingSheet
 *   • Pull-to-refresh, pagination, loading / empty / error states
 *
 * @module components/bookings/bookings-screen
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { HapticPressable } from '@/components/ui';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import {
  Calendar,
  Clock,
} from 'lucide-react-native';

import { Colors, Fonts, Spacing, Radius, Layout, Sizes, ZIndex} from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';
import {
  Heading,
  Body,
  Data,
  Supporting,
  ButtonText,
  Label,
  Skeleton,
} from '@/components/ui';
import { useBookings, useCancelBooking } from '@/hooks/use-booking-query';
import { type UserBooking, type BookingFilter } from '@/lib/booking-api';
import {
  formatBookingStatus,
  getBookingStatusColor,
  formatBookingDate,
  formatTimeRange,
  formatBookingCountdown,
} from './utilities/booking-helpers';
import { CancelBookingSheet } from './cancel-booking-sheet';
import { BookingDetailsSheet } from './booking-details-sheet';


// ─── Constants (derived from theme for responsive scaling) ──────────────────

const IMAGE_WIDTH = Sizes.cardThumbnailWidth;
const IMAGE_HEIGHT = Sizes.cardThumbnailHeight;

/** Empty state icon container — derived from theme */
const EMPTY_ICON_SIZE = Spacing['5xl'] + Spacing['3xl'];

// ─── Tab Configuration ───────────────────────────────────────────────────────

interface StatusTab {
  key: BookingFilter;
  label: string;
}

const STATUS_TABS: StatusTab[] = [
  { key: 'all',       label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'rejected',  label: 'Rejected' },
  { key: 'no_show',   label: 'No Show' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function BookingsScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // ── Data State (via React Query) ─────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<BookingFilter>('all');
  
  const {
    bookings,
    total,
    isLoading,
    isRefreshing,
    isFetchingNextPage: isLoadingMore,
    hasNextPage,
    error,
    fetchNextPage,
    refresh,
  } = useBookings({ filter: activeTab });

  const cancelMutation = useCancelBooking();

  // ── Sheet State ──────────────────────────────────────────────────────────
  const [selectedBooking, setSelectedBooking] = useState<UserBooking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleRefresh = useCallback(() => refresh(), [refresh]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isLoadingMore) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isLoadingMore]);

  // ── Tab ──────────────────────────────────────────────────────────────────

  const handleTabChange = useCallback((tab: BookingFilter) => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  }, []);

  // ── Card Tap → Details Sheet ─────────────────────────────────────────────

  const openDetails = useCallback((booking: UserBooking) => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBooking(booking);
    setShowDetails(true);
  }, []);

  // ── Cancel Action (from details sheet) ───────────────────────────────────

  const openCancel = useCallback((booking: UserBooking) => {
    setShowDetails(false);
    setTimeout(() => {
      setSelectedBooking(booking);
      setShowCancel(true);
    }, 300);
  }, []);

  const handleCancelSuccess = useCallback(() => {
    setShowCancel(false);
    // Cache is automatically invalidated by useCancelBooking mutation
  }, []);

  const handleViewListing = useCallback((listingId: string) => {
    setShowDetails(false);
    setTimeout(() => router.push(`/listing/${listingId}`), 200);
  }, [router]);

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Card (CarCardList-style)
  // ════════════════════════════════════════════════════════════════════════

  const renderCard = useCallback(
    ({ item }: { item: UserBooking }) => {
      const statusLabel = formatBookingStatus(item.status);
      const statusColor = getBookingStatusColor(item.status, colors);
      const countdown = formatBookingCountdown(item.scheduledDate);
      const isActive = item.status === 'pending' || item.status === 'confirmed';

      return (
        <HapticPressable
          onPress={() => openDetails(item)}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          {/* ── Image ────────────────────────────────────────────────── */}
          <View style={[styles.imageContainer, { backgroundColor: colors.bg2 }]}>
            {item.listingThumbnail ? (
              <Image
                source={{ uri: getAppThumbUrl(item.listingThumbnail)! }}
                style={styles.image}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <View style={[styles.image, { backgroundColor: colors.skeleton }]} />
            )}
            {/* Status badge (BLK-badge style) */}
            <View style={[styles.statusBadge, { backgroundColor: statusColor + 'E6' }]}>
              <Label size="caption" uppercase={false} style={{ color: '#FFF' }}>
                {statusLabel}
              </Label>
            </View>
          </View>

          {/* ── Content ──────────────────────────────────────────────── */}
          <View style={styles.content}>
            {/* Title */}
            <Data size="bodySm" style={{ color: colors.text, }} numberOfLines={1}>
              {item.listingTitle}
            </Data>

            {/* Partner */}
            <Data size="bodySm" style={{ color: colors.text2 }} numberOfLines={1}>
              {item.partnerName}
            </Data>

            {/* Date */}
            <View style={styles.metaRow}>
              <Calendar size={Sizes.iconXs} color={colors.text2} />
              <Data size="bodySm" style={{ color: colors.text2 }}>
                {formatBookingDate(item.scheduledDate)}
              </Data>
            </View>

            {/* Time */}
            <View style={styles.metaRow}>
              <Clock size={Sizes.iconXs} color={colors.text2} />
              <Data size="bodySm" style={{ color: colors.text2 }}>
                {formatTimeRange(item.scheduledStartTime, item.scheduledEndTime)}
              </Data>
            </View>

            {/* Countdown pill */}
            {isActive && (
              <View style={styles.countdownRow}>
                <View
                  style={[
                    styles.countdownPill,
                    {
                      backgroundColor: countdown.isToday
                        ? colors.successMuted
                        : countdown.isTomorrow
                          ? colors.warningMuted
                          : colors.primaryMuted,
                    },
                  ]}
                >
                  <Data
                    size="bodySm"
                    style={{
                      fontWeight: Fonts.bold,
                      color: countdown.isToday
                        ? colors.success
                        : countdown.isTomorrow
                          ? colors.warning
                          : colors.primary,
                    }}
                  >
                    {countdown.text}
                  </Data>
                </View>
              </View>
            )}
          </View>
        </HapticPressable>
      );
    },
    [colors, openDetails],
  );

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Empty / Footer
  // ════════════════════════════════════════════════════════════════════════

  const renderEmptyState = useCallback(() => {
    if (isLoading) return null;
    const tabLabel = STATUS_TABS.find((t) => t.key === activeTab)?.label ?? 'All';
    const isAll = activeTab === 'all';

    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.surface2 }]}>
          <Ionicons name="calendar-outline" size={Sizes.iconXl} color={colors.textMuted} />
        </View>
        <Heading size="subheading" style={{ marginTop: Spacing.lg }}>
          {isAll ? 'No bookings yet' : `No ${tabLabel.toLowerCase()} bookings`}
        </Heading>
        <Body size="body" tone="secondary" style={{ textAlign: 'center', marginTop: Spacing.sm }}>
          {isAll
            ? 'When you book a test drive on a listing, it will appear here.'
            : `You don't have any ${tabLabel.toLowerCase()} bookings.`}
        </Body>
      </View>
    );
  }, [isLoading, activeTab, colors]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return <View style={{ height: insets.bottom + Spacing['4xl'] }} />;
    return (
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing['4xl'] }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isLoadingMore, colors, insets.bottom]);

  // ════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ════════════════════════════════════════════════════════════════════════

  const headerHeight = insets.top + Layout.headerPadding + Sizes.pillHeight + Spacing.md;

  return (
    <View style={styles.container}>
      {/* ─────────────────────── Floating Header (absolute) ────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + Layout.headerPadding }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.headerScrollContent}
          style={styles.headerScroll}
        >
          {/* Bookings Title Pill */}
          <View
            style={[
              styles.pillButton,
              styles.glass,
              {
                borderColor: colors.glassBorder,
                backgroundColor: colors.glassBg,
              },
            ]}
          >
            <View style={styles.pillContent}>
              <Calendar size={Sizes.iconXs} color={colors.icon} strokeWidth={2} />
              <Data size="bodySm">Bookings</Data>
            </View>
          </View>

          {/* Filter Pills */}
          {STATUS_TABS.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <View
                key={tab.key}
                style={[
                  styles.pill,
                  styles.glass,
                  {
                    borderColor: colors.glassBorder,
                    backgroundColor: colors.glassBg,
                  },
                ]}
              >
                <HapticPressable
                  onPress={() => handleTabChange(tab.key)}
                  style={styles.pillInner}
                >
                  {({ pressed }) => (
                    <View style={[styles.pillContent, { opacity: pressed ? 0.7 : 1 }]}>
                      <Data
                        size="bodySm"
                        style={{ color: isActive ? colors.text : colors.textMuted }}
                        numberOfLines={1}
                      >
                        {tab.label}
                      </Data>
                    </View>
                  )}
                </HapticPressable>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* ─────────────────────── Content ────────────────────────────────── */}
      {isLoading && bookings.length === 0 ? (
        <View style={[styles.listContent, { paddingTop: headerHeight }]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Skeleton width={IMAGE_WIDTH} height={IMAGE_HEIGHT} borderRadius={Radius.md} />
              <View style={styles.content}>
                <Skeleton width="85%" height={Spacing.md} />
                <Skeleton width="60%" height={Spacing.md} />
                <Skeleton width="70%" height={Spacing.md} />
                <Skeleton width="65%" height={Spacing.md} />
                <Skeleton width="45%" height={Spacing.xl} borderRadius={Radius.sm} />
              </View>
            </View>
          ))}
        </View>
      ) : error && bookings.length === 0 ? (
        <View style={[styles.centerContainer, { paddingTop: headerHeight }]}>
          <Ionicons name="alert-circle-outline" size={Sizes.avatarLg} color={colors.error} />
          <Body
            size="body"
            style={{ color: colors.error, textAlign: 'center', marginTop: Spacing.md }}
          >
            {error.message || 'Failed to load bookings'}
          </Body>
          <HapticPressable onPress={handleRefresh} style={{ marginTop: Spacing.lg }}>
            <ButtonText size="body" tone="primary">Try Again</ButtonText>
          </HapticPressable>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={[styles.listContent, { paddingTop: headerHeight }]}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              progressViewOffset={headerHeight}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ─────────────────────── Details Sheet ─────────────────────────── */}
      <BookingDetailsSheet
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        booking={selectedBooking}
        onCancel={openCancel}
        onViewListing={handleViewListing}
      />

      {/* ─────────────────────── Cancel Sheet ──────────────────────────── */}
      {selectedBooking && (
        <CancelBookingSheet
          visible={showCancel}
          onClose={() => setShowCancel(false)}
          onSuccess={handleCancelSuccess}
          bookingId={selectedBooking.id}
          listingTitle={selectedBooking.listingTitle}
          listingThumbnail={selectedBooking.listingThumbnail}
          partnerName={selectedBooking.partnerName}
          scheduledDate={selectedBooking.scheduledDate}
        />
      )}

    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Header (absolute floating) ─────────────────────────────────────────────────────────────────
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: ZIndex.overlay,
    paddingBottom: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerScroll: {
    flex: 1,
  },
  headerScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.headerGap,
  },
  pillButton: {
    height: Sizes.pillHeight,
    paddingHorizontal: Spacing.md,
    borderRadius: Sizes.pillRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    borderWidth: 1,
  },
  pill: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  pillInner: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  // ── List ───────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
  },

  // ── Card (CarCardList-style) ───────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  imageContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Sizes.badgePaddingH,
    paddingVertical: Sizes.badgePaddingV,
    borderRadius: Radius.sm,
  },
  content: {
    flex: 1,
    gap: 2,
  },

  // ── Meta rows ──────────────────────────────────────────────────────────
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 1,
  },

  // ── Countdown ──────────────────────────────────────────────────────────
  countdownRow: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  countdownPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Sizes.badgePaddingV,
    borderRadius: Radius.sm,
  },

  // ── Empty State ────────────────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: EMPTY_ICON_SIZE,
    paddingHorizontal: Spacing['4xl'],
  },
  emptyIcon: {
    width: EMPTY_ICON_SIZE,
    height: EMPTY_ICON_SIZE,
    borderRadius: EMPTY_ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Loading / Error ────────────────────────────────────────────────────
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['4xl'],
  },

  // ── Footer ─────────────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
});
