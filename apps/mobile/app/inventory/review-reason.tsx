import { useLocalSearchParams } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SheetHeader, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getStringParam, parseAiModerationParam, type InventorySheetRouteParams } from '@/components/user-inventory-management/sub-operations/route-params';
import { getSheetBottomPadding } from '@/lib/sheet-layout';

function formatFlagLabel(flag: string | { code: string; severity?: string; message?: string } | null | undefined) {
  if (!flag) return '';

  if (typeof flag === 'object') {
    const text = flag.message || flag.code || '';
    return text.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
  }

  return flag.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function InventoryReviewReasonScreen() {
  const params = useLocalSearchParams() as InventorySheetRouteParams;
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const listingTitle = getStringParam(params.listingTitle) ?? 'Listing';
  const aiModeration = parseAiModerationParam(params.aiModeration);
  const hasReasoning = Boolean(aiModeration?.reasoning);
  const flags = aiModeration?.flags ?? [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: getSheetBottomPadding(insets.bottom) },
      ]}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <SheetHeader title="Under Review" />

      <View
        style={[
          styles.heroSection,
          {
            backgroundColor: colors.sheetSurface,
            borderColor: colors.sheetBorder,
          },
        ]}
      >
        <View style={styles.heroHeaderRow}>
          <View style={[styles.heroIconWrap, { backgroundColor: colors.warning + '1A' }]}>
            <AlertCircle size={Sizes.iconXs} color={colors.warning} />
          </View>
          <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }} numberOfLines={2}>
            {listingTitle}
          </Text>
        </View>
        <Text variant={SheetTypography.supporting} style={{ color: colors.sheetLabelMuted }}>
          Our system flagged this listing for an extra review before it goes live.
        </Text>
      </View>

      {hasReasoning || flags.length > 0 ? (
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.sheetSurface,
              borderColor: colors.sheetBorder,
            },
          ]}
        >
          <Text variant={SheetTypography.rowLabel} tone="secondary">Moderation Details</Text>
          {hasReasoning ? (
            <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabel }}>
              {aiModeration?.reasoning}
            </Text>
          ) : null}
          {flags.length > 0 ? (
            <>
              {hasReasoning ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
              <View style={styles.flagsWrap}>
                {flags.map((flag, index) => {
                  const label = formatFlagLabel(flag);
                  if (!label) {
                    return null;
                  }

                  return (
                    <View key={`${label}-${index}`} style={[styles.flag, { backgroundColor: colors.warning + '1A' }]}> 
                      <Text variant={SheetTypography.supportingEmphasized} style={{ color: colors.warning }}>
                        {label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : null}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
          <AlertCircle size={Sizes.iconXs} color={colors.warning} />
          <Text variant={SheetTypography.supporting} style={{ color: colors.sheetLabelMuted, flex: 1 }}>
            No specific moderation details are available yet.
          </Text>
        </View>
      )}

      <View style={styles.noteWrap}>
        <Text variant={SheetTypography.supporting} style={{ color: colors.sheetLabelMuted, textAlign: 'center' }}>
          Our team will review within 24 hours. This assessment is automated and followed by human review.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
    paddingTop: SheetChrome.contentPaddingTop,
    gap: Spacing.md,
  },
  heroSection: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderCurve: 'continuous',
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
    paddingVertical: SheetChrome.rowPaddingVertical,
    gap: Spacing.md,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroIconWrap: {
    width: Sizes.actionButtonSm,
    height: Sizes.actionButtonSm,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderCurve: 'continuous',
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
    paddingVertical: SheetChrome.rowPaddingVertical,
    gap: Spacing.md,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderCurve: 'continuous',
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
    paddingVertical: SheetChrome.rowPaddingVertical,
  },
  flagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  flag: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  noteWrap: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
});
