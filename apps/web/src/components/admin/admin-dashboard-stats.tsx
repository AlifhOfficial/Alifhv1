/**
 * Admin Dashboard Statistics Component
 * Shows overview statistics for the admin dashboard
 * Following profile-view design system
 */

'use client';

import { useAdminStats } from '@/hooks/admin';
import {
  Users,
  Building2,
  Shield,
  Crown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

export function AdminDashboardStats() {
  const { stats, isLoading, isError, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-50 dark:bg-red-950/20 p-6">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
          <XCircle className="w-5 h-5" />
          <h3 className="font-medium">Error Loading Statistics</h3>
        </div>
        <p className="text-sm text-red-600/80 dark:text-red-400/80">
          {error instanceof Error ? error.message : 'Failed to load dashboard statistics'}
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-xl border border-yellow-500/40 bg-yellow-50 dark:bg-yellow-950/20 p-6">
        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="w-5 h-5" />
          <span>No statistics available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      
      {/* Welcome */}
      <section className="rounded-xl border border-border p-8 bg-gradient-to-br from-blue-500/5 to-blue-500/0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">System Overview</h2>
            <p className="text-sm text-muted-foreground">Monitor platform performance and user activity</p>
          </div>
        </div>
      </section>

      {/* User Statistics */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
          <h3 className="text-lg font-medium tracking-tight">User Statistics</h3>
          <Link 
            href="/admin-dashboard/users"
            className="text-sm text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border divide-x divide-border bg-background">
          <div className="p-8 flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Total Users</span>
            <span className="text-2xl font-semibold text-blue-500">{stats.users.total.toLocaleString()}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Regular Users</span>
            <span className="text-2xl font-semibold text-green-500">{stats.users.user.toLocaleString()}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Admins</span>
            <span className="text-2xl font-semibold text-foreground">{stats.users.admin.toLocaleString()}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Super Admins</span>
            <span className="text-2xl font-semibold text-foreground">{stats.users.super_admin.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Partner Statistics */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
          <h3 className="text-lg font-medium tracking-tight">Partner Statistics</h3>
          <Link 
            href="/admin-dashboard/partners"
            className="text-sm text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 border-y border-border divide-x divide-border bg-background">
          <div className="p-8 flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Total</span>
            <span className="text-2xl font-semibold text-blue-500">{stats.partners.total.toLocaleString()}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Pending</span>
            <span className="text-2xl font-semibold text-yellow-500">{stats.partners.pending.toLocaleString()}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Active</span>
            <span className="text-2xl font-semibold text-green-500">{stats.partners.active.toLocaleString()}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Suspended</span>
            <span className="text-2xl font-semibold text-foreground">{stats.partners.suspended.toLocaleString()}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Cancelled</span>
            <span className="text-2xl font-semibold text-foreground">{stats.partners.cancelled.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
          <h3 className="text-lg font-medium tracking-tight">Quick Actions</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/admin-dashboard/users"
            className="group rounded-xl border border-border p-6 hover:border-blue-500/40 hover:bg-secondary/10 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <h4 className="font-medium">Manage Users</h4>
            </div>
            <p className="text-sm text-muted-foreground">View, search, and manage user accounts</p>
          </Link>

          <Link 
            href="/admin-dashboard/partners"
            className="group rounded-xl border border-border p-6 hover:border-blue-500/40 hover:bg-secondary/10 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Building2 className="w-5 h-5 text-blue-500" />
              </div>
              <h4 className="font-medium">Manage Partners</h4>
            </div>
            <p className="text-sm text-muted-foreground">Review and approve partner applications</p>
          </Link>

          <Link 
            href="/admin-dashboard/ban-appeals"
            className="group rounded-xl border border-border p-6 hover:border-blue-500/40 hover:bg-secondary/10 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <h4 className="font-medium">Ban Appeals</h4>
            </div>
            <p className="text-sm text-muted-foreground">Review user ban appeal requests</p>
          </Link>
        </div>
      </section>

    </div>
  );
}
