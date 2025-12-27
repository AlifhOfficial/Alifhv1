/**
 * Staff Profile Form Component
 * Edit work identity (display name, work email, work phone)
 * Following profile-view minimal design system
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, User, Mail, Phone, Info, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface StaffProfile {
  id: string;
  displayName: string | null;
  workEmail: string | null;
  workPhone: string | null;
  partner: {
    brandName: string;
  };
}

export function StaffProfileForm() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<StaffProfile>({
    queryKey: ['staff-profile'],
    queryFn: async () => {
      const res = await fetch('/api/staff/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
  });

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    workEmail: '',
    workPhone: '',
  });

  // Populate form when data loads
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        workEmail: profile.workEmail || '',
        workPhone: profile.workPhone || '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/staff/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-profile'] });
      toast({ title: 'Profile saved' });
      setEditing(false);
    },
    onError: () => {
      toast({
        title: 'Failed to save',
        description: 'Please try again.',
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
        workEmail: profile.workEmail || '',
        workPhone: profile.workPhone || '',
      });
    }
    setEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Unable to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-4xl mx-auto px-8 py-16 space-y-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="flex items-start gap-3">
            <Link
              href="/staff-dashboard"
              className="p-2 hover:bg-secondary/50 rounded-lg transition-colors mt-0.5"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Work Profile</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your professional identity at {profile.partner.brandName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-12 md:ml-0">
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['staff-profile'] })}
              className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2 rounded-full border border-border bg-background text-sm font-medium hover:bg-secondary/50 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-xl border border-border/40 p-6 bg-muted/30">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-medium text-foreground">Why separate work details?</p>
              <p className="text-muted-foreground">
                Your display name will be shown to clients instead of your personal name. 
                Work email and phone are used for business communications, keeping your personal contact private.
              </p>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-12">
          
          {/* Work Identity */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h3 className="text-lg font-medium tracking-tight">Work Identity</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                <input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  disabled={!editing}
                  placeholder="e.g. Ahmed, Alex, Sarah"
                  className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/30"
                />
                <p className="text-xs text-muted-foreground">
                  This name will be shown to clients
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Work Email</label>
                <input
                  type="email"
                  value={formData.workEmail}
                  onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                  disabled={!editing}
                  placeholder="your.name@dealership.com"
                  className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/30"
                />
                <p className="text-xs text-muted-foreground">
                  Clients will contact you at this email
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Work Phone</label>
                <input
                  type="tel"
                  value={formData.workPhone}
                  onChange={(e) => setFormData({ ...formData, workPhone: e.target.value })}
                  disabled={!editing}
                  placeholder="+971 50 123 4567"
                  className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/30"
                />
                <p className="text-xs text-muted-foreground">
                  Your work number for client calls
                </p>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
