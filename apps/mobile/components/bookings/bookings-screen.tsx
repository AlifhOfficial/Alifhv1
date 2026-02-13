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

import React, { useCallback, useEffect, useRef, useState } from 'react';
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

import { Colors, Spacing, Radius, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import {
  Heading,
  Body,
  Data,
  Supporting,
  ButtonText,
  Label,
  Skeleton,
} from '@/components/ui';
import {
  getUserBookings,
  type UserBooking,
  type BookingFilter,
  type BookingStatus,
} from '@/lib/booking-api';
import {
  formatBookingStatus,
  getBookingStatusColor,
  formatBookingDate,
  formatTimeRange,
  formatBookingCountdown,
} from './utilities/booking-helpers';
import { CancelBookingSheet } from './cancel-booking-sheet';
import { BookingDetailsSheet } from './booking-details-sheet';
import { BottomSafeAreaGradient } from '@/components/layout/bottom-safe-area';

// ─── Constants (matches CarCardList) ─────────────────────────────────────────

const IMAGE_WIDTH = 160;
const IMAGE_HEIGHT = 140;
const PAGE_SIZE = 20;

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
  { key: 'no_show',   label: 'No Show' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function BookingsScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // ── Data State ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<BookingFilter>('all');
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Sheet State ──────────────────────────────────────────────────────────
  const [selectedBooking, setSelectedBooking] = useState<UserBooking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchBookings = useCallback(
    async (opts: { refresh?: boolean; loadMore?: boolean } = {}) => {
      const { refresh = false, loadMore = false } = opts;

      if (refresh) setIsRefreshing(true);
      else if (loadMore) setIsLoadingMore(true);
      else setIsLoading(true);

      try {
        const offset = loadMore ? bookings.length : 0;
        const response = await getUserBookings({
          status: activeTab === 'all' ? undefined : activeTab as BookingStatus,
          limit: PAGE_SIZE,
          offset,
          sort: 'newest',
        });

        if (loadMore) {
          setBookings((prev) => [...prev, ...response.bookings]);
        } else {
          setBookings(response.bookings);
        }

        setTotal(response.total);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load bookings');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [activeTab, bookings.length],
  );

  useEffect(() => {
    fetchBookings();
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = useCallback(() => fetchBookings({ refresh: true }), [fetchBookings]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && bookings.length < total) fetchBookings({ loadMore: true });
  }, [fetchBookings, isLoadingMore, bookings.length, total]);

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
    fetchBookings({ refresh: true });
  }, [fetchBookings]);

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
          <View style={[styles.imageContainer, { backgroundColor: colors.backgroundSecondary }]}>
            {item.listingThumbnail ? (
              <Image
                source={{ uri: item.listingThumbnail }}
                style={styles.image}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <View style={[styles.image, { backgroundColor: colors.skeleton }]} />
            )}
            {/* Status badge (BLK-badge style) */}
            <View style={[styles.statusBadge, { backgroundColor: statusColor + 'E6' }]}>
              <Label size="badge" uppercase={false} style={{ color: '#FFF' }}>
                {statusLabel}
              </Label>
            </View>
          </View>

          {/* ── Content ──────────────────────────────────────────────── */}
          <View style={styles.content}>
            {/* Title */}
            <Data size="small" style={{ color: colors.text, fontWeight: '600' }} numberOfLines={1}>
              {item.listingTitle}
            </Data>

            {/* Partner */}
            <Data size="mini" style={{ color: colors.textSecondary }} numberOfLines={1}>
              {item.partnerName}
            </Data>

            {/* Date */}
            <View style={styles.metaRow}>
              <Calendar size={12} color={colors.textSecondary} />
              <Data size="mini" style={{ color: colors.textSecondary }}>
                {formatBookingDate(item.scheduledDate)}
              </Data>
            </View>

            {/* Time */}
            <View style={styles.metaRow}>
              <Clock size={12} color={colors.textSecondary} />
              <Data size="mini" style={{ color: colors.textSecondary }}>
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
                    size="mini"
                    style={{
                      fontWeight: '700',
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
        <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name="calendar-outline" size={36} color={colors.textMuted} />
        </View>
        <Heading size="small" style={{ marginTop: Spacing.lg }}>
          {isAll ? 'No bookings yet' : `No ${tabLabel.toLowerCase()} bookings`}
        </Heading>
        <Body size="medium" tone="secondary" style={{ textAlign: 'center', marginTop: Spacing.sm }}>
          {isAll
            ? 'When you book a test drive on a listing, it will appear here.'
            : `You don't have any ${tabLabel.toLowerCase()} bookings.`}
        </Body>
      </View>
    );
  }, [isLoading, activeTab, colors]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return <View style={{ height: insets.bottom + 40 }} />;
    return (
      <View style={[styles.footer, { paddingBottom: insets.bottom + 40 }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isLoadingMore, colors, insets.bottom]);

  // ════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ════════════════════════════════════════════════════════════════════════

  const headerHeight = insets.top + Layout.headerPadding + 32 + Spacing.sm + 36 + Spacing.sm;

  return (
    <View style={styles.container}>
      {/* ─────────────────────── Floating Header ───────────────────────── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Layout.headerPadding,
            backgroundColor: colors.background,
            paddingHorizontal: Layout.screenPadding,
          },
        ]}
      >
        {/* Title */}
        <Heading size="large">Bookings</Heading>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillScrollContent}
        >
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <View
                key={tab.key}
                style={[
                  styles.pill,
                  styles.glass,
                  {
                    borderColor: colors.glassBorder,
                    backgroundColor: colors.glassBackground,
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
                        size="small"
                        tone={isActive ? 'default' : 'secondary'}
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
                <Skeleton width={130} height={14} />
                <Skeleton width={90} height={12} />
                <Skeleton width={110} height={12} />
                <Skeleton width={100} height={12} />
                <Skeleton width={70} height={20} borderRadius={Radius.sm} />
              </View>
            </View>
          ))}
        </View>
      ) : error && bookings.length === 0 ? (
        <View style={[styles.centerContainer, { paddingTop: headerHeight }]}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Body
            size="medium"
            style={{ color: colors.error, textAlign: 'center', marginTop: Spacing.md }}
          >
            {error}
          </Body>
          <HapticPressable onPress={handleRefresh} style={{ marginTop: Spacing.lg }}>
            <ButtonText size="medium" tone="primary">Try Again</ButtonText>
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

      {/* ─────────────────────── Bottom Safe Area ──────────────────────── */}
      <BottomSafeAreaGradient />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Header ─────────────────────────────────────────────────────────────
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingBottom: Spacing.sm,
    flexDirection: 'column',
    gap: Spacing.sm,
  },


  // ── Filter Pills ──────────────────────────────────────────────────────
  pillScroll: {
    flexGrow: 0,
  },
  pillScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.headerGap,
    paddingRight: Layout.screenPadding,
  },
  glass: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  pill: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  pillInner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
    paddingHorizontal: Spacing.sm - 2,
    paddingVertical: 2,
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
    gap: 4,
    marginTop: 1,
  },

  // ── Countdown ──────────────────────────────────────────────────────────
  countdownRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  countdownPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },

  // ── Empty State ────────────────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Loading / Error ────────────────────────────────────────────────────
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  // ── Footer ─────────────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
});