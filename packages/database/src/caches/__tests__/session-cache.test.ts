/**
 * Session Cache Tests
 * 
 * Comprehensive tests for the session cache implementation including:
 * - Basic cache operations (get/set/delete)
 * - Token-to-user mapping for invalidation
 * - User session invalidation (single and batch)
 * - Speed/performance benchmarks
 * - Consistency tests under concurrent access
 * 
 * Run with: bun test packages/database/src/caches/__tests__/session-cache.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { 
  memoryCache, 
  sessionCache, 
  invalidateUserSessions, 
  CacheKeys, 
  CacheTTL,
  setSessionCacheInvalidator,
  invalidateUserSession,
} from '../index';

// Mock user session data
interface MockExtendedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  banned: boolean;
  hasPartnerAccess: boolean;
  isAlifhAdmin: boolean;
  partnerMemberships: Array<{ partnerId: string; staffRole: string }>;
}

function createMockUser(id: string, overrides?: Partial<MockExtendedUser>): MockExtendedUser {
  return {
    id,
    email: `user_${id}@test.com`,
    name: `Test User ${id}`,
    role: 'user',
    banned: false,
    hasPartnerAccess: false,
    isAlifhAdmin: false,
    partnerMemberships: [],
    ...overrides,
  };
}

describe('Session Cache', () => {
  beforeEach(() => {
    memoryCache.clear();
    memoryCache.resetStats();
  });

  describe('Basic Operations', () => {
    it('should set and get session data', () => {
      const user = createMockUser('user_1');
      const key = CacheKeys.userSession(user.id);
      
      sessionCache.set(key, user, CacheTTL.userSession);
      const result = sessionCache.get<MockExtendedUser>(key);
      
      expect(result).not.toBeNull();
      expect(result?.id).toBe('user_1');
      expect(result?.email).toBe('user_user_1@test.com');
    });

    it('should return null for non-existent session', () => {
      const result = sessionCache.get('nonexistent:session');
      expect(result).toBeNull();
    });

    it('should delete session data', () => {
      const user = createMockUser('user_2');
      const key = CacheKeys.userSession(user.id);
      
      sessionCache.set(key, user, 60);
      expect(sessionCache.get(key)).not.toBeNull();
      
      sessionCache.delete(key);
      expect(sessionCache.get(key)).toBeNull();
    });

    it('should use correct TTL (5 minutes = 300 seconds)', () => {
      expect(CacheTTL.userSession).toBe(300);
    });
  });

  describe('Token-to-User Mapping', () => {
    it('should cache by token and register userId mapping', () => {
      const user = createMockUser('user_token_1');
      const tokenKey = 'token:abc123def456';
      
      sessionCache.setWithMapping(tokenKey, user, user.id, CacheTTL.userSession);
      
      // Should be retrievable by token
      const result = sessionCache.get<MockExtendedUser>(tokenKey);
      expect(result?.id).toBe('user_token_1');
    });

    it('should invalidate all token caches when invalidating by userId', () => {
      const user = createMockUser('user_multi_token');
      
      // Simulate multiple tokens for same user (different devices/sessions)
      const token1 = 'token:device1_abc';
      const token2 = 'token:device2_xyz';
      const token3 = 'token:device3_123';
      
      sessionCache.setWithMapping(token1, user, user.id);
      sessionCache.setWithMapping(token2, user, user.id);
      sessionCache.setWithMapping(token3, user, user.id);
      
      // Also cache by userId key (as done in customSession)
      const userKey = CacheKeys.userSession(user.id);
      sessionCache.set(userKey, user);
      
      // Verify all caches exist
      expect(sessionCache.get(token1)).not.toBeNull();
      expect(sessionCache.get(token2)).not.toBeNull();
      expect(sessionCache.get(token3)).not.toBeNull();
      expect(sessionCache.get(userKey)).not.toBeNull();
      
      // Invalidate by userId - should clear ALL caches
      invalidateUserSessions(user.id);
      
      // All should be cleared
      expect(sessionCache.get(token1)).toBeNull();
      expect(sessionCache.get(token2)).toBeNull();
      expect(sessionCache.get(token3)).toBeNull();
      expect(sessionCache.get(userKey)).toBeNull();
    });

    it('should not affect other users when invalidating one user', () => {
      const user1 = createMockUser('user_1');
      const user2 = createMockUser('user_2');
      
      const token1 = 'token:user1_session';
      const token2 = 'token:user2_session';
      
      sessionCache.setWithMapping(token1, user1, user1.id);
      sessionCache.setWithMapping(token2, user2, user2.id);
      
      // Invalidate user1
      invalidateUserSessions(user1.id);
      
      // User1 should be cleared
      expect(sessionCache.get(token1)).toBeNull();
      
      // User2 should still exist
      expect(sessionCache.get(token2)).not.toBeNull();
    });
  });

  describe('Auth Cache Invalidator Integration', () => {
    it('should trigger invalidation via setSessionCacheInvalidator', () => {
      const user = createMockUser('user_callback');
      const userKey = CacheKeys.userSession(user.id);
      const tokenKey = 'token:callback_test';
      
      // Set up the callback (this is done at app startup)
      setSessionCacheInvalidator((key) => {
        const match = key.match(/^user:(.+):session$/);
        if (match) {
          invalidateUserSessions(match[1]);
        } else {
          sessionCache.delete(key);
        }
      });
      
      // Cache session data
      sessionCache.set(userKey, user);
      sessionCache.setWithMapping(tokenKey, user, user.id);
      
      expect(sessionCache.get(userKey)).not.toBeNull();
      expect(sessionCache.get(tokenKey)).not.toBeNull();
      
      // Trigger invalidation via the auth-cache module
      invalidateUserSession(user.id);
      
      // Both should be cleared (async, but synchronous in our implementation)
      // Give a small delay for the fire-and-forget pattern
      expect(sessionCache.get(userKey)).toBeNull();
      expect(sessionCache.get(tokenKey)).toBeNull();
    });
  });

  describe('TTL Expiration', () => {
    it('should expire session after TTL', async () => {
      const user = createMockUser('user_expire');
      const key = CacheKeys.userSession(user.id);
      
      // Set with 1 second TTL
      sessionCache.set(key, user, 1);
      expect(sessionCache.get(key)).not.toBeNull();
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(sessionCache.get(key)).toBeNull();
    });

    it('should expire token-mapped session after TTL', async () => {
      const user = createMockUser('user_token_expire');
      const tokenKey = 'token:expire_test';
      
      sessionCache.setWithMapping(tokenKey, user, user.id, 1); // 1 second TTL
      expect(sessionCache.get(tokenKey)).not.toBeNull();
      
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(sessionCache.get(tokenKey)).toBeNull();
    });
  });
});

describe('Session Cache Performance', () => {
  beforeEach(() => {
    memoryCache.clear();
    memoryCache.resetStats();
  });

  describe('Speed Benchmarks', () => {
    it('should handle 10,000 cache writes in < 100ms', () => {
      const iterations = 10_000;
      const users = Array.from({ length: iterations }, (_, i) => createMockUser(`perf_${i}`));
      
      const startWrite = performance.now();
      for (let i = 0; i < iterations; i++) {
        const key = CacheKeys.userSession(users[i].id);
        sessionCache.set(key, users[i], CacheTTL.userSession);
      }
      const writeTime = performance.now() - startWrite;
      
      console.log(`📝 Write: ${iterations} entries in ${writeTime.toFixed(2)}ms (${(iterations / writeTime * 1000).toFixed(0)} ops/sec)`);
      expect(writeTime).toBeLessThan(100);
    });

    it('should handle 10,000 cache reads in < 50ms', () => {
      const iterations = 10_000;
      
      // Pre-populate cache
      for (let i = 0; i < iterations; i++) {
        const user = createMockUser(`read_${i}`);
        sessionCache.set(CacheKeys.userSession(user.id), user, CacheTTL.userSession);
      }
      
      const startRead = performance.now();
      for (let i = 0; i < iterations; i++) {
        sessionCache.get(CacheKeys.userSession(`read_${i}`));
      }
      const readTime = performance.now() - startRead;
      
      console.log(`📖 Read: ${iterations} entries in ${readTime.toFixed(2)}ms (${(iterations / readTime * 1000).toFixed(0)} ops/sec)`);
      expect(readTime).toBeLessThan(50);
    });

    it('should handle token mapping operations efficiently', () => {
      const iterations = 5_000;
      
      const startMapping = performance.now();
      for (let i = 0; i < iterations; i++) {
        const user = createMockUser(`map_${i}`);
        const tokenKey = `token:perf_${i}_${Math.random().toString(36)}`;
        sessionCache.setWithMapping(tokenKey, user, user.id, CacheTTL.userSession);
      }
      const mappingTime = performance.now() - startMapping;
      
      console.log(`🔗 Mapping: ${iterations} entries in ${mappingTime.toFixed(2)}ms (${(iterations / mappingTime * 1000).toFixed(0)} ops/sec)`);
      expect(mappingTime).toBeLessThan(150);
    });

    it('should handle user invalidation efficiently (10 tokens per user)', () => {
      const users = 100;
      const tokensPerUser = 10;
      
      // Pre-populate with multiple tokens per user
      for (let u = 0; u < users; u++) {
        const user = createMockUser(`inv_user_${u}`);
        for (let t = 0; t < tokensPerUser; t++) {
          const tokenKey = `token:inv_${u}_${t}`;
          sessionCache.setWithMapping(tokenKey, user, user.id);
        }
        sessionCache.set(CacheKeys.userSession(user.id), user);
      }
      
      const startInvalidate = performance.now();
      for (let u = 0; u < users; u++) {
        invalidateUserSessions(`inv_user_${u}`);
      }
      const invalidateTime = performance.now() - startInvalidate;
      
      console.log(`🗑️ Invalidate: ${users} users (${users * tokensPerUser} tokens) in ${invalidateTime.toFixed(2)}ms`);
      expect(invalidateTime).toBeLessThan(50);
    });

    it('should maintain performance under mixed workload', () => {
      const operations = 10_000;
      let writes = 0, reads = 0, deletes = 0;
      
      const startMixed = performance.now();
      for (let i = 0; i < operations; i++) {
        const op = Math.random();
        const userId = `mixed_${i % 100}`; // 100 unique users
        const key = CacheKeys.userSession(userId);
        
        if (op < 0.3) {
          // 30% writes
          sessionCache.set(key, createMockUser(userId), CacheTTL.userSession);
          writes++;
        } else if (op < 0.9) {
          // 60% reads
          sessionCache.get(key);
          reads++;
        } else {
          // 10% deletes
          sessionCache.delete(key);
          deletes++;
        }
      }
      const mixedTime = performance.now() - startMixed;
      
      console.log(`⚡ Mixed: ${operations} ops (${writes} writes, ${reads} reads, ${deletes} deletes) in ${mixedTime.toFixed(2)}ms`);
      expect(mixedTime).toBeLessThan(100);
    });
  });

  describe('Memory Efficiency', () => {
    it('should report accurate cache info', () => {
      const entries = 500;
      
      for (let i = 0; i < entries; i++) {
        const user = createMockUser(`mem_${i}`);
        sessionCache.set(CacheKeys.userSession(user.id), user, CacheTTL.userSession);
      }
      
      const info = memoryCache.info();
      
      console.log('📊 Cache Info:', JSON.stringify(info, null, 2));
      
      expect(info.entries.total).toBe(entries);
      expect(info.entries.active).toBe(entries);
      expect(info.entries.expired).toBe(0);
    });
  });
});

describe('Session Cache Consistency', () => {
  beforeEach(() => {
    memoryCache.clear();
    memoryCache.resetStats();
  });

  describe('Data Integrity', () => {
    it('should maintain data integrity across set/get cycles', () => {
      const complexUser: MockExtendedUser = {
        id: 'integrity_1',
        email: 'integrity@test.com',
        name: 'Integrity Test User',
        role: 'admin',
        banned: false,
        hasPartnerAccess: true,
        isAlifhAdmin: true,
        partnerMemberships: [
          { partnerId: 'partner_1', staffRole: 'owner' },
          { partnerId: 'partner_2', staffRole: 'sales' },
        ],
      };
      
      const key = CacheKeys.userSession(complexUser.id);
      sessionCache.set(key, complexUser, CacheTTL.userSession);
      
      const retrieved = sessionCache.get<MockExtendedUser>(key);
      
      expect(retrieved).toEqual(complexUser);
      expect(retrieved?.partnerMemberships).toHaveLength(2);
      expect(retrieved?.partnerMemberships[0].partnerId).toBe('partner_1');
    });

    it('should handle Unicode and special characters', () => {
      const user = createMockUser('unicode_user', {
        name: '测试用户 🚗 Тест المستخدم',
        email: 'unicode@exämple.com',
      });
      
      const key = CacheKeys.userSession(user.id);
      sessionCache.set(key, user, CacheTTL.userSession);
      
      const retrieved = sessionCache.get<MockExtendedUser>(key);
      
      expect(retrieved?.name).toBe('测试用户 🚗 Тест المستخدم');
      expect(retrieved?.email).toBe('unicode@exämple.com');
    });

    it('should handle null and undefined fields correctly', () => {
      const user = createMockUser('null_fields', {
        name: undefined as any,
      });
      
      // Add nullable fields
      const userWithNulls = {
        ...user,
        avatar: null,
        avatarUrl: null,
        firstName: null,
        lastName: null,
      };
      
      const key = CacheKeys.userSession(user.id);
      sessionCache.set(key, userWithNulls, CacheTTL.userSession);
      
      const retrieved = sessionCache.get<typeof userWithNulls>(key);
      
      expect(retrieved?.avatar).toBeNull();
      expect(retrieved?.avatarUrl).toBeNull();
    });
  });

  describe('Concurrent Access Simulation', () => {
    it('should handle rapid successive writes to same key', () => {
      const key = CacheKeys.userSession('concurrent_1');
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        const user = createMockUser('concurrent_1', { name: `Version ${i}` });
        sessionCache.set(key, user, CacheTTL.userSession);
      }
      
      const final = sessionCache.get<MockExtendedUser>(key);
      expect(final?.name).toBe(`Version ${iterations - 1}`);
    });

    it('should handle interleaved read/write operations', () => {
      const key = CacheKeys.userSession('interleaved_1');
      const results: string[] = [];
      
      for (let i = 0; i < 100; i++) {
        // Write
        sessionCache.set(key, createMockUser('interleaved_1', { name: `Write ${i}` }), CacheTTL.userSession);
        
        // Read
        const read = sessionCache.get<MockExtendedUser>(key);
        if (read) results.push(read.name);
      }
      
      // All reads should return valid data
      expect(results.filter(r => r.startsWith('Write'))).toHaveLength(100);
    });

    it('should handle delete during iteration pattern', () => {
      // Pre-populate
      for (let i = 0; i < 50; i++) {
        const user = createMockUser(`delete_iter_${i}`);
        sessionCache.set(CacheKeys.userSession(user.id), user, CacheTTL.userSession);
      }
      
      // Delete odd-indexed users
      for (let i = 1; i < 50; i += 2) {
        sessionCache.delete(CacheKeys.userSession(`delete_iter_${i}`));
      }
      
      // Verify even-indexed still exist, odd-indexed deleted
      for (let i = 0; i < 50; i++) {
        const result = sessionCache.get(CacheKeys.userSession(`delete_iter_${i}`));
        if (i % 2 === 0) {
          expect(result).not.toBeNull();
        } else {
          expect(result).toBeNull();
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string key', () => {
      const user = createMockUser('empty_key');
      sessionCache.set('', user, 60);
      
      const result = sessionCache.get('');
      expect(result).not.toBeNull();
    });

    it('should handle very long keys', () => {
      const longKey = 'token:' + 'x'.repeat(1000);
      const user = createMockUser('long_key');
      
      sessionCache.set(longKey, user, 60);
      const result = sessionCache.get<MockExtendedUser>(longKey);
      
      expect(result?.id).toBe('long_key');
    });

    it('should handle zero TTL (immediate expiration)', () => {
      const user = createMockUser('zero_ttl');
      const key = CacheKeys.userSession(user.id);
      
      sessionCache.set(key, user, 0);
      
      // Should be expired immediately
      const result = sessionCache.get(key);
      expect(result).toBeNull();
    });

    it('should handle invalidation of non-existent user', () => {
      // Should not throw
      expect(() => {
        invalidateUserSessions('nonexistent_user_xyz');
      }).not.toThrow();
    });

    it('should handle double invalidation', () => {
      const user = createMockUser('double_inv');
      const tokenKey = 'token:double_inv_123';
      
      sessionCache.setWithMapping(tokenKey, user, user.id);
      
      // First invalidation
      invalidateUserSessions(user.id);
      expect(sessionCache.get(tokenKey)).toBeNull();
      
      // Second invalidation - should not throw
      expect(() => {
        invalidateUserSessions(user.id);
      }).not.toThrow();
    });

    it('should handle large user object', () => {
      const largeUser = createMockUser('large_user', {
        partnerMemberships: Array.from({ length: 100 }, (_, i) => ({
          partnerId: `partner_${i}`,
          staffRole: i % 2 === 0 ? 'owner' : 'sales',
        })),
      });
      
      const key = CacheKeys.userSession(largeUser.id);
      sessionCache.set(key, largeUser, CacheTTL.userSession);
      
      const retrieved = sessionCache.get<MockExtendedUser>(key);
      expect(retrieved?.partnerMemberships).toHaveLength(100);
    });
  });

  describe('Statistics Accuracy', () => {
    it('should accurately track hit rate for session cache', () => {
      const key = CacheKeys.userSession('stats_user');
      const user = createMockUser('stats_user');
      
      // 1 set
      sessionCache.set(key, user, CacheTTL.userSession);
      
      // 5 hits
      for (let i = 0; i < 5; i++) {
        sessionCache.get(key);
      }
      
      // 2 misses
      sessionCache.get('nonexistent_1');
      sessionCache.get('nonexistent_2');
      
      const stats = memoryCache.getStats();
      
      expect(stats.hits).toBe(5);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBeCloseTo(5/7, 2);
    });
  });
});

describe('Proxy Session Caching Scenario', () => {
  beforeEach(() => {
    memoryCache.clear();
    memoryCache.resetStats();
  });

  it('should simulate real proxy session caching flow', () => {
    // Simulate a user logging in and making multiple requests
    const user = createMockUser('proxy_user_1', {
      role: 'user',
      hasPartnerAccess: true,
      partnerMemberships: [{ partnerId: 'dealer_123', staffRole: 'sales' }],
    });
    
    // 1. First request - cache miss, fetch from Better Auth
    const sessionToken = 'better-auth-session-token-abc123';
    const tokenKey = `token:${sessionToken.slice(0, 32)}`;
    
    let cachedUser = sessionCache.get<MockExtendedUser>(tokenKey);
    expect(cachedUser).toBeNull(); // Cache miss
    
    // 2. Fetch from Better Auth (simulated) and cache
    sessionCache.setWithMapping(tokenKey, user, user.id, CacheTTL.userSession);
    
    // 3. Subsequent requests - cache hit
    for (let i = 0; i < 10; i++) {
      cachedUser = sessionCache.get<MockExtendedUser>(tokenKey);
      expect(cachedUser).not.toBeNull();
      expect(cachedUser?.role).toBe('user');
    }
    
    // 4. User role changes (admin promotes them)
    // This triggers cache invalidation
    invalidateUserSessions(user.id);
    
    // 5. Next request - cache miss again
    cachedUser = sessionCache.get<MockExtendedUser>(tokenKey);
    expect(cachedUser).toBeNull();
    
    // 6. Re-fetch with updated data
    const updatedUser = { ...user, role: 'admin', isAlifhAdmin: true };
    sessionCache.setWithMapping(tokenKey, updatedUser, user.id, CacheTTL.userSession);
    
    // 7. Verify updated data is cached
    cachedUser = sessionCache.get<MockExtendedUser>(tokenKey);
    expect(cachedUser?.role).toBe('admin');
    expect(cachedUser?.isAlifhAdmin).toBe(true);
  });

  it('should handle multi-device login scenario', () => {
    const user = createMockUser('multi_device_user');
    
    // User logs in from 3 different devices
    const devices = ['desktop', 'mobile', 'tablet'];
    const tokens = devices.map(d => `token:${d}_session_${Math.random().toString(36)}`);
    
    // Cache session for each device
    tokens.forEach(token => {
      sessionCache.setWithMapping(token, user, user.id, CacheTTL.userSession);
    });
    
    // Verify all devices have cached session
    tokens.forEach(token => {
      expect(sessionCache.get(token)).not.toBeNull();
    });
    
    // User changes password - all sessions should be invalidated
    invalidateUserSessions(user.id);
    
    // All device sessions should be cleared
    tokens.forEach(token => {
      expect(sessionCache.get(token)).toBeNull();
    });
  });

  it('should handle banned user scenario', () => {
    const user = createMockUser('ban_test_user');
    const tokenKey = 'token:ban_test_session';
    
    sessionCache.setWithMapping(tokenKey, user, user.id);
    
    // Admin bans user - triggers invalidation
    invalidateUserSessions(user.id);
    
    // Next request will fetch fresh data showing banned: true
    const cachedAfterBan = sessionCache.get(tokenKey);
    expect(cachedAfterBan).toBeNull();
    
    // New session shows banned status
    const bannedUser = { ...user, banned: true };
    sessionCache.setWithMapping(tokenKey, bannedUser, user.id);
    
    const retrieved = sessionCache.get<MockExtendedUser>(tokenKey);
    expect(retrieved?.banned).toBe(true);
  });
});
