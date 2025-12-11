/**
 * Root Dashboard - Auth + User Stats
 * Left: Authentication forms, Right: User profile/stats
 */

'use client';

import { useAuthSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  User, 
  Shield, 
  Building, 
  LogIn, 
  UserPlus, 
  TestTube,
  LogOut,
  Mail,
  Calendar,
  Hash,
  Users,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { getUserPortalAccess, getRoleDisplayName, getUserTypeDisplayName } from '@alifh/shared';

export default function RootDashboard() {
  const { user, isLoading } = useAuthSession();
  
  // Get comprehensive access permissions
  const access = getUserPortalAccess(user as any);

  // Authentication Section Component
  const AuthSection = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Alifh Platform</h1>
        <p className="text-muted-foreground">
          {user ? 'Welcome back!' : 'Sign in to access your dashboard'}
        </p>
      </div>

      {!user ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Sign In
              </CardTitle>
              <CardDescription>
                Access your account and portals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/signin">
                <Button className="w-full">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Create Account
              </CardTitle>
              <CardDescription>
                New to Alifh? Create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/signup">
                <Button variant="outline" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test Credentials
              </CardTitle>
              <CardDescription>
                Development testing accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><strong>Regular User:</strong><br/>john@example.com<br/>password123</div>
                <div><strong>Partner:</strong><br/>partner@techcorp.com<br/>partner123</div>
                <div><strong>Admin:</strong><br/>admin@alifh.ae<br/>admin123</div>
                <div><strong>Super Admin:</strong><br/>superadmin@alifh.ae<br/>super123</div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => signOut()} 
              variant="destructive" 
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // User Stats Section Component
  const UserStatsSection = () => {
    if (!user) {
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Sign in to view your profile information</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Please sign in to view your profile</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="font-semibold">{user.name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <p className="font-mono text-sm flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  {user.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email Verified</label>
                <Badge variant={user.emailVerified ? "default" : "destructive"}>
                  {user.emailVerified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Platform Role</label>
                <Badge variant="outline">
                  {getRoleDisplayName((user as any)?.platformRole || 'user')}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                <p className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partner Information */}
        {(user as any)?.activePartnerId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Works for</label>
                  <p className="font-semibold">TechCorp Solutions</p>
                  <p className="text-sm text-muted-foreground">Partner Organization</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Partner ID</label>
                  <p className="font-mono text-sm">{(user as any).activePartnerId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Organization Role</label>
                  <Badge variant="secondary">
                    <Briefcase className="h-3 w-3 mr-1" />
                    Owner
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Access Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Permissions
            </CardTitle>
            <CardDescription>
              Portals and features you have access to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Public Portal</span>
                </div>
                <Badge variant={access.public ? "default" : "secondary"}>
                  {access.public ? "Accessible" : "No Access"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>User Portal</span>
                </div>
                <Badge variant={access.user ? "default" : "secondary"}>
                  {access.user ? "Accessible" : "No Access"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>Partner Portal</span>
                </div>
                <Badge variant={access.partner ? "default" : "secondary"}>
                  {access.partner ? "Accessible" : "No Access"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Admin Portal</span>
                </div>
                <Badge variant={access.admin ? "default" : "secondary"}>
                  {access.admin ? "Accessible" : "No Access"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {access.user && (
              <Link href="/user">
                <Button variant="outline" className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  User Portal
                </Button>
              </Link>
            )}
            {access.partner && (
              <Link href="/partner">
                <Button variant="outline" className="w-full">
                  <Building className="h-4 w-4 mr-2" />
                  Partner Portal
                </Button>
              </Link>
            )}
            {access.admin && (
              <Link href="/admin">
                <Button variant="outline" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Portal
                </Button>
              </Link>
            )}
            <Link href="/public">
              <Button variant="outline" className="w-full">
                <Globe className="h-4 w-4 mr-2" />
                Public Portal
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Side: Authentication */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <AuthSection />
          </div>
          
          {/* Right Side: User Stats */}
          <div>
            <UserStatsSection />
          </div>
        </div>
      </div>
    </div>
  );
}