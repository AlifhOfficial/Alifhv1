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

import { Text, HapticPressable, useAlert } from '@/components/ui';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform } from 'react-native';
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
  Calendar1,
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

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';
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
  const { showAlert } = useAlert();

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
      showAlert('Unable to add to calendar', 'The booking date or time is invalid.');
      return;
    }

    const startISO = startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const endISO = endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startISO}/${endISO}&location=${encodeURIComponent(location || '')}&details=${encodeURIComponent(`Booking at ${b.partnerName}`)}`;

    const addToDeviceCalendar = async () => {
      try {
        const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
        if (status !== 'granted') {
          showAlert('Permission required', 'Calendar access is needed to create the event.');
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
          showAlert('No calendar found', 'Could not find a writable calendar on this device.');
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

        showAlert('Added!', 'The test drive has been added to your calendar.');
      } catch (err: any) {
        showAlert('Error', err.message || 'Failed to add event to calendar.');
      }
    };

    showAlert('Add to Calendar', 'Choose your calendar app', [
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
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: Radius['3xl'] }}
      handleIndicatorStyle={{ backgroundColor: colors.labelQuaternary, width: Sizes.bubble }}
    >
      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text variant="heading">Booking Details</Text>
          <HapticPressable
            onPress={onClose}
            hitSlop={Layout.hitSlop}
            style={[styles.closeButton, { backgroundColor: colors.error }]}
          >
            <Ionicons name="close" size={Sizes.iconSm} color={colors.primaryForeground} />
          </HapticPressable>
        </View>

        {/* ── Listing Hero ────────────────────────────────────────────── */}
        <HapticPressable
          onPress={() => onViewListing?.(booking.listingId)}
          style={[styles.heroCard, { backgroundColor: colors.surfaceSecondary }]}
        >
          {booking.listingThumbnail ? (
            <Image
              source={{ uri: getAppThumbUrl(booking.listingThumbnail)! }}
              style={styles.heroImage}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: colors.fill, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="car-outline" size={Sizes.iconXl} color={colors.labelQuaternary} />
            </View>
          )}
          <View style={styles.heroInfo}>
            <Text variant="body" numberOfLines={2}>
              {booking.listingTitle}
            </Text>
            {booking.listingPrice > 0 && (
              <Text variant="heading" tone="primary">
                {formatPrice(booking.listingPrice)}
              </Text>
            )}
            <View style={styles.heroAction}>
              <Text variant="bodySm" style={{ color: colors.primary }} tone="secondary">View listing</Text>
              <ChevronRight size={Sizes.iconXs} color={colors.primary} />
            </View>
          </View>
        </HapticPressable>

        {/* ── Status + Countdown ───────────────────────────────────────── */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  booking.status === 'pending'
                    ? colors.warningMuted
                    : booking.status === 'confirmed'
                      ? colors.primaryMuted
                      : booking.status === 'completed'
                        ? colors.successMuted
                        : booking.status === 'cancelled' || booking.status === 'rejected' || booking.status === 'no_show'
                          ? colors.errorMuted
                          : colors.fill2,
              },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text variant="caption" style={{ color: statusColor }} uppercase>
              {statusLabel}
            </Text>
          </View>

          {isActive && countdown && (
            <View
              style={[
                styles.countdownBadge,
                {
                  backgroundColor: countdown.isToday
                    ? colors.success
                    : countdown.isTomorrow
                      ? colors.warning
                      : colors.primary,
                },
              ]}
            >
              <Text
                variant="caption"
                style={{
                  color: colors.primaryForeground,
                }}
               uppercase>
                {countdown.text}
              </Text>
            </View>
          )}
        </View>

        {/* ── Date & Time ──────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={styles.detailRow}>
            <Calendar1 size={Sizes.iconSm} color={colors.labelSecondary} />
            <View style={styles.detailText}>
              <Text variant="bodySm" tone="secondary">Date</Text>
              <Text variant="body">{formatBookingDate(booking.scheduledDate)}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.detailRow}>
            <Clock size={Sizes.iconSm} color={colors.labelSecondary} />
            <View style={styles.detailText}>
              <Text variant="bodySm" tone="secondary">Time</Text>
              <Text variant="body">{timeRange}</Text>
            </View>
          </View>
        </View>

        {/* ── Partner Info ──────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={styles.detailRow}>
            {booking.partnerLogo ? (
              <Image source={{ uri: getAppThumbUrl(booking.partnerLogo)! }} style={styles.partnerLogoLg} contentFit="contain" />
            ) : (
              <View style={[styles.dealerIconCircle, { backgroundColor: colors.surfaceSecondary }]}>
                <Ionicons name="storefront-outline" size={Sizes.iconXs} color={colors.labelSecondary} />
              </View>
            )}
            <View style={styles.detailText}>
              <Text variant="bodySm" tone="secondary">Dealer</Text>
              <Text variant="body">{booking.partnerName}</Text>
            </View>
          </View>

          {booking.partnerAddress && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <HapticPressable
                onPress={() => handleOpenMaps(booking.partnerAddress!)}
                style={styles.detailRow}
              >
                <MapPin size={Sizes.iconSm} color={colors.labelSecondary} />
                <View style={[styles.detailText, { flex: 1 }]}>
                  <Text variant="bodySm" tone="secondary">Address</Text>
                  <Text variant="bodySm" numberOfLines={2}>{booking.partnerAddress}</Text>
                </View>
                <ExternalLink size={Sizes.iconXs} color={colors.primary} />
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
                <Phone size={Sizes.iconSm} color={colors.labelSecondary} />
                <View style={[styles.detailText, { flex: 1 }]}>
                  <Text variant="bodySm" tone="secondary">Phone</Text>
                  <Text variant="body">{booking.partnerPhone}</Text>
                </View>
                <ExternalLink size={Sizes.iconXs} color={colors.primary} />
              </HapticPressable>
            </>
          )}

          {settings?.contactPersonName && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.detailRow}>
                <User size={Sizes.iconSm} color={colors.labelSecondary} />
                <View style={styles.detailText}>
                  <Text variant="bodySm" tone="secondary">Contact Person</Text>
                  <Text variant="body">
                    {settings.contactPersonName}
                    {settings.contactPersonPhone ? ` · ${settings.contactPersonPhone}` : ''}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* ── Confirmation Token ───────────────────────────────────────── */}
        {booking.confirmationToken && isActive && (
          <View style={[styles.section, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.detailRow}>
              <Hash size={Sizes.iconSm} color={colors.labelSecondary} />
              <View style={styles.detailText}>
                <Text variant="bodySm" tone="secondary">Confirmation Code</Text>
                <Text variant="body" style={{ color: colors.label, letterSpacing: 1 }}>
                  {booking.confirmationToken}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Booking Details ──────────────────────────────────────────── */}
        {(booking.numberOfAttendees > 1 || booking.notes || booking.specialRequests) && (
          <View style={[styles.section, { backgroundColor: colors.surfaceSecondary }]}>
            {booking.numberOfAttendees > 1 && (
              <View style={styles.detailRow}>
                <Users size={Sizes.iconSm} color={colors.labelSecondary} />
                <View style={styles.detailText}>
                  <Text variant="bodySm" tone="secondary">Attendees</Text>
                  <Text variant="body">{booking.numberOfAttendees}</Text>
                </View>
              </View>
            )}
            {booking.notes && (
              <>
                {booking.numberOfAttendees > 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
                <View style={styles.detailRow}>
                  <FileText size={Sizes.iconSm} color={colors.labelSecondary} />
                  <View style={styles.detailText}>
                    <Text variant="bodySm" tone="secondary">Notes</Text>
                    <Text variant="bodySm">{booking.notes}</Text>
                  </View>
                </View>
              </>
            )}
            {booking.specialRequests && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.detailRow}>
                  <Star size={Sizes.iconSm} color={colors.labelSecondary} />
                  <View style={styles.detailText}>
                    <Text variant="bodySm" tone="secondary">Special Requests</Text>
                    <Text variant="bodySm">{booking.specialRequests}</Text>
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
              <Info size={Sizes.iconXs} color={colors.primary} />
              <Text variant="caption" style={{ color: colors.primary }} uppercase>
                Visit Information
              </Text>
            </View>

            {settings.preparationInstructions && (
              <View style={styles.instructionRow}>
                <Text variant="bodySm" tone="secondary">Preparation</Text>
                <Text variant="bodySm">{settings.preparationInstructions}</Text>
              </View>
            )}
            {settings.directions && (
              <View style={styles.instructionRow}>
                <Text variant="bodySm" tone="secondary">Directions</Text>
                <Text variant="bodySm">{settings.directions}</Text>
              </View>
            )}
            {settings.parkingInstructions && (
              <View style={styles.instructionRow}>
                <Text variant="bodySm" tone="secondary">Parking</Text>
                <Text variant="bodySm">{settings.parkingInstructions}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Cancellation Details ──────────────────────────────────── */}
        {booking.status === 'cancelled' && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.error }]}>
            <View style={styles.sectionHeader}>
              <XIcon size={Sizes.iconXs} color={colors.error} />
              <Text variant="caption" style={{ color: colors.error }} uppercase>
                Cancelled
              </Text>
            </View>
            {(booking.cancellationNotes || booking.cancellationReason) && (
              <View style={styles.instructionRow}>
                <Text variant="bodySm" tone="secondary">Reason</Text>
                <Text variant="bodySm">{booking.cancellationNotes || booking.cancellationReason?.replace(/_/g, ' ')}</Text>
              </View>
            )}
            {booking.cancelledAt && (
              <View style={styles.instructionRow}>
                <Text variant="bodySm" tone="secondary">Cancelled on</Text>
                <Text variant="bodySm">{formatBookingDate(booking.cancelledAt)}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Rejection Reason ──────────────────────────────────────── */}
        {booking.status === 'rejected' && booking.rejectionReason && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.error }]}>
            <View style={styles.sectionHeader}>
              <XIcon size={Sizes.iconXs} color={colors.error} />
              <Text variant="caption" style={{ color: colors.error }} uppercase>
                Rejected
              </Text>
            </View>
            <View style={styles.instructionRow}>
              <Text variant="bodySm" tone="secondary">Reason</Text>
              <Text variant="bodySm">{booking.rejectionReason}</Text>
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
              <CalendarPlus size={Sizes.iconSm} color={colors.label} />
              <Text variant="body">Add to Calendar</Text>
            </HapticPressable>
          )}

          {cancelCheck.canCancel ? (
            <HapticPressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onCancel?.(booking);
              }}
              style={[styles.cancelBtn, { backgroundColor: colors.error }]}
            >
              <XIcon size={Sizes.iconSm} color={colors.primaryForeground} />
              <Text variant="body" style={{ color: colors.primaryForeground }}>Cancel Booking</Text>
            </HapticPressable>
          ) : isActive && cancelCheck.reason ? (
            <View style={[styles.cancelDisabledRow, { backgroundColor: colors.surfaceSecondary }]}>
              <Info size={Sizes.iconXs} color={colors.labelQuaternary} />
              <Text variant="bodySm" style={styles.cancelDisabledText}>
                {cancelCheck.reason}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── Booked at ────────────────────────────────────────────────── */}
        <Text variant="bodySm" tone="secondary" style={{ textAlign: 'center', marginTop: Spacing.md }}>
          Booked on {formatBookingDate(booking.createdAt)}
        </Text>
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
    marginHorizontal: Layout.screenPadding,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  closeButton: {
    width: Sizes.avatarSm,
    height: Sizes.avatarSm,
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
    width: Spacing['5xl'] + Spacing['3xl'],
    height: Spacing['5xl'] + Spacing.lg,
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
    gap: Sizes.badgePaddingH,
    paddingHorizontal: Spacing.md,
    paddingVertical: Sizes.badgePaddingH,
    borderRadius: Radius.full,
  },
  statusDot: {
    width: Spacing.sm,
    height: Spacing.sm,
    borderRadius: Spacing.xs,
  },
  countdownBadge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Sizes.badgePaddingH,
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
    gap: Sizes.badgePaddingH,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  detailText: {
    gap: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.sm,
  },
  partnerLogoLg: {
    width: Sizes.iconXl,
    height: Sizes.iconXl,
    borderRadius: Sizes.iconXs,
    marginTop: 2,
  },
  dealerIconCircle: {
    width: Sizes.iconXl,
    height: Sizes.iconXl,
    borderRadius: Sizes.iconXs,
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
    width: '100%',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  viewListingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  cancelDisabledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  cancelDisabledText: {
    flex: 1,
    flexShrink: 1,
  },
});
