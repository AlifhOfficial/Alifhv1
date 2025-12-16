import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireRole } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { desc, eq } from "drizzle-orm";

export default async function AuditLogsPage() {
  const user = await requireRole("admin");

  // Fetch recent audit logs
  const logs = await db
    .select({
      id: schema.auditLog.id,
      action: schema.auditLog.action,
      entityType: schema.auditLog.entityType,
      entityId: schema.auditLog.entityId,
      metadata: schema.auditLog.metadata,
      severity: schema.auditLog.severity,
      ipAddress: schema.auditLog.ipAddress,
      userAgent: schema.auditLog.userAgent,
      createdAt: schema.auditLog.createdAt,
      user: {
        name: schema.user.name,
        email: schema.user.email,
      },
    })
    .from(schema.auditLog)
    .leftJoin(schema.user, eq(schema.auditLog.userId, schema.user.id))
    .orderBy(desc(schema.auditLog.createdAt))
    .limit(200);

  const criticalCount = logs.filter(l => l.severity === 'critical').length;
  const warningCount = logs.filter(l => l.severity === 'warning').length;

  return (
    <DashboardDisplayArea
      title="Audit Logs"
      description="System activity and security audit trail"
    >
      <div className="p-6 md:p-10">
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Events</div>
            <div className="text-2xl font-semibold text-foreground">{logs.length}</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Critical Events</div>
            <div className="text-2xl font-semibold text-foreground">{criticalCount}</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Warnings</div>
            <div className="text-2xl font-semibold text-foreground">{warningCount}</div>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Recent Activity</h2>
            <div className="text-sm text-muted-foreground">{logs.length} events</div>
          </div>

          {logs.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <p className="text-sm text-muted-foreground">No audit logs found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`bg-card border rounded-lg p-4 ${
                    log.severity === 'critical' ? 'border-red-300 bg-red-50' :
                    log.severity === 'warning' ? 'border-yellow-300 bg-yellow-50' :
                    'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                          log.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {log.severity}
                        </span>
                        <span className="text-xs font-mono text-foreground">
                          {log.action}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          on {log.entityType}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-xs">
                        <div>
                          <div className="text-muted-foreground">User</div>
                          <div className="text-foreground mt-1">
                            {log.user?.name || log.user?.email || 'System'}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-muted-foreground">Entity ID</div>
                          <div className="text-foreground mt-1 font-mono text-xs truncate">
                            {log.entityId || 'N/A'}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-muted-foreground">IP Address</div>
                          <div className="text-foreground mt-1 font-mono">
                            {log.ipAddress || 'N/A'}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-muted-foreground">Timestamp</div>
                          <div className="text-foreground mt-1">
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="mt-3">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            View metadata
                          </summary>
                          <pre className="mt-2 p-3 bg-muted/30 border border-border/40 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}

                      {log.userAgent && (
                        <div className="mt-2 text-xs text-muted-foreground truncate">
                          {log.userAgent}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
