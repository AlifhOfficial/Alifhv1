/**
 * Security Section Component
 * Passkeys and security settings - matches Profile styling
 */

import React from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { ScanFace, Fingerprint, Key, Trash2, Loader2 } from 'lucide-react-native';

import { Supporting, Body, Label } from '@/components/ui';
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
          <Supporting size="medium" tone="muted">Passkeys</Supporting>
          <Body size="medium">Sign in with biometrics</Body>
        </View>
        <Pressable
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
        </Pressable>
      </View>

      {/* Passkeys List or Empty State */}
      {passkeys.length === 0 ? (
        <View style={styles.empty}>
          <Label size="medium" tone="muted" uppercase={false}>No passkeys registered</Label>
          <Supporting size="medium" tone="muted">Add a passkey for passwordless sign-in</Supporting>
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
                <Label size="medium" uppercase={false}>{pk.name}</Label>
                <Supporting size="medium" tone="muted">Added {pk.createdAt}</Supporting>
              </View>
              <Pressable
                onPress={() => onDeletePasskey?.(pk.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={16} color={colors.error} strokeWidth={1.5} />
              </Pressable>
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  list: {
    padding: 12,
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  deleteButton: {
    padding: 8,
  },
});
