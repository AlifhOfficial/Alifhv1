/**
 * Chat Screen - Full conversation view
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatWindow, useConversations } from '@/components/messages';
import { Colors, Spacing } from '@/constants/theme';
import { Supporting, ButtonText } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { useTabBar } from '@/context/tab-bar-context';
import { fetchConversation } from '@/lib/messaging-api';

export default function ChatScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { isAuthenticated, user } = useAuth();
  const { hideChrome, showChrome } = useTabBar();

  // Hide tab bar and header gradient when in chat
  useEffect(() => {
    hideChrome();
    return () => showChrome();
  }, [hideChrome, showChrome]);

  const { conversations, isLoading: convListLoading, markAsRead } = useConversations({
    isAuthenticated,
    userId: user?.id,
    scope: 'personal',
  });

  // Try to find conversation in the loaded list first
  const cachedConversation = conversations.find((c) => c.id === conversationId);

  // For newly created conversations (0 messages), fetch directly from API
  const [directConversation, setDirectConversation] = useState<any>(null);
  const [isDirectLoading, setIsDirectLoading] = useState(false);

  useEffect(() => {
    if (!cachedConversation && !convListLoading && conversationId && isAuthenticated) {
      setIsDirectLoading(true);
      fetchConversation(conversationId)
        .then(setDirectConversation)
        .catch((err) => console.error('[Chat] Direct fetch failed:', err))
        .finally(() => setIsDirectLoading(false));
    }
  }, [cachedConversation, convListLoading, conversationId, isAuthenticated]);

  const conversation = cachedConversation || directConversation;
  const isLoading = convListLoading || isDirectLoading;

  // Mark as read when entering the chat
  useEffect(() => {
    if (conversation && conversationId && conversation.unreadCount > 0) {
      markAsRead(conversationId);
    }
  }, [conversation?.id, conversationId]);

  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  // Error / Not found
  if (!conversation || !conversationId) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <Supporting size="medium" tone="secondary" style={styles.errorText}>
            Conversation not found
          </Supporting>
          <ButtonText
            tone="primary"
            style={styles.backLink}
            onPress={handleBack}
          >
            ← Go Back
          </ButtonText>
        </View>
      </View>
    );
  }

  return (
    <ChatWindow
      conversationId={conversationId}
      userId={user?.id || ''}
      conversation={conversation}
      isAuthenticated={isAuthenticated}
      onBack={handleBack}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
    gap: Spacing.lg,
  },
  errorText: {
    textAlign: 'center',
  },
  backLink: {
  },
});