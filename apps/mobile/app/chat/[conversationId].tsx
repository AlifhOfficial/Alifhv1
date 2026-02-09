/**
 * Chat Screen - Full conversation view
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatWindow, useConversations } from '@/components/messages';
import { Colors, Spacing } from '@/constants/theme';
import { Supporting, ButtonText } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { useTabBar } from '@/context/tab-bar-context';

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

  const { conversations, isLoading } = useConversations({
    isAuthenticated,
    scope: 'personal',
  });

  const conversation = conversations.find((c) => c.id === conversationId);

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