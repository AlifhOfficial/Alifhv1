/**
 * Saved Screen - Favorites & Superlikes (Stack Screen with swipe back)
 * Native-feeling, modular saved screen connected to API
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { LogoPulse } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import {
  SavedHeader,
  SavedList,
  SavedNotAuthenticatedView,
} from '@/components/saved';
import { useSaved } from '@/hooks/use-saved';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SavedScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { isAuthenticated, openAuthFlow } = useAuth();
  const insets = useSafeAreaInsets();

  // Saved data from hook (pass isAuthenticated like profile does)
  const {
    favorites,
    superlikes,
    quota,
    activeTab,
    isLoading,
    error,
    setActiveTab,
    refresh,
  } = useSaved({ isAuthenticated });

  // Get current listings based on active tab
  const currentListings = activeTab === 'favorites' ? favorites : superlikes;

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <SavedNotAuthenticatedView
        colors={colors}
        topInset={insets.top}
        onSignIn={openAuthFlow}
      />
    );
  }

  // Loading state
  if (isLoading && currentListings.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SavedHeader
          colors={colors}
          topInset={insets.top}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          favoritesCount={favorites.length}
          superlikesCount={superlikes.length}
        />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <LogoPulse size={56} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading saved listings...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && currentListings.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SavedHeader
          colors={colors}
          topInset={insets.top}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          favoritesCount={favorites.length}
          superlikesCount={superlikes.length}
        />
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <Text
            style={[styles.retryText, { color: colors.primary }]}
            onPress={refresh}
          >
            Tap to retry
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <SavedHeader
        colors={colors}
        topInset={insets.top}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        favoritesCount={favorites.length}
        superlikesCount={superlikes.length}
      />

      {/* List */}
      <SavedList
        colors={colors}
        listings={currentListings}
        activeTab={activeTab}
        isRefreshing={isLoading}
        onRefresh={refresh}
        quota={quota}
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  retryText: {
    ...Typography.button,
  },
});
