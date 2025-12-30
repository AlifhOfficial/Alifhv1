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
import { useAuth } from '@/providers/auth-provider';

export function SettingsView() {
  const { session: user } = useAuth();
  const { profile, updateProfile, refresh } = useUserProfile();
  const { toast } = useToast();

  const [form, setForm] = useState({
    consignmentMode: true,
    showPhone: true,
    useGeneratedAvatar: true,
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
        useGeneratedAvatar: profile.preferences?.useGeneratedAvatar ?? true,
      });
      setInitialized(true);
    }
  }, [profile, initialized]);

  const updateField = (updates: Partial<typeof form>) => {
    setForm(f => ({ ...f, ...updates }));
  };

  const save = async (field: 'consignmentMode' | 'showPhone' | 'useGeneratedAvatar') => {
    setSaving(true);
    try {
      const payload: UserProfileUpdate = {
        consignmentMode: field === 'consignmentMode' ? form.consignmentMode : undefined,
        privacySettings: field === 'showPhone' ? { showPhone: form.showPhone } : undefined,
        preferences: field === 'useGeneratedAvatar' ? { useGeneratedAvatar: form.useGeneratedAvatar } : undefined,
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
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-16">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Manage your preferences and account
          </p>
        </div>

        {/* Preferences */}
        <section className="space-y-6">
          <h3 className="text-base font-medium tracking-tight">Preferences</h3>

          <div className="space-y-3">
            {/* Consignment Mode */}
            <div className="rounded-xl border border-border/40 p-6 flex items-start justify-between gap-6 hover:bg-muted/10 transition-colors">
              <div className="space-y-1.5 flex-1">
                <p className="text-sm font-medium">Consignment Mode</p>
                <p className="text-sm text-muted-foreground/70">
                  Enable this to list vehicles on consignment
                </p>
              </div>
              <button
                onClick={async () => {
                  updateField({ consignmentMode: !form.consignmentMode });
                  await save('consignmentMode');
                }}
                disabled={saving}
                className={cn(
                  "relative h-7 w-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50",
                  form.consignmentMode ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-5 w-5 rounded-full shadow-sm transition-transform",
                    form.consignmentMode ? "left-6 bg-white" : "left-1 bg-white"
                  )}
                />
              </button>
            </div>

            {/* Show Phone */}
            <div className="rounded-xl border border-border/40 p-6 flex items-start justify-between gap-6 hover:bg-muted/10 transition-colors">
              <div className="space-y-1.5 flex-1">
                <p className="text-sm font-medium">Show Phone Number</p>
                <p className="text-sm text-muted-foreground/70">
                  Display your phone on your public profile
                </p>
              </div>
              <button
                onClick={async () => {
                  updateField({ showPhone: !form.showPhone });
                  await save('showPhone');
                }}
                disabled={saving}
                className={cn(
                  "relative h-7 w-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50",
                  form.showPhone ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-5 w-5 rounded-full shadow-sm transition-transform",
                    form.showPhone ? "left-6 bg-white" : "left-1 bg-white"
                  )}
                />
              </button>
            </div>

            {/* Generated Avatar */}
            <div className="rounded-xl border border-border/40 p-6 flex items-start justify-between gap-6 hover:bg-muted/10 transition-colors">
              <div className="space-y-1.5 flex-1">
                <p className="text-sm font-medium">Generated Avatar</p>
                <p className="text-sm text-muted-foreground/70">
                  Show robot avatar when no profile photo is set
                </p>
              </div>
              <button
                onClick={async () => {
                  updateField({ useGeneratedAvatar: !form.useGeneratedAvatar });
                  await save('useGeneratedAvatar');
                }}
                disabled={saving}
                className={cn(
                  "relative h-7 w-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50",
                  form.useGeneratedAvatar ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-5 w-5 rounded-full shadow-sm transition-transform",
                    form.useGeneratedAvatar ? "left-6 bg-white" : "left-1 bg-white"
                  )}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Account Actions */}
        <section className="space-y-6">
          <h3 className="text-base font-medium tracking-tight">Account</h3>

          <div className="rounded-xl border border-border/40 p-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground/70">
                  This will permanently delete your account and all data after 6 months
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2 rounded-full border border-border/40 text-sm font-medium tracking-tight hover:bg-muted/50 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </section>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-card/95 backdrop-blur-sm border border-border/30 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
            
            {/* Content */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight">Delete Account?</h2>
              <p className="text-sm text-muted-foreground/70 leading-relaxed">
                This action cannot be undone. Your account will be permanently deleted after 6 months.
              </p>
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground block">
                Type "DELETE" to confirm
              </label>
              <input
                type="text"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="DELETE"
                className="w-full h-11 px-4 bg-muted/20 border border-border/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteText('');
                }}
                className="flex-1 px-6 py-2.5 rounded-full border border-border/40 hover:bg-muted/50 text-sm font-medium tracking-tight transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleteText !== 'DELETE'}
                className="flex-1 px-6 py-2.5 rounded-full bg-red-500 text-white hover:bg-red-600 text-sm font-medium tracking-tight disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/20"
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
