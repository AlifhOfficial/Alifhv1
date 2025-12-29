/**
 * API Performance Test Suite
 * Run with: bun test tests/api-performance.test.ts
 */

import { expect, test, describe } from 'bun:test';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  fast: 100,      // < 100ms = excellent
  good: 500,      // < 500ms = good
  acceptable: 1000, // < 1s = acceptable
};

interface PerfResult {
  endpoint: string;
  method: string;
  time: number;
  status: number;
  cached?: boolean;
}

async function testEndpoint(
  endpoint: string,
  options: RequestInit = {}
): Promise<PerfResult> {
  const start = performance.now();
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const time = performance.now() - start;
  const cached = response.headers.get('X-Cache') === 'HIT';
  
  return {
    endpoint,
    method: options.method || 'GET',
    time,
    status: response.status,
    cached,
  };
}

function formatResult(result: PerfResult): string {
  const emoji = result.time < THRESHOLDS.fast ? '🚀' : 
                result.time < THRESHOLDS.good ? '✅' : 
                result.time < THRESHOLDS.acceptable ? '⚠️' : '❌';
  const cache = result.cached ? ' [CACHED]' : '';
  return `${emoji} ${result.endpoint} - ${result.time.toFixed(2)}ms${cache}`;
}

describe('Public API Performance Tests', () => {
  
  test('GET /api/listings/car-card (published listings)', async () => {
    const result = await testEndpoint('/api/listings/car-card?status=published&limit=20&offset=0');
    
    console.log(formatResult(result));
    
    expect(result.status).toBe(200);
    expect(result.time).toBeLessThan(THRESHOLDS.acceptable);
    
    // Second request should be cached and faster
    const cachedResult = await testEndpoint('/api/listings/car-card?status=published&limit=20&offset=0');
    console.log(formatResult(cachedResult));
    
    if (cachedResult.cached) {
      expect(cachedResult.time).toBeLessThan(THRESHOLDS.fast);
    }
  });

  test('GET /api/listings/car-card with pagination', async () => {
    const results: PerfResult[] = [];
    
    // Test multiple pages
    for (let page = 0; page < 3; page++) {
      const offset = page * 20;
      const result = await testEndpoint(`/api/listings/car-card?status=published&limit=20&offset=${offset}`);
      results.push(result);
      console.log(formatResult(result));
    }
    
    // All requests should be reasonable
    results.forEach(r => {
      expect(r.status).toBe(200);
      expect(r.time).toBeLessThan(THRESHOLDS.acceptable);
    });
    
    // Calculate average
    const avg = results.reduce((sum, r) => sum + r.time, 0) / results.length;
    console.log(`📊 Average pagination time: ${avg.toFixed(2)}ms`);
  });

  test('GET /api/listings/car-card by partner', async () => {
    // You'll need to replace with an actual partnerId from your database
    const result = await testEndpoint('/api/listings/car-card?partnerId=r7fbqam2Qc&limit=20');
    
    console.log(formatResult(result));
    
    expect(result.status).toBe(200);
    expect(result.time).toBeLessThan(THRESHOLDS.acceptable);
  });

});

describe('Load Testing - Concurrent Requests', () => {
  
  test('Handle 10 concurrent requests', async () => {
    const concurrentRequests = 10;
    
    const start = performance.now();
    const promises = Array.from({ length: concurrentRequests }, (_, i) => 
      testEndpoint(`/api/listings/car-card?status=published&limit=20&offset=${i * 20}`)
    );
    
    const results = await Promise.all(promises);
    const totalTime = performance.now() - start;
    
    console.log(`\n📊 Concurrent Load Test Results:`);
    console.log(`   Total time: ${totalTime.toFixed(2)}ms`);
    console.log(`   Requests: ${concurrentRequests}`);
    console.log(`   Average: ${(totalTime / concurrentRequests).toFixed(2)}ms per request`);
    
    results.forEach((r, i) => {
      console.log(`   ${i + 1}. ${formatResult(r)}`);
    });
    
    // All requests should succeed
    results.forEach(r => {
      expect(r.status).toBe(200);
    });
    
    // Average should be reasonable
    const avg = results.reduce((sum, r) => sum + r.time, 0) / results.length;
    expect(avg).toBeLessThan(THRESHOLDS.acceptable);
  });

  test('Handle 50 rapid-fire requests (stress test)', async () => {
    const requestCount = 50;
    
    console.log(`\n🔥 Stress Test: ${requestCount} rapid requests`);
    
    const start = performance.now();
    const promises = Array.from({ length: requestCount }, () => 
      testEndpoint('/api/listings/car-card?status=published&limit=20')
    );
    
    const results = await Promise.all(promises);
    const totalTime = performance.now() - start;
    
    const successful = results.filter(r => r.status === 200).length;
    const avg = results.reduce((sum, r) => sum + r.time, 0) / results.length;
    const min = Math.min(...results.map(r => r.time));
    const max = Math.max(...results.map(r => r.time));
    
    console.log(`   ✅ Successful: ${successful}/${requestCount}`);
    console.log(`   ⏱️  Total: ${totalTime.toFixed(2)}ms`);
    console.log(`   📊 Average: ${avg.toFixed(2)}ms`);
    console.log(`   ⚡ Min: ${min.toFixed(2)}ms`);
    console.log(`   🐌 Max: ${max.toFixed(2)}ms`);
    
    expect(successful).toBe(requestCount);
  });
});

describe('Admin API Performance Tests (requires auth)', () => {
  
  // Note: These tests will fail without authentication
  // You'll need to add a valid session token for authenticated endpoints
  
  test.skip('GET /api/admin/listings', async () => {
    const result = await testEndpoint('/api/admin/listings?status=pending&limit=20', {
      headers: {
        // Add your auth cookie here
        // 'Cookie': 'session=...'
      }
    });
    
    console.log(formatResult(result));
    
    expect(result.status).toBe(200);
    expect(result.time).toBeLessThan(THRESHOLDS.acceptable);
  });
});

describe('Performance Summary', () => {
  
  test('Generate performance report', async () => {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              API PERFORMANCE TEST SUMMARY                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('Thresholds:');
    console.log(`  🚀 Excellent: < ${THRESHOLDS.fast}ms`);
    console.log(`  ✅ Good:      < ${THRESHOLDS.good}ms`);
    console.log(`  ⚠️  Acceptable: < ${THRESHOLDS.acceptable}ms`);
    console.log(`  ❌ Poor:      > ${THRESHOLDS.acceptable}ms`);
    console.log('');
    
    expect(true).toBe(true);
  });
});
