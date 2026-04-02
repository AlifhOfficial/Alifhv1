import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Loader2, Trash2 } from 'lucide-react-native';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticPressable, SheetHeader, Text, useAlert } from '@/components/ui';
import { Colors, InputTypography, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { requestAccountDeletion } from '@/lib/profile-api';

export default function DeleteAccountScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { signOut } = useAuth();
  const [deleteText, setDeleteText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    return () => {
      setDeleteText('');
    };
  }, []);

  async function handleConfirm() {
    if (deleteText !== 'DELETE' || isDeleting) {
      return;
    }

    setIsDeleting(true);
    if (process.env.EXPO_OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    const result = await requestAccountDeletion();

    if (!result.success) {
      setIsDeleting(false);
      showAlert('Error', result.error || 'Failed to request account deletion');
      return;
    }

    router.replace('/settings');
    showAlert(
      'Account Deletion Requested',
      'Your account has been deactivated and will be permanently deleted after 6 months. We retain your data during this period to comply with UAE regulations.',
      [{
        text: 'OK',
        onPress: () => signOut(),
      }],
    );
  }

  const canConfirm = deleteText === 'DELETE' && !isDeleting;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <SheetHeader title="Delete Account" />

      <View style={[styles.heroCard, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
        <View style={[styles.heroIcon, { backgroundColor: colors.errorMuted }]}> 
          <Trash2 size={Sizes.iconMd} color={colors.error} />
        </View>
        <View style={styles.heroCopy}>
          <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>
            Permanent deletion request
          </Text>
          <Text variant={SheetTypography.supporting} style={{ color: colors.sheetLabelMuted }}>
            This starts a permanent account deletion request.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant={SheetTypography.supportingEmphasized} style={{ color: colors.sheetLabelMuted }}>
          WHAT HAPPENS
        </Text>
        <View style={[styles.infoCard, { backgroundColor: colors.sheetSurface }]}> 
          <View style={styles.infoRow}>
            <View style={[styles.bullet, { backgroundColor: colors.error }]} />
            <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabel, flex: 1 }}>
              Your account is deactivated immediately.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.bullet, { backgroundColor: colors.error }]} />
            <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabel, flex: 1 }}>
              Your data is retained for 6 months for UAE compliance and dispute handling.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.bullet, { backgroundColor: colors.error }]} />
            <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabel, flex: 1 }}>
              This action cannot be undone once the deletion request is submitted.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant={SheetTypography.supportingEmphasized} style={{ color: colors.sheetLabelMuted }}>
          CONFIRMATION
        </Text>
        <Text variant={SheetTypography.supporting} style={{ color: colors.sheetLabelMuted, marginTop: Spacing.sm, marginBottom: Spacing.md }}>
          Type DELETE to confirm you want to remove this account.
        </Text>
        <TextInput
          value={deleteText}
          onChangeText={setDeleteText}
          placeholder="DELETE"
          placeholderTextColor={colors.placeholder}
          style={[
            styles.input,
            InputTypography,
            {
              backgroundColor: colors.sheetSurface,
              borderColor: colors.sheetBorder,
              color: colors.sheetLabel,
            },
          ]}
          autoCapitalize="characters"
          editable={!isDeleting}
        />
      </View>

      <View style={styles.actions}>
        <HapticPressable
          onPress={() => router.back()}
          disabled={isDeleting}
          style={[styles.secondaryButton, { backgroundColor: colors.fill2 }]}
        >
          <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabel }}>
            Cancel
          </Text>
        </HapticPressable>
        <HapticPressable
          onPress={handleConfirm}
          disabled={!canConfirm}
          style={[styles.primaryButton, { backgroundColor: canConfirm ? colors.error : colors.errorMuted }]}
        >
          {isDeleting ? (
            <Loader2 size={Sizes.iconSm} color={colors.primaryForeground} strokeWidth={2} />
          ) : (
            <Text variant={SheetTypography.rowLabelSelected} style={{ color: canConfirm ? colors.primaryForeground : colors.error }}>
              Delete Account
            </Text>
          )}
        </HapticPressable>
      </View>

      <View style={{ height: insets.bottom + SheetChrome.bottomSafeAreaSpacing }} />
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
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  heroIcon: {
    width: Sizes.avatarLg,
    height: Sizes.avatarLg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  infoCard: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  bullet: {
    width: Spacing.xs + 2,
    height: Spacing.xs + 2,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SheetChrome.rowPaddingVertical,
    borderRadius: Radius.full,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SheetChrome.rowPaddingVertical,
    borderRadius: Radius.full,
  },
});