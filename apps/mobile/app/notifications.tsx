/**
 * Notifications Screen
 * Full feed of in-app notifications with pull-to-refresh & infinite scroll
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';

import { NotificationsHeader, NotificationItem } from '@/components/notifications';
import { Colors, Layout, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { Body, Heading, Skeleton, SkeletonCircle } from '@/components/ui';
import { SpinLoader } from '@/components/ui/loaders/spinners';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationById,
  deleteAllNotificationsApi,
  type AppNotification,
} from '@/lib/notifications-api';

export default function NotificationsScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // ── Fetch notifications ── 
  const loadNotifications = useCallback(async (cursor?: string) => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await fetchNotifications({ limit: 20, cursor });

      if (cursor) {
        // Append for pagination
        setNotifications(prev => [...prev, ...data.notifications]);
      } else {
        // Fresh load
        setNotifications(data.notifications);
      }

      setUnreadCount(data.unreadCount);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('[Notifications] Failed to load:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsFetchingMore(false);
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadNotifications();
  }, [loadNotifications]);

  // Infinite scroll
  const handleLoadMore = useCallback(() => {
    if (!hasMore || isFetchingMore || !nextCursor) return;
    setIsFetchingMore(true);
    loadNotifications(nextCursor);
  }, [hasMore, isFetchingMore, nextCursor, loadNotifications]);

  // ── Actions ── 
  const handleNotificationPress = useCallback(async (item: AppNotification) => {
    // Mark as read if unread
    if (!item.isRead) {
      try {
        const newUnread = await markNotificationRead(item.id);
        setUnreadCount(newUnread);
        setNotifications(prev =>
          prev.map(n => n.id === item.id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
        );
      } catch {
        // ignore
      }
    }

    // Navigate based on action
    const data = item.actionData;
    if (data?.action === 'open_chat' && data?.conversationId) {
      router.push(`/chat/${data.conversationId}` as any);
    } else if (data?.action === 'open_listing' && data?.listingId) {
      router.push(`/listing/${data.listingId}` as any);
    }
  }, [router]);

  const handleLongPress = useCallback((item: AppNotification) => {
    Alert.alert(
      'Notification',
      undefined,
      [
        {
          text: item.isRead ? 'Already Read' : 'Mark as Read',
          onPress: async () => {
            if (!item.isRead) {
              const newUnread = await markNotificationRead(item.id);
              setUnreadCount(newUnread);
              setNotifications(prev =>
                prev.map(n => n.id === item.id ? { ...n, isRead: true } : n)
              );
            }
          },
          style: item.isRead ? 'cancel' : 'default',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteNotificationById(item.id);
            setNotifications(prev => prev.filter(n => n.id !== item.id));
            if (!item.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      const newUnread = await markAllNotificationsRead();
      setUnreadCount(newUnread);
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('[Notifications] Failed to mark all read:', error);
    }
  }, []);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllNotificationsApi();
              setNotifications([]);
              setUnreadCount(0);
            } catch (error) {
              console.error('[Notifications] Failed to clear all:', error);
            }
          },
        },
      ]
    );
  }, []);

  // ── Render ── 
  const renderItem = useCallback(({ item }: { item: AppNotification }) => (
    <NotificationItem
      notification={item}
      onPress={handleNotificationPress}
      onLongPress={handleLongPress}
    />
  ), [handleNotificationPress, handleLongPress]);

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
          <Bell size={32} color={colors.textMuted} strokeWidth={1.5} />
        </View>
        <Heading size="small" style={{ marginTop: 16 }}>
          No notifications yet
        </Heading>
        <Body size="medium" tone="secondary" style={{ marginTop: 4, textAlign: 'center' }}>
          When you get messages, listing updates, or other activity, they'll show up here.
        </Body>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <View style={styles.footer}>
        <SpinLoader size="sm" />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <NotificationsHeader
        unreadCount={unreadCount}
        onMarkAllRead={handleMarkAllRead}
        onClearAll={handleClearAll}
      />

      {isLoading ? (
        <View style={styles.skeletonList}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={styles.skeletonRow}>
              <SkeletonCircle size={40} />
              <View style={styles.skeletonRowContent}>
                <View style={styles.skeletonRowTop}>
                  <Skeleton width={140} height={14} />
                  <Skeleton width={28} height={12} />
                </View>
                <Skeleton width={220} height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ 
            paddingBottom: insets.bottom + Layout.tabBarHeight,
            flexGrow: 1,
          }}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeletonList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.xl,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  skeletonRowContent: {
    flex: 1,
    gap: 6,
  },
  skeletonRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
