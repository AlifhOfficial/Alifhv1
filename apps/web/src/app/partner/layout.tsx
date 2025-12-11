/**
 * Partner Layout
 * Layout for partner portal pages
 */

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <nav className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Partner Portal</h1>
          <div className="space-x-4">
            <span>Dashboard</span>
            <span>Inventory</span>
            <span>Analytics</span>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}