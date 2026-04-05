/**
 * Status Hero Section - Revvup Status Page
 * Shows overall system status with visual indicator
 */

'use client';

import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface StatusHeroSectionProps {
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
}

const statusConfig = {
  healthy: {
    icon: CheckCircle2,
    label: 'All Systems Operational',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
    textClass: 'text-emerald-500',
    dotClass: 'bg-emerald-500',
  },
  degraded: {
    icon: AlertTriangle,
    label: 'Partial System Outage',
    bgClass: 'bg-warning-muted border-warning/20',
    textClass: 'text-warning',
    dotClass: 'bg-warning',
  },
  unhealthy: {
    icon: XCircle,
    label: 'System Outage',
    bgClass: 'bg-destructive-muted border-destructive/20',
    textClass: 'text-destructive',
    dotClass: 'bg-destructive',
  },
};

export function StatusHeroSection({ overallStatus }: StatusHeroSectionProps) {
  const config = statusConfig[overallStatus] || statusConfig.healthy;
  const Icon = config.icon;

  return (
    <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            System Status
          </span>
          <h1 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
            Revvup Status
          </h1>
          <p className="text-callout text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Real-time status of all Revvup services and infrastructure.
          </p>
        </div>

        {/* Overall Status Card */}
        <div className={`rounded-xl border p-6 ${config.bgClass}`}>
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <div className={`w-2 h-2 rounded-full ${config.dotClass} animate-pulse`} />
            </div>
            <Icon className={`w-5 h-5 ${config.textClass}`} />
            <span className={`text-headline font-semibold ${config.textClass}`}>
              {config.label}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
