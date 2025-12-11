/**
 * Admin Layout
 * Layout for admin portal pages
 */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <nav className="bg-red-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Portal</h1>
          <div className="space-x-4">
            <span>Dashboard</span>
            <span>Users</span>
            <span>Partners</span>
            <span>Analytics</span>
            <span>Settings</span>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}