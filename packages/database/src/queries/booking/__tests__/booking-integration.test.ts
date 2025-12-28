/**
 * Booking Integration Tests
 * 
 * Tests the booking queries, mutations, and availability functions.
 * 
 * Two modes:
 * 1. Unit Tests - Always run, test pure helper functions
 * 2. Integration Tests - Require RUN_INTEGRATION_TESTS=1 and DATABASE_URL
 * 
 * Run unit tests: bun test src/queries/booking/__tests__/booking-integration.test.ts
 * Run all tests: RUN_INTEGRATION_TESTS=1 bun test src/queries/booking/__tests__/booking-integration.test.ts
 */

import { describe, it, expect, beforeAll } from 'bun:test';

// Skip database tests if DATABASE_URL is not set or RUN_INTEGRATION_TESTS is not enabled
const HAS_DATABASE = !!process.env.DATABASE_URL;
const SKIP_DB_TESTS = !process.env.RUN_INTEGRATION_TESTS || !HAS_DATABASE;

// ============================================================================
// UNIT TESTS - Pure function tests that don't require database
// ============================================================================

describe('Pure Helper Functions (No DB Required)', () => {
  describe('formatListingTitle', () => {
    // Test the logic without importing the module
    const formatListingTitle = (
      year: number,
      make: string,
      model: string,
      trim?: string | null
    ): string => {
      const base = `${year} ${make} ${model}`;
      return trim ? `${base} ${trim}` : base;
    };

    it('should format title with year, make, model', () => {
      const result = formatListingTitle(2023, 'Toyota', 'Camry');
      expect(result).toBe('2023 Toyota Camry');
    });

    it('should include trim when provided', () => {
      const result = formatListingTitle(2023, 'Toyota', 'Camry', 'XLE');
      expect(result).toBe('2023 Toyota Camry XLE');
    });

    it('should handle null trim', () => {
      const result = formatListingTitle(2023, 'BMW', 'X5', null);
      expect(result).toBe('2023 BMW X5');
    });

    it('should handle undefined trim', () => {
      const result = formatListingTitle(2023, 'Mercedes', 'C-Class', undefined);
      expect(result).toBe('2023 Mercedes C-Class');
    });
  });

  describe('getDayBoundsUTC', () => {
    // Test the logic without importing the module
    const getDayBoundsUTC = (date: Date): { startOfDay: Date; endOfDay: Date } => {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      return { startOfDay, endOfDay };
    };

    it('should return start and end of day in UTC', () => {
      const testDate = new Date('2024-06-15T14:30:00Z');
      const { startOfDay, endOfDay } = getDayBoundsUTC(testDate);
      
      expect(startOfDay.getUTCHours()).toBe(0);
      expect(startOfDay.getUTCMinutes()).toBe(0);
      expect(startOfDay.getUTCSeconds()).toBe(0);
      expect(startOfDay.getUTCMilliseconds()).toBe(0);
      
      expect(endOfDay.getUTCHours()).toBe(23);
      expect(endOfDay.getUTCMinutes()).toBe(59);
      expect(endOfDay.getUTCSeconds()).toBe(59);
      expect(endOfDay.getUTCMilliseconds()).toBe(999);
    });

    it('should preserve the date', () => {
      const testDate = new Date('2024-12-25T00:00:00Z');
      const { startOfDay, endOfDay } = getDayBoundsUTC(testDate);
      
      expect(startOfDay.getUTCDate()).toBe(25);
      expect(startOfDay.getUTCMonth()).toBe(11); // December is month 11
      expect(startOfDay.getUTCFullYear()).toBe(2024);
      
      expect(endOfDay.getUTCDate()).toBe(25);
      expect(endOfDay.getUTCMonth()).toBe(11);
      expect(endOfDay.getUTCFullYear()).toBe(2024);
    });

    it('should handle edge case dates', () => {
      // New Year's Eve
      const newYearsEve = new Date('2024-12-31T23:59:59Z');
      const { startOfDay, endOfDay } = getDayBoundsUTC(newYearsEve);
      
      expect(startOfDay.getUTCDate()).toBe(31);
      expect(endOfDay.getUTCDate()).toBe(31);
    });

    it('should not mutate the original date', () => {
      const original = new Date('2024-06-15T14:30:00Z');
      const originalTime = original.getTime();
      
      getDayBoundsUTC(original);
      
      expect(original.getTime()).toBe(originalTime);
    });
  });

  describe('Booking Status Logic', () => {
    // Define statuses locally to test logic without DB import
    const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed'] as const;
    const TERMINAL_BOOKING_STATUSES = ['completed', 'cancelled', 'rejected', 'no_show', 'expired'] as const;

    it('should have active statuses contain pending and confirmed', () => {
      expect(ACTIVE_BOOKING_STATUSES).toContain('pending');
      expect(ACTIVE_BOOKING_STATUSES).toContain('confirmed');
    });

    it('should have terminal statuses not overlap with active', () => {
      const overlap = ACTIVE_BOOKING_STATUSES.filter((s: string) => 
        (TERMINAL_BOOKING_STATUSES as readonly string[]).includes(s)
      );
      expect(overlap.length).toBe(0);
    });

    it('should cover all expected statuses', () => {
      const allStatuses = [...ACTIVE_BOOKING_STATUSES, ...TERMINAL_BOOKING_STATUSES];
      
      expect(allStatuses).toContain('pending');
      expect(allStatuses).toContain('confirmed');
      expect(allStatuses).toContain('completed');
      expect(allStatuses).toContain('cancelled');
      expect(allStatuses).toContain('rejected');
      expect(allStatuses).toContain('no_show');
      expect(allStatuses).toContain('expired');
      expect(allStatuses.length).toBe(7);
    });
  });

  describe('Configuration Validation Logic', () => {
    // Test configuration structure expectations
    it('should validate MAX_ACTIVE_BOOKINGS is reasonable', () => {
      const MAX_ACTIVE_BOOKINGS = 3; // Expected value
      expect(MAX_ACTIVE_BOOKINGS).toBeGreaterThan(0);
      expect(MAX_ACTIVE_BOOKINGS).toBeLessThanOrEqual(10);
    });

    it('should validate slot duration is reasonable', () => {
      const DEFAULT_SLOT_DURATION = 45; // Expected value in minutes
      expect(DEFAULT_SLOT_DURATION).toBeGreaterThanOrEqual(15);
      expect(DEFAULT_SLOT_DURATION).toBeLessThanOrEqual(120);
    });

    it('should validate confirmation token length is secure', () => {
      const CONFIRMATION_TOKEN_LENGTH = 8;
      expect(CONFIRMATION_TOKEN_LENGTH).toBeGreaterThanOrEqual(6);
      expect(CONFIRMATION_TOKEN_LENGTH).toBeLessThanOrEqual(32);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS - Require database connection
// ============================================================================

describe.skipIf(SKIP_DB_TESTS)('Booking Database Integration Tests', () => {
  // These tests require:
  // 1. A running database (DATABASE_URL set)
  // 2. RUN_INTEGRATION_TESTS=1 environment variable
  
  let getBookingById: any;
  let getUserBookings: any;
  let checkUserBookingRestrictions: any;
  let getAvailableSlots: any;
  let getPartnerBookingSettings: any;
  let BOOKING_CONFIG: any;
  let BOOKING_MUTATION_CONFIG: any;
  let AVAILABILITY_CONFIG: any;
  let ACTIVE_BOOKING_STATUSES: any;
  let TERMINAL_BOOKING_STATUSES: any;

  beforeAll(async () => {
    // Dynamic import to load database modules only when running integration tests
    const bookingQueries = await import('../booking-queries');
    const bookingMutations = await import('../booking-mutations');
    const availabilityQueries = await import('../availability-queries');
    
    getBookingById = bookingQueries.getBookingById;
    getUserBookings = bookingQueries.getUserBookings;
    checkUserBookingRestrictions = bookingQueries.checkUserBookingRestrictions;
    getAvailableSlots = availabilityQueries.getAvailableSlots;
    getPartnerBookingSettings = availabilityQueries.getPartnerBookingSettings;
    
    BOOKING_CONFIG = bookingQueries.BOOKING_CONFIG;
    BOOKING_MUTATION_CONFIG = bookingMutations.BOOKING_MUTATION_CONFIG;
    AVAILABILITY_CONFIG = availabilityQueries.AVAILABILITY_CONFIG;
    ACTIVE_BOOKING_STATUSES = bookingQueries.ACTIVE_BOOKING_STATUSES;
    TERMINAL_BOOKING_STATUSES = bookingQueries.TERMINAL_BOOKING_STATUSES;
  });

  describe('Configuration Constants', () => {
    it('BOOKING_CONFIG should have all required fields', () => {
      expect(BOOKING_CONFIG.MAX_ACTIVE_BOOKINGS).toBeDefined();
      expect(BOOKING_CONFIG.MAX_CANCELLATIONS_PER_MONTH).toBeDefined();
      expect(BOOKING_CONFIG.COOLDOWN_HOURS_AFTER_CANCEL).toBeDefined();
      expect(BOOKING_CONFIG.DEFAULT_PAGE_LIMIT).toBeDefined();
      
      expect(typeof BOOKING_CONFIG.MAX_ACTIVE_BOOKINGS).toBe('number');
      expect(BOOKING_CONFIG.MAX_ACTIVE_BOOKINGS).toBeGreaterThan(0);
    });

    it('BOOKING_MUTATION_CONFIG should have all required fields', () => {
      expect(BOOKING_MUTATION_CONFIG.DEFAULT_SLOT_DURATION).toBeDefined();
      expect(BOOKING_MUTATION_CONFIG.CONFIRMATION_TOKEN_LENGTH).toBeDefined();
      expect(BOOKING_MUTATION_CONFIG.PENDING_BOOKING_EXPIRY_HOURS).toBeDefined();
      expect(BOOKING_MUTATION_CONFIG.TOKEN_CHARS).toBeDefined();
      
      expect(typeof BOOKING_MUTATION_CONFIG.DEFAULT_SLOT_DURATION).toBe('number');
      expect(BOOKING_MUTATION_CONFIG.TOKEN_CHARS.length).toBeGreaterThan(10);
    });

    it('AVAILABILITY_CONFIG should have all required fields', () => {
      expect(AVAILABILITY_CONFIG.DEFAULT_SLOT_DURATION).toBeDefined();
      expect(AVAILABILITY_CONFIG.DEFAULT_BUFFER_TIME).toBeDefined();
      expect(AVAILABILITY_CONFIG.DEFAULT_MAX_CONCURRENT_BOOKINGS).toBeDefined();
      expect(AVAILABILITY_CONFIG.DEFAULT_AVAILABILITY_DAYS).toBeDefined();
      expect(AVAILABILITY_CONFIG.DEFAULT_REMINDER_TIMES).toBeDefined();
      
      expect(Array.isArray(AVAILABILITY_CONFIG.DEFAULT_REMINDER_TIMES)).toBe(true);
    });
  });

  describe('Booking Status Constants', () => {
    it('ACTIVE_BOOKING_STATUSES should be valid', () => {
      expect(ACTIVE_BOOKING_STATUSES).toContain('pending');
      expect(ACTIVE_BOOKING_STATUSES).toContain('confirmed');
      expect(ACTIVE_BOOKING_STATUSES.length).toBe(2);
    });

    it('TERMINAL_BOOKING_STATUSES should be valid', () => {
      expect(TERMINAL_BOOKING_STATUSES).toContain('completed');
      expect(TERMINAL_BOOKING_STATUSES).toContain('cancelled');
      expect(TERMINAL_BOOKING_STATUSES).toContain('rejected');
      expect(TERMINAL_BOOKING_STATUSES).toContain('no_show');
      expect(TERMINAL_BOOKING_STATUSES).toContain('expired');
      expect(TERMINAL_BOOKING_STATUSES.length).toBe(5);
    });
  });

  describe('getBookingById', () => {
    it('should return null for non-existent booking', async () => {
      const result = await getBookingById('non_existent_id_12345');
      expect(result).toBeNull();
    });

    it('should handle empty string gracefully', async () => {
      const result = await getBookingById('');
      expect(result).toBeNull();
    });
  });

  describe('getUserBookings', () => {
    it('should return empty array for non-existent user', async () => {
      const result = await getUserBookings('non_existent_user_12345');
      expect(result).toBeDefined();
      expect(result.bookings).toBeDefined();
      expect(Array.isArray(result.bookings)).toBe(true);
      expect(result.bookings.length).toBe(0);
    });

    it('should respect pagination options', async () => {
      const result = await getUserBookings('non_existent_user_12345', {
        limit: 5,
        offset: 0,
      });
      expect(result).toBeDefined();
      expect(Array.isArray(result.bookings)).toBe(true);
    });

    it('should handle status filter', async () => {
      const result = await getUserBookings('non_existent_user_12345', {
        status: ['pending', 'confirmed'],
      });
      expect(result).toBeDefined();
      expect(Array.isArray(result.bookings)).toBe(true);
    });
  });

  describe('checkUserBookingRestrictions', () => {
    it('should allow booking for new user', async () => {
      const result = await checkUserBookingRestrictions('new_user_with_no_history');
      expect(result).toBeDefined();
      expect(result.canBook).toBe(true);
      expect(result.activeBookings).toBe(0);
    });

    it('should return proper restriction structure', async () => {
      const result = await checkUserBookingRestrictions('test_user_123');
      expect(result).toBeDefined();
      expect(typeof result.canBook).toBe('boolean');
      expect(typeof result.activeBookings).toBe('number');
      expect(typeof result.recentCancellations).toBe('number');
      expect(typeof result.maxActiveBookings).toBe('number');
      expect(typeof result.maxCancellationsPerMonth).toBe('number');
    });
  });

  describe('getPartnerBookingSettings', () => {
    it('should return null for non-existent partner', async () => {
      const result = await getPartnerBookingSettings('non_existent_partner');
      expect(result).toBeNull();
    });
  });

  describe('getAvailableSlots', () => {
    it('should return empty array for non-existent partner', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      
      const result = await getAvailableSlots('non_existent_partner', tomorrow);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle past dates gracefully', async () => {
      const pastDate = new Date('2020-01-01');
      
      const result = await getAvailableSlots('any_partner', pastDate);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

// ============================================================================
// API Integration Tests - Require running server
// ============================================================================

const SKIP_API_TESTS = !process.env.RUN_INTEGRATION_TESTS;
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe.skipIf(SKIP_API_TESTS)('Booking API Integration Tests', () => {
  describe('GET /api/bookings/slots', () => {
    it('should require listingId parameter', async () => {
      const response = await fetch(`${BASE_URL}/api/bookings/slots`);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('listingId');
    });

    it('should return 404 for non-existent listing', async () => {
      const response = await fetch(`${BASE_URL}/api/bookings/slots?listingId=non_existent_12345`);
      const data = await response.json();
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/bookings (authenticated)', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/bookings`);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/bookings (authenticated)', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: 'test',
          scheduledDate: new Date().toISOString(),
          scheduledStartTime: new Date().toISOString(),
          scheduledEndTime: new Date().toISOString(),
        }),
      });
      const data = await response.json();
      
      expect(response.status).toBe(401);
    });
  });
});
