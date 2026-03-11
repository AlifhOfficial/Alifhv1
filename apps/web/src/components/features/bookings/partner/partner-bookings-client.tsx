/**
 * Partner Bookings Client Component
 * Minimal macOS-inspired design with server-side filtering
 */

'use client';

import { UserAvatar } from "@/components/ui/data-display/user-avatar";
import { Combobox } from "@/components/ui/forms/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Box, RefreshCw, Search, ChevronLeft, ChevronRight, Calendar, X, Phone, Mail, User, Clock, Users, Hash, MessageSquare, FileText, XCircle, ChevronDown, ImageIcon, Copy, Check } from "lucide-react";
import { useMemo, useState, useEffect, useCallback, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "@/utils";
import { getThumbUrl } from "@/utils/storage";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const BOOKING_TIME_ZONE = 'Asia/Dubai';

interface PartnerBookingsClientProps {
  partnerId: string;
  partnerName: string;
  userRole?: string;
  initialTeamMembers: TeamMember[];
  initialData: {
    bookings: BookingData[];
    total: number;
    stats: BookingStats | null;
  };
  filters: {
    status: StatusFilter;
    page: number;
    q: string;
    staffUserId: string;
  };
}

interface BookingData {
  id: string;
  status: string;
  source?: string;
  scheduledDate: string;
  scheduledStartTime: Date;
  scheduledEndTime?: Date;
  userName: string;
  userEmail: string;
  userPhone?: string | null;
  listingTitle: string;
  listingThumbnail: string | null;
  listingMake?: string;
  listingModel?: string;
  listingYear?: number;
  listingPrice?: number;
  listingId?: string;
  staffUserId?: string | null;
  staffName?: string | null;
  staffAvatar?: string | null;
  confirmationToken?: string;
  numberOfAttendees?: number;
  notes?: string | null;
  specialRequests?: string | null;
  partnerNotes?: string | null;
  confirmedAt?: string | null;
  confirmedBy?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  createdAt: Date;
  cancellationReason?: string | null;
  cancellationNotes?: string | null;
  rejectionReason?: string | null;
}

interface BookingStats {
  // API field names
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  rejected: number;
  noShow: number;
  todayCount: number;
  upcomingCount: number;
}

interface TeamMember {
  id: string;
  userId: string;
  status: 'active' | 'left';
  displayName: string;
  username: string;
  avatar: string | null;
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected' | 'no_show';

// Normalize status values from API to our filter keys
const normalizeStatus = (status: string): StatusFilter => {
  const normalized = status.toLowerCase().replace(/[-\s]/g, '_');
  if (['pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'no_show'].includes(normalized)) {
    return normalized as StatusFilter;
  }
  return 'pending'; // fallback
};

const STATUS_CONFIG: Record<StatusFilter, { label: string; color: string; bg: string }> = {
  all: { label: 'All', color: 'text-foreground', bg: 'bg-secondary' },
  pending: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
  confirmed: { label: 'Confirmed', color: 'text-green-600', bg: 'bg-green-500/10' },
  completed: { label: 'Completed', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-500/10' },
  rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-500/10' },
  no_show: { label: 'No Show', color: 'text-red-600', bg: 'bg-red-500/10' },
};

const ITEMS_PER_PAGE = 20;

export function PartnerBookingsClient({ 
  partnerId: _partnerId, 
  partnerName,
  userRole: _userRole,
  initialTeamMembers,
  initialData,
  filters,
}: PartnerBookingsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(filters.q);
  
  // UI state
  const [error, setError] = useState<string | null>(null);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const bookings = initialData.bookings;
  const totalBookings = initialData.total;
  const stats = initialData.stats;
  const teamMembers = initialTeamMembers;
  const selectedStaffFilter = filters.staffUserId;
  const statusFilter = filters.status;
  const debouncedSearch = filters.q;
  const currentPage = filters.page;
  const isLoading = isPending;
  const isRefreshing = isPending;

  useEffect(() => {
    setSearchQuery(filters.q);
  }, [filters.q]);

  const updateRoute = useCallback((updates: Partial<PartnerBookingsClientProps['filters']>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    const nextStatus = updates.status ?? statusFilter;
    const nextPage = updates.page ?? currentPage;
    const nextQuery = updates.q ?? debouncedSearch;
    const nextStaffUserId = updates.staffUserId ?? selectedStaffFilter;

    if (nextStatus === 'all') params.delete('status');
    else params.set('status', nextStatus);

    if (nextPage <= 1) params.delete('page');
    else params.set('page', String(nextPage));

    if (!nextQuery.trim()) params.delete('q');
    else params.set('q', nextQuery.trim());

    if (!nextStaffUserId || nextStaffUserId === 'all') params.delete('staffUserId');
    else params.set('staffUserId', nextStaffUserId);

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }, [searchParams, statusFilter, currentPage, debouncedSearch, selectedStaffFilter, pathname, router]);

  // Debounced search handler
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    updateRoute({ q: value, page: 1 });
  }, 400);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);

  const handleStaffFilterChange = useCallback((value: string) => {
    setError(null);
    updateRoute({ staffUserId: value, page: 1 });
  }, [updateRoute]);

  const handleStatusFilterChange = useCallback((value: StatusFilter) => {
    setError(null);
    updateRoute({ status: value, page: 1 });
  }, [updateRoute]);

  // Create a Map for O(1) team member lookups
  const teamMemberMap = useMemo(() => {
    const map = new Map<string, TeamMember>();
    teamMembers.forEach(m => map.set(m.userId, m));
    return map;
  }, [teamMembers]);

  // Calculate all staff data including those with 0 bookings
  // Note: We no longer have all bookings, so we just use team members
  const allStaffData = useMemo(() => {
    // For server-side filtering, we build staff list from team members only
    const allStaff = teamMembers
      .filter(m => m.status === 'active')
      .map(m => ({
        staffUserId: m.userId,
        staffName: m.displayName,
        bookingCount: 0, // We don't track counts with server-side filtering
        isActive: true,
        avatar: m.avatar,
      }));
    
    return { allStaff, activeStaff: allStaff, staffWithBookings: [] };
  }, [teamMembers]);

  // Derived values
  const allStaffForDisplay = allStaffData.allStaff;

  // Pagination is now server-side - calculate total pages from server total
  const totalPages = Math.ceil(totalBookings / ITEMS_PER_PAGE);

  // Main tabs always shown in tab bar
  const mainStatusTabs = useMemo(() => [
    { key: 'all' as const, label: 'All', count: stats?.total ?? 0 },
    { key: 'pending' as const, label: 'Pending', count: stats?.pending ?? 0 },
    { key: 'confirmed' as const, label: 'Confirmed', count: stats?.confirmed ?? 0 },
    { key: 'completed' as const, label: 'Completed', count: stats?.completed ?? 0 },
  ], [stats]);

  // Secondary statuses in dropdown (less frequently accessed)
  const allSecondaryTabs = useMemo(() => [
    { key: 'cancelled' as const, label: 'Cancelled', count: stats?.cancelled ?? 0 },
    { key: 'rejected' as const, label: 'Rejected', count: stats?.rejected ?? 0 },
    { key: 'no_show' as const, label: 'No Show', count: stats?.noShow ?? 0 },
  ], [stats]);
  const secondaryStatusTabs = useMemo(() => allSecondaryTabs.filter(tab => tab.count > 0), [allSecondaryTabs]);

  // Check if current selection is a secondary status
  const isSecondaryStatusSelected = secondaryStatusTabs.some(tab => tab.key === statusFilter);
  const selectedSecondaryTab = secondaryStatusTabs.find(tab => tab.key === statusFilter);

  // Staff options for combobox
  const staffOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Staff' }];
    allStaffForDisplay.forEach(staff => {
      options.push({
        value: staff.staffUserId,
        label: staff.staffName,
      });
    });
    return options;
  }, [allStaffForDisplay]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setError(null);
    setSearchQuery('');
    updateRoute({
      staffUserId: 'all',
      status: 'all',
      q: '',
      page: 1,
    });
  }, [updateRoute]);

  const hasActiveFilters = selectedStaffFilter !== 'all' || statusFilter !== 'all' || debouncedSearch.trim() !== '';

  // Format date helper
  const formatBookingDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (d.toDateString() === today.toDateString()) {
      return { label: 'Today', isToday: true, isTomorrow: false };
    }
    if (d.toDateString() === tomorrow.toDateString()) {
      return { label: 'Tomorrow', isToday: false, isTomorrow: true };
    }
    return { 
      label: d.toLocaleDateString('en-AE', { weekday: 'short', month: 'short', day: 'numeric', timeZone: BOOKING_TIME_ZONE }), 
      isToday: false,
      isTomorrow: false,
    };
  };

  const formatTime = (isoString: string | Date) => {
    return new Date(isoString).toLocaleTimeString('en-AE', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: BOOKING_TIME_ZONE,
    });
  };

  const copyToken = async (token: string) => {
    await navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-foreground">Bookings</h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-0.5">{partnerName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.refresh()}
            disabled={isRefreshing}
            className="p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Row 1: Search + Staff */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-9 sm:h-10 pl-10 pr-8 rounded-lg sm:rounded-xl bg-secondary/50 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Staff Combobox */}
        {allStaffForDisplay.length > 0 && (
          <div className="w-full sm:w-48">
            <Combobox
              options={staffOptions}
              value={selectedStaffFilter}
              onValueChange={handleStaffFilterChange}
              placeholder="All Staff"
              searchPlaceholder="Search staff..."
              className="h-9 sm:h-10 rounded-lg sm:rounded-xl bg-secondary/50 border-0"
            />
          </div>
        )}
        </div>

        {/* Row 2: Status Pills - Horizontal scroll on mobile */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl w-fit">
          {mainStatusTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleStatusFilterChange(tab.key)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.key !== 'all' && tab.count > 0 && (
                  <span className="ml-1 sm:ml-1.5 text-muted-foreground">{tab.count}</span>
                )}
              </button>
            );
          })}
          
          {/* More dropdown for secondary statuses */}
          {secondaryStatusTabs.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition-all flex items-center gap-1 whitespace-nowrap ${
                    isSecondaryStatusSelected
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isSecondaryStatusSelected && selectedSecondaryTab ? (
                    <>
                      {selectedSecondaryTab.label}
                      <span className="text-muted-foreground">{selectedSecondaryTab.count}</span>
                    </>
                  ) : (
                    <>More</>
                  )}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                {secondaryStatusTabs.map((tab) => (
                  <DropdownMenuItem
                    key={tab.key}
                    onClick={() => handleStatusFilterChange(tab.key)}
                    className={`text-xs cursor-pointer ${
                      statusFilter === tab.key ? 'bg-secondary' : ''
                    }`}
                  >
                    <span className="flex-1">{tab.label}</span>
                    <span className="text-muted-foreground ml-2">{tab.count}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20">
          <p className="text-xs sm:text-sm text-destructive font-medium">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex gap-4">
                {/* Image skeleton */}
                <Skeleton className="w-28 sm:w-36 aspect-[4/3] rounded-lg flex-shrink-0" />
                
                {/* Content skeleton */}
                <div className="flex-1 min-w-0 flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-3.5 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  
                  {/* Date/Time row */}
                  <div className="flex items-center gap-3 mt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  
                  {/* Code + Staff row */}
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bookings List */}
      {!isLoading && !error && bookings.length > 0 && (
        <>
          {/* Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-muted-foreground">
              {totalBookings} booking{totalBookings !== 1 ? 's' : ''}
              {hasActiveFilters && ` (filtered)`}
            </p>
            {totalPages > 1 && (
              <p className="text-xs text-muted-foreground">{currentPage} / {totalPages}</p>
            )}
          </div>

          {/* List */}
          <div className="space-y-1">
            {bookings.map((booking) => {
              const normalizedStatus = normalizeStatus(booking.status);
              const statusConfig = STATUS_CONFIG[normalizedStatus];
              const teamMember = booking.staffUserId ? teamMemberMap.get(booking.staffUserId) : null;
              const dateInfo = formatBookingDate(booking.scheduledStartTime);
              const isExpanded = expandedBooking === booking.id;
              const isCancelledOrRejected = normalizedStatus === 'cancelled' || normalizedStatus === 'rejected';
              
              return (
                <div
                  key={booking.id}
                  className="group relative"
                >
                  {/* Main Card - Overview */}
                  <div className="flex gap-4 p-4">
                    {/* Image */}
                    <div className="relative w-28 sm:w-36 aspect-[4/3] flex-shrink-0 overflow-hidden rounded-lg bg-muted/20">
                      {booking.listingThumbnail ? (
                        <img
                          src={getThumbUrl(booking.listingThumbnail) || booking.listingThumbnail}
                          alt={booking.listingTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/30">
                          <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-foreground tracking-tight line-clamp-1">
                            {booking.listingTitle || `${booking.listingYear || ''} ${booking.listingMake || ''} ${booking.listingModel || ''}`.trim() || 'Vehicle'}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{booking.userName}</span>
                            {booking.numberOfAttendees && booking.numberOfAttendees > 1 && (
                              <span className="text-xs text-muted-foreground/60">+{booking.numberOfAttendees - 1}</span>
                            )}
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                          statusConfig?.bg || 'bg-muted',
                          statusConfig?.color || 'text-muted-foreground'
                        )}>
                          {statusConfig?.label || booking.status}
                        </span>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-3 text-xs mt-2">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className={cn(
                            "font-medium",
                            dateInfo.isToday ? "text-yellow-600" : "text-foreground"
                          )}>
                            {dateInfo.label}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-medium text-foreground tabular-nums">
                            {formatTime(booking.scheduledStartTime)}
                          </span>
                        </span>
                        {booking.listingPrice && (
                          <span className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
                            <span className="text-xs">AED</span>
                            <span className="font-medium text-foreground tabular-nums">
                              {booking.listingPrice.toLocaleString()}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Code + Staff (compact) */}
                      <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                        {booking.confirmationToken && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToken(booking.confirmationToken!);
                            }}
                            className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                            title="Copy booking code"
                          >
                            <span>#{booking.confirmationToken}</span>
                            {copiedToken === booking.confirmationToken ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        )}
                        {booking.staffName && (
                          <span className={cn(
                            "text-xs text-muted-foreground truncate",
                            teamMember?.status === 'left' && "opacity-50"
                          )}>
                            {booking.staffName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details Toggle */}
                  <button
                    onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-t border-border/20"
                  >
                    <span>{isExpanded ? 'Hide details' : 'View details'}</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-180")} />
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 space-y-5 animate-in slide-in-from-top-2 duration-200 border-t border-border/20 bg-muted/10">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Contact Info */}
                        <div className="space-y-3">
                          <p className="text-xs font-medium text-muted-foreground">Contact</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">{booking.userName}</span>
                              {booking.numberOfAttendees && booking.numberOfAttendees > 1 && (
                                <span className="text-xs text-muted-foreground">(+{booking.numberOfAttendees - 1} guests)</span>
                              )}
                            </div>
                            <a 
                              href={`mailto:${booking.userEmail}`}
                              className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                            >
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              {booking.userEmail}
                            </a>
                            {booking.userPhone && (
                              <a 
                                href={`tel:${booking.userPhone}`}
                                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                              >
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                {booking.userPhone}
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Booking Info */}
                        <div className="space-y-3">
                          <p className="text-xs font-medium text-muted-foreground">Booking Info</p>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5">Date & Time</p>
                              <p className="text-sm font-medium text-foreground">
                                {dateInfo.label}, {formatTime(booking.scheduledStartTime)}
                                {booking.scheduledEndTime && ` – ${formatTime(booking.scheduledEndTime)}`}
                              </p>
                            </div>
                            {booking.confirmationToken && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Confirmation Code</p>
                                <button
                                  onClick={() => copyToken(booking.confirmationToken!)}
                                  className="flex items-center gap-1.5 text-sm font-mono font-medium text-foreground hover:text-primary transition-colors"
                                >
                                  {booking.confirmationToken}
                                  {copiedToken === booking.confirmationToken ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 opacity-50 hover:opacity-100 transition-opacity" />
                                  )}
                                </button>
                              </div>
                            )}
                            {booking.listingPrice && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Vehicle Price</p>
                                <p className="text-sm font-medium text-foreground">AED {booking.listingPrice.toLocaleString()}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5">Assigned Staff</p>
                              <p className={cn(
                                "text-sm font-medium",
                                booking.staffName ? "text-foreground" : "text-muted-foreground/60"
                              )}>
                                {booking.staffName || 'Unassigned'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes & Requests */}
                      {(booking.notes || booking.specialRequests) && (
                        <div className="space-y-4">
                          {booking.notes && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Customer Notes</p>
                              <p className="text-sm text-foreground leading-relaxed">{booking.notes}</p>
                            </div>
                          )}
                          {booking.specialRequests && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Special Requests</p>
                              <p className="text-sm text-foreground leading-relaxed">{booking.specialRequests}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Cancellation Reason */}
                      {(booking.cancellationReason || booking.cancellationNotes) && (
                        <div className="p-4 rounded-lg bg-destructive/5">
                          <p className="text-xs font-medium text-destructive mb-1">
                            Cancelled by {booking.cancelledBy || 'unknown'}
                          </p>
                          <p className="text-sm text-foreground">
                            {booking.cancellationNotes || booking.cancellationReason?.replace(/_/g, ' ')}
                          </p>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {booking.rejectionReason && (
                        <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                          <p className="text-xs font-medium text-red-500 mb-1">Rejection Reason</p>
                          <p className="text-sm text-foreground">{booking.rejectionReason}</p>
                        </div>
                      )}

                      {/* Metadata Footer */}
                      <div className="pt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground/60">
                        <span>
                          Booked {new Date(booking.createdAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {booking.source && ` via ${booking.source}`}
                        </span>
                        {booking.confirmedAt && (
                          <span className="text-green-600/80">
                            Confirmed {new Date(booking.confirmedAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-12">
              <button
                onClick={() => updateRoute({ page: Math.max(1, currentPage - 1) })}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateRoute({ page: pageNum })}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                      currentPage === pageNum
                        ? 'bg-secondary text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => updateRoute({ page: Math.min(totalPages, currentPage + 1) })}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty - No Data */}
      {!isLoading && !error && !hasActiveFilters && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
          <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <Calendar className="w-4 h-4 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground">No bookings yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Customer appointments will appear here</p>
        </div>
      )}

      {/* Empty - No Results */}
      {!isLoading && !error && hasActiveFilters && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
          <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <Search className="w-4 h-4 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground">No results found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try a different search or filter</p>
          <button
            onClick={clearFilters}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
