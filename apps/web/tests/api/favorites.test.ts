/**
 * Favorites & Superlikes API Tests
 * Tests favorite/superlike endpoints for auth, rate limits, and consistency
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { mockSession, testUsers, TEST_BASE_URL } from '../setup';

describe('Favorites & Superlikes APIs', () => {
  beforeEach(() => {
    mockSession.reset();
  });

  describe('GET /api/favorites', () => {
    it('should allow guests (returns empty arrays)', async () => {
      const response = await fetch(`${TEST_BASE_URL}/api/favorites`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.favorites).toEqual([]);
      expect(data.superlikes).toEqual([]);
    });

    it('should have no-cache headers (user-specific)', async () => {
      const response = await fetch(`${TEST_BASE_URL}/api/favorites`);
      const cacheControl = response.headers.get('Cache-Control');
      
      expect(cacheControl).toContain('no-cache');
      expect(cacheControl).toContain('private');
      console.log(`Favorites Cache-Control: ${cacheControl}`);
    });
  });

  describe('POST /api/favorites', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${TEST_BASE_URL}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: 'test_listing' })
      });
      
      expect(response.status).toBe(401);
    });

    it('should check auth before validating input', async () => {
      const response = await fetch(`${TEST_BASE_URL}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Missing listingId
      });
      
      // Auth check happens first (correct pattern)
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/superlikes', () => {
    it('should allow guests (returns empty data)', async () => {
      const response = await fetch(`${TEST_BASE_URL}/api/superlikes`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('quota');
      expect(data.quota.remaining).toBe(0); // Guest quota
    });

    it('should support includeStatuses param', async () => {
      const response = await fetch(`${TEST_BASE_URL}/api/superlikes?includeStatuses=true`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      // For guests, favorites/superlikes should be undefined or empty
      expect(data).toHaveProperty('quota');
    });

    it('should have no-cache headers', async () => {
      const response = await fetch(`${TEST_BASE_URL}/api/superlikes`);
      const cacheControl = response.headers.get('Cache-Control');
      
      expect(cacheControl).toContain('no-cache');
      console.log(`Superlikes Cache-Control: ${cacheControl}`);
    });
  });

  describe('POST /api/superlikes', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${TEST_BASE_URL}/api/superlikes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: 'test_listing' })
      });
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.requiresAuth).toBe(true);
    });

    it('should check auth before validating input', async () => {
      const response = await fetch(`${TEST_BASE_URL}/api/superlikes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Missing listingId
      });
      
      // Auth check happens first (correct pattern)
      expect(response.status).toBe(401);
    });

    // Note: Testing quota limit (429) would require authenticated session
    // and multiple requests, skipping in basic tests
  });
});
