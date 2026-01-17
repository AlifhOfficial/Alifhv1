/**
 * useHealthCheck Hook
 * 
 * Fetches system health status for all services
 */

'use client';

import { useEffect, useState } from 'react';

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  message?: string;
  details?: Record<string, any>;
}

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    websocket: ServiceStatus;
    runtime: ServiceStatus;
    api: ServiceStatus;
  };
}

export function useHealthCheck() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      } catch (err) {
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
  }, []);

  return {
    health,
    isLoading,
    error,
  };
}
