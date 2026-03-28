/**
 * Security Section Component
 * Passkeys and security settings - matches Profile styling
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { ScanFace, Fingerprint, Key, Trash2, Loader2 } from 'lucide-react-native';

import { Supporting, Body } from '@/components/ui';
import { Layout, Sizes, Spacing, Radius } from '@/constants/theme';
import { Section } from './Section';
import type { ThemeColors, Passkey } from './types';

interface SecuritySectionProps {
  passkeys: Passkey[];
  addingPasskey: boolean;
  colors: ThemeColors;
  onAddPasskey: () => void;
  onDeletePasskey?: (id: string) => void;
  delay?: number;
}

export function SecuritySection({
  passkeys,
  addingPasskey,
  colors,
  onAddPasskey,
  onDeletePasskey,
  delay = 200,
}: SecuritySectionProps) {
  return (
    <Section title="Security" colors={colors} delay={delay}>
      {/* Header with Add button */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.info}>
          <Body size="bodySm" tone="muted">Passkeys</Body>
          <Body size="body">Sign in with biometrics</Body>
        </View>
        <HapticPressable
          onPress={onAddPasskey}
          disabled={addingPasskey}
          style={[styles.addButton, { backgroundColor: colors.surfaceSecondary }]}
        >
          {addingPasskey ? (
            <Loader2 size={Sizes.iconMd} color={colors.labelSecondary} strokeWidth={2} />
          ) : Platform.OS === 'ios' ? (
            <ScanFace size={Sizes.iconMd} color={colors.label} strokeWidth={1.5} />
          ) : (
            <Fingerprint size={Sizes.iconMd} color={colors.label} strokeWidth={1.5} />
          )}
        </HapticPressable>
      </View>

      {/* Passkeys List or Empty State */}
      {passkeys.length === 0 ? (
        <View style={styles.empty}>
          <Body size="bodySm" tone="muted">No passkeys registered</Body>
          <Supporting size="bodySm" tone="muted">Add a passkey for passwordless sign-in</Supporting>
        </View>
      ) : (
        <View style={styles.list}>
          {passkeys.map((pk) => (
            <View
              key={pk.id}
              style={[styles.item, { backgroundColor: colors.surfaceSecondary }]}
            >
              <Key size={Sizes.iconXs} color={colors.labelSecondary} strokeWidth={1.5} />
              <View style={styles.itemInfo}>
                <Body size="bodySm">{pk.name || 'Passkey'}</Body>
                <Supporting size="bodySm" tone="muted">Added {pk.createdAt}</Supporting>
              </View>
              <HapticPressable
                onPress={() => onDeletePasskey?.(pk.id)}
                hitSlop={Layout.hitSlopSmall}
                style={styles.deleteButton}
              >
                <Trash2 size={Sizes.iconXs} color={colors.error} strokeWidth={1.5} />
              </HapticPressable>
            </View>
          ))}
        </View>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  info: {
    flex: 1,
    gap: Spacing.xs,
  },
  addButton: {
    width: Sizes.actionButtonSm,
    height: Sizes.actionButtonSm,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  list: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  itemInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
});
