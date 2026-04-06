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
      <div className="rounded-xl border border-destructive/40 bg-destructive-muted bg-destructive-muted p-6">
        <div className="flex items-center gap-2 text-destructive mb-2">
          <XCircle className="w-5 h-5" />
          <h3 className="font-medium">Error Loading Statistics</h3>
        </div>
        <p className="text-subhead text-destructive/80 text-destructive/80">
          {error instanceof Error ? error.message : 'Failed to load dashboard statistics'}
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-xl border border-yellow-500/40 bg-yellow-50 dark:bg-yellow-950/20 p-6">
        <div className="flex items-center gap-2 text-warning">
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
          <div className="w-12 h-12 rounded-full bg-primary-muted flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-title3 font-semibold">System Overview</h2>
            <p className="text-subhead text-muted-foreground">Monitor platform performance and user activity</p>
          </div>
        </div>
      </section>

      {/* User Statistics */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
          <h3 className="text-headline tracking-tight">User Statistics</h3>
          <Link 
            href="/admin-dashboard/users"
            className="text-subhead text-primary hover:text-primary transition-colors flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 regular:grid-cols-4 border-y border-border divide-x divide-border bg-background">
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Total Users</span>
            <span className="text-title2 font-semibold text-primary">{stats.users.total.toLocaleString()}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Regular Users</span>
            <span className="text-title2 font-semibold text-success">{stats.users.user.toLocaleString()}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Admins</span>
            <span className="text-title2 font-semibold text-foreground">{stats.users.admin.toLocaleString()}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Super Admins</span>
            <span className="text-title2 font-semibold text-foreground">{stats.users.super_admin.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Partner Statistics */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
          <h3 className="text-headline tracking-tight">Partner Statistics</h3>
          <Link 
            href="/admin-dashboard/partners"
            className="text-subhead text-primary hover:text-primary transition-colors flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 regular:grid-cols-5 border-y border-border divide-x divide-border bg-background">
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Total</span>
            <span className="text-title2 font-semibold text-primary">{stats.partners.total.toLocaleString()}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Pending</span>
            <span className="text-title2 font-semibold text-warning">{stats.partners.pending.toLocaleString()}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Active</span>
            <span className="text-title2 font-semibold text-success">{stats.partners.active.toLocaleString()}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Suspended</span>
            <span className="text-title2 font-semibold text-foreground">{stats.partners.suspended.toLocaleString()}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Cancelled</span>
            <span className="text-title2 font-semibold text-foreground">{stats.partners.cancelled.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
          <h3 className="text-headline tracking-tight">Quick Actions</h3>
        </div>
        
        <div className="grid grid-cols-1 regular:grid-cols-3 gap-4">
          <Link 
            href="/admin-dashboard/users"
            className="group rounded-xl border border-border p-6  hover:bg-secondary/10 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-medium">Manage Users</h4>
            </div>
            <p className="text-subhead text-muted-foreground">View, search, and manage user accounts</p>
          </Link>

          <Link 
            href="/admin-dashboard/partners"
            className="group rounded-xl border border-border p-6  hover:bg-secondary/10 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-medium">Manage Partners</h4>
            </div>
            <p className="text-subhead text-muted-foreground">Review and approve partner applications</p>
          </Link>

          <Link 
            href="/admin-dashboard/ban-appeals"
            className="group rounded-xl border border-border p-6  hover:bg-secondary/10 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-medium">Ban Appeals</h4>
            </div>
            <p className="text-subhead text-muted-foreground">Review user ban appeal requests</p>
          </Link>
        </div>
      </section>

    </div>
  );
}
