/**
 * Notification Item Component
 * Single notification row in the notification feed
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { HapticPressable } from '@/components/ui';
import { Body } from '@/components/ui/text';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius } from '@/constants/theme';
import {
  MessageCircle,
  CheckCircle,
  XCircle,
  Eye,
  Heart,
  HelpCircle,
  TrendingDown,
  Calendar,
  CalendarCheck,
  Bell,
  Tag,
  Megaphone,
} from 'lucide-react-native';
import type { AppNotification } from '@/lib/notifications-api';

// ============================================================================
// HELPERS
// ============================================================================

function getNotificationIcon(type: AppNotification['type']) {
  switch (type) {
    case 'new_message': return MessageCircle;
    case 'listing_approved': return CheckCircle;
    case 'listing_rejected': return XCircle;
    case 'listing_viewed': return Eye;
    case 'listing_saved': return Heart;
    case 'new_enquiry': return HelpCircle;
    case 'price_drop': return TrendingDown;
    case 'booking_request': return Calendar;
    case 'booking_confirmed': return CalendarCheck;
    case 'booking_reminder': return Bell;
    case 'promotion': return Megaphone;
    case 'system': return Bell;
    default: return Bell;
  }
}

function getNotificationIconColor(type: AppNotification['type'], colors: typeof Colors.light) {
  switch (type) {
    case 'new_message': return colors.primary;
    case 'listing_approved': return colors.success;
    case 'listing_rejected': return colors.error;
    case 'listing_saved': return colors.favorite;
    case 'price_drop': return colors.warning;
    case 'booking_confirmed': return colors.success;
    default: return colors.icon;
  }
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay < 7) return `${diffDay}d`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w`;
  return `${Math.floor(diffDay / 30)}mo`;
}

// ============================================================================
// COMPONENT
// ============================================================================

interface NotificationItemProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
  onLongPress?: (notification: AppNotification) => void;
}

export function NotificationItem({ notification, onPress, onLongPress }: NotificationItemProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const Icon = getNotificationIcon(notification.type);
  const iconColor = getNotificationIconColor(notification.type, colors);
  const avatarSrc = notification.imageUrl || notification.actorAvatarUrl;
  const isRead = notification.isRead;

  return (
    <HapticPressable
      onPress={() => onPress(notification)}
      onLongPress={() => onLongPress?.(notification)}
      style={styles.container}
    >
      {({ pressed }) => (
        <View style={[styles.inner, { opacity: pressed ? 0.6 : isRead ? 0.55 : 1 }]}>
          {/* Avatar or Icon */}
          <View style={[styles.avatar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {avatarSrc ? (
              <Image
                source={{ uri: avatarSrc }}
                style={styles.avatarImage}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
                <Icon size={20} color={iconColor} strokeWidth={2} />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Body
                size="small"
                style={{ color: colors.text, flex: 1, fontFamily: isRead ? 'Inter_400Regular' : 'Inter_600SemiBold' }}
                numberOfLines={1}
              >
                {notification.title}
              </Body>
              <Body size="small" tone="muted" style={styles.time}>
                {formatTimeAgo(notification.createdAt)}
              </Body>
            </View>
            <Body
              size="small"
              tone="secondary"
              numberOfLines={2}
              style={styles.body}
            >
              {notification.body}
            </Body>
          </View>
        </View>
      )}
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  body: {
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
  },
});
