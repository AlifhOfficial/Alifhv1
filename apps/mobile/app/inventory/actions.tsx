import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticPressable, SheetHeader, Text } from "@/components/ui";
import {
  Colors,
  Radius,
  SheetChrome,
  SheetTypography,
  Sizes,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { getAppThumbUrl } from "@/lib/config";
import {
  isLifecycleStatus,
  isModerationStatus,
  useInventoryActionMenu,
} from "@/components/user-inventory-management/sub-operations/action-config";
import {
  buildInventoryEditTriggerParams,
  getStringParam,
  parseBooleanParam,
  toRouteInputParams,
  type InventorySheetRouteParams,
} from "@/components/user-inventory-management/sub-operations/route-params";
import {
  formatListingStatus,
  getStatusColor,
} from "@/components/user-inventory-management/utilities/listing-helpers";
import { getSheetBottomPadding } from '@/lib/sheet-layout';

export default function InventoryActionsScreen() {
  const params = useLocalSearchParams() as InventorySheetRouteParams;
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const listingId = getStringParam(params.listingId) ?? "";
  const listingTitle = getStringParam(params.listingTitle) ?? "Listing";
  const listingThumbnail = getStringParam(params.listingThumbnail);
  const moderationStatus = getStringParam(params.moderationStatus);
  const lifecycleStatus = getStringParam(params.lifecycleStatus);
  const isArchived = parseBooleanParam(params.isArchived);
  const expiresAt = getStringParam(params.expiresAt);
  const activeTab = getStringParam(params.activeTab);

  const visibleActions = useInventoryActionMenu({
    moderationStatus,
    lifecycleStatus,
    isArchived,
    expiresAt,
  });
  const routeParams = toRouteInputParams(params);
  const hasValidStatuses =
    isModerationStatus(moderationStatus) && isLifecycleStatus(lifecycleStatus);

  const statusLabel = hasValidStatuses
    ? formatListingStatus(moderationStatus, lifecycleStatus)
    : "Listing";
  const statusColor = hasValidStatuses
    ? getStatusColor(moderationStatus, lifecycleStatus, colors)
    : colors.sheetLabelMuted;

  const handleEdit = useCallback(async () => {
    if (!listingId || pendingAction) return;

    setPendingAction("edit");

    try {
      router.dismissTo({
        pathname: "/inventory",
        params: buildInventoryEditTriggerParams({
          listingId,
          activeTab,
          isPublishedEdit: moderationStatus !== "draft",
        }),
      });
    } catch (error) {
      console.error("Failed to open edit listing flow:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPendingAction(null);
    }
  }, [activeTab, listingId, moderationStatus, pendingAction]);

  function handlePress(action: (typeof visibleActions)[number]["key"]) {
    if (pendingAction) return;

    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    switch (action) {
      case "edit":
        void handleEdit();
        return;
      case "view_stats":
        router.replace({ pathname: "/inventory/stats", params: routeParams });
        return;
      case "view_review_reason":
        router.replace({
          pathname: "/inventory/review-reason",
          params: routeParams,
        });
        return;
      case "visit_listing":
        router.dismiss();
        router.push(`/listing/${listingId}`);
        return;
      case "mark_sold":
        router.replace({
          pathname: "/inventory/mark-sold",
          params: routeParams,
        });
        return;
      case "extend":
        router.replace({ pathname: "/inventory/extend", params: routeParams });
        return;
      case "archive":
      case "unarchive":
        router.replace({ pathname: "/inventory/archive", params: routeParams });
        return;
      case "delete":
        router.replace({
          pathname: "/inventory/delete",
          params: { ...routeParams, hardDelete: "false" },
        });
        return;
      case "hard_delete":
        router.replace({
          pathname: "/inventory/delete",
          params: { ...routeParams, hardDelete: "true" },
        });
        return;
    }
  }

  return (
    <View style={styles.container}>
      <SheetHeader title="Manage Listing" />

      <View
        style={[
          styles.previewCard,
          {
            backgroundColor: colors.sheetSurface,
            borderColor: colors.sheetBorder,
          },
        ]}
      >
        <View style={[styles.thumbnail, { backgroundColor: colors.fill2 }]}>
          {listingThumbnail ? (
            <Image
              source={{ uri: getAppThumbUrl(listingThumbnail) ?? listingThumbnail }}
              style={styles.thumbnailImage}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <Ionicons
              name="image-outline"
              size={Sizes.iconSm}
              color={colors.sheetLabelMuted}
            />
          )}
        </View>
        <View style={styles.previewCopy}>
          <Text
            variant={SheetTypography.rowLabelSelected}
            numberOfLines={2}
            style={{ color: colors.sheetLabel }}
          >
            {listingTitle}
          </Text>
          <Text
            variant={SheetTypography.supportingEmphasized}
            style={{ color: statusColor }}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {visibleActions.map((action, index) => {
          const IconComponent = action.icon;
          const tint = action.color(colors);
          const isLast = index === visibleActions.length - 1;
          const destructive =
            action.key === "delete" || action.key === "hard_delete";

          return (
            <HapticPressable
              key={action.key}
              onPress={() => handlePress(action.key)}
              disabled={!!pendingAction}
              style={[
                styles.listItem,
                pendingAction && styles.listItemDisabled,
                {
                  borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                  borderBottomColor: colors.sheetBorder,
                },
              ]}
            >
              <View style={styles.actionLeft}>
                <IconComponent size={Sizes.iconMd} color={tint} />
                <Text
                  variant={
                    destructive
                      ? SheetTypography.rowLabelSelected
                      : SheetTypography.rowLabel
                  }
                  style={{
                    color: destructive ? colors.error : colors.sheetLabel,
                  }}
                >
                  {action.label}
                </Text>
              </View>
              {pendingAction === action.key ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={Sizes.iconSm}
                  color={colors.sheetLabelMuted}
                />
              )}
            </HapticPressable>
          );
        })}
      </View>

      <View
        style={{ height: getSheetBottomPadding(insets.bottom) }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
    paddingTop: SheetChrome.contentPaddingTop,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: SheetChrome.headerPaddingBottom,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: SheetChrome.headerMarginBottom,
    alignItems: "center",
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
    paddingVertical: SheetChrome.rowPaddingVertical,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  thumbnail: {
    width: Sizes.avatarSm + Spacing.lg,
    height: Sizes.avatarSm + Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  previewCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  list: {
    borderRadius: Radius.xl,
    overflow: "hidden",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SheetChrome.rowPaddingVertical,
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
  },
  listItemDisabled: {
    opacity: 0.7,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
});
