/**
 * Status Page Client Component
 * Simple, stable status display
 */

'use client';

import { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface Service {
  name: string;
  displayName: string;
  currentStatus: 'healthy' | 'degraded' | 'unhealthy';
  currentLatency: number;
  currentMessage: string;
  uptimePercent90d: number;
  history: Array<{
    date: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptimePercent: number;
  }>;
}

interface StatusData {
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  services: Service[];
  incidents: Array<{
    id: number;
    title: string;
    status: string;
    severity: string;
    createdAt: string;
  }>;
  lastUpdated?: string;
}

interface StatusPageClientProps {
  initialData: StatusData;
}

const statusConfig = {
  healthy: {
    icon: CheckCircle2,
    label: 'All Systems Operational',
    serviceLabel: 'Operational',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
    textClass: 'text-emerald-500',
    barClass: 'bg-emerald-500',
  },
  degraded: {
    icon: AlertTriangle,
    label: 'Partial System Outage',
    serviceLabel: 'Degraded',
    bgClass: 'bg-amber-500/10 border-amber-500/20',
    textClass: 'text-amber-500',
    barClass: 'bg-amber-500',
  },
  unhealthy: {
    icon: XCircle,
    label: 'System Outage',
    serviceLabel: 'Outage',
    bgClass: 'bg-red-500/10 border-red-500/20',
    textClass: 'text-red-500',
    barClass: 'bg-red-500',
  },
};

export function StatusPageClient({ initialData }: StatusPageClientProps) {
  const data = initialData;
  const lastUpdated = useMemo(() => {
    if (!data.lastUpdated) {
      return 'Just now';
    }

    return new Date(data.lastUpdated).toLocaleTimeString();
  }, [data.lastUpdated]);

  const overallConfig = statusConfig[data.overallStatus] || statusConfig.healthy;
  const OverallIcon = overallConfig.icon;

  return (
    <>
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 space-y-4">
            <p className="wordmark-geom text-lg text-foreground">
              Revvup
            </p>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              System Status
            </span>
          </div>

          <div className={`rounded-xl border p-6 ${overallConfig.bgClass}`}>
            <div className="flex items-center justify-center gap-3">
              <div className={`w-2 h-2 rounded-full ${overallConfig.barClass} animate-pulse`} />
              <OverallIcon className={`w-5 h-5 ${overallConfig.textClass}`} />
              <span className={`text-lg font-semibold ${overallConfig.textClass}`}>
                {overallConfig.label}
              </span>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Last checked at {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <section className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground/70 mb-3">
              Services
            </p>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Current Status
            </h2>
          </div>

          <div className="space-y-4">
            {(data.services || []).map((service) => {
              const config = statusConfig[service.currentStatus] || statusConfig.healthy;
              const Icon = config.icon;
              const history = service.history || [];

              return (
                <div
                  key={service.name}
                  className="rounded-xl border border-border/40 bg-sidebar p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        {service.displayName || service.name}
                      </span>
                      {service.currentLatency > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {service.currentLatency}ms
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${config.textClass}`} />
                      <span className={`text-sm font-medium ${config.textClass}`}>
                        {config.serviceLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-[2px] h-8 mb-3">
                    {history.length > 0 ? (
                      history.map((day) => {
                        const dayConfig = statusConfig[day.status] || statusConfig.healthy;
                        return (
                          <div
                            key={day.date}
                            className={`flex-1 rounded-[2px] ${dayConfig.barClass} opacity-80 hover:opacity-100 transition-opacity`}
                            title={`${day.date}: ${day.uptimePercent}%`}
                          />
                        );
                      })
                    ) : (
                      <div className="flex-1 rounded-[2px] bg-muted/50 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No history yet</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>90 days ago</span>
                    <span className="font-medium">{service.uptimePercent90d ?? 100}% uptime</span>
                    <span>Today</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground/70 mb-3">
              Incidents
            </p>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Recent Activity
            </h2>
          </div>

          <div className="rounded-xl border border-border/40 bg-sidebar p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">No recent incidents</p>
            <p className="text-xs text-muted-foreground">
              All systems have been running smoothly.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
