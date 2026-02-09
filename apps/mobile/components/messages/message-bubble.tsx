/**
 * Message Bubble - Mobile Native
 * Individual message display with sender/receiver styling
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { UserAvatar } from '@/components/ui/user-avatar';
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

  // Check if optimistic message
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
          <Text style={[styles.systemText, { color: colors.textTertiary }]}>
            {text}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.containerOwn : styles.containerOther,
        isOptimistic && styles.optimistic,
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
              <Text
                style={[styles.listingTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {listing.title}
              </Text>
            </View>
          </View>
        )}

        {/* Message Bubble */}
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
            <Text
              style={[
                styles.messageText,
                { color: isOwn ? '#FFFFFF' : colors.text },
              ]}
            >
              {text}
            </Text>
          )}

          {/* Edited indicator */}
          {isEdited && (
            <Text
              style={[
                styles.editedText,
                { color: isOwn ? 'rgba(255,255,255,0.7)' : colors.textTertiary },
              ]}
            >
              (edited)
            </Text>
          )}
        </View>

        {/* Sending indicator for optimistic messages */}
        {isOptimistic && isOwn && (
          <Text style={[styles.sendingText, { color: colors.textTertiary }]}>
            Sending...
          </Text>
        )}

        {/* Seen indicator */}
        {showSeen && isOwn && (
          <View style={styles.seenContainer}>
            <Text style={[styles.seenText, { color: colors.textTertiary }]}>
              Seen
            </Text>
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
  optimistic: {
    opacity: 0.6,
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
  senderName: {
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
    marginBottom: 2,
    marginLeft: 12,
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
  listingTitle: {
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
    fontWeight: '600',
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius['2xl'],
    minHeight: 36,
  },
  bubbleOwn: {
    borderTopRightRadius: 6,
  },
  bubbleOther: {
    borderTopLeftRadius: 6,
    borderWidth: 0.5,
  },
  mediaImage: {
    width: 200,
    height: 150,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
  },
  messageText: {
    fontSize: Typography.bodySmall.fontSize,
    lineHeight: Typography.bodySmall.lineHeight,
  },
  editedText: {
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
    marginTop: 2,
  },
  sendingText: {
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
    marginTop: 2,
    marginHorizontal: Spacing.xs,
  },
  seenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  seenText: {
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
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
  systemText: {
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
    fontWeight: '500',
  },
});
