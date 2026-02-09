/**
 * Seller Actions (CTA Row)
 * 
 * Chat, Book Viewing, and Phone actions.
 * Follows listings component patterns for consistency.
 */

import React, { memo } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { MessageCircle, Calendar } from 'lucide-react-native';

import { Spacing, Radius } from '@/constants/theme';
import { ButtonText } from '@/components/ui';
import type { SellerActionsProps } from './types';

const ICON_SIZE = 20;

export const SellerActions = memo(function SellerActions({
  seller,
  isChatLoading,
  onChat,
  onBookViewing,
  onShowPhone,
  colors,
}: SellerActionsProps) {
  return (
    <View style={{ gap: Spacing.md }}>
      {/* CTA Row - Chat and Book together */}
      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        {/* Primary CTA - Chat */}
        <Pressable
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
            paddingVertical: Spacing.lg,
            borderRadius: Radius.full,
            backgroundColor: colors.primary,
            opacity: pressed ? 0.8 : 1,
          })}
          onPress={onChat}
          disabled={isChatLoading}
        >
          {isChatLoading ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <>
              <MessageCircle size={ICON_SIZE} color={colors.primaryForeground} />
              <ButtonText size="medium" style={{ color: colors.primaryForeground }}>
                Chat
              </ButtonText>
            </>
          )}
        </Pressable>
        
        {/* Secondary CTA - Book (dealers only) */}
        {seller.isDealer && (
          <Pressable
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: Spacing.sm,
              paddingVertical: Spacing.lg,
              borderRadius: Radius.full,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: 'transparent',
              opacity: pressed ? 0.8 : 1,
            })}
            onPress={onBookViewing}
          >
            <Calendar size={ICON_SIZE} color={colors.icon} />
            <ButtonText size="medium">Book</ButtonText>
          </Pressable>
        )}
      </View>

      {/* Phone Number Link */}
      {seller.phone && (
        <Pressable onPress={onShowPhone} style={{ alignItems: 'center', paddingVertical: Spacing.sm }}>
          <ButtonText size="medium" tone="primary">
            Show phone number
          </ButtonText>
        </Pressable>
      )}
    </View>
  );
});
