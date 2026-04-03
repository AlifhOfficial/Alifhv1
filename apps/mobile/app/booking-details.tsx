import { BrandAvatar, HapticPressable, SheetHeader, Text, useAlert } from '@/components/ui';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useCallback } from 'react';
import { View, StyleSheet, Linking, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
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
  Info,
  ExternalLink,
  X as XIcon,
  ChevronRight,
} from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useBookings } from '@/hooks/use-booking-query';
import { getAppThumbUrl } from '@/lib/config';
import type { UserBooking } from '@/lib/booking-api';
import {
  formatBookingStatus,
  getBookingStatusColor,
  formatBookingDate,
  formatTimeRange,
  formatBookingCountdown,
  formatPrice,
  canCancelBooking,
} from '@/components/bookings/utilities/booking-helpers';

type RouteParams = {
  bookingId?: string | string[];
};

function getBookingIdFromParams(rawBookingId?: string | string[]): string | null {
  const value = Array.isArray(rawBookingId) ? rawBookingId[0] : rawBookingId;
  return value || null;
}

export default function BookingDetailsScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const bookingId = getBookingIdFromParams(params.bookingId);
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { bookings, isLoading } = useBookings({ filter: 'all', enabled: !!bookingId });
  const booking = bookingId ? bookings.find((item) => item.id === bookingId) ?? null : null;

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
      { text: 'Google Calendar', onPress: () => Linking.openURL(gcalUrl) },
      { text: 'Device Calendar', onPress: addToDeviceCalendar },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [showAlert]);

  if (isLoading && bookingId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.labelTertiary} />
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
        <View style={styles.fallbackContainer}>
          <Text variant="subhead" tone="muted">Booking details are unavailable.</Text>
          <HapticPressable onPress={() => router.back()} style={[styles.fallbackButton, { backgroundColor: colors.fill2 }]}> 
            <Text variant="subhead">Go back</Text>
          </HapticPressable>
        </View>
      </View>
    );
  }

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
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <View style={styles.headerWrap}>
        <SheetHeader title="Booking" />
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
        showsVerticalScrollIndicator={false}
      >

        <HapticPressable
          onPress={() => {
            router.back();
            setTimeout(() => {
              router.push(`/listing/${booking.listingId}` as any);
            }, 200);
          }}
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
            <Text variant="subheadEmphasized" numberOfLines={2}>{booking.listingTitle}</Text>
            {booking.listingPrice > 0 && (
              <Text variant="headline" tone="primary">{formatPrice(booking.listingPrice)}</Text>
            )}
            <View style={styles.heroFooter}>
              <View style={styles.heroMeta}>
                <Text variant="caption1Emphasized" style={{ color: statusColor }} uppercase>{statusLabel}</Text>
                {isActive && countdown ? <Text variant="caption1" tone="secondary">{countdown.text}</Text> : null}
              </View>
              <View style={styles.heroAction}>
                <Text variant="caption1Emphasized" style={{ color: colors.primary }} uppercase>View listing</Text>
                <ChevronRight size={Sizes.iconXs} color={colors.primary} />
              </View>
            </View>
          </View>
        </HapticPressable>

        <View style={[styles.section, { backgroundColor: colors.surfaceSecondary }]}> 
          <View style={styles.detailRow}>
            <Calendar1 size={Sizes.iconSm} color={colors.labelSecondary} />
            <View style={styles.detailText}>
              <Text variant="caption1Emphasized" tone="muted" uppercase>Date</Text>
              <Text variant="subhead">{formatBookingDate(booking.scheduledDate)}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.detailRow}>
            <Clock size={Sizes.iconSm} color={colors.labelSecondary} />
            <View style={styles.detailText}>
              <Text variant="caption1Emphasized" tone="muted" uppercase>Time</Text>
              <Text variant="subhead">{timeRange}</Text>
            </View>
          </View>
          {booking.partnerPhone ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <HapticPressable onPress={() => handleCall(booking.partnerPhone)} style={styles.detailRow}>
                <Phone size={Sizes.iconSm} color={colors.labelSecondary} />
                <View style={[styles.detailText, { flex: 1 }]}>
                  <Text variant="caption1Emphasized" tone="muted" uppercase>Phone</Text>
                  <Text variant="subhead">{booking.partnerPhone}</Text>
                </View>
                <ExternalLink size={Sizes.iconXs} color={colors.labelTertiary} />
              </HapticPressable>
            </>
          ) : null}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surfaceSecondary }]}> 
          <View style={styles.partnerHeaderRow}>
            <BrandAvatar
              src={booking.partnerLogo}
              name={booking.partnerName || 'Dealer'}
              size="xl"
              backgroundColor={colors.fill2}
              ringColor={colors.border}
            />
            <View style={styles.partnerHeaderText}>
              <Text variant="caption1Emphasized" tone="muted" uppercase>Dealer</Text>
              <Text variant="subheadEmphasized">{booking.partnerName}</Text>
            </View>
          </View>

          {booking.partnerAddress ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <HapticPressable onPress={() => handleOpenMaps(booking.partnerAddress!)} style={styles.actionRow}>
                <View style={[styles.actionIconWrap, { backgroundColor: colors.fill2 }]}> 
                  <MapPin size={Sizes.iconXs} color={colors.labelSecondary} />
                </View>
                <View style={[styles.detailText, styles.actionText]}>
                  <Text variant="caption1Emphasized" tone="muted" uppercase>Address</Text>
                  <Text variant="subhead" numberOfLines={2}>{booking.partnerAddress}</Text>
                </View>
                <ExternalLink size={Sizes.iconXs} color={colors.labelTertiary} />
              </HapticPressable>
            </>
          ) : null}

          {settings?.contactPersonName ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.actionRow}>
                <View style={[styles.actionIconWrap, { backgroundColor: colors.fill2 }]}> 
                  <User size={Sizes.iconXs} color={colors.labelSecondary} />
                </View>
                <View style={[styles.detailText, styles.actionText]}>
                  <Text variant="caption1Emphasized" tone="muted" uppercase>Contact</Text>
                  <Text variant="subhead">
                    {settings.contactPersonName}
                    {settings.contactPersonPhone ? ` · ${settings.contactPersonPhone}` : ''}
                  </Text>
                </View>
              </View>
            </>
          ) : null}
        </View>

        {booking.confirmationToken && isActive ? (
          <View style={[styles.section, { backgroundColor: colors.surfaceSecondary }]}> 
            <View style={styles.detailRow}>
              <Hash size={Sizes.iconSm} color={colors.labelSecondary} />
              <View style={styles.detailText}>
                <Text variant="caption1Emphasized" tone="muted" uppercase>Confirmation Code</Text>
                <Text variant="subheadEmphasized" style={{ color: colors.label, letterSpacing: Typography.footnoteEmphasized.letterSpacing }}>
                  {booking.confirmationToken}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {(booking.numberOfAttendees > 1 || booking.notes || booking.specialRequests) ? (
          <View style={[styles.section, { backgroundColor: colors.surfaceSecondary }]}> 
            {booking.numberOfAttendees > 1 ? (
              <View style={styles.detailRow}>
                <Users size={Sizes.iconSm} color={colors.labelSecondary} />
                <View style={styles.detailText}>
                  <Text variant="caption1Emphasized" tone="muted" uppercase>Attendees</Text>
                  <Text variant="subhead">{booking.numberOfAttendees}</Text>
                </View>
              </View>
            ) : null}
            {booking.notes ? (
              <>
                {booking.numberOfAttendees > 1 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                <View style={styles.detailRow}>
                  <FileText size={Sizes.iconSm} color={colors.labelSecondary} />
                  <View style={styles.detailText}>
                    <Text variant="caption1Emphasized" tone="muted" uppercase>Notes</Text>
                    <Text variant="subhead">{booking.notes}</Text>
                  </View>
                </View>
              </>
            ) : null}
            {booking.specialRequests ? (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.detailRow}>
                  <Star size={Sizes.iconSm} color={colors.labelSecondary} />
                  <View style={styles.detailText}>
                    <Text variant="caption1Emphasized" tone="muted" uppercase>Special Requests</Text>
                    <Text variant="subhead">{booking.specialRequests}</Text>
                  </View>
                </View>
              </>
            ) : null}
          </View>
        ) : null}

        {isActive && settings && (settings.preparationInstructions || settings.directions || settings.parkingInstructions) ? (
          <View style={[styles.section, { backgroundColor: colors.surfaceSecondary }]}> 
            <View style={styles.sectionHeader}>
              <Info size={Sizes.iconXs} color={colors.labelSecondary} />
              <Text variant="caption1Emphasized" tone="muted" uppercase>Visit Information</Text>
            </View>

            {settings.preparationInstructions ? (
              <View style={styles.instructionRow}>
                <Text variant="caption1Emphasized" tone="muted" uppercase>Preparation</Text>
                <Text variant="subhead">{settings.preparationInstructions}</Text>
              </View>
            ) : null}
            {settings.directions ? (
              <View style={styles.instructionRow}>
                <Text variant="caption1Emphasized" tone="muted" uppercase>Directions</Text>
                <Text variant="subhead">{settings.directions}</Text>
              </View>
            ) : null}
            {settings.parkingInstructions ? (
              <View style={styles.instructionRow}>
                <Text variant="caption1Emphasized" tone="muted" uppercase>Parking</Text>
                <Text variant="subhead">{settings.parkingInstructions}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {booking.status === 'cancelled' ? (
          <View style={[styles.section, { backgroundColor: colors.surfaceSecondary }]}> 
            <View style={styles.sectionHeader}>
              <XIcon size={Sizes.iconXs} color={colors.error} />
              <Text variant="caption1Emphasized" style={{ color: colors.error }} uppercase>Cancelled</Text>
            </View>
            {(booking.cancellationNotes || booking.cancellationReason) ? (
              <View style={styles.instructionRow}>
                <Text variant="caption1Emphasized" tone="muted" uppercase>Reason</Text>
                <Text variant="subhead">{booking.cancellationNotes || booking.cancellationReason?.replace(/_/g, ' ')}</Text>
              </View>
            ) : null}
            {booking.cancelledAt ? (
              <View style={styles.instructionRow}>
                <Text variant="caption1Emphasized" tone="muted" uppercase>Cancelled On</Text>
                <Text variant="subhead">{formatBookingDate(booking.cancelledAt)}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {booking.status === 'rejected' && booking.rejectionReason ? (
          <View style={[styles.section, { backgroundColor: colors.surfaceSecondary }]}> 
            <View style={styles.sectionHeader}>
              <XIcon size={Sizes.iconXs} color={colors.error} />
              <Text variant="caption1Emphasized" style={{ color: colors.error }} uppercase>Rejected</Text>
            </View>
            <View style={styles.instructionRow}>
              <Text variant="caption1Emphasized" tone="muted" uppercase>Reason</Text>
              <Text variant="subhead">{booking.rejectionReason}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.actions}>
          {isActive ? (
            <HapticPressable
              onPress={() => handleAddToCalendar(booking)}
              style={[styles.secondaryActionBtn, { backgroundColor: colors.fill2, borderColor: colors.border }]}
            >
              <CalendarPlus size={Sizes.iconSm} color={colors.label} />
              <Text variant="subhead">Add to Calendar</Text>
            </HapticPressable>
          ) : null}

          {cancelCheck.canCancel ? (
            <HapticPressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.replace({
                  pathname: '/cancel-booking',
                  params: { bookingId: booking.id },
                });
              }}
              style={[styles.primaryActionBtn, { backgroundColor: colors.error }]}
            >
              <XIcon size={Sizes.iconSm} color={colors.primaryForeground} />
              <Text variant="subheadEmphasized" style={{ color: colors.primaryForeground }}>Cancel Booking</Text>
            </HapticPressable>
          ) : isActive && cancelCheck.reason ? (
            <View style={[styles.cancelDisabledRow, { backgroundColor: colors.surfaceSecondary }]}> 
              <Info size={Sizes.iconXs} color={colors.labelQuaternary} />
              <Text variant="subhead" style={styles.cancelDisabledText}>{cancelCheck.reason}</Text>
            </View>
          ) : null}
        </View>

        <Text variant="caption1" tone="muted" style={{ textAlign: 'center', marginTop: Spacing.md }}>
          Booked on {formatBookingDate(booking.createdAt)}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    minHeight: Sizes.iconLg * 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackContainer: {
    minHeight: Sizes.iconLg * 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  fallbackButton: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  headerWrap: {
    paddingHorizontal: Spacing.lg,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  heroImage: {
    width: Spacing['5xl'] + Spacing['3xl'],
    height: Spacing['5xl'] + Spacing.lg,
    borderRadius: Radius.md,
  },
  heroInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  heroAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  heroMeta: {
    flex: 1,
    gap: 2,
  },
  section: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
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
    gap: Spacing.xs,
  },
  partnerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  partnerHeaderText: {
    flex: 1,
    gap: Spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  actionIconWrap: {
    width: Sizes.actionButtonSm,
    height: Sizes.actionButtonSm,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.sm,
  },
  instructionRow: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    width: '100%',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  secondaryActionBtn: {
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