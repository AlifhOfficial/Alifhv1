"use client";

import { Navbar } from "@/components/navbar";
import { useUser } from "@/hooks/auth/use-auth";

export default function HomePage() {
  const { user, isLoading } = useUser();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen pt-16 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen pt-16 gap-4">
        <h1 className="text-4xl font-bold">Hello Alifh</h1>
        {user ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Welcome back, <span className="font-medium">{user.name}</span>!
            </p>
            <p className="text-sm text-muted-foreground">
              Click your profile icon in the navbar to access your dashboards
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Try clicking the user icon in the navbar above to sign in
          </p>
        )}
      </div>
    </>
  );
}
