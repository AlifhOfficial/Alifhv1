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

import { Text, HapticPressable, Skeleton } from '@/components/ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, ScrollView, RefreshControl, ActivityIndicator, Platform, TouchableWithoutFeedback } from 'react-native';

import { Image } from 'expo-image';
import { getAppThumbUrl } from '@/lib/config';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import {
  MoreVertical,
  Plus,
  Clock,
  Package,
  ListFilter,
  Check,
} from 'lucide-react-native';

import { Colors, Spacing, Radius, Layout, Sizes, ZIndex} from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import {
  getListingForEdit,
  type MyListingCard,
  type MyListingsStats,
  type MyListingsFilter,
  type DeleteListingResponse,
} from '@/lib/sell-car-user-api';
import {
  formatListingStatus,
  getStatusColor,
  formatExpiryCountdown,
  buildListingTitle,
  formatPrice,
  canOpenPublicListing,
} from './utilities/listing-helpers';
import {
  EditStatusSheet,
  type EditStatusAction,
} from './sub-operations/edit-status-sheet';
import { MarkSoldSheet } from './sub-operations/mark-sold-sheet';
import { ExtendListingSheet } from './sub-operations/extend-listing-sheet';
import { ArchiveListingSheet } from './sub-operations/archive-listing-sheet';

import { DeleteListingSheet } from './sub-operations/delete-listing-sheet';
import { ListingStatsSheet } from './sub-operations/listing-stats-sheet';
import { PendingReviewReasonSheet } from './sub-operations/pending-review-reason-sheet';
import { CreateListingFlow } from '@/components/sheets/create-listing/create-listing-flow';
import type { CreateListingData } from '@/components/sheets/create-listing/types';
import { useInventory } from '@/hooks/use-inventory-query';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Card image dimensions — derived from theme for responsive scaling */
const IMAGE_WIDTH = Sizes.cardThumbnailWidth + Spacing.xl;
const IMAGE_HEIGHT = Sizes.cardThumbnailHeight + Spacing.xl;

/** FAB dimensions — derived from theme */
const FAB_SIZE = Sizes.bubbleMd + Spacing.xs;

/** Empty state icon container — derived from theme */
const EMPTY_ICON_SIZE = Spacing['5xl'] + Spacing['3xl'];

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

// ─── Component ───────────────────────────────────────────────────────────────

export function InventoryScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();

  // Determine initial tab from URL param
  const initialTab = useMemo(() => {
    if (tab && STATUS_TABS.some(t => t.key === tab)) {
      return tab as MyListingsFilter;
    }
    return 'all';
  }, [tab]);

  // ── Data State (React Query) ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<MyListingsFilter>(initialTab);
  
  // React Query hook for listings data
  const {
    listings,
    stats,
    total,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    invalidate,
  } = useInventory({ filter: activeTab });

  // Sync active tab when URL param changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // ── Sheet State ──────────────────────────────────────────────────────────
  const [selectedListing, setSelectedListing] = useState<MyListingCard | null>(null);
  const [showEditStatus, setShowEditStatus] = useState(false);
  const [showMarkSold, setShowMarkSold] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [hardDeleteMode, setHardDeleteMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showReviewReason, setShowReviewReason] = useState(false);
  const [showEditFlow, setShowEditFlow] = useState(false);
  const [editInitialData, setEditInitialData] = useState<Partial<CreateListingData> | undefined>(undefined);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [isPublishedEdit, setIsPublishedEdit] = useState(false);

  // ── Filter Drawer State ─────────────────────────────────────────────────
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const openFilterDrawer = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilterDrawer(true);
  }, []);

  const closeFilterDrawer = useCallback(() => {
    setShowFilterDrawer(false);
  }, []);

  // Handler to open create flow (fresh, no initial data)
  const openCreateFlow = useCallback(() => {
    setEditInitialData(undefined);
    setEditingListingId(null);
    setShowEditFlow(true);
  }, []);

  const flatListRef = useRef<FlatList>(null);

  // Scroll to top when tab changes
  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [activeTab]);

  const handleRefresh = useCallback(() => refresh(), [refresh]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) loadMore();
  }, [loadMore, isLoadingMore, hasMore]);

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

  const handleEditStatusAction = useCallback(async (action: EditStatusAction) => {
    switch (action) {
      case 'edit': {
        if (!selectedListing) break;
        try {
          const listing = await getListingForEdit(selectedListing.id);
          // Check if this is a published listing (not draft)
          // Drafts get full creation flow, published get limited edit
          const isDraft = selectedListing.moderationStatus === 'draft';
          
          // Map API data to CreateListingData format
          const initialData: Partial<CreateListingData> = {
            vin: listing.vin || '',
            vinVerified: true, // If they have a listing, VIN was verified
            vinVisibility: listing.vinVisibility || 'public',
            make: listing.make || '',
            model: listing.model || '',
            year: listing.year?.toString() || '',
            trim: listing.trim || '',
            mileage: listing.mileage?.toString() || '',
            specs: listing.specs || 'gcc',
            steeringSide: listing.steeringSide || 'left',
            bodyType: listing.bodyType || '',
            exteriorColor: listing.exteriorColor || '',
            interiorColor: listing.interiorColor || '',
            doors: listing.doors?.toString() || '',
            seatingCapacity: listing.seatingCapacity?.toString() || '',
            fuelType: listing.fuelType || '',
            transmission: listing.transmission || '',
            engineSize: listing.engineSize || '',
            engineType: listing.engineType || '',
            cylinders: listing.cylinders?.toString() || '',
            powerRange: listing.powerRange || '',
            fuelEconomy: listing.fuelEconomy || '',
            torque: listing.torque || '',
            warrantyType: listing.warrantyType || '',
            exportStatus: listing.exportStatus || 'local_only',
            extras: listing.extras || [],
            tags: listing.tags || [],
            price: listing.price?.toString() || '',
            isNegotiable: listing.isNegotiable ?? false,
            emirate: listing.emirate || '',
            city: listing.city || '',
            images: listing.images || [],
            description: listing.description || '',
            specialNotes: Array.isArray(listing.specialNotes) ? listing.specialNotes : [],
          };
          setEditInitialData(initialData);
          setEditingListingId(selectedListing.id);
          setIsPublishedEdit(!isDraft); // true for published, false for drafts
          setShowEditFlow(true);
        } catch (err) {
          console.error('Failed to load listing for edit:', err);
        }
        break;
      }
      case 'view_stats': setShowStats(true); break;
      case 'view_review_reason': setShowReviewReason(true); break;
      case 'mark_sold': setShowMarkSold(true); break;
      case 'extend': setShowExtend(true); break;
      case 'archive':
      case 'unarchive': setShowArchive(true); break;
      case 'delete': setHardDeleteMode(false); setShowDelete(true); break;
      case 'hard_delete': setHardDeleteMode(true); setShowDelete(true); break;
    }
  }, [selectedListing]);

  const handleSubOpSuccess = useCallback(() => invalidate(), [invalidate]);

  /** Handle delete success: navigate to 'deleted' tab for soft-deletes */
  const handleDeleteSuccess = useCallback((result: DeleteListingResponse) => {
    if (result.action === 'soft_deleted' && activeTab !== 'deleted') {
      // Navigate to deleted tab so user can see where listing went
      setActiveTab('deleted');
    } else {
      // Hard delete or already on deleted tab - just refresh
      invalidate();
    }
  }, [activeTab, invalidate]);

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

      const rawDisplayImage = item.thumbnail || item.images?.[0];
      const displayImage = getAppThumbUrl(rawDisplayImage);
      const canViewPublicDetail = canOpenPublicListing(item.moderationStatus, item.lifecycleStatus);

      return (
        <HapticPressable
          onPress={canViewPublicDetail ? () => router.push(`/listing/${item.id}`) : undefined}
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
                <Ionicons name="image-outline" size={Sizes.iconXl} color={colors.labelQuaternary} />
              </View>
            )}
            {/* Status badge overlaid on image */}
            <View style={[styles.statusOverlay, { backgroundColor: statusColor + 'E6' }]}>
              <Text variant="caption" uppercase={false} style={{ color: colors.primaryForeground }}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* ── Content ────────────────────────────────────────────────── */}
          <View style={styles.content}>
            {/* Row 1: Title + action */}
            <View style={styles.titleRow}>
              <Text variant="bodySm" style={{ color: colors.label, flex: 1 }} numberOfLines={1}>
                {title}
              </Text>
              <HapticPressable
                onPress={() => openActions(item)}
                hitSlop={Layout.hitSlop}
                style={{ padding: Spacing.xs }}
              >
                <MoreVertical size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={2} />
              </HapticPressable>
            </View>

            {/* Row 2: Price */}
            <Text variant="heading" tone="primary">
              {price}
            </Text>

            {/* Row 3: Meta line — specs · emirate */}
            <Text variant="bodySm" style={{ color: colors.labelSecondary }}>
              {displaySpecs} · {displayEmirate}
            </Text>

            {/* Row 4: Expiry (if applicable) */}
            {expiry && (
              <View style={styles.expiryRow}>
                <Clock
                  size={Sizes.iconXs}
                  color={
                    expiry.isExpired ? colors.error : expiry.isUrgent ? colors.warning : colors.labelQuaternary
                  }
                />
                <Text
                  variant="bodySm"
                  style={{
                    color: expiry.isExpired
                      ? colors.error
                      : expiry.isUrgent
                        ? colors.warning
                        : colors.labelSecondary,
                  }}
                >
                  {expiry.text}
                </Text>
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
          <Ionicons name="image-outline" size={Sizes.iconXl} color={colors.labelQuaternary} />
        </View>
        <Text variant="subheading" style={{ marginTop: Spacing.lg }}>
          {isAll ? 'No listings yet' : `No ${tabLabel.toLowerCase()} listings`}
        </Text>
        <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: Spacing.sm }}>
          {isAll
            ? 'Create your first listing to start selling'
            : `Listings matching "${tabLabel}" will appear here`}
        </Text>
        {isAll && (
          <HapticPressable
            onPress={openCreateFlow}
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
          >
            <Plus size={Sizes.iconSm} color={colors.primaryForeground} />
            <Text variant="body" style={{ color: colors.primaryForeground }}>
              Create Listing
            </Text>
          </HapticPressable>
        )}
      </View>
    );
  }, [isLoading, activeTab, colors, router]);

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

  const footerHeight = insets.bottom + FAB_SIZE + Spacing.xl * 2;

  return (
    <View style={styles.container}>

      {/* ─────────────────────── Content ─────────────────────────────────── */}
      {isLoading && listings.length === 0 ? (
        <View style={[styles.listContent, { paddingTop: insets.top + Spacing.lg, paddingBottom: footerHeight }]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.imageContainer}>
                <Skeleton width={IMAGE_WIDTH - Spacing.sm * 2} height={IMAGE_HEIGHT - Spacing.sm * 2} borderRadius={Radius.md} />
              </View>
              <View style={styles.content}>
                <Skeleton width="80%" height={Spacing.md} />
                <Skeleton width="55%" height={Spacing.md} />
                <Skeleton width="60%" height={Spacing.md} />
                <Skeleton width="50%" height={Spacing.md} />
              </View>
            </View>
          ))}
        </View>
      ) : error && listings.length === 0 ? (
        <View style={[styles.centerContainer, { paddingTop: insets.top + Spacing.lg, paddingBottom: footerHeight }]}>
          <Ionicons name="alert-circle-outline" size={Sizes.avatarLg} color={colors.error} />
          <Text
            variant="body"
            style={{ color: colors.error, textAlign: 'center', marginTop: Spacing.md }}
          >
            {error}
          </Text>
          <HapticPressable onPress={handleRefresh} style={{ marginTop: Spacing.lg }}>
            <Text variant="bodySm" tone="primary">Tap to retry</Text>
          </HapticPressable>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[styles.listContent, { paddingBottom: footerHeight }]}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
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
            onSuccess={handleDeleteSuccess}
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
            impressionCount={selectedListing.impressionCount ?? 0}
            favouriteCount={selectedListing.favouriteCount ?? 0}
            superlikeCount={selectedListing.superlikeCount ?? 0}
          />
          <PendingReviewReasonSheet
            visible={showReviewReason}
            onClose={() => setShowReviewReason(false)}
            listingTitle={selectedTitle}
            listingThumbnail={selectedListing.thumbnail}
            aiModeration={selectedListing.aiModeration}
          />
        </>
      )}

      {/* Edit Listing Flow (for drafts and editing) */}
      <CreateListingFlow
        visible={showEditFlow}
        onClose={() => {
          setShowEditFlow(false);
          setEditInitialData(undefined);
          setEditingListingId(null);
          setIsPublishedEdit(false);
        }}
        onSuccess={() => {
          setShowEditFlow(false);
          setEditInitialData(undefined);
          setEditingListingId(null);
          setIsPublishedEdit(false);
          invalidate();
        }}
        initialData={editInitialData}
        listingId={editingListingId ?? undefined}
        isPublishedEdit={isPublishedEdit}
      />

      {/* ─────────────────────── Filter Drawer Bubble ─────────────────────── */}
      <View
        style={[styles.fabCluster, { bottom: insets.bottom + Spacing.xl }]}
        pointerEvents="box-none"
      >
        {/* Backdrop to dismiss */}
        {showFilterDrawer && (
          <TouchableWithoutFeedback onPress={closeFilterDrawer}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
        )}

        {/* Popover menu */}
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

        {/* FAB row: filter pill + create button */}
        <View style={styles.fabRow}>
          <HapticPressable
            onPress={showFilterDrawer ? closeFilterDrawer : openFilterDrawer}
            style={[
              styles.fab,
              styles.glass,
              {
                width: FAB_SIZE,
                paddingHorizontal: 0,
                backgroundColor: showFilterDrawer ? colors.primary : colors.background,
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

          <HapticPressable
            onPress={openCreateFlow}
            style={[
              styles.fab,
              styles.glass,
              {
                width: FAB_SIZE,
                paddingHorizontal: 0,
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            {({ pressed }) => (
              <Plus size={Sizes.iconMd} color={colors.label} strokeWidth={2} style={{ opacity: pressed ? 0.6 : 1 }} />
            )}
          </HapticPressable>
        </View>
      </View>
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
  fabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  fab: {
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  } as any,
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  glass: {
    borderWidth: 1,
  },

  // ── Filter Drawer popover ─────────────────────────────────────────────
  drawerContainer: {
    marginBottom: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    minWidth: 220,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
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
  drawerBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.lg,
    minWidth: Sizes.iconSm + 4,
    alignItems: 'center',
  },
  drawerDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.lg,
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
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Sizes.badgePaddingV,
    borderRadius: Radius.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    gap: Spacing.xs,
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
    gap: Spacing.xs,
    marginTop: 2,
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
    paddingHorizontal: Spacing['4xl'],
  },

  // ── Footer ─────────────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
});
