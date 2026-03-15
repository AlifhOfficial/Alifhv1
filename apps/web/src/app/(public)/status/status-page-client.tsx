/**
 * Status Page Client Component
 * Simple, stable status display
 */

'use client';

import { useEffect, useState, useRef } from 'react';
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
  const [data, setData] = useState<StatusData>(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const eventSourceRef = useRef<EventSource | null>(null);

  // Set time on mount only
  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  // SSE connection
  useEffect(() => {
    const connect = () => {
      const es = new EventSource('/api/status/stream');
      eventSourceRef.current = es;

      es.onopen = () => setIsConnected(true);

      es.onmessage = (event) => {
        try {
          const streamData = JSON.parse(event.data);
          // Only update status fields, preserve displayName and history
          setData((prev) => ({
            ...prev,
            overallStatus: streamData.overallStatus || prev.overallStatus,
            services: prev.services.map((svc) => {
              const updated = streamData.services?.find(
                (s: { name: string }) => s.name === svc.name
              );
              if (updated) {
                return {
                  ...svc,
                  currentStatus: updated.status || svc.currentStatus,
                  currentLatency: updated.latency ?? svc.currentLatency,
                };
              }
              return svc;
            }),
          }));
          setLastUpdated(new Date().toLocaleTimeString());
        } catch {
          // Ignore parse errors
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();
        // Reconnect after 10s
        setTimeout(connect, 10000);
      };
    };

    connect();

    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const overallConfig = statusConfig[data.overallStatus] || statusConfig.healthy;
  const OverallIcon = overallConfig.icon;

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 space-y-4">
            <p className="wordmark-geom text-lg text-foreground">
              Revvup
            </p>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              System Status
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              Revvup Status
            </h1>
            <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Real-time status of all Revvup services and infrastructure.
            </p>
          </div>

          <div className={`rounded-xl border p-6 ${overallConfig.bgClass}`}>
            <div className="flex items-center justify-center gap-3">
              <div className={`w-2 h-2 rounded-full ${overallConfig.barClass} animate-pulse`} />
              <OverallIcon className={`w-5 h-5 ${overallConfig.textClass}`} />
              <span className={`text-lg font-semibold ${overallConfig.textClass}`}>
                {overallConfig.label}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
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
                  {/* Header */}
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

                  {/* History Bars */}
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

                  {/* Footer */}
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

      {/* Incidents */}
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

      {/* Footer */}
      <footer className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'
                }`}
              />
              <span>{isConnected ? 'Live' : 'Connecting...'}</span>
            </div>
            <span>·</span>
            <span suppressHydrationWarning>Updated: {lastUpdated || '—'}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
