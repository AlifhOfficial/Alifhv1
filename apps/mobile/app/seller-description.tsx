import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Copy } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { Colors, Radius, SheetChrome, Sizes, Spacing } from '@/constants/theme';
import { getSheetBottomPadding } from '@/lib/sheet-layout';

export default function SellerDescriptionScreen() {
  const { description, sellerName } = useLocalSearchParams<{ description?: string; sellerName?: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);

  const safeDescription = useMemo(() => {
    if (!description) return '';
    return Array.isArray(description) ? description[0] : description;
  }, [description]);

  const safeSellerName = useMemo(() => {
    if (!sellerName) return 'Seller';
    return Array.isArray(sellerName) ? sellerName[0] : sellerName;
  }, [sellerName]);

  const handleCopy = async () => {
    if (!safeDescription) return;
    await Clipboard.setStringAsync(safeDescription);
    if (process.env.EXPO_OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: colors.sheet }]}
      contentContainerStyle={[styles.content, { paddingBottom: getSheetBottomPadding(insets.bottom) }]}
      showsVerticalScrollIndicator={false}
    >
      <SheetHeader
        title={`About ${safeSellerName}`}
        right={
          <HapticPressable
            onPress={handleCopy}
            hitSlop={Spacing.md}
            style={[styles.iconButton, { backgroundColor: colors.fill2 }]}
            disabled={!safeDescription}
          >
            {copied ? (
              <Ionicons name="checkmark" size={Sizes.iconSm} color={colors.primary} />
            ) : (
              <Copy size={Sizes.iconSm} color={colors.labelSecondary} />
            )}
          </HapticPressable>
        }
      />

      <View style={styles.body}>
        {safeDescription ? (
          <Text variant="subhead" tone="secondary" selectable>{safeDescription}</Text>
        ) : (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={colors.labelTertiary} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SheetChrome.contentPaddingTop,
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
  loadingState: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
});
