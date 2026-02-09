/**
 * Security Section Component
 * Passkeys and security settings - matches Profile styling
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { ScanFace, Fingerprint, Key, Trash2, Loader2 } from 'lucide-react-native';

import { Typography } from '@/constants/theme';
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
          <Text style={[styles.label, { color: colors.textTertiary }]}>Passkeys</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            Sign in with biometrics
          </Text>
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
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
            No passkeys registered
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            Add a passkey for passwordless sign-in
          </Text>
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
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {pk.name}
                </Text>
                <Text style={[styles.itemDate, { color: colors.textTertiary }]}>
                  Added {pk.createdAt}
                </Text>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as any,
  },
  value: {
    fontSize: Typography.bodySmall.fontSize,
    lineHeight: Typography.bodySmall.lineHeight,
    fontFamily: 'Inter_400Regular',
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
  },
  emptyText: {
    fontSize: Typography.labelSmall.fontSize,
    lineHeight: Typography.labelSmall.lineHeight,
    fontFamily: 'Inter_500Medium',
  },
  emptySubtext: {
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
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
  },
  itemName: {
    fontSize: Typography.labelSmall.fontSize,
    lineHeight: Typography.labelSmall.lineHeight,
    fontFamily: 'Inter_500Medium',
  },
  itemDate: {
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
});
