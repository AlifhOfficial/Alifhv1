/**
 * Status Incidents Section - Revvup Status Page
 * Shows recent incidents and their resolution timeline
 */

import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface IncidentUpdate {
  id: number;
  status: string;
  message: string;
  createdAt: string;
}

interface Incident {
  id: number;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  affectedServices: string[];
  createdAt: string;
  resolvedAt?: string;
  updates: IncidentUpdate[];
}

interface StatusIncidentsSectionProps {
  incidents: Incident[];
}

const incidentStatusConfig = {
  investigating: {
    icon: Clock,
    label: 'Investigating',
    textClass: 'text-amber-500',
    bgClass: 'bg-amber-500/10',
  },
  identified: {
    icon: AlertTriangle,
    label: 'Identified',
    textClass: 'text-orange-500',
    bgClass: 'bg-orange-500/10',
  },
  monitoring: {
    icon: Clock,
    label: 'Monitoring',
    textClass: 'text-blue-500',
    bgClass: 'bg-blue-500/10',
  },
  resolved: {
    icon: CheckCircle2,
    label: 'Resolved',
    textClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500/10',
  },
};

const severityConfig = {
  minor: { label: 'Minor', textClass: 'text-amber-500' },
  major: { label: 'Major', textClass: 'text-orange-500' },
  critical: { label: 'Critical', textClass: 'text-red-500' },
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function IncidentCard({ incident }: { incident: Incident }) {
  const statusConf = incidentStatusConfig[incident.status] || incidentStatusConfig.investigating;
  const severityConf = severityConfig[incident.severity] || severityConfig.minor;
  const StatusIcon = statusConf.icon;

  return (
    <div className="rounded-xl border border-border/40 bg-sidebar p-5">
      {/* Incident Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-subhead font-semibold text-foreground mb-1">
            {incident.title}
          </h3>
          <div className="flex items-center gap-3 text-caption1 text-muted-foreground">
            <span>{formatDate(incident.createdAt)}</span>
            <span className={severityConf.textClass}>{severityConf.label}</span>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${statusConf.bgClass}`}>
          <StatusIcon className={`w-3 h-3 ${statusConf.textClass}`} />
          <span className={`text-caption1 font-medium ${statusConf.textClass}`}>
            {statusConf.label}
          </span>
        </div>
      </div>

      {/* Affected Services */}
      {(incident.affectedServices?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {incident.affectedServices.map((service) => (
            <span
              key={service}
              className="px-2 py-0.5 text-caption1 bg-muted rounded-md text-muted-foreground"
            >
              {service}
            </span>
          ))}
        </div>
      )}

      {/* Updates Timeline */}
      {(incident.updates?.length ?? 0) > 0 && (
        <div className="border-t border-border/40 pt-4 mt-4">
          <div className="space-y-3">
            {incident.updates.slice(0, 3).map((update) => (
              <div key={update.id} className="flex gap-3">
                <div className="flex-shrink-0 w-1 bg-border/40 rounded-full" />
                <div>
                  <div className="text-caption1 text-muted-foreground mb-1">
                    {formatDate(update.createdAt)}
                  </div>
                  <div className="text-subhead text-foreground">{update.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function StatusIncidentsSection({ incidents }: StatusIncidentsSectionProps) {
  const hasIncidents = (incidents?.length ?? 0) > 0;

  return (
    <section className="pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <p className="text-caption1 uppercase tracking-widest text-muted-foreground/70 mb-3">
            Incidents
          </p>
          <h2 className="text-title3 font-semibold text-foreground tracking-tight">
            Recent Activity
          </h2>
        </div>

        {/* Incidents List or Empty State */}
        {hasIncidents ? (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border/40 bg-sidebar p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <p className="text-subhead font-medium text-foreground mb-1">
              No recent incidents
            </p>
            <p className="text-caption1 text-muted-foreground">
              All systems have been running smoothly.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
