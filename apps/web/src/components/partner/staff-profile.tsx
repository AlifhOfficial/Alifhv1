/**
 * Staff Profile Component
 * Edit work identity - display name, work email, work phone
 * Minimal macOS-style design
 */
'use client';

import { useState, useEffect } from 'react';
import { useAsyncMutation } from '@/hooks/use-async-mutation';
import { useAsyncQuery } from '@/hooks/use-async-query';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, RefreshCw, User, Phone } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface StaffProfileData {
  id: string;
  displayName: string | null;
  workPhone: string | null;
  title: string | null;
  department: string | null;
  role: string;
}

// Role badge config
const ROLE_CONFIG: Record<string, { color: string; bg: string }> = {
  owner: { color: 'text-purple-600', bg: 'bg-purple-500/10' },
  manager: { color: 'text-primary', bg: 'bg-primary-muted' },
  staff: { color: 'text-foreground', bg: 'bg-secondary' },
};

export function StaffProfile() {
  const { toast } = useToast();
  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    workPhone: '',
  });

  // Fetch current profile
  const { data: profileData, isLoading, isRefetching, refetch } = useAsyncQuery({
    queryFn: async () => {
      const res = await fetch('/api/partner/staff/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
  });

  const profile: StaffProfileData | null = profileData?.data || null;

  // Populate form when data loads
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        workPhone: profile.workPhone || '',
      });
    }
  }, [profile]);

  // Update mutation
  const updateMutation = useAsyncMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/partner/staff/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update profile');
      }
      return res.json();
    },
    onSuccess: async () => {
      await refetch();
      toast({ title: 'Profile saved' });
      setEditing(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to save',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        workPhone: profile.workPhone || '',
      });
    }
    setEditing(false);
  };

  const getRoleBadge = (role: string) => {
    return ROLE_CONFIG[role] || ROLE_CONFIG.staff;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 compact:px-6 py-8 compact:py-16">
        {/* Back */}
        <Skeleton className="h-4 w-12 mb-6" />
        
        {/* Header */}
        <header className="mb-8 compact:mb-16">
          <div className="flex flex-col compact:flex-row compact:items-start compact:justify-between gap-4 compact:gap-0 mb-6 compact:mb-8">
            <div>
              <Skeleton className="h-7 w-40 mb-2" />
              <Skeleton className="h-4 w-56" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        </header>

        {/* Role Badge Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Form Fields Skeleton */}
        <div className="space-y-8 max-w-md">
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-3 w-48 mt-2" />
          </div>
          <div>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-3 w-40 mt-2" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <User className="w-10 h-10 text-muted-foreground/20 mb-4" />
          <h3 className="text-headline tracking-tight">Unable to load profile</h3>
          <p className="text-subhead text-muted-foreground mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(profile.role);

  return (
    <div className="max-w-6xl mx-auto px-4 compact:px-6 py-8 compact:py-16">
      {/* Back */}
      <Link 
        href="/partner-dashboard/staff"
        className="inline-flex items-center gap-1.5 text-subhead text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Staff
      </Link>

      {/* Header */}
      <header className="mb-8 compact:mb-16">
        <div className="flex flex-col compact:flex-row compact:items-start compact:justify-between gap-4 compact:gap-0 mb-6 compact:mb-8">
          <div>
            <h1 className="text-title3 compact:text-title2 font-semibold tracking-tight">Work Profile</h1>
            <p className="text-caption1 compact:text-subhead text-muted-foreground mt-2">
              Your work identity for client interactions
            </p>
          </div>
          <div className="flex items-center gap-2 compact:gap-3 self-end compact:self-auto">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isRefetching && "animate-spin")} />
            </button>
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                  className="px-3 compact:px-4 py-1.5 compact:py-2 rounded-full text-caption1 compact:text-subhead hover:bg-secondary/50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-3 compact:px-4 py-1.5 compact:py-2 rounded-full bg-primary text-white text-caption1 compact:text-subhead hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-3 compact:px-4 py-1.5 compact:py-2 rounded-full bg-primary text-white text-caption1 compact:text-subhead hover:bg-primary/90 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Role Badge */}
        <div className="flex flex-wrap items-center gap-2 compact:gap-3">
          <span className={cn(
            "px-2.5 py-1 rounded-md text-caption1 capitalize",
            roleBadge.bg,
            roleBadge.color
          )}>
            {profile.role}
          </span>
          {profile.title && (
            <span className="text-caption1 text-muted-foreground">{profile.title}</span>
          )}
          {profile.department && (
            <span className="text-caption1 text-muted-foreground">· {profile.department}</span>
          )}
        </div>
      </header>

      {/* Info Note */}
      <div className="mb-8 compact:mb-12 p-3 compact:p-4 rounded-xl bg-secondary/30">
        <p className="text-caption1 text-muted-foreground">
          Your display name is shown to clients instead of your personal name. Work email and phone are used for business communications.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4 compact:space-y-8">
        {/* Display Name */}
        <div className="group p-3 compact:p-4 -mx-3 compact:-mx-4 rounded-xl hover:bg-secondary/30 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-caption1 text-muted-foreground">Display Name</label>
              {editing ? (
                <input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. Ahmed, Alex, Sarah"
                  className="w-full mt-1 px-3 py-2 bg-secondary/50 rounded-lg text-subhead border border-transparent focus:border-primary focus:outline-none placeholder:text-muted-foreground/50"
                />
              ) : (
                <p className="text-subhead tracking-tight mt-1">
                  {profile.displayName || <span className="text-muted-foreground">Not set</span>}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Work Phone */}
        <div className="group p-3 compact:p-4 -mx-3 compact:-mx-4 rounded-xl hover:bg-secondary/30 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-caption1 text-muted-foreground">Work Phone</label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.workPhone}
                  onChange={(e) => setFormData({ ...formData, workPhone: e.target.value })}
                  placeholder="+971 50 123 4567"
                  className="w-full mt-1 px-3 py-2 bg-secondary/50 rounded-lg text-subhead border border-transparent focus:border-primary focus:outline-none placeholder:text-muted-foreground/50"
                />
              ) : (
                <p className="text-subhead tracking-tight mt-1">
                  {profile.workPhone || <span className="text-muted-foreground">Not set</span>}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
