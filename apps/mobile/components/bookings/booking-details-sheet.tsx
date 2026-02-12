/**
 * BookingDetailsSheet — Full booking details bottom sheet
 *
 * Opens when tapping a booking card. Shows:
 *   • Listing image + title + price
 *   • Status badge
 *   • Date / time / countdown
 *   • Partner info (name, address, phone)
 *   • Confirmation token
 *   • Notes, special requests, attendees
 *   • Cancellation details (if cancelled)
 *   • Preparation instructions / directions / parking (from partner settings)
 *   • Cancel button (if eligible)
 *   • View listing button
 *
 * @module components/bookings/booking-details-sheet
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform, Alert } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { Image } from 'expo-image';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ExpoCalendar from 'expo-calendar';
import { Ionicons } from '@expo/vector-icons';
import {
  Calendar,
  CalendarPlus,
  Clock,
  MapPin,
  Phone,
  User,
  Users,
  FileText,
  Star,
  Hash,
  Navigation,
  ParkingCircle,
  Info,
  ExternalLink,
  X as XIcon,
  ChevronRight,
} from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Data, Supporting, ButtonText, Label } from '@/components/ui';
import type { UserBooking } from '@/lib/booking-api';
import {
  formatBookingStatus,
  getBookingStatusColor,
  formatBookingDate,
  formatBookingTime,
  formatTimeRange,
  formatBookingCountdown,
  formatPrice,
  canCancelBooking,
} from './utilities/booking-helpers';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BookingDetailsSheetProps {
  visible: boolean;
  onClose: () => void;
  booking: UserBooking | null;
  onCancel?: (booking: UserBooking) => void;
  onViewListing?: (listingId: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BookingDetailsSheet({
  visible,
  onClose,
  booking,
  onCancel,
  onViewListing,
}: BookingDetailsSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['85%'], []);

  useEffect(() => {
    if (visible && booking) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible, booking]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  const handleOpenMaps = useCallback((address: string) => {
    const url = Platform.select({
      ios: `maps:?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
    });
    if (url) Linking.openURL(url);
  }, []);

  const handleAddToCalendar = useCallback(async (b: UserBooking) => {
    const title = `Test Drive – ${b.listingTitle}`;
    const location = b.partnerAddress || b.partnerName;

    // scheduledStartTime / scheduledEndTime are full ISO timestamps from the DB
    const startDate = new Date(b.scheduledStartTime);
    const endDate = new Date(b.scheduledEndTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      Alert.alert('Unable to add to calendar', 'The booking date or time is invalid.');
      return;
    }

    const startISO = startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const endISO = endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startISO}/${endISO}&location=${encodeURIComponent(location || '')}&details=${encodeURIComponent(`Booking at ${b.partnerName}`)}`;

    const addToDeviceCalendar = async () => {
      try {
        const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Calendar access is needed to create the event.');
          return;
        }

        const calendars = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
        const defaultCalendar =
          Platform.OS === 'ios'
            ? calendars.find((c) => c.allowsModifications && c.source?.name === 'iCloud') ||
              calendars.find((c) => c.allowsModifications)
            : calendars.find((c) => c.accessLevel === 'owner') ||
              calendars.find((c) => c.allowsModifications);

        if (!defaultCalendar) {
          Alert.alert('No calendar found', 'Could not find a writable calendar on this device.');
          return;
        }

        await ExpoCalendar.createEventAsync(defaultCalendar.id, {
          title,
          startDate,
          endDate,
          location: location || undefined,
          notes: `Booking at ${b.partnerName}`,
          timeZone: 'Asia/Dubai',
        });

        Alert.alert('Added!', 'The test drive has been added to your calendar.');
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to add event to calendar.');
      }
    };

    Alert.alert('Add to Calendar', 'Choose your calendar app', [
      {
        text: 'Google Calendar',
        onPress: () => Linking.openURL(gcalUrl),
      },
      {
        text: 'Device Calendar',
        onPress: addToDeviceCalendar,
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  if (!booking) return null;

  const statusLabel = formatBookingStatus(booking.status);
  const statusColor = getBookingStatusColor(booking.status, colors);
  const countdown = formatBookingCountdown(booking.scheduledDate);
  const timeRange = formatTimeRange(booking.scheduledStartTime, booking.scheduledEndTime);
  const cancelCheck = canCancelBooking(
    booking.status,
    booking.scheduledStartTime,
    booking.partnerSettings,
  );
  const settings = booking.partnerSettings;
  const isActive = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: 36 }}
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Heading size="medium">Booking Details</Heading>
          <HapticPressable
            onPress={onClose}
            hitSlop={Spacing.md}
            style={[styles.closeButton, { backgroundColor: colors.fillSecondary }]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </HapticPressable>
        </View>

        {/* ── Listing Hero ────────────────────────────────────────────── */}
        <HapticPressable
          onPress={() => onViewListing?.(booking.listingId)}
          style={[styles.heroCard, { backgroundColor: colors.surfaceSecondary }]}
        >
          {booking.listingThumbnail ? (
            <Image
              source={{ uri: booking.listingThumbnail }}
              style={styles.heroImage}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: colors.fill, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="car-outline" size={32} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.heroInfo}>
            <Data size="small" style={{ color: colors.text, fontWeight: '600' }} numberOfLines={2}>
              {booking.listingTitle}
            </Data>
            {booking.listingPrice > 0 && (
              <Data size="medium" style={{ color: colors.primary, fontWeight: '700' }}>
                {formatPrice(booking.listingPrice)}
              </Data>
            )}
            <View style={styles.heroAction}>
              <Supporting size="small" style={{ color: colors.primary }}>View listing</Supporting>
              <ChevronRight size={14} color={colors.primary} />
            </View>
          </View>
        </HapticPressable>

        {/* ── Status + Countdown ───────────────────────────────────────── */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Label size="small" style={{ color: statusColor, fontWeight: '700' }}>
              {statusLabel}
            </Label>
          </View>

          {isActive && (
            <View
              style={[
                styles.countdownBadge,
                {
                  backgroundColor: countdown.isToday
                    ? colors.successMuted
                    : countdown.isTomorrow
                      ? colors.warningMuted
                      : colors.primaryMuted,
                },
              ]}
            >
              <Supporting
                size="small"
                style={{
                  fontWeight: '600',
                  color: countdown.isToday
                    ? colors.success
                    : countdown.isTomorrow
                      ? colors.warning
                      : colors.primary,
                }}
              >
                {countdown.text}
              </Supporting>
            </View>
          )}
        </View>

        {/* ── Date & Time ──────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={styles.detailRow}>
            <Calendar size={16} color={colors.textSecondary} />
            <View style={styles.detailText}>
              <Supporting size="small" tone="secondary">Date</Supporting>
              <Body size="medium">{formatBookingDate(booking.scheduledDate)}</Body>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.detailRow}>
            <Clock size={16} color={colors.textSecondary} />
            <View style={styles.detailText}>
              <Supporting size="small" tone="secondary">Time</Supporting>
              <Body size="medium">{timeRange}</Body>
            </View>
          </View>
        </View>

        {/* ── Partner Info ──────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={styles.detailRow}>
            {booking.partnerLogo ? (
              <Image source={{ uri: booking.partnerLogo }} style={styles.partnerLogoLg} contentFit="contain" />
            ) : (
              <View style={[styles.dealerIconCircle, { backgroundColor: colors.surfaceSecondary }]}>
                <Ionicons name="storefront-outline" size={14} color={colors.textSecondary} />
              </View>
            )}
            <View style={styles.detailText}>
              <Supporting size="small" tone="secondary">Dealer</Supporting>
              <Body size="medium">{booking.partnerName}</Body>
            </View>
          </View>

          {booking.partnerAddress && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <HapticPressable
                onPress={() => handleOpenMaps(booking.partnerAddress!)}
                style={styles.detailRow}
              >
                <MapPin size={16} color={colors.textSecondary} />
                <View style={[styles.detailText, { flex: 1 }]}>
                  <Supporting size="small" tone="secondary">Address</Supporting>
                  <Body size="small" numberOfLines={2}>{booking.partnerAddress}</Body>
                </View>
                <ExternalLink size={14} color={colors.primary} />
              </HapticPressable>
            </>
          )}

          {booking.partnerPhone && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <HapticPressable
                onPress={() => handleCall(booking.partnerPhone)}
                style={styles.detailRow}
              >
                <Phone size={16} color={colors.textSecondary} />
                <View style={[styles.detailText, { flex: 1 }]}>
                  <Supporting size="small" tone="secondary">Phone</Supporting>
                  <Body size="medium">{booking.partnerPhone}</Body>
                </View>
                <ExternalLink size={14} color={colors.primary} />
              </HapticPressable>
            </>
          )}

          {settings?.contactPersonName && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.detailRow}>
                <User size={16} color={colors.textSecondary} />
                <View style={styles.detailText}>
                  <Supporting size="small" tone="secondary">Contact Person</Supporting>
                  <Body size="medium">
                    {settings.contactPersonName}
                    {settings.contactPersonPhone ? ` · ${settings.contactPersonPhone}` : ''}
                  </Body>
                </View>
              </View>
            </>
          )}
        </View>

        {/* ── Confirmation Token ───────────────────────────────────────── */}
        {booking.confirmationToken && isActive && (
          <View style={[styles.section, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.detailRow}>
              <Hash size={16} color={colors.textSecondary} />
              <View style={styles.detailText}>
                <Supporting size="small" tone="secondary">Confirmation Code</Supporting>
                <Data size="medium" style={{ color: colors.text, fontWeight: '700', letterSpacing: 1 }}>
                  {booking.confirmationToken}
                </Data>
              </View>
            </View>
          </View>
        )}

        {/* ── Booking Details ──────────────────────────────────────────── */}
        {(booking.numberOfAttendees > 1 || booking.notes || booking.specialRequests) && (
          <View style={[styles.section, { backgroundColor: colors.surfaceSecondary }]}>
            {booking.numberOfAttendees > 1 && (
              <View style={styles.detailRow}>
                <Users size={16} color={colors.textSecondary} />
                <View style={styles.detailText}>
                  <Supporting size="small" tone="secondary">Attendees</Supporting>
                  <Body size="medium">{booking.numberOfAttendees}</Body>
                </View>
              </View>
            )}
            {booking.notes && (
              <>
                {booking.numberOfAttendees > 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
                <View style={styles.detailRow}>
                  <FileText size={16} color={colors.textSecondary} />
                  <View style={styles.detailText}>
                    <Supporting size="small" tone="secondary">Notes</Supporting>
                    <Body size="small">{booking.notes}</Body>
                  </View>
                </View>
              </>
            )}
            {booking.specialRequests && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.detailRow}>
                  <Star size={16} color={colors.textSecondary} />
                  <View style={styles.detailText}>
                    <Supporting size="small" tone="secondary">Special Requests</Supporting>
                    <Body size="small">{booking.specialRequests}</Body>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* ── Preparation Instructions ──────────────────────────────── */}
        {isActive && settings && (settings.preparationInstructions || settings.directions || settings.parkingInstructions) && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }]}>
            <View style={styles.sectionHeader}>
              <Info size={14} color={colors.primary} />
              <Label size="small" style={{ color: colors.primary, fontWeight: '700' }}>
                Visit Information
              </Label>
            </View>

            {settings.preparationInstructions && (
              <View style={styles.instructionRow}>
                <Supporting size="small" tone="secondary" style={{ fontWeight: '600' }}>Preparation</Supporting>
                <Body size="small">{settings.preparationInstructions}</Body>
              </View>
            )}
            {settings.directions && (
              <View style={styles.instructionRow}>
                <Supporting size="small" tone="secondary" style={{ fontWeight: '600' }}>Directions</Supporting>
                <Body size="small">{settings.directions}</Body>
              </View>
            )}
            {settings.parkingInstructions && (
              <View style={styles.instructionRow}>
                <Supporting size="small" tone="secondary" style={{ fontWeight: '600' }}>Parking</Supporting>
                <Body size="small">{settings.parkingInstructions}</Body>
              </View>
            )}
          </View>
        )}

        {/* ── Cancellation Details ──────────────────────────────────── */}
        {booking.status === 'cancelled' && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.error }]}>
            <View style={styles.sectionHeader}>
              <XIcon size={14} color={colors.error} />
              <Label size="small" style={{ color: colors.error, fontWeight: '700' }}>
                Cancelled
              </Label>
            </View>
            {booking.cancellationReason && (
              <View style={styles.instructionRow}>
                <Supporting size="small" tone="secondary" style={{ fontWeight: '600' }}>Reason</Supporting>
                <Body size="small">{booking.cancellationReason.replace(/_/g, ' ')}</Body>
              </View>
            )}
            {booking.cancellationNotes && (
              <View style={styles.instructionRow}>
                <Supporting size="small" tone="secondary" style={{ fontWeight: '600' }}>Notes</Supporting>
                <Body size="small">{booking.cancellationNotes}</Body>
              </View>
            )}
            {booking.cancelledAt && (
              <View style={styles.instructionRow}>
                <Supporting size="small" tone="secondary" style={{ fontWeight: '600' }}>Cancelled on</Supporting>
                <Body size="small">{formatBookingDate(booking.cancelledAt)}</Body>
              </View>
            )}
          </View>
        )}

        {/* ── Rejection Reason ──────────────────────────────────────── */}
        {booking.status === 'rejected' && booking.rejectionReason && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.error }]}>
            <View style={styles.sectionHeader}>
              <XIcon size={14} color={colors.error} />
              <Label size="small" style={{ color: colors.error, fontWeight: '700' }}>
                Rejected
              </Label>
            </View>
            <View style={styles.instructionRow}>
              <Supporting size="small" tone="secondary" style={{ fontWeight: '600' }}>Reason</Supporting>
              <Body size="small">{booking.rejectionReason}</Body>
            </View>
          </View>
        )}

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <View style={styles.actions}>
          {isActive && (
            <HapticPressable
              onPress={() => handleAddToCalendar(booking)}
              style={[
                styles.viewListingBtn,
                { backgroundColor: 'transparent', borderColor: colors.border },
              ]}
            >
              <CalendarPlus size={16} color={colors.text} />
              <ButtonText size="medium">Add to Calendar</ButtonText>
            </HapticPressable>
          )}

          {cancelCheck.canCancel && (
            <HapticPressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onCancel?.(booking);
              }}
              style={[styles.cancelBtn, { backgroundColor: colors.error }]}
            >
              <XIcon size={18} color="#FFF" />
              <ButtonText size="medium" style={{ color: '#FFF' }}>Cancel Booking</ButtonText>
            </HapticPressable>
          )}
        </View>

        {/* ── Booked at ────────────────────────────────────────────────── */}
        <Supporting size="small" tone="secondary" style={{ textAlign: 'center', marginTop: Spacing.md }}>
          Booked on {formatBookingDate(booking.createdAt)}
        </Supporting>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  sheetContainer: {
    marginHorizontal: 16,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Hero card ──────────────────────────────────────────────────────────
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
  },
  heroImage: {
    width: 80,
    height: 64,
    borderRadius: Radius.md,
  },
  heroInfo: {
    flex: 1,
    gap: 2,
  },
  heroAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },

  // ── Status ─────────────────────────────────────────────────────────────
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  countdownBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },

  // ── Section card ───────────────────────────────────────────────────────
  section: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  detailText: {
    gap: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.sm,
  },
  partnerLogoLg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginTop: 2,
  },
  dealerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  // ── Instructions ───────────────────────────────────────────────────────
  instructionRow: {
    gap: 2,
    marginTop: Spacing.xs,
  },

  // ── Actions ────────────────────────────────────────────────────────────
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: Radius.lg,
  },
  viewListingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
});
