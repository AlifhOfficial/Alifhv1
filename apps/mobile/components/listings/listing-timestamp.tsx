/**
 * Listing Timestamp - Posted/Updated time display
 * 
 * Clean, minimal timestamp following "Less is More" principle.
 * Shows relative time (e.g., "2h ago") with optional update indicator.
 */

import React, { memo, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Clock } from 'lucide-react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// TYPES
// ============================================================================

interface ListingTimestampProps {
  /** When the listing was created */
  createdAt: Date | string;
  /** When the listing was first published */
  publishedAt?: Date | string | null;
  /** Original publish date (for re-listed items) */
  originalPublishedAt?: Date | string | null;
  /** When the listing content was last edited by the user */
  lastEditedAt?: Date | string | null;
  /** For BLK listings styling */
  isBlk?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function toDate(date: Date | string): Date {
  return date instanceof Date ? date : new Date(date);
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  
  // For older dates, show formatted date
  return date.toLocaleDateString('en-AE', { 
    day: 'numeric',
    month: 'short', 
    year: 'numeric',
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ListingTimestamp = memo(function ListingTimestamp({
  createdAt,
  publishedAt,
  originalPublishedAt,
  lastEditedAt,
  isBlk = false,
}: ListingTimestampProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const textColor = isBlk ? colors.blkText : colors.text;
  const secondaryTextColor = isBlk ? colors.blkTextSecondary : colors.textSecondary;

  // Compute display values
  const { postedTimeAgo, wasUpdated, updatedTimeAgo } = useMemo(() => {
    // Use originalPublishedAt for display (anti-abuse: shows true first listing date)
    // Fall back to publishedAt, then createdAt
    const postedDate = toDate(originalPublishedAt || publishedAt || createdAt);
    
    // Only show "updated" if lastEditedAt is explicitly set
    // Don't use updatedAt - it auto-updates on any DB row change
    const editedDateObj = lastEditedAt ? toDate(lastEditedAt) : null;
    
    // Only show "updated" if edit was at least 1 hour after posting
    // (prevents showing "updated" for quick post-publish corrections)
    const wasEdited = editedDateObj && 
      editedDateObj.getTime() > postedDate.getTime() + (60 * 60 * 1000);

    return {
      postedTimeAgo: formatTimeAgo(postedDate),
      wasUpdated: wasEdited,
      updatedTimeAgo: wasEdited ? formatTimeAgo(editedDateObj) : null,
    };
  }, [createdAt, publishedAt, originalPublishedAt, lastEditedAt]);

  return (
    <View style={styles.container}>
      <Clock size={18} color={secondaryTextColor} />
      <View style={styles.textContainer}>
        <Text style={[styles.postedText, { color: textColor }]}>
          {postedTimeAgo}
        </Text>
        {wasUpdated && updatedTimeAgo && (
          <Text style={[styles.updatedText, { color: secondaryTextColor }]}>
            • Updated {updatedTimeAgo}
          </Text>
        )}
      </View>
    </View>
  );
});

// ============================================================================
// SKELETON
// ============================================================================

export function ListingTimestampSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton width={18} height={18} borderRadius={9} />
      <View style={[styles.textContainer, { gap: 6 }]}>
        <Skeleton width={60} height={16} />
        <Skeleton width={100} height={14} />
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
  },
  postedText: {
    ...Typography.dataMedium,
  },
  updatedText: {
    ...Typography.dataMini,
  },
});
