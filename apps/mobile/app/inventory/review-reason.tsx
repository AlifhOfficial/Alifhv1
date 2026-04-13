import { useLocalSearchParams } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SheetHeader, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Spacing } from '@/constants/theme';
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
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <SheetHeader title="Under Review" />

      <View style={[styles.card, { backgroundColor: colors.sheetSurface }]}>
        <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }} numberOfLines={2}>
          {listingTitle}
        </Text>
        <Text variant={SheetTypography.supporting} style={{ color: colors.sheetLabelMuted }}>
          Our system flagged this listing for an extra review before it goes live.
        </Text>
      </View>

      {hasReasoning || flags.length > 0 ? (
        <View style={[styles.card, { backgroundColor: colors.sheetSurface }]}> 
          {hasReasoning ? (
            <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabel }}>
              {aiModeration?.reasoning}
            </Text>
          ) : null}
          {flags.length > 0 ? (
            <View style={styles.flagsWrap}>
              {flags.map((flag, index) => {
                const label = formatFlagLabel(flag);
                if (!label) {
                  return null;
                }

                return (
                  <View key={`${label}-${index}`} style={[styles.flag, { backgroundColor: colors.warningMuted }]}> 
                    <Text variant={SheetTypography.supportingEmphasized} style={{ color: colors.warning }}>
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: colors.sheetSurface }]}> 
          <AlertCircle size={18} color={colors.sheetLabelMuted} />
          <Text variant={SheetTypography.supporting} style={{ color: colors.sheetLabelMuted }}>
            No specific moderation details are available yet.
          </Text>
        </View>
      )}

      <View style={styles.noteWrap}>
        <Text variant={SheetTypography.supporting} style={{ color: colors.sheetLabelMuted, textAlign: 'center' }}>
          Our team will review within 24 hours. This assessment is automated and followed by human review.
        </Text>
      </View>

      <View style={{ height: getSheetBottomPadding(insets.bottom) }} />
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
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: SheetChrome.headerPaddingBottom,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: SheetChrome.headerMarginBottom,
    alignItems: 'center',
  },
  card: {
    borderRadius: Radius.xl,
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
    paddingVertical: SheetChrome.rowPaddingVertical,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    borderRadius: Radius.xl,
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
    paddingVertical: SheetChrome.rowPaddingVertical,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  flagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  flag: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  noteWrap: {
    paddingHorizontal: Spacing.lg,
  },
});
