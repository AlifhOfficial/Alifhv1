/**
 * Security Section Component
 * Passkeys and security settings - matches Profile styling
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { ScanFace, Fingerprint, Key, Trash2, Loader2 } from 'lucide-react-native';

import { Supporting, Body } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';
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
          <Body size="small" tone="muted">Passkeys</Body>
          <Body size="medium">Sign in with biometrics</Body>
        </View>
        <HapticPressable
          onPress={onAddPasskey}
          disabled={addingPasskey}
          style={[styles.addButton, { backgroundColor: colors.surfaceSecondary }]}
        >
          {addingPasskey ? (
            <Loader2 size={22} color={colors.textSecondary} strokeWidth={2} />
          ) : Platform.OS === 'ios' ? (
            <ScanFace size={22} color={colors.text} strokeWidth={1.5} />
          ) : (
            <Fingerprint size={22} color={colors.text} strokeWidth={1.5} />
          )}
        </HapticPressable>
      </View>

      {/* Passkeys List or Empty State */}
      {passkeys.length === 0 ? (
        <View style={styles.empty}>
          <Body size="small" tone="muted">No passkeys registered</Body>
          <Supporting size="small" tone="muted">Add a passkey for passwordless sign-in</Supporting>
        </View>
      ) : (
        <View style={styles.list}>
          {passkeys.map((pk) => (
            <View
              key={pk.id}
              style={[styles.item, { backgroundColor: colors.surfaceSecondary }]}
            >
              <Key size={16} color={colors.textSecondary} strokeWidth={1.5} />
              <View style={styles.itemInfo}>
                <Body size="small">{pk.name}</Body>
                <Supporting size="small" tone="muted">Added {pk.createdAt}</Supporting>
              </View>
              <HapticPressable
                onPress={() => onDeletePasskey?.(pk.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={16} color={colors.error} strokeWidth={1.5} />
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
    paddingVertical: Spacing.lg - 2,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  info: {
    flex: 1,
    gap: Spacing.xs,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm - 2,
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
    gap: Spacing.sm + 2,
  },
  itemInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
});
