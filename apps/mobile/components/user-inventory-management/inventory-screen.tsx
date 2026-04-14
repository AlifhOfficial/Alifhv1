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
 *       – Three-dot action menu → native form-sheet routes
 *   • Pull-to-refresh, pagination, loading / empty / error states
 *
 * @module components/user-inventory-management/inventory-screen
 */

import {
  Text,
  HapticPressable,
  Skeleton,
  HapticRefreshControl,
  EmptyState,
} from "@/components/ui";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

import { Image } from "expo-image";
import { getAppThumbUrl } from "@/lib/config";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  MoreVertical,
  Plus,
  Clock,
  Package,
  Package2,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react-native";

import {
  Colors,
  Shadows,
  Spacing,
  Radius,
  Layout,
  Sizes,
  ZIndex,
  AspectRatio,
  BorderWidths,
  Stroke,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import {
  getListingForEdit,
  type MyListingCard,
  type MyListingsFilter,
} from "@/lib/sell-car-user-api";
import {
  formatListingStatus,
  getStatusColor,
  formatExpiryCountdown,
  formatPrice,
  buildCreateListingInitialData,
} from "./utilities/listing-helpers";
import { CreateListingFlow } from "@/components/sheets/create-listing/create-listing-flow";
import type { CreateListingData } from "@/components/sheets/create-listing/types";
import { useInventory } from "@/hooks/use-inventory-query";
import { getMobileHeaderContentInset } from "@/components/layout";
import {
  buildInventorySheetParams,
  getStringParam,
  parseBooleanParam,
} from "@/components/user-inventory-management/sub-operations/route-params";

// ─── Constants ───────────────────────────────────────────────────────────────

/** FAB dimensions — derived from theme */
const FAB_SIZE = Sizes.bubbleMd + Spacing.xs;

const SPECS_SHORT: Record<string, string> = {
  gcc: "GCC",
  us: "US",
  european: "EU",
  japanese: "JP",
  korean: "KR",
  chinese: "CN",
  canadian: "CA",
  american: "US",
  other: "—",
};

const EMIRATE_SHORT: Record<string, string> = {
  dubai: "DXB",
  "abu dhabi": "AUH",
  abu_dhabi: "AUH",
  abudhabi: "AUH",
  sharjah: "SHJ",
  ajman: "AJM",
  "ras al khaimah": "RAK",
  ras_al_khaimah: "RAK",
  "ras al-khaimah": "RAK",
  rasalkhaimah: "RAK",
  fujairah: "FUJ",
  "umm al quwain": "UAQ",
  umm_al_quwain: "UAQ",
  "umm al-quwain": "UAQ",
  ummalquwain: "UAQ",
};

// ─── Tab Configuration ───────────────────────────────────────────────────────

interface StatusTab {
  key: MyListingsFilter;
  label: string;
}

const STATUS_TABS: StatusTab[] = [
  { key: "all", label: "All" },
  { key: "public", label: "Public" },
  { key: "draft", label: "Drafts" },
  { key: "in_review", label: "In Review" },
  { key: "sold", label: "Sold" },
  { key: "archived", label: "Archived" },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface InventoryScreenProps {
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export function InventoryScreen({ onScroll }: InventoryScreenProps) {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const headerInset = getMobileHeaderContentInset(insets.top);
  const router = useRouter();
  const { tab, editListingId, editPublished, editNonce } =
    useLocalSearchParams<{
      tab?: string;
      editListingId?: string;
      editPublished?: string;
      editNonce?: string;
    }>();

  // Determine initial tab from URL param
  const initialTab = useMemo(() => {
    if (tab && STATUS_TABS.some((t) => t.key === tab)) {
      return tab as MyListingsFilter;
    }
    return "all";
  }, [tab]);

  // ── Data State (React Query) ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<MyListingsFilter>(initialTab);

  // React Query hook for listings data
  const {
    listings,
    stats,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    invalidate,
  } = useInventory({ userId: user?.id, filter: activeTab });

  // Sync active tab when URL param changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // ── Create Flow State ────────────────────────────────────────────────────
  const [showEditFlow, setShowEditFlow] = useState(false);
  const [editInitialData, setEditInitialData] = useState<
    Partial<CreateListingData> | undefined
  >(undefined);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [isPublishedEdit, setIsPublishedEdit] = useState(false);
  const handledEditNonceRef = useRef<string | null>(null);

  const openFilterSheet = useCallback(() => {
    if (process.env.EXPO_OS === "ios")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/inventory/filters",
      params: {
        activeTab,
        totalCount: String(stats?.total ?? 0),
        activeCount: String(stats?.active ?? 0),
        draftCount: String(stats?.draft ?? 0),
        pendingCount: String(stats?.pending ?? 0),
        soldCount: String(stats?.sold ?? 0),
        archivedCount: String(stats?.archived ?? 0),
      },
    });
  }, [activeTab, router, stats]);

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

  const launchEditFlow = useCallback(
    async (listingId: string, publishedEdit: boolean) => {
      try {
        const listing = await getListingForEdit(listingId);
        const initialData: Partial<CreateListingData> =
          buildCreateListingInitialData(listing);
        setEditInitialData(initialData);
        setEditingListingId(listingId);
        setIsPublishedEdit(publishedEdit);
        setShowEditFlow(true);
      } catch (err) {
        console.error("Failed to load listing for edit:", err);
      }
    },
    [],
  );

  useEffect(() => {
    const listingId = getStringParam(editListingId);
    const nonce = getStringParam(editNonce);

    if (!listingId || !nonce || handledEditNonceRef.current === nonce) {
      return;
    }

    handledEditNonceRef.current = nonce;
    void launchEditFlow(listingId, parseBooleanParam(editPublished));
  }, [editListingId, editNonce, editPublished, launchEditFlow]);

  const openActions = useCallback(
    (listing: MyListingCard) => {
      if (process.env.EXPO_OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      router.push({
        pathname: "/inventory/actions",
        params: buildInventorySheetParams(listing, activeTab),
      });
    },
    [activeTab, router],
  );

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Card
  // ════════════════════════════════════════════════════════════════════════

  const renderCard = useCallback(
    ({ item }: { item: MyListingCard }) => {
      const title = `${item.make} ${item.model}`;
      const statusLabel = formatListingStatus(
        item.moderationStatus,
        item.lifecycleStatus,
      );
      const statusColor = getStatusColor(
        item.moderationStatus,
        item.lifecycleStatus,
        colors,
      );
      const price = formatPrice(item.price ?? 0, item.currency);
      const metaParts = [
        item.year,
        SPECS_SHORT[item.specs?.toLowerCase()] || item.specs || null,
        EMIRATE_SHORT[item.emirate?.toLowerCase()] || item.emirate || null,
      ].filter(Boolean);
      const metaLine = metaParts.join(" · ");

      const expiry =
        item.expiresAt &&
        item.lifecycleStatus === "active" &&
        item.moderationStatus === "approved"
          ? formatExpiryCountdown(item.expiresAt)
          : null;

      const rawDisplayImage = item.thumbnail || item.images?.[0];
      const displayImage = getAppThumbUrl(rawDisplayImage);
      return (
        <HapticPressable
          onPress={() => openActions(item)}
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* ── Image + Status Overlay ──────────────────────────────────── */}
          <View
            style={[
              styles.imageContainer,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            {displayImage ? (
              <Image
                source={{ uri: displayImage }}
                style={styles.image}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <View
                style={[
                  styles.image,
                  styles.imagePlaceholder,
                  { backgroundColor: colors.skeleton },
                ]}
              >
                <ImageIcon
                  size={Sizes.iconXl}
                  color={colors.labelQuaternary}
                  strokeWidth={Stroke.icon}
                />
              </View>
            )}
            {/* Status badge */}
            <View
              style={[
                styles.statusOverlay,
                { backgroundColor: statusColor + "E6" },
              ]}
            >
              <Text
                variant="caption1Emphasized"
                uppercase={false}
                style={{ color: colors.primaryForeground }}
              >
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* ── Content ────────────────────────────────────────────────── */}
          <View style={styles.content}>
            {/* Title + three-dot action */}
            <View style={styles.titleRow}>
              <Text
                variant="subheadEmphasized"
                style={[styles.titleText, { color: colors.label }]}
                numberOfLines={1}
              >
                {title}
              </Text>
              <HapticPressable
                onPress={() => openActions(item)}
                hitSlop={Layout.hitSlop}
                style={[
                  styles.actionBubble,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <MoreVertical
                  size={Sizes.iconXs}
                  color={colors.label}
                  strokeWidth={2}
                />
              </HapticPressable>
            </View>

            {/* Meta: year · specs · emirate (only present values) */}
            {metaLine ? (
              <Text variant="footnote" style={{ color: colors.labelSecondary }}>
                {metaLine}
              </Text>
            ) : null}

            {/* Price + expiry footer */}
            <View style={styles.footer}>
              <Text variant="callout" style={{ color: colors.primary }}>
                {price}
              </Text>
              {expiry && (
                <View style={styles.expiryRow}>
                  <Clock
                    size={Sizes.iconXs}
                    color={
                      expiry.isExpired
                        ? colors.error
                        : expiry.isUrgent
                          ? colors.warning
                          : colors.labelQuaternary
                    }
                  />
                  <Text
                    variant="footnote"
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
          </View>
        </HapticPressable>
      );
    },
    [colors, openActions],
  );

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Empty / Footer
  // ════════════════════════════════════════════════════════════════════════

  const renderEmptyState = useCallback(() => {
    if (isLoading) return null;
    const tabLabel =
      STATUS_TABS.find((t) => t.key === activeTab)?.label ?? "All";
    const isAll = activeTab === "all";

    return (
      <EmptyState
        icon={Package}
        title={
          isAll ? "No listings yet." : `No ${tabLabel.toLowerCase()} listings.`
        }
        subtitle={
          isAll
            ? "Create your first listing to start selling."
            : `Listings matching "${tabLabel}" will appear here.`
        }
        action={
          isAll
            ? { label: "Create Listing", onPress: openCreateFlow, icon: Plus }
            : undefined
        }
      />
    );
  }, [isLoading, activeTab, openCreateFlow]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore)
      return <View style={{ height: insets.bottom + Spacing["4xl"] }} />;
    return (
      <View
        style={[
          styles.listFooter,
          { paddingBottom: insets.bottom + Spacing["4xl"] },
        ]}
      >
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
        <View
          style={[
            styles.listContent,
            { paddingTop: headerInset, paddingBottom: footerHeight },
          ]}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.imageContainer,
                  { backgroundColor: colors.skeleton },
                ]}
              />
              <View style={styles.content}>
                <Skeleton width="75%" height={Spacing.md} />
                <Skeleton width="50%" height={Spacing.md} />
                <Skeleton width="40%" height={Spacing.md} />
              </View>
            </View>
          ))}
        </View>
      ) : error && listings.length === 0 ? (
        <View
          style={[
            styles.centerContainer,
            { paddingTop: headerInset, paddingBottom: footerHeight },
          ]}
        >
          <AlertCircle
            size={Sizes.avatarLg}
            color={colors.error}
            strokeWidth={Stroke.icon}
          />
          <Text
            variant="body"
            style={{
              color: colors.error,
              textAlign: "center",
              marginTop: Spacing.md,
            }}
          >
            {error}
          </Text>
          <HapticPressable
            onPress={handleRefresh}
            style={{ marginTop: Spacing.lg }}
          >
            <Text variant="subhead" tone="primary">
              Tap to retry
            </Text>
          </HapticPressable>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: headerInset, paddingBottom: footerHeight },
            listings.length === 0 && { flexGrow: 1 },
          ]}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={
            <HapticRefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
        />
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

      {/* ─────────────────────── Bottom Bubble Actions ─────────────────────── */}
      <View
        style={[styles.bottomBar, { bottom: insets.bottom + Spacing.xl }]}
        pointerEvents="box-none"
      >
        <View style={styles.bottomBarContent}>
          {/* FAB row: filter + create */}
          <View style={styles.fabRow}>
            <HapticPressable
              onPress={openFilterSheet}
              style={[
                styles.fabButton,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  borderWidth: BorderWidths.thin,
                },
              ]}
            >
              <Package2
                size={Sizes.iconSm}
                color={colors.label}
                strokeWidth={2.8}
              />
            </HapticPressable>

            <HapticPressable
              onPress={openCreateFlow}
              style={[
                styles.fabButton,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  borderWidth: BorderWidths.thin,
                },
              ]}
            >
              <Plus size={Sizes.iconSm} color={colors.label} strokeWidth={2.8} />
            </HapticPressable>
          </View>
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

  // ── Bottom action bar (centered like browse tab bar) ────────────────
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: ZIndex.overlay,
  },
  bottomBarContent: {
    alignItems: "center",
    paddingHorizontal: Layout.screenPadding,
  },
  fabRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  fabButton: {
    width: Sizes.actionButtonLg,
    height: Sizes.actionButtonLg,
    borderRadius: Sizes.actionButtonLg / 2,
    borderWidth: BorderWidths.medium,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.md,
  },

  // ── List ───────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
  },

  // ── Card (CarCardM-style vertical) ────────────────────────────────────
  card: {
    width: "100%",
    borderRadius: Radius["2xl"],
    borderCurve: "continuous",
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: Spacing.md,
  } as any,
  imageContainer: {
    marginHorizontal: Spacing.sm,
    marginTop: Spacing.sm,
    aspectRatio: AspectRatio.cardImage,
    borderRadius: Radius["2xl"],
    borderCurve: "continuous",
    overflow: "hidden",
  } as any,
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  statusOverlay: {
    position: "absolute",
    top: Spacing.sm,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Footer: price + expiry ────────────────────────────────────────────
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.xs,
  },

  // ── Expiry ─────────────────────────────────────────────────────────────
  expiryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },

  // ── Empty State ────────────────────────────────────────────────────────
  // (handled by shared EmptyState component)

  // ── Loading / Error ────────────────────────────────────────────────────
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["4xl"],
  },

  // ── List Footer ───────────────────────────────────────────────────────────────
  listFooter: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
});
