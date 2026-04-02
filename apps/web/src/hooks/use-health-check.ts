/**
 * useHealthCheck Hook
 * 
 * Fetches system health status for all services
 */

'use client';

import { useEffect, useState } from 'react';
import type { HealthCheckResponse } from '@/lib/health';

export function useHealthCheck(initialData?: HealthCheckResponse | null, enableFetch = true) {
  const [health, setHealth] = useState<HealthCheckResponse | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enableFetch) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function fetchHealth() {
      try {
        const response = await fetch('/api/health', {
          cache: 'no-store',
        });
        
        if (!mounted) return;
        
        if (response.ok) {
          const data = await response.json();
          setHealth(data);
          setError(null);
        } else {
          setError('Health check failed');
        }
      } catch (_err) {
        if (!mounted) return;
        setError('Unable to connect');
        setHealth(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    // Fetch once on mount
    fetchHealth();

    return () => {
      mounted = false;
    };
  }, [enableFetch]);

  return {
    health,
    isLoading,
    error,
  };
}
