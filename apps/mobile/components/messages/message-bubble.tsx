/**
 * Message Bubble - Mobile Native
 * Individual message display with sender/receiver styling
 * Chat-style rounded rectangles with directional tail corners
 */

import { Text } from '@/components/ui';
import React from 'react';
import { View, Image, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/theme-context';
import { Spacing, Radius, Sizes } from '@/constants/theme';
import { getAppThumbUrl } from '@/lib/config';
import { UserAvatar } from '@/components/ui/user-avatar';
import { LocationBubble } from './location-bubble';
import type { Message } from '@/lib/messaging-api';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  showSeen?: boolean;
  otherUserAvatar?: string | null;
  otherUserName?: string | null;
  listing?: { id: string; title: string; thumbnail: string | null };
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  showSeen = false,
  otherUserAvatar,
  otherUserName,
  listing,
}: MessageBubbleProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const { sender, text, mediaUrl, mediaType, mediaMetadata, isEdited, isSystemMessage } = message;

  // Check if optimistic message (sending state)
  const isOptimistic = message.id.startsWith('temp-');
  const isLongTextMessage = !!text && text.length > 90;

  // Extract location data if present
  const locationData = mediaType === 'location' && mediaMetadata ? {
    latitude: (mediaMetadata as { latitude?: number }).latitude,
    longitude: (mediaMetadata as { longitude?: number }).longitude,
    address: (mediaMetadata as { address?: string }).address,
    placeName: (mediaMetadata as { placeName?: string }).placeName,
  } : null;

  // System message (centered, muted)
  if (isSystemMessage) {
    return (
      <View style={styles.systemContainer}>
        <View
          style={[
            styles.systemBubble,
            { backgroundColor: colors.fill2 },
          ]}
        >
          <Text variant="footnote" tone="muted">{text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        Platform.OS === 'android' && isLongTextMessage ? styles.containerLongTextAndroid : null,
        isOwn ? styles.containerOwn : styles.containerOther,
      ]}
    >
      {/* Avatar - only for received messages */}
      {!isOwn &&
        (showAvatar ? (
          <UserAvatar
            src={otherUserAvatar ?? sender.avatarUrl}
            name={otherUserName ?? sender.name}
            size="xs"
          />
        ) : (
          <View style={styles.avatarPlaceholder} />
        ))}

      {/* Message Content */}
      <View
        style={[styles.content, isOwn ? styles.contentOwn : styles.contentOther]}
      >
        {/* Listing Preview (if any) - tappable to listing */}
        {listing && (
          <Pressable
            onPress={() => router.push({ pathname: '/listing/[id]', params: { id: listing.id } } as any)}
            style={[
              styles.listingPreview,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            {listing.thumbnail ? (
              <Image
                source={{ uri: getAppThumbUrl(listing.thumbnail)! }}
                style={styles.listingImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[styles.listingImage, { backgroundColor: colors.surface }]}
              />
            )}
            <View style={styles.listingInfo}>
              <Text variant="footnote" tone="secondary" numberOfLines={2}>
                {listing.title}
              </Text>
            </View>
          </Pressable>
        )}

        {/* Message Bubble */}
        <View style={styles.bubbleRow}>
          <View
            style={[
              styles.bubble,
              isOwn
                ? [
                    styles.bubbleOwn,
                    showAvatar ? styles.bubbleOwnTail : styles.bubbleOwnContinuation,
                    { backgroundColor: colors.primary },
                  ]
                : [
                    styles.bubbleOther,
                    showAvatar ? styles.bubbleOtherTail : styles.bubbleOtherContinuation,
                    {
                      backgroundColor: colors.surfaceSecondary,
                    },
                  ],
            ]}
          >
          {/* Media */}
          {mediaUrl && mediaType === 'image' && (
            <Image
              source={{ uri: mediaUrl }}
              style={styles.mediaImage}
              resizeMode="cover"
            />
          )}

          {/* Location */}
          {locationData?.latitude && locationData?.longitude && (
            <LocationBubble
              latitude={locationData.latitude}
              longitude={locationData.longitude}
              address={locationData.address}
              placeName={locationData.placeName}
              isOwn={isOwn}
            />
          )}

          {/* Text */}
          {text && (
            <Text
              variant="chatText"
              style={{ color: isOwn ? colors.primaryForeground : colors.label }}
            >
              {text}
            </Text>
          )}

          {/* Edited indicator */}
          {isEdited && (
            <Text
              variant="caption2"
              style={{ 
                color: isOwn ? colors.primaryForeground : colors.labelQuaternary,
                marginTop: Spacing.xs,
              }}
            >
              edited
            </Text>
          )}
        </View>
          
          {/* Sending dot - right of bubble for own messages */}
          {isOptimistic && isOwn && (
            <View style={[styles.sendingDot, { backgroundColor: colors.labelTertiary }]} />
          )}
        </View>

        {/* Seen indicator */}
        {showSeen && isOwn && (
          <View style={styles.seenContainer}>
            <Text variant="caption2" tone="muted">Seen</Text>
            <UserAvatar
              src={otherUserAvatar}
              name={otherUserName || 'User'}
              size="xxs"
            />
          </View>
        )}
      </View>
    </View>
  );
}

// Bubble corner radii
const BUBBLE_RADIUS = Radius.xl;
const BUBBLE_TAIL = Radius.sm;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: Platform.OS === 'android' ? Spacing.xs : Spacing.xs / 2,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'flex-end',
  },
  containerOwn: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },
  containerLongTextAndroid: {
    marginBottom: Spacing.sm,
  },
  avatarPlaceholder: {
    width: Sizes.iconXl,
  },
  content: {
    maxWidth: '75%',
  },
  contentOwn: {
    alignItems: 'flex-end',
  },
  contentOther: {
    alignItems: 'flex-start',
  },
  listingPreview: {
    borderRadius: BUBBLE_RADIUS,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
    width: '85%',
    borderWidth: StyleSheet.hairlineWidth,
  },
  listingImage: {
    width: '100%',
    aspectRatio: 16 / 10,
  },
  listingInfo: {
    padding: Spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sendingDot: {
    width: Spacing.xs,
    height: Spacing.xs,
    borderRadius: Radius.full,
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: Sizes.bubble,
  },
  // Own message bubble shapes
  bubbleOwn: {
    // Default - no tail
  },
  bubbleOwnTail: {
    borderTopLeftRadius: BUBBLE_RADIUS,
    borderTopRightRadius: BUBBLE_RADIUS,
    borderBottomLeftRadius: BUBBLE_RADIUS,
    borderBottomRightRadius: BUBBLE_TAIL,
  },
  bubbleOwnContinuation: {
    borderTopLeftRadius: BUBBLE_RADIUS,
    borderTopRightRadius: BUBBLE_RADIUS,
    borderBottomLeftRadius: BUBBLE_RADIUS,
    borderBottomRightRadius: BUBBLE_RADIUS,
  },
  // Other message bubble shapes
  bubbleOther: {
    // Default - no tail
  },
  bubbleOtherTail: {
    borderTopLeftRadius: BUBBLE_RADIUS,
    borderTopRightRadius: BUBBLE_RADIUS,
    borderBottomLeftRadius: BUBBLE_TAIL,
    borderBottomRightRadius: BUBBLE_RADIUS,
  },
  bubbleOtherContinuation: {
    borderTopLeftRadius: BUBBLE_RADIUS,
    borderTopRightRadius: BUBBLE_RADIUS,
    borderBottomLeftRadius: BUBBLE_RADIUS,
    borderBottomRightRadius: BUBBLE_RADIUS,
  },
  mediaImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
  },
  seenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs / 2,
  },
  systemContainer: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  systemBubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.lg,
  },
});
