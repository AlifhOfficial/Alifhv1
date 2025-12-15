import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireAuth } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { TeamActions, StaffCardActions } from "./team-actions";
import { 
  Users, 
  UserCheck, 
  MessageSquare, 
  DollarSign, 
  ShieldCheck, 
  Star, 
  MoreHorizontal,
  Mail,
  Phone,
  Briefcase,
  Trophy
} from "lucide-react";

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
        image: schema.user.image,
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
      notation: "compact",
      compactDisplay: "short"
    }).format(cents / 100);
  };

  const activeMembers = teamMembers.filter(m => m.status === 'active').length;

  return (
    <DashboardDisplayArea
      title="Team Management"
      description="Manage your dealership team members"
      action={<TeamActions canManage={canManage} />}
    >
      <div className="max-w-5xl mx-auto px-8 py-12 space-y-12">
        {/* Stats Grid - Minimalist & Clean */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="p-1.5 rounded-md bg-blue-500/10">
                <Users className="w-3.5 h-3.5 text-blue-600" />
              </div>
              Total Members
            </div>
            <div className="text-xl font-medium">{teamMembers.length}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="p-1.5 rounded-md bg-emerald-500/10">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              Active Staff
            </div>
            <div className="text-xl font-medium">{activeMembers}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="p-1.5 rounded-md bg-violet-500/10">
                <Trophy className="w-3.5 h-3.5 text-violet-600" />
              </div>
              Top Performer
            </div>
            <div className="text-xl font-medium truncate">
              {teamMembers.sort((a, b) => (b.dealsClosed ?? 0) - (a.dealsClosed ?? 0))[0]?.user?.name?.split(' ')[0] || '-'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="p-1.5 rounded-md bg-amber-500/10">
                <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              </div>
              Total Sales
            </div>
            <div className="text-xl font-medium">
              {teamMembers.reduce((sum, m) => sum + (m.dealsClosed ?? 0), 0)}
            </div>
          </div>
        </div>

        <div className="border-t border-border/60" />

        {/* Team Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Team Members</h2>
              <p className="text-sm text-muted-foreground mt-1">Staff directory and performance</p>
            </div>
          </div>

          {teamMembers.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border/60 rounded-lg">
              <p className="text-sm text-muted-foreground">No team members found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="group relative p-6 rounded-lg border border-border/40 bg-card/30 hover:bg-card/50 transition-all duration-200"
                >
                  {/* Header: Avatar & Info */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground border border-border/50">
                        {member.user?.name?.charAt(0) || '?'}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-foreground">
                            {member.user?.name || 'Unknown'}
                          </h3>
                          {member.isPrimaryContact && (
                            <ShieldCheck className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{member.title || member.role}</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/40" />
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              member.status === 'active' ? 'bg-emerald-500' : 
                              member.status === 'invited' ? 'bg-amber-500' : 
                              'bg-muted-foreground'
                            }`} />
                            <span className="capitalize">{member.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <StaffCardActions staff={member} canManage={canManage} />
                  </div>

                  {/* Contact Details - Minimal */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3 opacity-70" />
                      <span className="truncate">{member.user?.email}</span>
                    </div>
                    {member.department && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Briefcase className="w-3 h-3 opacity-70" />
                        <span>{member.department}</span>
                      </div>
                    )}
                  </div>

                  {/* Key Metrics - Clean Row */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/40">
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">Leads</div>
                      <div className="text-sm font-medium">{member.leadsHandled ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">Sales</div>
                      <div className="text-sm font-medium">{formatCurrency(member.totalSalesValue)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">Rating</div>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        {member.customerRating?.toFixed(1) ?? '-'}
                        {member.customerRating && <Star className="w-3 h-3 fill-amber-500 text-amber-500" />}
                      </div>
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
