/**
 * Next.js Instrumentation Hook
 * 
 * Runs once on server startup for:
 * - Cache warming for popular searches
 * - Analytics buffer initialization
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on Node.js runtime (not edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[instrumentation] Server starting, warming cache...');
    
    // Warm cache after a short delay to let the server fully start
    setTimeout(async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const secret = process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET || '';
        
        const response = await fetch(`${baseUrl}/api/internal/warm-cache`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${secret}`,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`[instrumentation] Cache warmed: ${result.summary?.warmed || 0} searches pre-cached`);
        } else {
          console.warn(`[instrumentation] Cache warm failed: ${response.status}`);
        }
      } catch (error) {
        // Don't crash the server if warming fails
        console.warn('[instrumentation] Cache warm error (non-fatal):', error);
      }
    }, 2000); // 2 second delay for server to be ready
  }
}
