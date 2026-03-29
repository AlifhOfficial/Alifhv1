/**
 * Seller Actions (CTA Row)
 * 
 * Chat, Book Viewing, and Phone actions.
 * Follows listings component patterns for consistency.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { memo, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Calendar1, MessageCircle, Phone } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import type { SellerActionsProps } from './types';

export const SellerActions = memo(function SellerActions({
  seller,
  isChatLoading,
  onChat,
  onBookViewing,
  onShowPhone,
}: Omit<SellerActionsProps, 'colors'>) {
  const { colors } = useTheme();

  const handleChat = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChat();
  }, [onChat]);

  const handleBookViewing = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBookViewing();
  }, [onBookViewing]);

  const handleShowPhone = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShowPhone();
  }, [onShowPhone]);
  
  return (
    <View style={styles.container}>
      <HapticPressable
        onPress={handleChat}
        disabled={isChatLoading}
        style={[
          styles.button,
          styles.primaryButton,
          { backgroundColor: colors.primary, borderColor: colors.primary },
        ]}
      >
        {({ pressed }) =>
          isChatLoading ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <View style={[styles.buttonInner, { opacity: pressed ? 0.78 : 1 }]}>
              <MessageCircle size={Sizes.iconSm} color={colors.primaryForeground} strokeWidth={2} />
              <Text variant="bodyEmphasized" style={{ color: colors.primaryForeground }}>
                Chat
              </Text>
            </View>
          )
        }
      </HapticPressable>

      {(seller.isDealer || seller.phone) && (
        <View style={styles.supportingRow}>
          {seller.isDealer && (
            <HapticPressable
              onPress={handleBookViewing}
              style={[
                styles.supportingAction,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.outline },
              ]}
            >
              {({ pressed }) => (
                <View style={[styles.supportingInner, { opacity: pressed ? 0.72 : 1 }]}>
                  <Calendar1 size={Sizes.iconSm} color={colors.label} strokeWidth={2} />
                  <Text variant="subhead" style={{ color: colors.label }}>
                    Book
                  </Text>
                </View>
              )}
            </HapticPressable>
          )}

          {seller.phone && (
            <HapticPressable
              onPress={handleShowPhone}
              hitSlop={Layout.hitSlopSmall}
              style={[
                styles.supportingAction,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.outline },
              ]}
            >
              {({ pressed }) => (
                <View style={[styles.supportingInner, { opacity: pressed ? 0.72 : 1 }]}>
                  <Phone size={Sizes.iconSm} color={colors.label} strokeWidth={2} />
                  <Text variant="subhead" style={{ color: colors.label }}>
                    Phone
                  </Text>
                </View>
              )}
            </HapticPressable>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  button: {
    minHeight: Sizes.actionButtonLg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  primaryButton: {
    width: '100%',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  supportingRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  supportingAction: {
    flex: 1,
    minHeight: Sizes.actionButtonLg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  supportingInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
});
