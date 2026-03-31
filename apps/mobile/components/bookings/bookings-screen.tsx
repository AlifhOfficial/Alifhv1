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

import { Text, HapticPressable, Skeleton, BrandAvatar, HapticRefreshControl } from '@/components/ui';
import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, ActivityIndicator, Platform, TouchableWithoutFeedback, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Calendar1, Clock, ListFilter, Check, MoreVertical } from 'lucide-react-native';

import { Colors, Fonts, Shadows, Spacing, Radius, Layout, Sizes, ZIndex, AspectRatio, BorderWidths } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';
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
import { getMobileHeaderContentInset } from '@/components/layout';

// ─── Constants (derived from theme for responsive scaling) ──────────────────

/** FAB dimensions — derived from theme */
const FAB_SIZE = Sizes.actionButtonLg;

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

interface BookingsScreenProps {
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export function BookingsScreen({ onScroll }: BookingsScreenProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const headerInset = getMobileHeaderContentInset(insets.top);
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

  // ── Filter Drawer State ──────────────────────────────────────────────────
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const openFilterDrawer = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilterDrawer(true);
  }, []);

  const closeFilterDrawer = useCallback(() => {
    setShowFilterDrawer(false);
  }, []);

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
          onPress={() => handleViewListing(item.listingId)}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          {/* ── Image ────────────────────────────────────────────────── */}
          <View style={[styles.imageContainer, { backgroundColor: colors.backgroundSecondary }]}>
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
            {/* Status badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusColor + 'E6' }]}>
              <Text variant="caption1Emphasized" uppercase={false} style={{ color: colors.primaryForeground }}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* ── Content ──────────────────────────────────────────────── */}
          <View style={styles.content}>
            {/* Title + action */}
            <View style={styles.titleRow}>
              <Text variant="subheadEmphasized" style={[styles.titleText, { color: colors.label }]} numberOfLines={1}>
                {item.listingTitle}
              </Text>
              <HapticPressable
                onPress={() => openDetails(item)}
                hitSlop={Layout.hitSlop}
                style={[styles.actionBubble, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              >
                <MoreVertical size={Sizes.iconXs} color={colors.label} strokeWidth={2} />
              </HapticPressable>
            </View>

            {/* Date · Time */}
            <View style={styles.metaRow}>
              <Calendar1 size={Sizes.iconXs} color={colors.labelSecondary} />
              <Text variant="footnote" style={{ color: colors.labelSecondary }}>
                {formatBookingDate(item.scheduledDate)}
              </Text>
              <Clock size={Sizes.iconXs} color={colors.labelSecondary} style={{ marginLeft: Spacing.xs }} />
              <Text variant="footnote" style={{ color: colors.labelSecondary }}>
                {formatTimeRange(item.scheduledStartTime, item.scheduledEndTime)}
              </Text>
            </View>

            {/* Footer row: partner avatar + name left, countdown right */}
            <View style={styles.footer}>
              {/* Partner info */}
              <View style={styles.partnerRow}>
                <BrandAvatar
                  src={item.partnerLogo}
                  name={item.partnerName || 'Dealer'}
                  size="md"
                  backgroundColor={colors.surfaceSecondary}
                  ringColor={colors.border}
                />
                <Text variant="footnote" style={[styles.partnerName, { color: colors.labelSecondary }]} numberOfLines={1}>
                  {item.partnerName}
                </Text>
              </View>

              {/* Countdown pill */}
              {isActive && (
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
                  <Text
                    variant="footnote"
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
                  </Text>
                </View>
              )}
            </View>
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
          <Ionicons name="calendar-outline" size={Sizes.iconXl} color={colors.labelQuaternary} />
        </View>
        <Text variant="headline" style={{ marginTop: Spacing.lg }}>
          {isAll ? 'No bookings yet' : `No ${tabLabel.toLowerCase()} bookings`}
        </Text>
        <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: Spacing.sm }}>
          {isAll
            ? 'When you book a test drive on a listing, it will appear here.'
            : `You don't have any ${tabLabel.toLowerCase()} bookings.`}
        </Text>
      </View>
    );
  }, [isLoading, activeTab, colors]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return <View style={{ height: insets.bottom + Spacing['4xl'] }} />;
    return (
      <View style={[styles.listFooter, { paddingBottom: insets.bottom + Spacing['4xl'] }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isLoadingMore, colors, insets.bottom]);

  // ════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ════════════════════════════════════════════════════════════════════════

  const footerHeight = insets.bottom + FAB_SIZE + Spacing.xl * 2;

  return (
    <View style={styles.container}>

      {/* ─────────────────────── Content ────────────────────────────────── */}
      {isLoading && bookings.length === 0 ? (
        <View style={[styles.listContent, { paddingTop: headerInset, paddingBottom: footerHeight }]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.imageContainer, { backgroundColor: colors.skeleton }]} />
              <View style={styles.content}>
                <Skeleton width="75%" height={Spacing.md} />
                <Skeleton width="55%" height={Spacing.md} />
                <Skeleton width="40%" height={Spacing.lg} borderRadius={Radius.sm} />
              </View>
            </View>
          ))}
        </View>
      ) : error && bookings.length === 0 ? (
        <View style={[styles.centerContainer, { paddingTop: headerInset, paddingBottom: footerHeight }]}>
          <Ionicons name="alert-circle-outline" size={Sizes.avatarLg} color={colors.error} />
          <Text
            variant="body"
            style={{ color: colors.error, textAlign: 'center', marginTop: Spacing.md }}
          >
            {error.message || 'Failed to load bookings'}
          </Text>
          <HapticPressable onPress={handleRefresh} style={{ marginTop: Spacing.lg }}>
            <Text variant="body" tone="primary">Try Again</Text>
          </HapticPressable>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={[styles.listContent, { paddingTop: headerInset, paddingBottom: footerHeight }]}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={
            <HapticRefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ─────────────────────── Filter Drawer Bubble ─────────────────────── */}
      <View
        style={[styles.fabCluster, { bottom: insets.bottom + Spacing.xl }]}
        pointerEvents="box-none"
      >
        {showFilterDrawer && (
          <TouchableWithoutFeedback onPress={closeFilterDrawer}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
        )}

        {showFilterDrawer && (
          <View
            style={[
              styles.drawerContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {STATUS_TABS.map((t, index) => {
              const isActive = t.key === activeTab;
              const isLast = index === STATUS_TABS.length - 1;
              return (
                <View key={t.key}>
                  <HapticPressable
                    onPress={() => {
                      handleTabChange(t.key);
                      closeFilterDrawer();
                    }}
                    style={styles.drawerItem}
                  >
                    {({ pressed }) => (
                      <View style={[styles.drawerItemInner, { opacity: pressed ? 0.6 : 1 }]}>
                        <View style={styles.drawerItemLeft}>
                          {isActive ? (
                            <Check size={Sizes.iconSm} color={colors.primary} strokeWidth={2.5} />
                          ) : (
                            <View style={{ width: Sizes.iconSm }} />
                          )}
                          <Text
                            variant="body"
                            style={{
                              color: isActive ? colors.primary : colors.label,
                              fontWeight: isActive ? '600' : '400',
                            }}
                          >
                            {t.label}
                          </Text>
                        </View>
                      </View>
                    )}
                  </HapticPressable>
                  {!isLast && (
                    <View style={[styles.drawerDivider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              );
            })}
          </View>
        )}

        <HapticPressable
          onPress={showFilterDrawer ? closeFilterDrawer : openFilterDrawer}
          style={[
            styles.fabButton,
            {
              backgroundColor: showFilterDrawer ? colors.primary : colors.surfaceSecondary,
              borderColor: showFilterDrawer ? colors.primary : colors.border,
            },
          ]}
        >
          {({ pressed }) => (
            <ListFilter
              size={Sizes.iconSm}
              color={showFilterDrawer ? colors.primaryForeground : colors.label}
              strokeWidth={2}
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </HapticPressable>
      </View>

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

  // ── FAB cluster (bottom-right absolute) ──────────────────────────────
  fabCluster: {
    position: 'absolute',
    right: Layout.screenPadding,
    alignItems: 'flex-end',
    zIndex: ZIndex.overlay,
  },
  fabButton: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    borderWidth: BorderWidths.medium,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  } as any,

  // ── Filter Drawer popover ─────────────────────────────────────────────
  drawerContainer: {
    marginBottom: Spacing.sm,
    borderRadius: Radius['3xl'],
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    minWidth: 200,
    ...Shadows.lg,
  } as any,
  drawerItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
  },
  drawerItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  drawerDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.lg,
  },

  // ── List ───────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
  },

  // ── Card (CarCardM-style vertical) ────────────────────────────────────
  card: {
    width: '100%',
    borderRadius: Radius['2xl'],
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  } as any,
  imageContainer: {
    marginHorizontal: Spacing.sm,
    marginTop: Spacing.sm,
    aspectRatio: AspectRatio.cardImage,
    borderRadius: Radius['2xl'],
    borderCurve: 'continuous',
    overflow: 'hidden',
  } as any,
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Sizes.badgePaddingH,
    paddingVertical: Sizes.badgePaddingV,
    borderRadius: Radius.sm,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  titleText: {
    flex: 1,
  },
  actionBubble: {
    width: Sizes.bubbleXs,
    height: Sizes.bubbleXs,
    borderRadius: Sizes.bubbleXs / 2,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Meta rows ──────────────────────────────────────────────────────────
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  // ── Footer / Partner + Countdown ──────────────────────────────────────
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  partnerName: {
    flexShrink: 1,
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

  // ── List Footer ─────────────────────────────────────────────────────
  listFooter: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
});
