/**
 * Test Setup for API Tests
 * Provides mock session, performance tracking, and utilities
 */

import { beforeAll, afterAll } from 'bun:test';

// Mock getSessionUser for tests
export const mockSession = {
  user: null as { id: string; email: string; role: string } | null,
  
  setUser(user: { id: string; email: string; role: string } | null) {
    this.user = user;
  },
  
  reset() {
    this.user = null;
  }
};

// Performance tracker
export const perfTracker = {
  measurements: [] as Array<{ name: string; duration: number }>,
  
  measure(name: string, fn: () => Promise<any>) {
    const start = performance.now();
    return fn().finally(() => {
      const duration = performance.now() - start;
      this.measurements.push({ name, duration });
    });
  },
  
  getStats(name?: string) {
    const filtered = name 
      ? this.measurements.filter(m => m.name === name)
      : this.measurements;
    
    if (filtered.length === 0) return null;
    
    const durations = filtered.map(m => m.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    
    return { avg, min, max, count: durations.length };
  },
  
  reset() {
    this.measurements = [];
  },
  
  report() {
    const names = [...new Set(this.measurements.map(m => m.name))];
    console.log('\n📊 Performance Report:');
    names.forEach(name => {
      const stats = this.getStats(name);
      if (stats) {
        console.log(`  ${name}:`);
        console.log(`    Avg: ${stats.avg.toFixed(2)}ms`);
        console.log(`    Min: ${stats.min.toFixed(2)}ms`);
        console.log(`    Max: ${stats.max.toFixed(2)}ms`);
        console.log(`    Count: ${stats.count}`);
      }
    });
  }
};

// Test user fixtures
export const testUsers = {
  authenticated: {
    id: 'test_user_123',
    email: 'test@example.com',
    role: 'user'
  },
  admin: {
    id: 'admin_user_123',
    email: 'admin@example.com',
    role: 'admin'
  }
};

// Cleanup after all tests
afterAll(() => {
  perfTracker.report();
  mockSession.reset();
});

export const TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
