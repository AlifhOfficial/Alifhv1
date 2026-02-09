/**
 * Seller Actions (CTA Row)
 * 
 * Chat, Book Viewing, and Phone actions.
 */

import React, { memo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { MessageCircle, Calendar } from 'lucide-react-native';

import type { SellerActionsProps } from './types';
import { styles } from './styles';

export const SellerActions = memo(function SellerActions({
  seller,
  isChatLoading,
  onChat,
  onBookViewing,
  onShowPhone,
  colors,
}: SellerActionsProps) {
  return (
    <>
      {/* CTA Row - Chat and Book together */}
      <View style={styles.ctaRow}>
        <Pressable
          style={[
            styles.primaryCta, 
            { backgroundColor: colors.primary, flex: seller.isDealer ? 1 : undefined }
          ]}
          onPress={onChat}
          disabled={isChatLoading}
        >
          {isChatLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <MessageCircle size={20} color="#FFF" strokeWidth={2} />
              <Text style={styles.primaryCtaText}>Chat</Text>
            </>
          )}
        </Pressable>
        
        {seller.isDealer && (
          <Pressable
            style={[styles.secondaryCta, { borderColor: colors.border }]}
            onPress={onBookViewing}
          >
            <Calendar size={20} color={colors.text} strokeWidth={2} />
            <Text style={[styles.secondaryCtaText, { color: colors.text }]}>Book</Text>
          </Pressable>
        )}
      </View>

      {/* Phone Number Link */}
      {seller.phone && (
        <Pressable onPress={onShowPhone}>
          <Text style={[styles.phoneText, { color: colors.primary }]}>Show phone number</Text>
        </Pressable>
      )}
    </>
  );
});
