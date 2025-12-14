import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";

import { requireRole } from "@/lib/auth/roles";

import { requireRole } from "@/lib/auth/roles";import { requireRole } from "@/lib/auth/roles";

export default async function AdminDashboardPage() {

  const user = await requireRole("admin");



  return (export default async function AdminDashboardPage() {export default async function AdminDashboardPage() {

    <DashboardDisplayArea

      title="Admin Dashboard"  const user = await requireRole("admin");  const user = await requireRole("admin");

      description="Welcome back to the Alifh admin panel"

    >

      <div className="p-6 md:p-10">

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">  return (  return (

          {/* Stats Cards */}

          <div className="bg-card border border-border rounded-lg p-6">    <DashboardDisplayArea    <DashboardDisplayArea

            <div className="text-sm text-muted-foreground mb-2">Pending KYC</div>

            <div className="text-2xl font-semibold text-foreground">12</div>      title="Admin Dashboard"      title="Admin Dashboard"

          </div>

                description="Welcome back to the Alifh admin panel"      description="Welcome back to the Alifh admin panel"

          <div className="bg-card border border-border rounded-lg p-6">

            <div className="text-sm text-muted-foreground mb-2">Total Users</div>    >    >

            <div className="text-2xl font-semibold text-foreground">1,234</div>

          </div>      <div className="p-6 md:p-10">      <div className="p-6 md:p-10">

          

          <div className="bg-card border border-border rounded-lg p-6">        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">        <div className="space-y-6">

            <div className="text-sm text-muted-foreground mb-2">Active Partners</div>

            <div className="text-2xl font-semibold text-foreground">45</div>          {/* Stats Cards */}

          </div>

                    <div className="bg-card border border-border rounded-lg p-6">      {/* System Stats */}

          <div className="bg-card border border-border rounded-lg p-6">

            <div className="text-sm text-muted-foreground mb-2">Active Listings</div>            <div className="text-sm text-muted-foreground mb-2">Pending KYC</div>      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <div className="text-2xl font-semibold text-foreground">567</div>

          </div>            <div className="text-2xl font-semibold text-foreground">12</div>        <div className="bg-white overflow-hidden shadow rounded-lg">

        </div>

          </div>          <div className="p-5">

        {/* Quick Actions */}

        <div className="mt-8">                      <div className="flex items-center">

          <h2 className="text-lg font-medium text-foreground mb-4">Quick Actions</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">          <div className="bg-card border border-border rounded-lg p-6">              <div className="flex-shrink-0">

            <a

              href="/admin-dashboard/kyc"            <div className="text-sm text-muted-foreground mb-2">Total Users</div>                <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">

              className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"

            >            <div className="text-2xl font-semibold text-foreground">1,234</div>                  <span className="text-white text-sm font-medium">U</span>

              <div className="text-sm font-medium text-foreground mb-2">Review KYC Requests</div>

              <div className="text-xs text-muted-foreground">12 pending verifications</div>          </div>                </div>

            </a>

                                    </div>

            <a

              href="/admin-dashboard/partners"          <div className="bg-card border border-border rounded-lg p-6">              <div className="ml-5 w-0 flex-1">

              className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"

            >            <div className="text-sm text-muted-foreground mb-2">Active Partners</div>                <dl>

              <div className="text-sm font-medium text-foreground mb-2">Manage Partners</div>

              <div className="text-xs text-muted-foreground">View all partner accounts</div>            <div className="text-2xl font-semibold text-foreground">45</div>                  <dt className="text-sm font-medium text-gray-500 truncate">

            </a>

                      </div>                    Total Users

            <a

              href="/admin-dashboard/users"                            </dt>

              className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"

            >          <div className="bg-card border border-border rounded-lg p-6">                  <dd className="text-lg font-medium text-gray-900">2,847</dd>

              <div className="text-sm font-medium text-foreground mb-2">User Management</div>

              <div className="text-xs text-muted-foreground">Manage user accounts</div>            <div className="text-sm text-muted-foreground mb-2">Active Listings</div>                </dl>

            </a>

          </div>            <div className="text-2xl font-semibold text-foreground">567</div>              </div>

        </div>

      </div>          </div>            </div>

    </DashboardDisplayArea>

  );        </div>          </div>

}

        </div>

        {/* Quick Actions */}

        <div className="mt-8">        <div className="bg-white overflow-hidden shadow rounded-lg">

          <h2 className="text-lg font-medium text-foreground mb-4">Quick Actions</h2>          <div className="p-5">

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">            <div className="flex items-center">

            <a              <div className="flex-shrink-0">

              href="/admin-dashboard/kyc"                <div className="h-8 w-8 bg-emerald-500 rounded-md flex items-center justify-center">

              className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"                  <span className="text-white text-sm font-medium">P</span>

            >                </div>

              <div className="text-sm font-medium text-foreground mb-2">Review KYC Requests</div>              </div>

              <div className="text-xs text-muted-foreground">12 pending verifications</div>              <div className="ml-5 w-0 flex-1">

            </a>                <dl>

                              <dt className="text-sm font-medium text-gray-500 truncate">

            <a                    Active Partners

              href="/admin-dashboard/partners"                  </dt>

              className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"                  <dd className="text-lg font-medium text-gray-900">47</dd>

            >                </dl>

              <div className="text-sm font-medium text-foreground mb-2">Manage Partners</div>              </div>

              <div className="text-xs text-muted-foreground">View all partner accounts</div>            </div>

            </a>          </div>

                    </div>

            <a

              href="/admin-dashboard/users"        <div className="bg-white overflow-hidden shadow rounded-lg">

              className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"          <div className="p-5">

            >            <div className="flex items-center">

              <div className="text-sm font-medium text-foreground mb-2">User Management</div>              <div className="flex-shrink-0">

              <div className="text-xs text-muted-foreground">Manage user accounts</div>                <div className="h-8 w-8 bg-red-500 rounded-md flex items-center justify-center">

            </a>                  <span className="text-white text-sm font-medium">S</span>

          </div>                </div>

        </div>              </div>

      </div>              <div className="ml-5 w-0 flex-1">

    </DashboardDisplayArea>                <dl>

  );                  <dt className="text-sm font-medium text-gray-500 truncate">

}                    System Health

                  </dt>
                  <dd className="text-lg font-medium text-gray-900">98.5%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">R</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Revenue (MTD)
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">$89.2K</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              System Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <span>User Management</span>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <span>System Configuration</span>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <span>Security Settings</span>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Admin Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-red-400 rounded-full"></div>
                <p className="text-sm text-gray-600">User account suspended: user@example.com</p>
                <span className="text-xs text-gray-400">1 hour ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <p className="text-sm text-gray-600">New partner approved: TechCorp Ltd.</p>
                <span className="text-xs text-gray-400">3 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                <p className="text-sm text-gray-600">System backup completed</p>
                <span className="text-xs text-gray-400">6 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </StandardDashboardLayout>
  );
}