/**
 * Admin Dashboard Statistics Component
 * 
 * Shows overview statistics for the admin dashboard including:
 * - User counts by role
 * - Partner counts by status  
 * - System metrics
 */

'use client';

import { useAdminStats } from '@/hooks/admin';
import {
  Users,
  Building2,
  Shield,
  Crown,
  UserCheck,
  UserX,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export function AdminDashboardStats() {
  const { stats, isLoading, isError, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading statistics...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg p-6">
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
      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-6">
        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="w-5 h-5" />
          <span>No statistics available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-900/30 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Overview</h2>
            <p className="text-gray-600 dark:text-gray-300">Monitor platform performance and user activity</p>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Statistics
          </h3>
          <Link 
            href="/admin-dashboard/users"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View All Users
            <TrendingUp className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.users.total.toLocaleString()}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-600 dark:text-green-400">Regular Users</p>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.users.user.toLocaleString()}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-600 dark:text-blue-400">Admins</p>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.users.admin.toLocaleString()}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <p className="text-sm text-purple-600 dark:text-purple-400">Super Admins</p>
            </div>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {stats.users.super_admin.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Partner Statistics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Partner Statistics
          </h3>
          <Link 
            href="/admin-dashboard/partners"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View All Partners
            <TrendingUp className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Partners</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.partners.total.toLocaleString()}
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
            </div>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {stats.partners.pending.toLocaleString()}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-600 dark:text-green-400">Active</p>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.partners.active.toLocaleString()}
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <p className="text-sm text-orange-600 dark:text-orange-400">Suspended</p>
            </div>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {stats.partners.suspended.toLocaleString()}
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">Cancelled</p>
            </div>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
              {stats.partners.cancelled.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            href="/admin-dashboard/users"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-gray-900 dark:text-white">Manage Users</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View, search, and manage user accounts
            </p>
          </Link>

          <Link 
            href="/admin-dashboard/partners"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-gray-900 dark:text-white">Manage Partners</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Review and approve partner applications
            </p>
          </Link>

          <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-6 opacity-75">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <h4 className="font-medium text-gray-500 dark:text-gray-400">System Logs</h4>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}