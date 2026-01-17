/**
 * Health Status Component
 * 
 * Displays real-time health status of all services with colored dots
 */

'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useHealthCheck } from '@/hooks/use-health-check';

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  message?: string;
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

const SERVICE_LABELS = {
  database: 'Database',
  websocket: 'WebSocket',
  runtime: 'Runtime',
  api: 'API',
} as const;

const STATUS_COLORS = {
  healthy: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  unhealthy: 'bg-red-500',
  unknown: 'bg-muted-foreground/30',
} as const;

export function HealthStatus() {
  const { health, isLoading, error } = useHealthCheck();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground/60">Loading...</span>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs text-muted-foreground/60">System offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {Object.entries(health.services).map(([key, service]) => {
        const label = SERVICE_LABELS[key as keyof typeof SERVICE_LABELS];
        const statusColor = STATUS_COLORS[service.status];
        
        return (
          <TooltipProvider key={key} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    statusColor,
                    service.status === 'healthy' && 'shadow-[0_0_4px_currentColor]'
                  )} />
                  <span className="text-[11px] text-muted-foreground/50 uppercase tracking-wider font-medium">
                    {label}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <div className="space-y-1">
                  <div className="font-semibold">{label}</div>
                  <div className="text-muted-foreground">
                    Status: <span className={cn(
                      'font-medium',
                      service.status === 'healthy' && 'text-emerald-500',
                      service.status === 'degraded' && 'text-amber-500',
                      service.status === 'unhealthy' && 'text-red-500'
                    )}>
                      {service.status}
                    </span>
                  </div>
                  {service.message && (
                    <div className="text-muted-foreground">
                      {service.message}
                    </div>
                  )}
                  {service.latency !== undefined && (
                    <div className="text-muted-foreground">
                      Latency: {service.latency}ms
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}
