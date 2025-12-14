import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireAuth } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { TeamActions, StaffCardActions } from "./team-actions";

export default async function PartnerTeamPage() {
  const user = await requireAuth();

  // Fetch partner data
  const membership = await db
    .select({
      partnerId: schema.partnerStaff.partnerId,
      role: schema.partnerStaff.role,
    })
    .from(schema.partnerStaff)
    .where(
      and(
        eq(schema.partnerStaff.userId, user.id),
        eq(schema.partnerStaff.status, "active")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    redirect('/partner-dashboard');
  }

  const partnerId = membership[0].partnerId;
  const userRole = membership[0].role;
  const canManage = userRole === 'owner' || userRole === 'admin' || userRole === 'manager';

  // Fetch all team members
  const teamMembers = await db
    .select({
      id: schema.partnerStaff.id,
      role: schema.partnerStaff.role,
      title: schema.partnerStaff.title,
      department: schema.partnerStaff.department,
      status: schema.partnerStaff.status,
      isPrimaryContact: schema.partnerStaff.isPrimaryContact,
      permissions: schema.partnerStaff.permissions,
      leadsHandled: schema.partnerStaff.leadsHandled,
      leadsConverted: schema.partnerStaff.leadsConverted,
      dealsClosed: schema.partnerStaff.dealsClosed,
      totalSalesValue: schema.partnerStaff.totalSalesValue,
      avgResponseTime: schema.partnerStaff.avgResponseTime,
      performanceScore: schema.partnerStaff.performanceScore,
      customerRating: schema.partnerStaff.customerRating,
      joinedAt: schema.partnerStaff.joinedAt,
      lastActiveAt: schema.partnerStaff.lastActiveAt,
      user: {
        id: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
      },
    })
    .from(schema.partnerStaff)
    .leftJoin(schema.user, eq(schema.partnerStaff.userId, schema.user.id))
    .where(eq(schema.partnerStaff.partnerId, partnerId));

  const formatCurrency = (cents: number | null) => {
    if (!cents) return 'AED 0';
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const activeMembers = teamMembers.filter(m => m.status === 'active').length;

  return (
    <DashboardDisplayArea
      title="Team Management"
      description="Manage your dealership team members"
      action={<TeamActions canManage={canManage} />}
    >
      <div className="p-6 md:p-10 space-y-12">
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Members</div>
            <div className="text-2xl font-semibold text-foreground">{teamMembers.length}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Active</div>
            <div className="text-2xl font-semibold text-foreground">{activeMembers}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Leads</div>
            <div className="text-2xl font-semibold text-foreground">
              {teamMembers.reduce((sum, m) => sum + (m.leadsHandled ?? 0), 0)}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Sales</div>
            <div className="text-2xl font-semibold text-foreground">
              {teamMembers.reduce((sum, m) => sum + (m.dealsClosed ?? 0), 0)}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-foreground">Team Members</h2>
          </div>

          {teamMembers.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <p className="text-sm text-muted-foreground">No team members found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-medium text-foreground">
                          {member.user?.name || 'Unknown'}
                        </h3>
                        
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                          member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                          member.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          member.role === 'sales' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {member.role}
                        </span>

                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                          member.status === 'active' ? 'bg-green-100 text-green-800' :
                          member.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {member.status}
                        </span>

                        {member.isPrimaryContact && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Primary Contact
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground mb-4">
                        {member.user?.email}
                        {member.title && ` • ${member.title}`}
                        {member.department && ` • ${member.department}`}
                      </div>
                    </div>

                    <StaffCardActions staff={member} canManage={canManage} />
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Leads Handled</div>
                          <div className="text-sm font-medium text-foreground mt-1">
                            {member.leadsHandled ?? 0}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">Leads Converted</div>
                          <div className="text-sm font-medium text-foreground mt-1">
                            {member.leadsConverted ?? 0}
                            {member.leadsHandled && member.leadsHandled > 0 && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({((member.leadsConverted ?? 0) / member.leadsHandled * 100).toFixed(0)}%)
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">Deals Closed</div>
                          <div className="text-sm font-medium text-foreground mt-1">
                            {member.dealsClosed ?? 0}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">Total Sales Value</div>
                          <div className="text-sm font-medium text-foreground mt-1">
                            {formatCurrency(member.totalSalesValue)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">Avg Response Time</div>
                          <div className="text-sm font-medium text-foreground mt-1">
                            {member.avgResponseTime ?? 0} min
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">Performance Score</div>
                          <div className="text-sm font-medium text-foreground mt-1">
                            {member.performanceScore ?? 0}/100
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">Customer Rating</div>
                          <div className="text-sm font-medium text-foreground mt-1">
                            {member.customerRating ? `⭐ ${member.customerRating.toFixed(1)}` : 'N/A'}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">Joined</div>
                          <div className="text-sm font-medium text-foreground mt-1">
                            {formatDate(member.joinedAt)}
                          </div>
                        </div>
                      </div>

                      {/* Permissions */}
                      {member.permissions && (
                        <div className="pt-4 border-t border-border/60">
                          <div className="text-xs text-muted-foreground mb-2">Permissions</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(member.permissions).map(([key, value]) => (
                              value && (
                                <span
                                  key={key}
                                  className="inline-flex items-center px-2 py-1 text-xs bg-muted text-foreground rounded"
                                >
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
