/**
 * Staff Profile Form Component
 * Edit work identity (display name, work email, work phone)
 * Redesigned to match partner profile UI/UX pattern
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Phone, Info } from 'lucide-react';
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
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="space-y-1.5 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Work Profile</h1>
            <p className="text-sm text-muted-foreground">
              {profile.partner.brandName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2 rounded-full border border-border/40 bg-background text-sm font-semibold hover:bg-muted/40 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-xl border border-border/40 bg-muted/30 p-5">
          <div className="flex gap-3">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-foreground">Professional Identity</p>
              <p className="text-muted-foreground">
                Your display name will be shown to clients instead of your personal name. 
                Work email and phone are used for business communications, keeping your personal contact private.
              </p>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-8">
          
          {/* Display Name */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold tracking-tight text-foreground">Display Name</h3>
            
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <User className="w-3 h-3" />
                  Name shown to clients
                </div>
                <input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  disabled={!editing}
                  placeholder="e.g. Ahmed, Alex, Sarah"
                  className="w-full h-10 bg-transparent border-b border-border/40 focus:border-primary outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/50 text-foreground font-medium"
                />
                <p className="text-xs text-muted-foreground">
                  This is how clients will see your name on listings and messages
                </p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold tracking-tight text-foreground">Work Contact</h3>
            
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    Work Email
                  </div>
                  <input
                    type="email"
                    value={formData.workEmail}
                    onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                    disabled={!editing}
                    placeholder="your.name@dealership.com"
                    className="w-full h-10 bg-transparent border-b border-border/40 focus:border-primary outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/50 text-foreground font-medium"
                  />
                  <p className="text-xs text-muted-foreground">
                    Clients will contact you at this email address
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    Work Phone
                  </div>
                  <input
                    type="tel"
                    value={formData.workPhone}
                    onChange={(e) => setFormData({ ...formData, workPhone: e.target.value })}
                    disabled={!editing}
                    placeholder="+971 50 123 4567"
                    className="w-full h-10 bg-transparent border-b border-border/40 focus:border-primary outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/50 text-foreground font-medium"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your business number for client calls and WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
