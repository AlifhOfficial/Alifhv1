/**
 * API: Cache Stats Monitoring
 * GET /api/admin/cache/stats
 * 
 * Purpose: Monitor cache performance and hit rates
 * Authentication: Required (admin only)
 * 
 * Returns:
 * - Cache hit/miss statistics
 * - Hit rate percentage
 * - Active entries count
 * - Memory usage estimates
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { memoryCache } from '@alifh/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_HEADERS_NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
} as const;

export async function GET(req: NextRequest) {
  try {
    // Auth check - admin only
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const cacheInfo = memoryCache.info();
    const stats = memoryCache.getStats();

    const response = NextResponse.json({
      timestamp: new Date().toISOString(),
      cache: cacheInfo,
      recommendations: generateRecommendations(stats),
    });
    Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Auth check - admin only
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    
    if (body.action === 'reset_stats') {
      memoryCache.resetStats();
      const response = NextResponse.json({ success: true, message: 'Stats reset successfully' });
      Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
        response.headers.set(key, value)
      );
      return response;
    }
    
    if (body.action === 'clear_cache') {
      memoryCache.clear();
      const response = NextResponse.json({ success: true, message: 'Cache cleared successfully' });
      Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
        response.headers.set(key, value)
      );
      return response;
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateRecommendations(stats: any): string[] {
  const recommendations: string[] = [];
  
  if (stats.hitRate < 50) {
    recommendations.push('⚠️ Cache hit rate is below 50%. Consider increasing TTL values.');
  } else if (stats.hitRate < 80) {
    recommendations.push('💡 Cache hit rate is decent but can be improved. Review cache invalidation patterns.');
  } else if (stats.hitRate >= 95) {
    recommendations.push('✅ Excellent cache performance! Hit rate above 95%.');
  } else {
    recommendations.push('✅ Good cache performance. Hit rate above 80%.');
  }
  
  const totalRequests = stats.hits + stats.misses;
  if (totalRequests < 100) {
    recommendations.push('ℹ️ Low request volume. Stats may not be representative yet.');
  }
  
  return recommendations;
}
