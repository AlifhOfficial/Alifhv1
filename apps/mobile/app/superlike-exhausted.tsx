import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Zap } from 'lucide-react-native';

import { HapticPressable, Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useListingFavorite } from '@/context/favorites-context';
import { Colors, Layout, Radius, Sizes, Spacing } from '@/constants/theme';

export default function SuperlikeExhaustedScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const favoriteState = useListingFavorite(listingId ?? '');

  const resetDate = favoriteState.quota?.periodEndDate
    ? new Date(favoriteState.quota.periodEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <View style={[styles.header, { borderBottomColor: colors.sheetBorder }]}> 
        <Text variant="caption1Emphasized" tone="muted" uppercase>Superlikes</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.centeredHeader}>
          <View style={[styles.iconContainer, { backgroundColor: colors.warningMuted }]}> 
            <Zap size={Sizes.iconXl} color={colors.warning} />
          </View>
          <Text variant="subheadEmphasized" style={{ marginTop: Spacing.md }}>No Superlikes Left</Text>
          <Text variant="subhead" style={{ textAlign: 'center', marginTop: Spacing.xs }} tone="secondary">
            You have used all your superlikes for this month.
            {resetDate ? ` They reset on ${resetDate}.` : ''}
          </Text>
        </View>

        <HapticPressable
          onPress={() => router.back()}
          style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: Spacing.lg }]}
        >
          <Text variant="body" style={{ color: colors.primaryForeground }}>Got it</Text>
        </HapticPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  centeredHeader: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  iconContainer: {
    width: Layout.hitTarget,
    height: Layout.hitTarget,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
});
