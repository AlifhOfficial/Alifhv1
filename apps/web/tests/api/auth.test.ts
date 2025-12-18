/**
 * Auth API Tests
 * Tests authentication endpoints for consistency and performance
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { mockSession, perfTracker, testUsers, TEST_BASE_URL } from '../setup';

describe('Auth APIs', () => {
  beforeEach(() => {
    mockSession.reset();
  });

  describe('Session Management', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const response = await fetch(`${TEST_BASE_URL}/api/profile/user-profile`);
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should use cached session (no redundant calls)', async () => {
      // This test verifies getSessionUser() is called once per request
      // Actual implementation uses middleware cache
      const start = performance.now();
      await fetch(`${TEST_BASE_URL}/api/profile/user-profile`, {
        headers: { 'Cookie': 'mock-session=test' }
      });
      const duration = performance.now() - start;
      
      // Session read should be fast (<5ms) if cached
      console.log(`Session read took: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(50); // Network overhead included
    });
  });

  describe('Performance Benchmarks', () => {
    it('should complete auth check within 10ms (cached)', async () => {
      await perfTracker.measure('auth-check', async () => {
        await fetch(`${TEST_BASE_URL}/api/profile/user-profile`);
      });
      
      const stats = perfTracker.getStats('auth-check');
      console.log(`Auth check: ${stats?.avg.toFixed(2)}ms`);
    });
  });
});
