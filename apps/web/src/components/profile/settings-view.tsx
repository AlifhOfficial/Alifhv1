/**
 * Settings View - Account Management
 * 
 * Privacy controls, preferences, and account deletion
 * Minimal design system with tap-to-toggle pattern
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useUserProfile, type UserProfileUpdate } from '@/hooks/profile';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

// ============================================================================
// Toggle Component
// ============================================================================

function Toggle({ 
  enabled, 
  onToggle, 
  disabled = false 
}: { 
  enabled: boolean; 
  onToggle: () => void; 
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-[22px] w-[42px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50",
        enabled ? "bg-green-500" : "bg-muted-foreground/30"
      )}
      aria-label="Toggle"
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
          enabled ? "translate-x-[22px]" : "translate-x-[2px]",
          "mt-[2px]"
        )}
      />
    </button>
  );
}

// ============================================================================
// Setting Row Component
// ============================================================================

function SettingRow({ 
  title, 
  description, 
  children,
  isLast = false,
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between py-3",
        !isLast && "border-b border-border/20"
      )}
    >
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SettingsView() {
  const { profile, updateProfile } = useUserProfile();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [savingField, setSavingField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' });
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

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'charcoal', label: 'Charcoal' },
  ];

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your preferences</p>
        </div>

        {/* Appearance */}
        <section>
          <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Appearance</h3>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-4">
            <div className="flex items-center gap-2">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
                    mounted && theme === t.value 
                      ? "bg-muted/50 text-foreground" 
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  )}
                >
                  {t.label}
                  {mounted && theme === t.value && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 inline ml-1.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section>
          <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Privacy</h3>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-4">
            <SettingRow 
              title="Show Phone Number" 
              description="Display your phone on public profile"
            >
              <Toggle 
                enabled={showPhone} 
                onToggle={() => saveToggle('showPhone', showPhone)}
                disabled={savingField === 'showPhone'}
              />
            </SettingRow>
            
            <SettingRow 
              title="Generated Avatar" 
              description="Use robot avatar when no photo is set"
              isLast
            >
              <Toggle 
                enabled={useGeneratedAvatar} 
                onToggle={() => saveToggle('useGeneratedAvatar', useGeneratedAvatar)}
                disabled={savingField === 'useGeneratedAvatar'}
              />
            </SettingRow>
          </div>
        </section>

        {/* Selling */}
        <section>
          <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Selling</h3>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-4">
            <SettingRow 
              title="Consignment Mode" 
              description="List vehicles on behalf of others"
              isLast
            >
              <Toggle 
                enabled={consignmentMode} 
                onToggle={() => saveToggle('consignmentMode', consignmentMode)}
                disabled={savingField === 'consignmentMode'}
              />
            </SettingRow>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Danger Zone</h3>
          
          <div className="rounded-xl border border-destructive/30 bg-sidebar p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Delete Account</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  Permanently delete after 6 months
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border/40 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-lg font-semibold tracking-tight mb-2">Delete Account?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone. Your account will be permanently deleted after 6 months.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-muted-foreground/70 mb-1.5 block">
                  Type "DELETE" to confirm
                </label>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full h-10 px-3 bg-muted/20 border border-border/40 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteText('');
                  }}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAccount}
                  disabled={deleteText !== 'DELETE'}
                  className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
