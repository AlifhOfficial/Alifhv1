import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Copy } from 'lucide-react-native';

import { HapticPressable, Text } from '@/components/ui';
import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useListingDetail } from '@/hooks/use-listing-query';

export default function ListingDescriptionSheetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [copied, setCopied] = useState(false);

  const { listing, isLoading } = useListingDetail({
    listingId: id,
    trackView: false,
  });

  const description = listing?.listing.description ?? '';

  const handleCopy = async () => {
    if (!description) return;
    await Clipboard.setStringAsync(description);
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
    return (
      <Text variant="subhead" tone="secondary" selectable>
        {description || 'No description available.'}
      </Text>
    );
  }, [isLoading, colors.labelTertiary, description]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: colors.sheet }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { borderBottomColor: colors.sheetBorder }]}>
        <HapticPressable onPress={() => router.back()} hitSlop={Spacing.md} style={styles.headerAction}>
          <Text variant="subhead" tone="muted">Close</Text>
        </HapticPressable>

        <Text variant="caption1Emphasized" tone="muted" uppercase>Description</Text>

        <HapticPressable
          onPress={handleCopy}
          hitSlop={Spacing.md}
          style={[styles.iconButton, { backgroundColor: colors.fill2 }]}
          disabled={!description}
        >
          {copied ? (
            <Ionicons name="checkmark" size={Sizes.iconSm} color={colors.primary} />
          ) : (
            <Copy size={Sizes.iconSm} color={colors.labelSecondary} />
          )}
        </HapticPressable>
      </View>

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
});
