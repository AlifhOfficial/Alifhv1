/**
 * Profile Page - Display User Information
 * Shows authenticated user details for testing auth flow
 * Follows Alifh Design Philosophy: clean, minimal
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, Shield, LogOut } from "lucide-react";
import { useAuthSession, signOut } from "@/lib/auth/client";
import { Navbar } from "@/components/navbar";
import { Button, Card, Separator } from "@/components/ui";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuthSession();
  const router = useRouter();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-16 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 bg-muted/5">
        <div className="max-w-4xl mx-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-medium">Profile</h1>
              <p className="text-sm text-muted-foreground">
                Your account information and authentication details
              </p>
            </div>

            {/* Profile Card */}
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-medium">{user.name || "User"}</h2>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>

                <Separator />

                {/* User Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Information</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Basic Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Full Name</p>
                          <p className="text-sm font-medium">{user.name || "Not provided"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email Address</p>
                          <p className="text-sm font-medium">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Account Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Account Created</p>
                          <p className="text-sm font-medium">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">User ID</p>
                          <p className="text-sm font-medium font-mono">{user.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Raw User Data (for development/testing) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Raw User Data</h3>
                  <div className="bg-muted/20 border border-border/20 rounded-lg p-4">
                    <pre className="text-xs text-muted-foreground overflow-auto">
                      {JSON.stringify(user, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}