/**
 * Chat Screen - Full conversation view
 * 
 * Lightweight: only fetches the specific conversation, not all conversations.
 * Conversation metadata can be passed via nav params to avoid fetch.
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatWindow } from '@/components/messages';
import { Colors, Spacing } from '@/constants/theme';
import { Supporting, ButtonText } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { useTabBar } from '@/context/tab-bar-context';
import { fetchConversation, markConversationAsRead, type Conversation } from '@/lib/messaging-api';

export default function ChatScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Get conversationId and optional conversation data from nav params
  const params = useLocalSearchParams<{ 
    conversationId: string;
    // Optional: conversation JSON passed from messages list to avoid fetch
    conversationData?: string;
  }>();
  const { conversationId, conversationData } = params;
  
  const { isAuthenticated, user } = useAuth();
  const { hideChrome, showChrome } = useTabBar();

  // Hide tab bar and header gradient when in chat
  useEffect(() => {
    hideChrome();
    return () => showChrome();
  }, [hideChrome, showChrome]);

  // State for fetched conversation (only used if not passed via params)
  const [conversation, setConversation] = useState<Conversation | null>(() => {
    // Parse conversation data from params if available
    if (conversationData) {
      try {
        return JSON.parse(conversationData);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!conversation);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const markedAsReadRef = useRef(false);

  // Fetch conversation only if not passed via params
  useEffect(() => {
    if (conversation || !conversationId || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setFetchError(null);

    fetchConversation(conversationId)
      .then((data) => {
        if (!cancelled) setConversation(data);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[Chat] Fetch failed:', err);
          setFetchError(err.message || 'Failed to load conversation');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [conversationId, isAuthenticated, conversation]);

  // Mark as read when entering the chat (once)
  useEffect(() => {
    if (
      conversation && 
      conversationId && 
      conversation.unreadCount > 0 && 
      !markedAsReadRef.current
    ) {
      markedAsReadRef.current = true;
      markConversationAsRead(conversationId).catch(() => {
        // Silent fail - mark as read is non-critical
      });
    }
  }, [conversation?.id, conversationId]);

  const handleBack = () => {
    router.back();
  };

  // No conversation ID
  if (!conversationId) {
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

  // Error state
  if (fetchError && !conversation) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <Supporting size="medium" tone="secondary" style={styles.errorText}>
            {fetchError}
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
      conversation={conversation ?? undefined}
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