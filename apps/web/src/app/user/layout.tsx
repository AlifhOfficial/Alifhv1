/**
 * User Layout
 * Layout for user-facing app pages
 */

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <nav className="bg-green-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">My Alifh</h1>
          <div className="space-x-4">
            <span>Dashboard</span>
            <span>My Listings</span>
            <span>Saved</span>
            <span>Profile</span>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}