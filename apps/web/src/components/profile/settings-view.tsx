/**
 * Settings View - Account Management
 * 
 * Privacy controls, preferences, and account deletion
 * Clean, Mobbin-inspired layout
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useUserProfile, type UserProfileUpdate } from '@/hooks/profile';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SettingsViewProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function SettingsView({ userName, userEmail }: SettingsViewProps) {
  const { profile, updateProfile, refresh } = useUserProfile();
  const { toast } = useToast();

  const [form, setForm] = useState({
    consignmentMode: true,
    showPhone: true,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize from profile
  useEffect(() => {
    if (profile && !initialized) {
      setForm({
        consignmentMode: profile.consignmentMode ?? true,
        showPhone: profile.privacySettings?.showPhone ?? true,
      });
      setInitialized(true);
    }
  }, [profile, initialized]);

  const updateField = (updates: Partial<typeof form>) => {
    setForm(f => ({ ...f, ...updates }));
  };

  const save = async (field: 'consignmentMode' | 'showPhone') => {
    setSaving(true);
    try {
      const payload: UserProfileUpdate = {
        consignmentMode: field === 'consignmentMode' ? form.consignmentMode : undefined,
        privacySettings: field === 'showPhone' ? { showPhone: form.showPhone } : undefined,
      };
      await updateProfile(payload);
      await refresh();
      toast({ title: 'Setting updated' });
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteText !== 'DELETE') {
      toast({ title: 'Type "DELETE" to confirm', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/profile/user/delete-account', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Account marked for deletion' });
        setTimeout(() => window.location.href = '/', 2000);
      } else throw new Error(data.error);
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage your preferences and account
          </p>
        </div>

        {/* Preferences */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Preferences</h3>
          </div>

          <div className="space-y-4">
            {/* Consignment Mode */}
            <div className="rounded-xl border border-border/40 p-6 flex items-start justify-between gap-6">
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-foreground">Consignment Mode</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Enable this to list vehicles on consignment. This changes how your listings are displayed.
                </p>
              </div>
              <button
                onClick={async () => {
                  updateField({ consignmentMode: !form.consignmentMode });
                  await save('consignmentMode');
                }}
                disabled={saving}
                className={cn(
                  "relative h-7 w-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50",
                  form.consignmentMode ? "bg-foreground" : "bg-secondary"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
                    form.consignmentMode ? "left-6" : "left-1"
                  )}
                />
              </button>
            </div>

            {/* Show Phone */}
            <div className="rounded-xl border border-border/40 p-6 flex items-start justify-between gap-6">
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-foreground">Show Phone Number</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Display your phone number on your public profile so buyers can contact you directly.
                </p>
              </div>
              <button
                onClick={async () => {
                  updateField({ showPhone: !form.showPhone });
                  await save('showPhone');
                }}
                disabled={saving}
                className={cn(
                  "relative h-7 w-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50",
                  form.showPhone ? "bg-foreground" : "bg-secondary"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
                    form.showPhone ? "left-6" : "left-1"
                  )}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-destructive/20 pb-2">
            <h3 className="text-lg font-medium tracking-tight text-destructive">Danger Zone</h3>
          </div>

          <div className="rounded-xl border border-destructive/30 p-6 flex items-start justify-between gap-6">
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-foreground">Delete Account</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-5 py-2 rounded-full border border-destructive/30 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors flex-shrink-0"
            >
              Delete Account
            </button>
          </div>
        </section>

      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border/40 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Content */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Delete Account</h2>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. Your account will be permanently deleted after 6 months.
              </p>
            </div>
            
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider font-medium text-muted-foreground block">
                Type "DELETE" to confirm
              </label>
              <input
                type="text"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="DELETE"
                className="w-full h-11 px-4 bg-secondary/20 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive/50 transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteText('');
                }}
                className="flex-1 px-6 py-3 rounded-full border border-border/40 hover:bg-secondary/50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleteText !== 'DELETE'}
                className="flex-1 px-6 py-3 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
