/**
 * Seller Actions (CTA Row)
 * 
 * Chat, Book Viewing, and Phone actions.
 * Follows listings component patterns for consistency.
 */

import React, { memo } from 'react';
import { View, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { MessageCircle, Calendar } from 'lucide-react-native';

import { Spacing, Radius } from '@/constants/theme';
import { ButtonText } from '@/components/ui';
import type { SellerActionsProps } from './types';

const ICON_SIZE = 22;

export const SellerActions = memo(function SellerActions({
  seller,
  isChatLoading,
  onChat,
  onBookViewing,
  onShowPhone,
  colors,
}: SellerActionsProps) {
  return (
    <View style={styles.container}>
      {/* CTA Row - Chat and Book together */}
      <View style={styles.ctaRow}>
        {/* Primary CTA - Chat */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={onChat}
          disabled={isChatLoading}
        >
          {isChatLoading ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <>
              <MessageCircle size={ICON_SIZE} color={colors.primaryForeground} />
              <ButtonText size="large" style={{ color: colors.primaryForeground }}>
                Chat with Seller
              </ButtonText>
            </>
          )}
        </Pressable>
        
        {/* Secondary CTA - Book (dealers only) */}
        {seller.isDealer && (
          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              { borderColor: colors.border, opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={onBookViewing}
          >
            <Calendar size={ICON_SIZE} color={colors.text} />
            <ButtonText size="large">Book Viewing</ButtonText>
          </Pressable>
        )}
      </View>

      {/* Phone Number Link */}
      {seller.phone && (
        <Pressable onPress={onShowPhone} style={styles.phoneLink} hitSlop={8}>
          <ButtonText size="medium" tone="primary">
            Show phone number
          </ButtonText>
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.full,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  phoneLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
