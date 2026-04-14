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
  User,
  Users,
  FileText,
  Star,
  CircleX,
  Info,
  ExternalLink,
} from 'lucide-react-native';

import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useBookings } from '@/hooks/use-booking-query';
import { getAppThumbUrl } from '@/lib/config';
import { getSheetBottomPadding } from '@/lib/sheet-layout';
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

    if (endDate.getTime() <= startDate.getTime()) {
      endDate.setTime(startDate.getTime() + 30 * 60 * 1000);
    }

    const startISO = startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const endISO = endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startISO}/${endISO}&location=${encodeURIComponent(location || '')}&details=${encodeURIComponent(`Booking at ${b.partnerName}`)}`;

    const openGoogleCalendar = async () => {
      try {
        const canOpen = await Linking.canOpenURL(gcalUrl);
        if (!canOpen) {
          showAlert('Google Calendar unavailable', 'Unable to open Google Calendar on this device.');
          return;
        }
        await Linking.openURL(gcalUrl);
      } catch (err: any) {
        showAlert('Google Calendar unavailable', err?.message || 'Unable to open Google Calendar on this device.');
      }
    };

    const addToDeviceCalendar = async () => {
      try {
        const permission = await ExpoCalendar.requestCalendarPermissionsAsync();
        if (!permission.granted && permission.status !== 'granted') {
          showAlert('Permission required', 'Calendar access is needed to create the event.');
          return;
        }

        if (Platform.OS === 'ios') {
          const createEventInCalendarAsync = (ExpoCalendar as any).createEventInCalendarAsync;
          if (typeof createEventInCalendarAsync === 'function') {
            await createEventInCalendarAsync({
              title,
              startDate,
              endDate,
              location: location || undefined,
              notes: `Booking at ${b.partnerName}`,
            });
            return;
          }
        }

        const calendars = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
        const defaultCalendar =
          calendars.find((c) => c.isPrimary && c.allowsModifications) ||
          calendars.find((c) => c.accessLevel === 'owner') ||
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

    if (Platform.OS === 'ios') {
      void addToDeviceCalendar();
      return;
    }

    showAlert('Add to Calendar', 'Choose your calendar app', [
      { text: 'Google Calendar', onPress: () => void openGoogleCalendar() },
      { text: 'Device Calendar', onPress: () => void addToDeviceCalendar() },
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
  const hasNotes = booking.notes || booking.specialRequests;
  const hasVisitInfo = Boolean(
    isActive && settings && (settings.preparationInstructions || settings.directions || settings.parkingInstructions),
  );
  const handleOpenListing = () => {
    router.back();
    setTimeout(() => {
      router.push(`/listing/${booking.listingId}` as any);
    }, 200);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.scrollView, { backgroundColor: colors.sheet }]}
      contentContainerStyle={[styles.content, { paddingBottom: getSheetBottomPadding(insets.bottom) }]}
      showsVerticalScrollIndicator={false}
    >
      <SheetHeader title="Booking" />

        <HapticPressable
          onPress={handleOpenListing}
          style={[styles.heroCard, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}
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
            <Text variant={SheetTypography.rowLabelSelected} numberOfLines={2} style={{ color: colors.sheetLabel }}>
              {booking.listingTitle}
            </Text>
            {booking.listingPrice > 0 && (
              <Text variant="headline" tone="primary">{formatPrice(booking.listingPrice)}</Text>
            )}
            <View style={styles.heroMetaRow}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '1A' }]}>
                <Text variant="caption1Emphasized" style={{ color: statusColor }}>
                  {statusLabel}
                </Text>
              </View>
              {isActive && countdown ? <Text variant="footnote" tone="secondary">{countdown.text}</Text> : null}
            </View>
            <View style={styles.heroFooter}>
              <Text variant={SheetTypography.supporting} style={{ color: colors.sheetLabelMuted }}>
                Booked on {formatBookingDate(booking.createdAt)}
              </Text>
            </View>
          </View>
        </HapticPressable>

        <View style={[styles.section, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
          <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>Overview</Text>
          <View style={styles.detailRow}>
            <Info size={Sizes.iconSm} color={colors.labelSecondary} />
            <View style={styles.detailText}>
              <Text variant="caption1" tone="muted">Status</Text>
              <Text variant="subheadEmphasized" style={{ color: statusColor }}>{statusLabel}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.detailRow}>
            <Text variant="subheadEmphasized" style={[styles.refLabel, { color: colors.labelSecondary }]}>#</Text>
            <View style={styles.detailText}>
              <Text variant="caption1" tone="muted">Ref No.</Text>
              <Text variant="subheadEmphasized" numberOfLines={1} style={{ color: colors.label }}>
                {booking.confirmationToken || 'Not issued'}
              </Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.detailRow}>
            <Calendar1 size={Sizes.iconSm} color={colors.labelSecondary} />
            <View style={styles.detailText}>
              <Text variant="caption1" tone="muted">Date</Text>
              <Text variant="subhead">{formatBookingDate(booking.scheduledDate)}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.detailRow}>
            <Clock size={Sizes.iconSm} color={colors.labelSecondary} />
            <View style={styles.detailText}>
              <Text variant="caption1" tone="muted">Time</Text>
              <Text variant="subhead">{timeRange}</Text>
            </View>
          </View>
          {booking.numberOfAttendees > 1 ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.detailRow}>
                <Users size={Sizes.iconSm} color={colors.labelSecondary} />
                <View style={styles.detailText}>
                  <Text variant="caption1" tone="muted">Attendees</Text>
                  <Text variant="subhead">{booking.numberOfAttendees}</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>

        <View style={[styles.section, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
          <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>Dealer</Text>
          <View style={styles.partnerHeaderRow}>
            <BrandAvatar
              src={booking.partnerLogo}
              name={booking.partnerName || 'Dealer'}
              size="xl"
              backgroundColor={colors.fill2}
              ringColor={colors.border}
            />
            <View style={styles.partnerHeaderText}>
              <Text variant="caption1" tone="muted">Partner</Text>
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
                  <Text variant="caption1" tone="muted">Address</Text>
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
                  <Text variant="caption1" tone="muted">Contact</Text>
                  <Text variant="subhead">{settings.contactPersonName}</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>

        {hasNotes ? (
          <View style={[styles.section, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
            <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>Notes</Text>
            {booking.notes ? (
              <>
                <View style={styles.detailRow}>
                  <FileText size={Sizes.iconSm} color={colors.labelSecondary} />
                  <View style={styles.detailText}>
                    <Text variant="caption1" tone="muted">Booking note</Text>
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
                    <Text variant="caption1" tone="muted">Special request</Text>
                    <Text variant="subhead">{booking.specialRequests}</Text>
                  </View>
                </View>
              </>
            ) : null}
          </View>
        ) : null}

        {hasVisitInfo && settings ? (
          <View style={[styles.section, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
            <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>Visit info</Text>

            {settings.preparationInstructions ? (
              <View style={styles.instructionRow}>
                <Text variant="caption1" tone="muted">Preparation</Text>
                <Text variant="subhead">{settings.preparationInstructions}</Text>
              </View>
            ) : null}
            {settings.directions ? (
              <View style={styles.instructionRow}>
                <Text variant="caption1" tone="muted">Directions</Text>
                <Text variant="subhead">{settings.directions}</Text>
              </View>
            ) : null}
            {settings.parkingInstructions ? (
              <View style={styles.instructionRow}>
                <Text variant="caption1" tone="muted">Parking</Text>
                <Text variant="subhead">{settings.parkingInstructions}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {booking.status === 'cancelled' ? (
          <View style={[styles.section, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
            <View style={styles.sectionHeader}>
              <CircleX size={Sizes.iconXs} color={colors.error} />
              <Text variant="subheadEmphasized" style={{ color: colors.error }}>Cancelled</Text>
            </View>
            {(booking.cancellationNotes || booking.cancellationReason) ? (
              <View style={styles.instructionRow}>
                <Text variant="caption1" tone="muted">Reason</Text>
                <Text variant="subhead">{booking.cancellationNotes || booking.cancellationReason?.replace(/_/g, ' ')}</Text>
              </View>
            ) : null}
            {booking.cancelledAt ? (
              <View style={styles.instructionRow}>
                <Text variant="caption1" tone="muted">Cancelled on</Text>
                <Text variant="subhead">{formatBookingDate(booking.cancelledAt)}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {booking.status === 'rejected' && booking.rejectionReason ? (
          <View style={[styles.section, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
            <View style={styles.sectionHeader}>
              <CircleX size={Sizes.iconXs} color={colors.error} />
              <Text variant="subheadEmphasized" style={{ color: colors.error }}>Rejected</Text>
            </View>
            <View style={styles.instructionRow}>
              <Text variant="caption1" tone="muted">Reason</Text>
              <Text variant="subhead">{booking.rejectionReason}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.actions}>
          {isActive ? (
            <HapticPressable
              onPress={() => handleAddToCalendar(booking)}
              style={[styles.secondaryActionBtn, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}
            >
              <CalendarPlus size={Sizes.iconSm} color={colors.label} />
              <Text variant="subheadEmphasized" style={{ color: colors.label }}>Add to Calendar</Text>
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
              <CircleX size={Sizes.iconSm} color={colors.primaryForeground} />
              <Text variant="subheadEmphasized" style={{ color: colors.primaryForeground }}>Cancel Booking</Text>
            </HapticPressable>
          ) : isActive && cancelCheck.reason ? (
            <View style={[styles.cancelDisabledRow, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
              <Info size={Sizes.iconXs} color={colors.labelQuaternary} />
              <Text variant="subhead" style={styles.cancelDisabledText}>{cancelCheck.reason}</Text>
            </View>
          ) : null}
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SheetChrome.contentPaddingTop,
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
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
    paddingTop: SheetChrome.contentPaddingTop,
    gap: Spacing.md,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
    paddingVertical: SheetChrome.rowPaddingVertical,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderCurve: 'continuous',
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
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  heroFooter: {
    marginTop: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  refLabel: {
    width: Sizes.iconSm,
    textAlign: 'center',
  },
  section: {
    borderRadius: Radius.xl,
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
    paddingVertical: SheetChrome.rowPaddingVertical,
    gap: Spacing.sm,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.badgePaddingH,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  detailText: {
    flex: 1,
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
    borderCurve: 'continuous',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  cancelDisabledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  cancelDisabledText: {
    flex: 1,
    flexShrink: 1,
  },
});
