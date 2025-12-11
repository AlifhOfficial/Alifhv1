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

  const portals = [
    {
      title: 'Public Marketplace',
      description: 'General marketplace for all visitors',
      href: '/public',
      icon: Globe,
      badge: 'Public',
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      available: access.public,
      accessLevel: 'Everyone'
    },
    {
      title: 'User Portal',
      description: 'Your personal dashboard and features',
      href: '/user',
      icon: User,
      badge: 'User',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      available: access.user,
      accessLevel: 'Authenticated Users'
    },
    {
      title: 'Partner Portal',
      description: 'Partner organization management & tools',
      href: '/partner', 
      icon: Building,
      badge: 'Partner',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      available: access.partner,
      accessLevel: 'Alifh Partners'
    },
    {
      title: 'Admin Portal',
      description: 'Alifh internal operations & moderation',
      href: '/admin',
      icon: Shield,
      badge: 'Admin',
      color: 'bg-red-50 hover:bg-red-100 border-red-200',
      available: access.admin,
      accessLevel: 'Alifh Team'
    }
  ];

  const authRoutes = [
    {
      title: 'Sign In',
      href: '/signin',
      icon: LogIn,
      variant: 'default' as const,
      show: !user
    },
    {
      title: 'Sign Up', 
      href: '/signup',
      icon: UserPlus,
      variant: 'outline' as const,
      show: !user
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Alifh Platform</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Alifh Platform
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Role-Based Portal Access
          </p>
          {user ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-col items-center gap-2">
                <Badge variant="default" className="text-sm">
                  Welcome, {user.name || user.email}
                </Badge>
                <div className="flex gap-2">
                  <Badge variant={access.userType === 'alifh' ? 'destructive' : access.userType === 'partner' ? 'secondary' : 'outline'}>
                    {getRoleDisplayName(user as any)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getUserTypeDisplayName(user as any)}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut()}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Badge variant="outline">Not authenticated</Badge>
          )}
        </div>

        {/* Auth Actions (when not signed in) */}
        {!user && (
          <div className="flex justify-center gap-4 mb-12">
            {authRoutes.filter(route => route.show).map((route) => (
              <Button
                key={route.title}
                variant={route.variant}
                asChild
                className="flex items-center gap-2"
              >
                <Link href={route.href}>
                  <route.icon className="w-4 h-4" />
                  {route.title}
                </Link>
              </Button>
            ))}
          </div>
        )}

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {portals.map((portal) => (
            <Card 
              key={portal.title} 
              className={`${portal.color} transition-all duration-200 hover:shadow-lg ${
                portal.available ? 'hover:-translate-y-1' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <portal.icon className="w-8 h-8 text-gray-700" />
                  <Badge variant="secondary" className="text-xs">
                    {portal.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{portal.title}</CardTitle>
                <CardDescription className="text-sm">
                  {portal.description}
                </CardDescription>
                {!portal.available && (
                  <div className="text-xs text-gray-500 mt-1">
                    Requires: {portal.accessLevel}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  asChild={portal.available}
                  variant={portal.available ? "default" : "outline"}
                  disabled={!portal.available}
                  className="w-full"
                >
                  {portal.available ? (
                    <Link href={portal.href}>
                      Enter Portal
                    </Link>
                  ) : (
                    <span>Access Denied</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Test Auth Section */}
        <div className="border-t pt-8">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5" />
                <span>Test Authentication</span>
              </CardTitle>
              <CardDescription>
                Manual testing with seeded accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-medium">Admin:</div>
                  <div>admin@alifh.com</div>
                  <div>admin123</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Staff:</div>
                  <div>staff@alifh.com</div>
                  <div>staff123</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">User 1:</div>
                  <div>john@example.com</div>
                  <div>password123</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">User 2:</div>
                  <div>jane@example.com</div>
                  <div>password123</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}