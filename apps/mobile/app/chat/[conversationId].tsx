/**
 * Chat Screen - Full conversation view
 * 
 * Uses React Query for data fetching with cache support.
 * Conversation data can be passed via nav params to avoid fetch.
 */

import { Text } from '@/components/ui';
import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { ChatWindow } from '@/components/messages';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { useConversation, useMarkAsRead } from '@/hooks/use-messaging-query';
import type { Conversation } from '@/lib/messaging-api';

export default function ChatScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  
  // Get conversationId and optional conversation data from nav params
  const params = useLocalSearchParams<{ 
    conversationId: string;
    // Optional: conversation JSON passed from messages list to avoid fetch
    conversationData?: string;
  }>();
  const { conversationId, conversationData } = params;
  
  const { isAuthenticated, user } = useAuth();
  const markedAsReadRef = useRef(false);

  // Parse initial conversation data from nav params (avoids fetch if available)
  const initialConversation = useMemo<Conversation | undefined>(() => {
    if (conversationData) {
      try {
        return JSON.parse(conversationData);
      } catch {
        return undefined;
      }
    }
    return undefined;
  }, [conversationData]);

  // React Query hook - uses cache + initialData from nav params
  const { conversation, isLoading, error } = useConversation({
    conversationId,
    initialData: initialConversation,
    enabled: isAuthenticated,
  });
  
  const { mutate: markAsRead } = useMarkAsRead();

  // Mark as read when entering the chat (once)
  useEffect(() => {
    if (
      conversation && 
      conversationId && 
      conversation.unreadCount > 0 && 
      !markedAsReadRef.current
    ) {
      markedAsReadRef.current = true;
      markAsRead(conversationId);
    }
  }, [conversation, conversationId, markAsRead]);

  const handleBack = () => {
    router.back();
  };

  const nativeHeaderOptions = Platform.OS === 'ios'
    ? {
        headerTransparent: false,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal' as const,
        headerBackTitle: '',
      }
    : {
        headerStyle: { backgroundColor: colors.background },
      };

  // No conversation ID
  if (!conversationId) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ ...nativeHeaderOptions, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.label, title: '' }} />
        <View style={styles.centered}>
          <Text variant="body" tone="secondary" style={styles.errorText}>
            Conversation not found
          </Text>
          <Text
            tone="primary"
            style={styles.backLink}
            onPress={handleBack}
           variant="body">
            ← Go Back
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && !conversation) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ ...nativeHeaderOptions, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.label, title: '' }} />
        <View style={styles.centered}>
          <Text variant="body" tone="secondary" style={styles.errorText}>
            {error.message}
          </Text>
          <Text
            tone="primary"
            style={styles.backLink}
            onPress={handleBack}
           variant="body">
            ← Go Back
          </Text>
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