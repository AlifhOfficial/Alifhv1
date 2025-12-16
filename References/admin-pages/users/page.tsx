import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireRole } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { desc, eq } from "drizzle-orm";

export default async function UsersPage() {
  const user = await requireRole("admin");

  // Fetch users with profile info
  const users = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      role: schema.user.role,
      emailVerified: schema.user.emailVerified,
      banned: schema.user.banned,
      banReason: schema.user.banReason,
      banExpires: schema.user.banExpires,
      createdAt: schema.user.createdAt,
      profile: {
        phone: schema.userProfile.phone,
        locationCity: schema.userProfile.locationCity,
        locationEmirate: schema.userProfile.locationEmirate,
        kycVerified: schema.userProfile.kycVerified,
        kycVerifiedAt: schema.userProfile.kycVerifiedAt,
      },
    })
    .from(schema.user)
    .leftJoin(schema.userProfile, eq(schema.user.id, schema.userProfile.userId))
    .orderBy(desc(schema.user.createdAt))
    .limit(100);

  // Get counts
  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u.emailVerified).length;
  const kycVerified = users.filter(u => u.profile?.kycVerified).length;
  const bannedUsers = users.filter(u => u.banned).length;
  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;

  return (
    <DashboardDisplayArea
      title="Users"
      description="Manage user accounts and permissions"
    >
      <div className="p-6 md:p-10">
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-5 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Users</div>
            <div className="text-2xl font-semibold text-foreground">{totalUsers}</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Email Verified</div>
            <div className="text-2xl font-semibold text-foreground">{verifiedUsers}</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">KYC Verified</div>
            <div className="text-2xl font-semibold text-foreground">{kycVerified}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Admins</div>
            <div className="text-2xl font-semibold text-foreground">{adminUsers}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Banned</div>
            <div className="text-2xl font-semibold text-foreground">{bannedUsers}</div>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">All Users</h2>
            <div className="text-sm text-muted-foreground">{users.length} users</div>
          </div>

          {users.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-medium text-foreground">
                          {u.name || 'No name'}
                        </h3>
                        
                        {u.role !== 'user' && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            {u.role}
                          </span>
                        )}
                        
                        {u.emailVerified && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            ✓ Email Verified
                          </span>
                        )}
                        
                        {u.profile?.kycVerified && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            ✓ KYC Verified
                          </span>
                        )}
                        
                        {u.banned && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Banned
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground mb-4">
                        {u.email}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {u.profile?.phone && (
                          <div>
                            <div className="text-xs text-muted-foreground">Phone</div>
                            <div className="text-sm text-foreground mt-1">{u.profile.phone}</div>
                          </div>
                        )}
                        
                        {u.profile?.locationCity && (
                          <div>
                            <div className="text-xs text-muted-foreground">Location</div>
                            <div className="text-sm text-foreground mt-1">
                              {u.profile.locationCity}
                              {u.profile.locationEmirate && `, ${u.profile.locationEmirate}`}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Joined</div>
                          <div className="text-sm text-foreground mt-1">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {u.profile?.kycVerifiedAt && (
                          <div>
                            <div className="text-xs text-muted-foreground">KYC Verified</div>
                            <div className="text-sm text-foreground mt-1">
                              {new Date(u.profile.kycVerifiedAt).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>

                      {u.banned && u.banReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="text-xs text-red-600 font-medium mb-1">Ban Reason</div>
                          <div className="text-sm text-red-700">{u.banReason}</div>
                          {u.banExpires && (
                            <div className="text-xs text-red-600 mt-1">
                              Expires: {new Date(u.banExpires).toLocaleString()}
                            </div>
                          )}
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
