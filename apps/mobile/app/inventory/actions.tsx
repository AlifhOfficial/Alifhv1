import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticPressable, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import {
  isLifecycleStatus,
  isModerationStatus,
  useInventoryActionMenu,
} from '@/components/user-inventory-management/sub-operations/action-config';
import {
  buildInventoryEditTriggerParams,
  getStringParam,
  parseBooleanParam,
  toRouteInputParams,
  type InventorySheetRouteParams,
} from '@/components/user-inventory-management/sub-operations/route-params';
import { formatListingStatus, getStatusColor } from '@/components/user-inventory-management/utilities/listing-helpers';

export default function InventoryActionsScreen() {
  const params = useLocalSearchParams() as InventorySheetRouteParams;
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const listingId = getStringParam(params.listingId) ?? '';
  const listingTitle = getStringParam(params.listingTitle) ?? 'Listing';
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
  const hasValidStatuses = isModerationStatus(moderationStatus) && isLifecycleStatus(lifecycleStatus);

  const statusLabel = hasValidStatuses
    ? formatListingStatus(moderationStatus, lifecycleStatus)
    : 'Listing';
  const statusColor = hasValidStatuses
    ? getStatusColor(moderationStatus, lifecycleStatus, colors)
    : colors.sheetLabelMuted;

  function handlePress(action: (typeof visibleActions)[number]['key']) {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    switch (action) {
      case 'edit':
        router.replace({
          pathname: '/inventory',
          params: buildInventoryEditTriggerParams({
            listingId,
            activeTab,
            isPublishedEdit: moderationStatus !== 'draft',
          }),
        });
        return;
      case 'view_stats':
        router.replace({ pathname: '/inventory/stats', params: routeParams });
        return;
      case 'view_review_reason':
        router.replace({ pathname: '/inventory/review-reason', params: routeParams });
        return;
      case 'mark_sold':
        router.replace({ pathname: '/inventory/mark-sold', params: routeParams });
        return;
      case 'extend':
        router.replace({ pathname: '/inventory/extend', params: routeParams });
        return;
      case 'archive':
      case 'unarchive':
        router.replace({ pathname: '/inventory/archive', params: routeParams });
        return;
      case 'delete':
        router.replace({ pathname: '/inventory/delete', params: { ...routeParams, hardDelete: 'false' } });
        return;
      case 'hard_delete':
        router.replace({ pathname: '/inventory/delete', params: { ...routeParams, hardDelete: 'true' } });
        return;
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.sheetBorder }]}>
        <Text variant={SheetTypography.headerTitle} style={{ color: colors.sheetLabel }}>
          Manage Listing
        </Text>
      </View>

      <View style={[styles.previewCard, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
        <View style={[styles.thumbnail, { backgroundColor: colors.fill2 }]}> 
          {listingThumbnail ? (
            <Ionicons name="image" size={Sizes.iconSm} color={colors.sheetLabelMuted} />
          ) : (
            <Ionicons name="image-outline" size={Sizes.iconSm} color={colors.sheetLabelMuted} />
          )}
        </View>
        <View style={styles.previewCopy}>
          <Text variant={SheetTypography.rowLabelSelected} numberOfLines={2} style={{ color: colors.sheetLabel }}>
            {listingTitle}
          </Text>
          <Text variant={SheetTypography.supportingEmphasized} style={{ color: statusColor }}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {visibleActions.map((action, index) => {
          const IconComponent = action.icon;
          const tint = action.color(colors);
          const isLast = index === visibleActions.length - 1;
          const destructive = action.key === 'delete' || action.key === 'hard_delete';

          return (
            <HapticPressable
              key={action.key}
              onPress={() => handlePress(action.key)}
              style={[
                styles.listItem,
                {
                  borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                  borderBottomColor: colors.sheetBorder,
                },
              ]}
            >
              <View style={styles.actionLeft}>
                <IconComponent size={Sizes.iconMd} color={tint} />
                <Text
                  variant={destructive ? SheetTypography.rowLabelSelected : SheetTypography.rowLabel}
                  style={{ color: destructive ? colors.error : colors.sheetLabel }}
                >
                  {action.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={Sizes.iconSm} color={colors.sheetLabelMuted} />
            </HapticPressable>
          );
        })}
      </View>

      <View style={{ height: insets.bottom + SheetChrome.bottomSafeAreaSpacing }} />
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
    alignItems: 'center',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  list: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SheetChrome.rowPaddingVertical,
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
});