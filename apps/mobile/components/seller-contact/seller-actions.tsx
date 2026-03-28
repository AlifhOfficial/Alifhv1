/**
 * Seller Actions (CTA Row)
 * 
 * Chat, Book Viewing, and Phone actions.
 * Follows listings component patterns for consistency.
 */

import React, { memo, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { MessageCircle, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { ButtonText, Supporting } from '@/components/ui';
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
      {/* CTA Row */}
      <View style={styles.ctaRow}>
        {/* Primary CTA - Chat */}
        <HapticPressable
          onPress={handleChat}
          disabled={isChatLoading}
          style={[
            styles.button,
            { backgroundColor: colors.primary },
          ]}
        >
          {isChatLoading ? (
            <ActivityIndicator size="small" color={colors.primaryFg} />
          ) : (
            <>
              <MessageCircle size={Sizes.iconSm} color={colors.primaryFg} />
              <ButtonText size="body" style={{ color: colors.primaryFg }}>
                Chat
              </ButtonText>
            </>
          )}
        </HapticPressable>

        {/* Secondary CTA - Book Viewing (dealers only) */}
        {seller.isDealer && (
          <HapticPressable
            onPress={handleBookViewing}
            style={[
              styles.button,
              {
                backgroundColor: colors.surface2,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Calendar size={Sizes.iconSm} color={colors.text} />
            <ButtonText size="body" style={{ color: colors.text }}>
              Book
            </ButtonText>
          </HapticPressable>
        )}
      </View>

      {/* Phone Number Link */}
      {seller.phone && (
        <HapticPressable onPress={handleShowPhone} hitSlop={Layout.hitSlopSmall}>
          <Supporting size="body" style={{ textAlign: 'center' }}>
            Show phone number
          </Supporting>
        </HapticPressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: Sizes.actionButtonLg,
    borderRadius: Radius.lg,
  },
});
