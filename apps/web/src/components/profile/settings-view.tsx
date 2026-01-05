/**
 * Settings View - Account Management
 * 
 * Privacy controls, preferences, and account deletion
 * Clean, Mobbin-inspired layout
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useUserProfile, type UserProfileUpdate } from '@/hooks/profile';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/providers/auth-provider';

export function SettingsView() {
  const { session: user } = useAuth();
  const { profile, updateProfile } = useUserProfile();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [savingField, setSavingField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Derive state directly from profile (no local state needed)
  const consignmentMode = profile?.consignmentMode ?? false;
  const showPhone = profile?.privacySettings?.showPhone ?? true;
  const useGeneratedAvatar = profile?.preferences?.useGeneratedAvatar ?? true;

  const saveToggle = async (field: 'consignmentMode' | 'showPhone' | 'useGeneratedAvatar', currentValue: boolean) => {
    const newValue = !currentValue;
    setSavingField(field);
    
    try {
      const payload: UserProfileUpdate = {
        consignmentMode: field === 'consignmentMode' ? newValue : undefined,
        privacySettings: field === 'showPhone' ? { showPhone: newValue } : undefined,
        preferences: field === 'useGeneratedAvatar' ? { useGeneratedAvatar: newValue } : undefined,
      };
      
      await updateProfile(payload);
      toast({ title: 'Setting updated' });
    } catch (error) {
      toast({ 
        title: 'Failed to update', 
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive' 
      });
    } finally {
      setSavingField(null);
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
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-[15px] font-medium text-muted-foreground/60 mt-1.5">
          Manage your preferences and account
        </p>
      </div>

      {/* Appearance Section */}
      <section className="mb-10">
        <h2 className="text-[15px] font-bold tracking-tight text-foreground mb-4">
          Appearance
        </h2>

        <div className="space-y-0 border border-border/40 rounded-xl overflow-hidden bg-sidebar">
          {/* Theme Selection */}
          {[
            { value: 'light', label: 'Light', description: 'Bright and clean' },
            { value: 'dark', label: 'Dark', description: 'Deep black theme' },
            { value: 'charcoal', label: 'Charcoal', description: 'Softer dark mode, easier on the eyes' }
          ].map((themeOption, index, array) => (
            <div 
              key={themeOption.value}
              className={cn(
                "flex items-center justify-between px-5 py-4 hover:bg-muted/10 transition-colors cursor-pointer",
                index < array.length - 1 && "border-b border-border/20"
              )}
              onClick={() => {
                setTheme(themeOption.value);
                toast({ title: `${themeOption.label} theme enabled` });
              }}
            >
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-[15px] font-semibold tracking-tight text-foreground">
                  {themeOption.label}
                </p>
                <p className="text-sm font-medium text-muted-foreground/60 mt-0.5">
                  {themeOption.description}
                </p>
              </div>
              {mounted && theme === themeOption.value && (
                <CheckCircle2 className="size-5 text-primary flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Preferences Section */}
      <section className="mb-10">
        <h2 className="text-[15px] font-bold tracking-tight text-foreground mb-4">
          Preferences
        </h2>

        <div className="space-y-0 border border-border/40 rounded-xl overflow-hidden bg-sidebar">
          {/* Consignment Mode */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/20 hover:bg-muted/10 transition-colors">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-[15px] font-semibold tracking-tight text-foreground">
                Consignment Mode
              </p>
              <p className="text-sm font-medium text-muted-foreground/60 mt-0.5">
                List vehicles on consignment
              </p>
            </div>
            <button
              onClick={() => saveToggle('consignmentMode', consignmentMode)}
              disabled={savingField === 'consignmentMode'}
              className={cn(
                "relative h-7 w-12 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 flex-shrink-0",
                consignmentMode ? "bg-primary" : "bg-muted/40"
              )}
              aria-label="Toggle consignment mode"
            >
              <span
                className={cn(
                  "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200",
                  consignmentMode ? "left-6" : "left-1"
                )}
              />
            </button>
          </div>

          {/* Show Phone Number */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/20 hover:bg-muted/10 transition-colors">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-[15px] font-semibold tracking-tight text-foreground">
                Show Phone Number
              </p>
              <p className="text-sm font-medium text-muted-foreground/60 mt-0.5">
                Display your phone on public profile
              </p>
            </div>
            <button
              onClick={() => saveToggle('showPhone', showPhone)}
              disabled={savingField === 'showPhone'}
              className={cn(
                "relative h-7 w-12 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 flex-shrink-0",
                showPhone ? "bg-primary" : "bg-muted/40"
              )}
              aria-label="Toggle phone visibility"
            >
              <span
                className={cn(
                  "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200",
                  showPhone ? "left-6" : "left-1"
                )}
              />
            </button>
          </div>

          {/* Generated Avatar */}
          <div className="flex items-center justify-between px-5 py-4 hover:bg-muted/10 transition-colors">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-[15px] font-semibold tracking-tight text-foreground">
                Generated Avatar
              </p>
              <p className="text-sm font-medium text-muted-foreground/60 mt-0.5">
                Use robot avatar when no photo is set
              </p>
            </div>
            <button
              onClick={() => saveToggle('useGeneratedAvatar', useGeneratedAvatar)}
              disabled={savingField === 'useGeneratedAvatar'}
              className={cn(
                "relative h-7 w-12 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 flex-shrink-0",
                useGeneratedAvatar ? "bg-primary" : "bg-muted/40"
              )}
              aria-label="Toggle generated avatar"
            >
              <span
                className={cn(
                  "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200",
                  useGeneratedAvatar ? "left-6" : "left-1"
                )}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Account Section */}
      <section>
        <h2 className="text-[15px] font-bold tracking-tight text-foreground mb-4">
          Account
        </h2>

        <div className="border border-border/40 rounded-xl overflow-hidden bg-sidebar">
          <div className="px-5 py-5">
            <div className="space-y-3">
              <div>
                <p className="text-[15px] font-semibold tracking-tight text-foreground">
                  Delete Account
                </p>
                <p className="text-sm font-medium text-muted-foreground/60 mt-0.5">
                  Permanently delete your account and all data after 6 months
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2.5 rounded-full bg-red-500 text-white hover:bg-red-600 text-sm font-semibold tracking-tight transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-background/95 backdrop-blur-sm border border-border/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="space-y-5">
              {/* Header */}
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Delete Account?</h2>
                <p className="text-[15px] font-medium text-muted-foreground/70 mt-2 leading-relaxed">
                  This action cannot be undone. Your account will be permanently deleted after 6 months.
                </p>
              </div>
              
              {/* Input */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold tracking-tight text-foreground block">
                  Type "DELETE" to confirm
                </label>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full h-11 px-4 bg-muted/20 border border-border/40 rounded-xl text-[15px] font-medium tracking-tight focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteText('');
                  }}
                  className="flex-1 px-6 py-2.5 rounded-full border border-border/40 hover:bg-muted/40 text-sm font-semibold tracking-tight text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAccount}
                  disabled={deleteText !== 'DELETE'}
                  className="flex-1 px-6 py-2.5 rounded-full bg-red-500 text-white hover:bg-red-600 text-sm font-semibold tracking-tight disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
