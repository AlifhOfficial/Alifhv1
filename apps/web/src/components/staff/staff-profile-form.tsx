/**
 * Staff Profile Form Component
 * Edit work identity (display name, work email, work phone)
 * Following profile-view minimal design system
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, User, Mail, Phone } from 'lucide-react';
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

  const [displayName, setDisplayName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [workPhone, setWorkPhone] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Initialize form when data loads
  if (profile && !initialized) {
    setDisplayName(profile.displayName || '');
    setWorkEmail(profile.workEmail || '');
    setWorkPhone(profile.workPhone || '');
    setInitialized(true);
  }

  const updateMutation = useMutation({
    mutationFn: async (data: { displayName: string; workEmail: string; workPhone: string }) => {
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
      toast({
        title: 'Profile Updated',
        description: 'Your work identity has been saved.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ displayName, workEmail, workPhone });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-secondary/50 rounded-xl w-48" />
          <div className="h-96 bg-secondary/50 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No staff profile found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-16">
      
      {/* Back Button */}
      <Link 
        href="/staff-dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Work Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your professional identity at {profile.partner.brandName}
        </p>
      </section>

      {/* Form */}
      <section className="space-y-8">
        <div className="border-b border-border/40 pb-2">
          <h3 className="text-lg font-medium tracking-tight">Work Identity</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This information is used when interacting with clients
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Display Name */}
          <div className="space-y-3">
            <label htmlFor="displayName" className="flex items-center gap-2 text-sm font-medium">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              placeholder="e.g., Ahmed K. or your code name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0"
            />
            <p className="text-xs text-muted-foreground">
              The name shown to clients. Can be a nickname or professional alias.
            </p>
          </div>

          {/* Work Email */}
          <div className="space-y-3">
            <label htmlFor="workEmail" className="flex items-center gap-2 text-sm font-medium">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              Work Email
            </label>
            <input
              id="workEmail"
              type="email"
              placeholder="your.name@dealership.com"
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0"
            />
            <p className="text-xs text-muted-foreground">
              Your dealership email for client communications.
            </p>
          </div>

          {/* Work Phone */}
          <div className="space-y-3">
            <label htmlFor="workPhone" className="flex items-center gap-2 text-sm font-medium">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              Work Phone
            </label>
            <input
              id="workPhone"
              type="tel"
              placeholder="+971 50 123 4567"
              value={workPhone}
              onChange={(e) => setWorkPhone(e.target.value)}
              className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0"
            />
            <p className="text-xs text-muted-foreground">
              Your work phone number for receiving client calls.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-8 border-t border-border">
            <button
              type="button"
              onClick={() => router.push('/staff-dashboard')}
              className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
