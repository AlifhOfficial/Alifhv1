/**
 * InventoryScreen — My Listings Management (v2)
 *
 * Redesigned with browse-tab-level polish:
 *   • BrowseHeader-style header (title + add button, safe-area aware)
 *   • FilterPills-style floating status tabs with shadows & badge counts
 *   • CarCardList-inspired listing cards — expo-image, proper sizing,
 *     rich data hierarchy, plus inventory overlays:
 *       – Status badge (dot + label)
 *       – Expiry countdown
 *       – Engagement stats (views / saves / superlikes)
 *       – Three-dot action menu → EditStatusSheet → sub-ops
 *   • Pull-to-refresh, pagination, loading / empty / error states
 *
 * @module components/user-inventory-management/inventory-screen
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
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
  MoreVertical,
  Plus,
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
  getMyListings,
  type MyListingCard,
  type MyListingsStats,
  type MyListingsFilter,
} from '@/lib/sell-car-user-api';
import {
  formatListingStatus,
  getStatusColor,
  formatExpiryCountdown,
  buildListingTitle,
  formatPrice,
} from './utilities/listing-helpers';
import {
  EditStatusSheet,
  type EditStatusAction,
} from './sub-operations/edit-status-sheet';
import { MarkSoldSheet } from './sub-operations/mark-sold-sheet';
import { ExtendListingSheet } from './sub-operations/extend-listing-sheet';
import { ArchiveListingSheet } from './sub-operations/archive-listing-sheet';
import { BottomSafeAreaGradient } from '@/components/layout/bottom-safe-area';
import { DeleteListingSheet } from './sub-operations/delete-listing-sheet';
import { ListingStatsSheet } from './sub-operations/listing-stats-sheet';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Card image dimensions — matches CarCardList */
const IMAGE_WIDTH = 180;
const IMAGE_HEIGHT = 160;

const SPECS_SHORT: Record<string, string> = {
  gcc: 'GCC', us: 'US', european: 'EU', japanese: 'JP',
  korean: 'KR', chinese: 'CN', canadian: 'CA', american: 'US', other: '—',
};

const EMIRATE_SHORT: Record<string, string> = {
  dubai: 'DXB', 'abu dhabi': 'AUH', abu_dhabi: 'AUH', abudhabi: 'AUH',
  sharjah: 'SHJ', ajman: 'AJM', 'ras al khaimah': 'RAK', ras_al_khaimah: 'RAK',
  'ras al-khaimah': 'RAK', rasalkhaimah: 'RAK', fujairah: 'FUJ',
  'umm al quwain': 'UAQ', umm_al_quwain: 'UAQ', 'umm al-quwain': 'UAQ',
  ummalquwain: 'UAQ',
};

// ─── Tab Configuration ───────────────────────────────────────────────────────

interface StatusTab {
  key: MyListingsFilter;
  label: string;
  count: (stats: MyListingsStats | null) => number;
}

const STATUS_TABS: StatusTab[] = [
  { key: 'all',      label: 'All',      count: (s) => s?.total ?? 0 },
  { key: 'active',   label: 'Active',   count: (s) => s?.active ?? 0 },
  { key: 'draft',    label: 'Drafts',   count: (s) => s?.draft ?? 0 },
  { key: 'in_review', label: 'In Review', count: (s) => s?.pending ?? 0 },
  { key: 'sold',     label: 'Sold',     count: (s) => s?.sold ?? 0 },
  { key: 'archived', label: 'Archived', count: (s) => s?.archived ?? 0 },
];

const PAGE_SIZE = 20;

// ─── Component ───────────────────────────────────────────────────────────────

export function InventoryScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // ── Data State ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<MyListingsFilter>('all');
  const [listings, setListings] = useState<MyListingCard[]>([]);
  const [stats, setStats] = useState<MyListingsStats | null>(null);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Sheet State ──────────────────────────────────────────────────────────
  const [selectedListing, setSelectedListing] = useState<MyListingCard | null>(null);
  const [showEditStatus, setShowEditStatus] = useState(false);
  const [showMarkSold, setShowMarkSold] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [hardDeleteMode, setHardDeleteMode] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchListings = useCallback(
    async (opts: { refresh?: boolean; loadMore?: boolean } = {}) => {
      const { refresh = false, loadMore = false } = opts;

      if (refresh) setIsRefreshing(true);
      else if (loadMore) setIsLoadingMore(true);
      else setIsLoading(true);

      try {
        const offset = loadMore ? listings.length : 0;
        const response = await getMyListings({
          status: activeTab === 'all' ? undefined : activeTab,
          includeStats: true,
          limit: PAGE_SIZE,
          offset,
          sort: 'newest',
        });

        if (loadMore) {
          setListings((prev) => [...prev, ...response.listings]);
        } else {
          setListings(response.listings);
        }

        if (response.stats) setStats(response.stats);
        setTotal(response.total);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load listings');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [activeTab, listings.length],
  );

  useEffect(() => {
    fetchListings();
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = useCallback(() => fetchListings({ refresh: true }), [fetchListings]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && listings.length < total) fetchListings({ loadMore: true });
  }, [fetchListings, isLoadingMore, listings.length, total]);

  // ── Tab ──────────────────────────────────────────────────────────────────

  const handleTabChange = useCallback((tab: MyListingsFilter) => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────

  const openActions = useCallback((listing: MyListingCard) => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedListing(listing);
    setShowEditStatus(true);
  }, []);

  const handleEditStatusAction = useCallback((action: EditStatusAction) => {
    switch (action) {
      case 'edit': break; // TODO
      case 'view_stats': setShowStats(true); break;
      case 'mark_sold': setShowMarkSold(true); break;
      case 'extend': setShowExtend(true); break;
      case 'archive':
      case 'unarchive': setShowArchive(true); break;
      case 'delete': setHardDeleteMode(false); setShowDelete(true); break;
      case 'hard_delete': setHardDeleteMode(true); setShowDelete(true); break;
    }
  }, []);

  const handleSubOpSuccess = useCallback(() => fetchListings({ refresh: true }), [fetchListings]);

  const selectedTitle = useMemo(
    () =>
      selectedListing
        ? buildListingTitle(selectedListing.year, selectedListing.make, selectedListing.model, selectedListing.trim)
        : '',
    [selectedListing],
  );

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Card
  // ════════════════════════════════════════════════════════════════════════

  const renderCard = useCallback(
    ({ item }: { item: MyListingCard }) => {
      const title = `${item.make} ${item.model}`;
      const statusLabel = formatListingStatus(item.moderationStatus, item.lifecycleStatus);
      const statusColor = getStatusColor(item.moderationStatus, item.lifecycleStatus, colors);
      const price = formatPrice(item.price ?? 0, item.currency);
      const displaySpecs = SPECS_SHORT[item.specs?.toLowerCase()] || item.specs || '—';
      const displayEmirate = EMIRATE_SHORT[item.emirate?.toLowerCase()] || item.emirate || '—';

      const expiry =
        item.expiresAt && item.lifecycleStatus === 'active' && item.moderationStatus === 'approved'
          ? formatExpiryCountdown(item.expiresAt)
          : null;

      const displayImage = item.thumbnail || item.images?.[0];

      return (
        <HapticPressable
          onPress={() => router.push(`/listing/${item.id}`)}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          {/* ── Image + Status Overlay ──────────────────────────────────── */}
          <View style={styles.imageContainer}>
            {displayImage ? (
              <Image
                source={{ uri: displayImage }}
                style={styles.image}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: colors.skeleton }]}>
                <Ionicons name="image-outline" size={32} color={colors.textMuted} />
              </View>
            )}
            {/* Status badge overlaid on image */}
            <View style={[styles.statusOverlay, { backgroundColor: statusColor + 'E6' }]}>
              <Label size="badge" uppercase={false} style={{ color: '#FFFFFF' }}>
                {statusLabel}
              </Label>
            </View>
          </View>

          {/* ── Content ────────────────────────────────────────────────── */}
          <View style={styles.content}>
            {/* Row 1: Title + action */}
            <View style={styles.titleRow}>
              <Data size="small" style={{ color: colors.text, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                {title}
              </Data>
              <HapticPressable
                onPress={() => openActions(item)}
                hitSlop={12}
                style={{ padding: 4 }}
              >
                <MoreVertical size={18} color={colors.textSecondary} strokeWidth={2} />
              </HapticPressable>
            </View>

            {/* Row 2: Price */}
            <Data size="small" style={{ color: colors.primary, fontWeight: '700' }}>
              {price}
            </Data>

            {/* Row 3: Meta line — specs · emirate */}
            <Data size="mini" style={{ color: colors.textSecondary }}>
              {displaySpecs} · {displayEmirate}
            </Data>

            {/* Row 4: Expiry (if applicable) */}
            {expiry && (
              <View style={styles.expiryRow}>
                <Clock
                  size={12}
                  color={
                    expiry.isExpired ? colors.error : expiry.isUrgent ? colors.warning : colors.textMuted
                  }
                />
                <Data
                  size="mini"
                  style={{
                    color: expiry.isExpired
                      ? colors.error
                      : expiry.isUrgent
                        ? colors.warning
                        : colors.textSecondary,
                    fontWeight: expiry.isUrgent || expiry.isExpired ? '700' : '500',
                  }}
                >
                  {expiry.text}
                </Data>
              </View>
            )}
          </View>
        </HapticPressable>
      );
    },
    [colors, router, openActions],
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
          <Ionicons name="image-outline" size={36} color={colors.textMuted} />
        </View>
        <Heading size="small" style={{ marginTop: Spacing.lg }}>
          {isAll ? 'No listings yet' : `No ${tabLabel.toLowerCase()} listings`}
        </Heading>
        <Body size="medium" tone="secondary" style={{ textAlign: 'center', marginTop: Spacing.sm }}>
          {isAll
            ? 'Create your first listing to start selling'
            : `Listings matching "${tabLabel}" will appear here`}
        </Body>
        {isAll && (
          <HapticPressable
            onPress={() => router.push('/create-listing')}
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
          >
            <Plus size={18} color="#FFFFFF" />
            <ButtonText size="medium" style={{ color: '#FFFFFF' }}>
              Create Listing
            </ButtonText>
          </HapticPressable>
        )}
      </View>
    );
  }, [isLoading, activeTab, colors, router]);

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

  // Calculate header height for content offset (matches browse-header pattern)
  const headerHeight = insets.top + Layout.headerPadding + 32 + Spacing.sm + 36 + Spacing.sm; // safe area + title + gap + pills + bottom padding

  return (
    <View style={styles.container}>
      {/* ─────────────────────── Floating Header (absolute) ────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + Layout.headerPadding, backgroundColor: colors.background, paddingHorizontal: Layout.screenPadding }]}>
        {/* Title */}
        <Heading size="large">Inventory</Heading>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillScrollContent}
        >
          {STATUS_TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            const count = tab.count(stats);

            return (
              <HapticPressable
                key={tab.key}
                onPress={() => handleTabChange(tab.key)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                {({ pressed }) => (
                  <>
                  <View style={[styles.pillContent, { opacity: pressed ? 0.7 : 1 }]}>
                    <Data
                      size="small"
                      tone={isActive ? 'default' : 'secondary'}
                      numberOfLines={1}
                    >
                      {tab.label}
                    </Data>
                    {count > 0 && (
                      <View
                        style={[
                          styles.pillBadge,
                          { backgroundColor: colors.text },
                        ]}
                      >
                        <Label
                          size="badge"
                          uppercase={false}
                          style={{ color: colors.background }}
                        >
                          {count > 99 ? '99+' : count}
                        </Label>
                      </View>
                    )}
                  </View>
                  </>
                )}
              </HapticPressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ─────────────────────── Content ─────────────────────────────────── */}
      {isLoading && listings.length === 0 ? (
        <View style={[styles.listContent, { paddingTop: headerHeight }]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.imageContainer}>
                <Skeleton width={IMAGE_WIDTH - Spacing.sm * 2} height={IMAGE_HEIGHT - Spacing.sm * 2} borderRadius={Radius.md} />
              </View>
              <View style={styles.content}>
                <Skeleton width={130} height={14} />
                <Skeleton width={90} height={14} />
                <Skeleton width={100} height={12} />
                <Skeleton width={80} height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : error && listings.length === 0 ? (
        <View style={[styles.centerContainer, { paddingTop: headerHeight }]}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Body
            size="medium"
            style={{ color: colors.error, textAlign: 'center', marginTop: Spacing.md }}
          >
            {error}
          </Body>
          <HapticPressable onPress={handleRefresh} style={{ marginTop: Spacing.lg }}>
            <Data size="small" tone="primary">Tap to retry</Data>
          </HapticPressable>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={listings}
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

      {/* ─────────────────────── Bottom Sheets ──────────────────────────── */}
      {selectedListing && (
        <>
          <EditStatusSheet
            visible={showEditStatus}
            onClose={() => setShowEditStatus(false)}
            onAction={handleEditStatusAction}
            listingId={selectedListing.id}
            listingTitle={selectedTitle}
            listingThumbnail={selectedListing.thumbnail}
            moderationStatus={selectedListing.moderationStatus}
            lifecycleStatus={selectedListing.lifecycleStatus}
            isArchived={selectedListing.isArchived}
            expiresAt={selectedListing.expiresAt}
          />
          <MarkSoldSheet
            visible={showMarkSold}
            onClose={() => setShowMarkSold(false)}
            onSuccess={handleSubOpSuccess}
            listingId={selectedListing.id}
            listingTitle={selectedTitle}
            listingThumbnail={selectedListing.thumbnail}
          />
          <ExtendListingSheet
            visible={showExtend}
            onClose={() => setShowExtend(false)}
            onSuccess={handleSubOpSuccess}
            listingId={selectedListing.id}
            listingTitle={selectedTitle}
            listingThumbnail={selectedListing.thumbnail}
            expiresAt={selectedListing.expiresAt}
          />
          <ArchiveListingSheet
            visible={showArchive}
            onClose={() => setShowArchive(false)}
            onSuccess={handleSubOpSuccess}
            listingId={selectedListing.id}
            listingTitle={selectedTitle}
            listingThumbnail={selectedListing.thumbnail}
            isArchived={selectedListing.isArchived}
          />
          <DeleteListingSheet
            visible={showDelete}
            onClose={() => setShowDelete(false)}
            onSuccess={handleSubOpSuccess}
            listingId={selectedListing.id}
            listingTitle={selectedTitle}
            listingThumbnail={selectedListing.thumbnail}
            hardDelete={hardDeleteMode}
          />
          <ListingStatsSheet
            visible={showStats}
            onClose={() => setShowStats(false)}
            listingTitle={selectedTitle}
            listingThumbnail={selectedListing.thumbnail}
            viewCount={selectedListing.viewCount ?? 0}
            favouriteCount={selectedListing.favouriteCount ?? 0}
            superlikeCount={selectedListing.superlikeCount ?? 0}
          />
        </>
      )}

      {/* ─────────────────────── Bottom Safe Area ────────────────────────── */}
      <BottomSafeAreaGradient />

      {/* ─────────────────────── FAB: Create Listing ─────────────────────── */}
      <HapticPressable
        onPress={() => router.push('/create-listing')}
        style={[
          styles.fab,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            bottom: insets.bottom + 20,
          },
        ]}
      >
        {({ pressed }) => (
          <>
            <Plus size={22} color={colors.text} strokeWidth={2} style={{ opacity: pressed ? 0.6 : 1 }} />
          </>
        )}
      </HapticPressable>
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
    zIndex: 20,
    paddingBottom: Spacing.sm,
    flexDirection: 'column',
    gap: Spacing.sm,
  },

  // ── Filter Pills (floating tabs) ───────────────────────────────────────
  pillScroll: {
    flexGrow: 0,
  },
  pillScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.headerGap,
    paddingRight: Layout.screenPadding,
  },
  fab: {
    position: 'absolute',
    right: Layout.screenPadding,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  pill: {
    borderRadius: Radius.full,
    borderWidth: 1,
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
  pillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },

  // ── List ───────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    gap: Spacing.lg,
  },

  // ── Card (CarCardList-style) ───────────────────────────────────────────
  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    width: IMAGE_WIDTH,
    padding: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: IMAGE_WIDTH - Spacing.sm * 2,
    height: IMAGE_HEIGHT - Spacing.sm * 2,
    borderRadius: Radius.md,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  // ── Expiry ─────────────────────────────────────────────────────────────
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
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
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing['2xl'],
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
