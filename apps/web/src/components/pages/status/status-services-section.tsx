/**
 * Status Services Section - Revvup Status Page
 * Shows individual service status with 90-day history bars
 */

'use client';

import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface ServiceHistory {
  date: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptimePercent: number;
}

interface Service {
  name: string;
  displayName: string;
  currentStatus: 'healthy' | 'degraded' | 'unhealthy';
  currentLatency: number;
  currentMessage: string;
  uptimePercent90d: number;
  history: ServiceHistory[];
}

interface StatusServicesSectionProps {
  services: Service[];
}

const statusConfig = {
  healthy: {
    icon: CheckCircle2,
    label: 'Operational',
    textClass: 'text-emerald-500',
    barClass: 'bg-emerald-500',
    bgClass: 'bg-emerald-500/10',
  },
  degraded: {
    icon: AlertTriangle,
    label: 'Degraded',
    textClass: 'text-amber-500',
    barClass: 'bg-amber-500',
    bgClass: 'bg-amber-500/10',
  },
  unhealthy: {
    icon: XCircle,
    label: 'Outage',
    textClass: 'text-red-500',
    barClass: 'bg-red-500',
    bgClass: 'bg-red-500/10',
  },
};

function ServiceCard({ service }: { service: Service }) {
  const config = statusConfig[service.currentStatus] || statusConfig.healthy;
  const Icon = config.icon;

  return (
    <div className="rounded-xl border border-border/40 bg-sidebar p-5">
      {/* Service Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-subhead font-semibold text-foreground">
            {service.displayName}
          </span>
          {service.currentLatency > 0 && (
            <span className="text-caption1 text-muted-foreground">
              {service.currentLatency}ms
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.textClass}`} />
          <span className={`text-subhead font-medium ${config.textClass}`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* 90-Day History Bars */}
      <div className="flex gap-[2px] h-8 mb-3">
        {(service.history || []).length > 0 ? (
          service.history.map((day) => {
            const dayConfig = statusConfig[day.status] || statusConfig.healthy;
            return (
              <div
                key={day.date}
                className={`flex-1 rounded-[2px] ${dayConfig.barClass} opacity-80 hover:opacity-100 transition-opacity cursor-pointer group relative`}
                title={`${day.date}: ${day.uptimePercent}% uptime`}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border border-border rounded text-caption1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="font-medium">{day.date}</div>
                  <div className="text-muted-foreground">{day.uptimePercent}% uptime</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex-1 rounded-[2px] bg-muted opacity-50 flex items-center justify-center">
            <span className="text-caption1 text-muted-foreground">No data yet</span>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-caption1 text-muted-foreground">
        <span>90 days ago</span>
        <span className="font-medium">{service.uptimePercent90d ?? 100}% uptime</span>
        <span>Today</span>
      </div>
    </div>
  );
}

export function StatusServicesSection({ services }: StatusServicesSectionProps) {
  return (
    <section className="pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <p className="text-caption1 uppercase tracking-widest text-muted-foreground/70 mb-3">
            Services
          </p>
          <h2 className="text-title3 font-semibold text-foreground tracking-tight">
            Current Status
          </h2>
        </div>

        {/* Service Cards */}
        <div className="space-y-4">
          {services.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>

      </div>
    </section>
  );
}
