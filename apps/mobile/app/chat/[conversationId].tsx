/**
 * Chat Screen - Full conversation view
 * 
 * Uses direct client-side API fetching.
 * Conversation data can be passed via nav params for immediate render.
 */

import { EmptyState } from '@/components/ui';
import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { ChatWindow } from '@/components/messages';
import { MobileHeader, getMobileHeaderContentInset } from '@/components/layout';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { getAvatarUrl } from '@/lib/config';
import { fetchConversation, type Conversation } from '@/lib/messaging-api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircleOff, AlertCircle, ArrowLeft } from 'lucide-react-native';

export default function ChatScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerInset = getMobileHeaderContentInset(insets.top);
  
  // Get conversationId and optional conversation data from nav params
  const params = useLocalSearchParams<{ 
    conversationId: string;
    // Optional: conversation JSON passed from messages list to avoid fetch
    conversationData?: string;
    locationRefresh?: string;
  }>();
  const { conversationId, conversationData, locationRefresh } = params;
  
  const { isAuthenticated, user } = useAuth();

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

  const [conversation, setConversation] = useState<Conversation | undefined>(initialConversation);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setConversation(initialConversation);
    setError(null);

    if (!isAuthenticated || !user?.id || !conversationId) {
      return;
    }

    if (initialConversation) {
      return;
    }

    let cancelled = false;

    const loadConversation = async () => {
      try {
        const conv = await fetchConversation(conversationId);
        if (cancelled) return;

        setConversation({
          ...conv,
          otherParticipant: conv.otherParticipant
            ? {
                ...conv.otherParticipant,
                avatarUrl: getAvatarUrl(conv.otherParticipant.avatarUrl),
              }
            : null,
          listing: conv.listing
            ? {
                ...conv.listing,
                thumbnail: getAvatarUrl(conv.listing.thumbnail),
              }
            : null,
        });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error('Failed to load conversation'));
      }
    };

    void loadConversation();

    return () => {
      cancelled = true;
    };
  }, [conversationId, initialConversation, isAuthenticated, user?.id]);

  const handleBack = () => {
    router.back();
  };

  const nativeHeaderOptions = {
    headerShown: false,
  };

  // No conversation ID
  if (!conversationId) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ ...nativeHeaderOptions, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.label, title: '' }} />
        <MobileHeader title="Chat" showBackButton onBackPress={handleBack} />
        <View style={[styles.centered, { paddingTop: headerInset }]}>
          <EmptyState
            icon={MessageCircleOff}
            title="Conversation not found."
            subtitle="This conversation doesn't exist or may have been deleted."
            action={{ label: 'Go Back', onPress: handleBack, icon: ArrowLeft }}
          />
        </View>
      </View>
    );
  }

  // Error state
  if (error && !conversation) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ ...nativeHeaderOptions, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.label, title: '' }} />
        <MobileHeader title="Chat" showBackButton onBackPress={handleBack} />
        <View style={[styles.centered, { paddingTop: headerInset }]}>
          <EmptyState
            icon={AlertCircle}
            title="Something went wrong."
            subtitle="We couldn't load this conversation. Please try again."
            action={{ label: 'Go Back', onPress: handleBack, icon: ArrowLeft }}
          />
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
      locationRefreshToken={locationRefresh}
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
