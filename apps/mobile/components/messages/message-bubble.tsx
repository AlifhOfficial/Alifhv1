/**
 * Message Bubble - Mobile Native
 * Individual message display with sender/receiver styling
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Body, Supporting, ButtonText } from '@/components/ui';
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
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const { sender, text, mediaUrl, mediaType, isEdited, isSystemMessage } = message;

  // Check if optimistic message (sending state)
  const isOptimistic = message.id.startsWith('temp-');

  // System message (centered, muted)
  if (isSystemMessage) {
    return (
      <View style={styles.systemContainer}>
        <View
          style={[
            styles.systemBubble,
            { backgroundColor: colors.fillSecondary },
          ]}
        >
          <Supporting size="small" tone="muted">{text}</Supporting>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
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
        {/* Listing Preview (if any) */}
        {listing && (
          <View
            style={[
              styles.listingPreview,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            {listing.thumbnail ? (
              <Image
                source={{ uri: listing.thumbnail }}
                style={styles.listingImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[styles.listingImage, { backgroundColor: colors.surface }]}
              />
            )}
            <View style={styles.listingInfo}>
              <ButtonText size="small" numberOfLines={2}>{listing.title}</ButtonText>
            </View>
          </View>
        )}

        {/* Message Bubble */}
        <View style={styles.bubbleRow}>
          <View
            style={[
              styles.bubble,
              isOwn
                ? [styles.bubbleOwn, { backgroundColor: colors.primary }]
                : [
                    styles.bubbleOther,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
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

          {/* Text */}
          {text && (
            <Body
              size="medium"
              style={{ color: isOwn ? colors.primaryForeground : colors.text }}
            >
              {text}
            </Body>
          )}

          {/* Edited indicator */}
          {isEdited && (
            <Supporting
              size="small"
              style={{ 
                color: isOwn ? 'rgba(255,255,255,0.7)' : colors.textTertiary,
                marginTop: 2,
              }}
            >
              (edited)
            </Supporting>
          )}
        </View>
          
          {/* Sending dot - right of bubble for own messages */}
          {isOptimistic && isOwn && (
            <View style={[styles.sendingDot, { backgroundColor: colors.textTertiary }]} />
          )}
        </View>

        {/* Seen indicator */}
        {showSeen && isOwn && (
          <View style={styles.seenContainer}>
            <Supporting size="small" tone="muted">Seen</Supporting>
            <UserAvatar
              src={otherUserAvatar}
              name={otherUserName || 'User'}
              size="xs"
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  containerOwn: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },
  avatarPlaceholder: {
    width: 28,
  },
  content: {
    maxWidth: '70%',
  },
  contentOwn: {
    alignItems: 'flex-end',
  },
  contentOther: {
    alignItems: 'flex-start',
  },
  listingPreview: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
    width: 180,
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
    width: 5,
    height: 5,
    borderRadius: Radius.full,
  },
  bubble: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    minHeight: 36,
  },
  bubbleOwn: {
    // Pill shape - no corner override
  },
  bubbleOther: {
    borderWidth: 0.5,
  },
  mediaImage: {
    width: 200,
    height: 150,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
  },
  seenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
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
