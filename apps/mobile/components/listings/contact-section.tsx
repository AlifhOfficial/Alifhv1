/**
 * Contact Section - Chat, Call, Book actions
 * 
 * Unified action buttons for contacting seller.
 * Clean, minimal design following "Less is More" principle.
 */

import React, { memo, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Linking, Platform, Clipboard } from 'react-native';
import { 
  MessageCircle, 
  Phone, 
  Calendar, 
  Copy, 
  Check,
  Loader2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// TYPES
// ============================================================================

interface ContactSectionProps {
  /** Seller phone number */
  phoneNumber?: string | null;
  /** Contact display name */
  contactName?: string | null;
  /** Is this the current user's own listing */
  isOwnListing?: boolean;
  /** Is this the current user's own partner listing (staff) */
  isOwnPartnerListing?: boolean;
  /** Show booking button (dealer listings only) */
  showBooking?: boolean;
  /** Partner name for booking display */
  partnerName?: string;
  /** Is chat action loading */
  isChatLoading?: boolean;
  /** Callback when chat button pressed */
  onChatPress?: () => void;
  /** Callback when book test drive pressed */
  onBookPress?: () => void;
  /** For BLK listings styling */
  isBlk?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ContactSection = memo(function ContactSection({
  phoneNumber,
  contactName,
  isOwnListing = false,
  isOwnPartnerListing = false,
  showBooking = false,
  partnerName,
  isChatLoading = false,
  onChatPress,
  onBookPress,
  isBlk = false,
}: ContactSectionProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [showPhone, setShowPhone] = useState(false);
  const [copied, setCopied] = useState(false);

  const isBlocked = isOwnListing || isOwnPartnerListing;
  const blockedMessage = isOwnPartnerListing ? 'Your Dealership' : 'Your Listing';

  const textColor = isBlk ? colors.blkText : colors.text;
  const secondaryTextColor = isBlk ? colors.blkTextSecondary : colors.textSecondary;
  const borderColor = isBlk ? colors.blkBorder : colors.border;
  const surfaceColor = isBlk ? colors.blkBackground : colors.surface;

  const handleCallPress = useCallback(() => {
    if (phoneNumber) {
      Haptics.selectionAsync();
      Linking.openURL(`tel:${phoneNumber}`);
    }
  }, [phoneNumber]);

  const handleWhatsAppPress = useCallback(() => {
    if (phoneNumber) {
      Haptics.selectionAsync();
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      Linking.openURL(`https://wa.me/${cleanNumber}`);
    }
  }, [phoneNumber]);

  const handleCopyPhone = useCallback(async () => {
    if (!phoneNumber) return;
    try {
      Clipboard.setString(phoneNumber);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy phone:', error);
    }
  }, [phoneNumber]);

  const toggleShowPhone = useCallback(() => {
    Haptics.selectionAsync();
    setShowPhone(prev => !prev);
  }, []);

  const formatPhoneForDisplay = (phone: string) => {
    if (phone.startsWith('+971')) {
      return phone.replace(/(\+971)(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4');
    }
    return phone;
  };

  return (
    <View style={styles.container}>
      {/* Primary Actions Row */}
      <View style={styles.actionsRow}>
        {/* Chat Button - Primary */}
        <Pressable
          onPress={onChatPress}
          disabled={isChatLoading || isBlocked}
          style={({ pressed }) => [
            styles.chatButton,
            {
              backgroundColor: isBlocked ? colors.buttonDisabled : colors.primary,
              opacity: pressed && !isBlocked ? 0.8 : 1,
            },
          ]}
        >
          {isChatLoading ? (
            <Loader2 size={20} color={colors.primaryForeground} />
          ) : (
            <>
              <MessageCircle size={20} color={isBlocked ? colors.buttonDisabledForeground : colors.primaryForeground} />
              <Text style={[
                styles.buttonText, 
                { color: isBlocked ? colors.buttonDisabledForeground : colors.primaryForeground }
              ]}>
                {isBlocked ? blockedMessage : 'Chat'}
              </Text>
            </>
          )}
        </Pressable>

        {/* Call Button */}
        {phoneNumber && !isBlocked && (
          <Pressable
            onPress={handleCallPress}
            style={({ pressed }) => [
              styles.secondaryButton,
              { 
                backgroundColor: colors.buttonSecondary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Phone size={20} color={colors.buttonSecondaryForeground} />
            <Text style={[styles.buttonText, { color: colors.buttonSecondaryForeground }]}>
              Call
            </Text>
          </Pressable>
        )}

        {/* Book Test Drive Button */}
        {showBooking && onBookPress && !isBlocked && (
          <Pressable
            onPress={onBookPress}
            style={({ pressed }) => [
              styles.bookButton,
              { 
                backgroundColor: colors.success,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Calendar size={20} color="#FFFFFF" />
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              Book
            </Text>
          </Pressable>
        )}
      </View>

      {/* Phone Toggle */}
      {phoneNumber && !isBlocked && (
        <Pressable onPress={toggleShowPhone} hitSlop={8}>
          <Text style={[styles.toggleText, { color: secondaryTextColor }]}>
            {showPhone ? 'Hide phone number' : 'Show phone number'}
          </Text>
        </Pressable>
      )}

      {/* Phone Number Display */}
      {phoneNumber && showPhone && (
        <View style={[styles.phoneCard, { backgroundColor: surfaceColor, borderColor }]}>
          {contactName && (
            <Text style={[styles.contactName, { color: colors.textTertiary }]}>
              {contactName}
            </Text>
          )}
          <View style={styles.phoneRow}>
            <Pressable onPress={handleCallPress}>
              <Text style={[styles.phoneNumber, { color: textColor }]}>
                {formatPhoneForDisplay(phoneNumber)}
              </Text>
            </Pressable>
            <View style={styles.phoneActions}>
              <Pressable 
                onPress={handleWhatsAppPress}
                style={styles.phoneActionButton}
                hitSlop={8}
              >
                <View style={styles.whatsappIcon}>
                  <Text style={styles.whatsappText}>W</Text>
                </View>
              </Pressable>
              <Pressable 
                onPress={handleCopyPhone}
                style={styles.phoneActionButton}
                hitSlop={8}
              >
                {copied ? (
                  <Check size={18} color={colors.success} />
                ) : (
                  <Copy size={18} color={secondaryTextColor} />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* No phone message for private sellers */}
      {!phoneNumber && !showBooking && !isBlocked && (
        <Text style={[styles.noPhoneText, { color: secondaryTextColor }]}>
          Seller prefers chat
        </Text>
      )}
    </View>
  );
});

// ============================================================================
// SKELETON
// ============================================================================

export function ContactSectionSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        <Skeleton width="48%" height={48} borderRadius={Radius.full} />
        <Skeleton width="48%" height={48} borderRadius={Radius.full} />
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: Radius.full,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: Radius.full,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: Radius.full,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  phoneCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 4,
  },
  contactName: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneNumber: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  phoneActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  phoneActionButton: {
    padding: Spacing.xs,
  },
  whatsappIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  noPhoneText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
});
