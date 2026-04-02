import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Copy } from 'lucide-react-native';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useListingDetail } from '@/hooks/use-listing-query';

function formatEnumValue(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ListingFeaturesSheetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [copied, setCopied] = useState(false);

  const { listing, isLoading } = useListingDetail({
    listingId: id,
    trackView: false,
  });

  const features = useMemo(() => listing?.listing.extras ?? [], [listing?.listing.extras]);

  const handleCopy = async () => {
    if (features.length === 0) return;
    const text = features.map((f) => formatEnumValue(f)).join(', ');
    await Clipboard.setStringAsync(text);
    if (process.env.EXPO_OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const body = useMemo(() => {
    if (isLoading) {
      return <ActivityIndicator size="small" color={colors.labelTertiary} />;
    }
    if (features.length === 0) {
      return <Text variant="subhead" tone="secondary">No features available.</Text>;
    }

    return (
      <View style={styles.badgesContainer}>
        {features.map((feature) => (
          <View
            key={feature}
            style={[
              styles.badge,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
          >
            <Text variant="subhead" tone="secondary">{formatEnumValue(feature)}</Text>
          </View>
        ))}
      </View>
    );
  }, [isLoading, colors.labelTertiary, colors.surfaceSecondary, colors.border, features]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: colors.sheet }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <SheetHeader
        title="Features"
        right={
          <HapticPressable
            onPress={handleCopy}
            hitSlop={Spacing.md}
            style={[styles.iconButton, { backgroundColor: colors.fill2 }]}
            disabled={features.length === 0}
          >
            {copied ? (
              <Ionicons name="checkmark" size={Sizes.iconSm} color={colors.primary} />
            ) : (
              <Copy size={Sizes.iconSm} color={colors.labelSecondary} />
            )}
          </HapticPressable>
        }
      />

      <View style={styles.body}>{body}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.lg,
  },
  header: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  iconButton: {
    width: Spacing['3xl'],
    height: Spacing['3xl'],
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    minHeight: Sizes.iconLg,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
});
