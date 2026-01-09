/**
 * Staff Profile Form Component
 * Edit work identity (display name, work phone)
 * Matches user profile tap-to-edit pattern
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/profile';
import { authClient } from '@/lib/auth/client';
import { Loader2, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StaffProfile {
  id: string;
  displayName: string | null;
  workPhone: string | null;
  usePersonalPhone: boolean;
  workPhoneVerified: boolean;
  partner: {
    brandName: string;
  };
}

type EditingField = null | 'displayName' | 'workPhone';

export function StaffProfileForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile: userProfile } = useUserProfile();

  const { data: profile, isLoading } = useQuery<StaffProfile>({
    queryKey: ['staff-profile'],
    queryFn: async () => {
      const res = await fetch('/api/staff/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
  });

  const [editingField, setEditingField] = useState<EditingField>(null);
  const [saving, setSaving] = useState(false);
  
  // Phone verification state
  const [phoneVerifyStep, setPhoneVerifyStep] = useState<'idle' | 'otp' | 'verifying'>('idle');
  const [otp, setOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [phoneJustVerified, setPhoneJustVerified] = useState(false);

  const [form, setForm] = useState({
    displayName: '',
    workPhone: '',
    usePersonalPhone: false,
  });

  // Populate form when data loads
  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || '',
        workPhone: profile.workPhone?.replace(/^\+971/, '') || '',
        usePersonalPhone: profile.usePersonalPhone ?? false,
      });
    }
  }, [profile]);

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const updateField = (updates: Partial<typeof form>) => {
    setForm(f => ({ ...f, ...updates }));
  };

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<StaffProfile>) => {
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
    },
  });

  // Save single field
  const saveField = async (field: EditingField) => {
    if (!field) return;
    
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      
      switch (field) {
        case 'displayName':
          payload.displayName = form.displayName.trim() || null;
          break;
        case 'workPhone':
          const cleanPhone = form.workPhone.replace(/[^\d]/g, '');
          payload.workPhone = cleanPhone ? `+971${cleanPhone}` : null;
          break;
      }

      await updateMutation.mutateAsync(payload);
      setEditingField(null);
      toast({ title: 'Saved' });
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    if (profile) {
      setForm({
        displayName: profile.displayName || '',
        workPhone: profile.workPhone?.replace(/^\+971/, '') || '',
        usePersonalPhone: profile.usePersonalPhone ?? false,
      });
    }
    setEditingField(null);
  };

  // Toggle use personal phone
  const toggleUsePersonalPhone = async () => {
    const newValue = !form.usePersonalPhone;
    updateField({ usePersonalPhone: newValue });
    
    try {
      await updateMutation.mutateAsync({ usePersonalPhone: newValue } as any);
      toast({ title: newValue ? 'Using personal phone' : 'Using work phone' });
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
      updateField({ usePersonalPhone: !newValue });
    }
  };

  // Send phone OTP
  const sendPhoneOTP = async () => {
    const cleanPhone = form.workPhone.replace(/[^\d]/g, '');
    if (cleanPhone.length !== 9) {
      toast({ title: 'Invalid phone', description: 'Enter 9 digits after +971', variant: 'destructive' });
      return;
    }

    const fullPhone = `+971${cleanPhone}`;
    setPhoneVerifyStep('verifying');
    
    try {
      const { error } = await authClient.phoneNumber.sendOtp({
        phoneNumber: fullPhone,
      });

      if (error) {
        const errorMsg = error.message?.toLowerCase() || '';
        if (errorMsg.includes('blocked') || errorMsg.includes('fraud') || errorMsg.includes('60410')) {
          toast({ 
            title: 'Number temporarily blocked', 
            description: 'This phone number has been temporarily blocked by our SMS provider. Please try a different number or contact support.',
            variant: 'destructive' 
          });
        } else {
          toast({ title: 'Failed to send code', description: error.message, variant: 'destructive' });
        }
        setPhoneVerifyStep('idle');
        return;
      }

      setPhoneVerifyStep('otp');
      setOtpCountdown(60);
      toast({ title: 'Code sent!', description: 'Check your phone' });
    } catch (err: any) {
      const errorMsg = err.message?.toLowerCase() || '';
      if (errorMsg.includes('blocked') || errorMsg.includes('fraud') || errorMsg.includes('60410')) {
        toast({ 
          title: 'Number temporarily blocked', 
          description: 'This phone number has been temporarily blocked by our SMS provider. Please try a different number or contact support.',
          variant: 'destructive' 
        });
      } else {
        toast({ title: 'Error', description: err.message || 'Failed to send code', variant: 'destructive' });
      }
      setPhoneVerifyStep('idle');
    }
  };

  // Verify phone OTP (for work phone - would need backend support)
  const verifyPhoneOTP = async () => {
    if (otp.length !== 6) {
      toast({ title: 'Invalid code', description: 'Enter 6-digit code', variant: 'destructive' });
      return;
    }

    const cleanPhone = form.workPhone.replace(/[^\d]/g, '');
    const fullPhone = `+971${cleanPhone}`;
    setPhoneVerifyStep('verifying');

    try {
      const { error } = await authClient.phoneNumber.verify({
        phoneNumber: fullPhone,
        code: otp,
        updatePhoneNumber: false, // Don't update user's personal phone
      });

      if (error) {
        toast({ title: 'Invalid code', description: error.message, variant: 'destructive' });
        setPhoneVerifyStep('otp');
        return;
      }

      // Mark work phone as verified
      await updateMutation.mutateAsync({ workPhoneVerified: true } as any);
      
      toast({ title: 'Work phone verified!' });
      setPhoneJustVerified(true);
      setPhoneVerifyStep('idle');
      setOtp('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Verification failed', variant: 'destructive' });
      setPhoneVerifyStep('otp');
    }
  };

  // Cancel phone verification
  const cancelPhoneVerify = () => {
    setPhoneVerifyStep('idle');
    setOtp('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <p className="text-center text-muted-foreground">Unable to load profile</p>
        </div>
      </div>
    );
  }

  const personalPhone = userProfile?.phone?.replace(/^\+971/, '') || '';
  const isPersonalPhoneVerified = userProfile?.phoneNumberVerified ?? false;

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Work Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profile.partner.brandName}
          </p>
        </div>

        {/* Info Banner */}
        <div className="rounded-xl border border-border/40 bg-blue-500/5 p-4">
          <div className="flex gap-3">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Your work profile keeps your personal info private. Clients see your display name and work phone instead.
            </p>
          </div>
        </div>

        {/* Display Name */}
        <section>
          <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Display Name</h3>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            <div 
              className={cn(
                "py-3",
                editingField !== 'displayName' && "cursor-pointer hover:bg-muted/30 -mx-5 px-5 transition-colors rounded"
              )}
              onClick={() => editingField !== 'displayName' && setEditingField('displayName')}
            >
              <p className="text-xs font-medium text-muted-foreground/70 mb-1">Name shown to clients</p>
              {editingField === 'displayName' ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={form.displayName}
                    onChange={(e) => updateField({ displayName: e.target.value })}
                    placeholder="e.g. Ahmed, Alex, Sarah"
                    className="flex-1 h-10 bg-muted/20 rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveField('displayName');
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); saveField('displayName'); }}
                    disabled={saving}
                    className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
                  >
                    {saving ? '...' : 'Save'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                    className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-sm font-medium text-foreground">
                  {form.displayName || <span className="text-muted-foreground/50">Tap to add</span>}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Work Phone */}
        <section>
          <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Work Phone</h3>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
            
            {/* Use personal phone toggle */}
            {personalPhone && (
              <div 
                className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/30 -mx-5 px-5 transition-colors rounded"
                onClick={toggleUsePersonalPhone}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">Use my personal phone</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    +971 {personalPhone} {isPersonalPhoneVerified && '(verified)'}
                  </p>
                </div>
                <div className={cn(
                  "w-10 h-6 rounded-full transition-colors relative",
                  form.usePersonalPhone ? "bg-green-500" : "bg-muted"
                )}>
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                    form.usePersonalPhone ? "translate-x-5" : "translate-x-1"
                  )} />
                </div>
              </div>
            )}

            {/* Divider if both options shown */}
            {personalPhone && !form.usePersonalPhone && (
              <div className="border-t border-border/20" />
            )}

            {/* Work phone input - only show if not using personal phone */}
            {!form.usePersonalPhone && (
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-muted-foreground/70">Separate work number</p>
                  {(profile?.workPhoneVerified || phoneJustVerified) ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : form.workPhone && phoneVerifyStep === 'idle' ? (
                    <button
                      onClick={sendPhoneOTP}
                      className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
                    >
                      Verify
                    </button>
                  ) : null}
                </div>
                
                {phoneVerifyStep === 'otp' ? (
                  // OTP input step
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Enter the 6-digit code sent to +971{form.workPhone}
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="flex-1 h-10 bg-muted/20 rounded-lg px-3 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={otpCountdown > 0 ? undefined : sendPhoneOTP}
                        disabled={otpCountdown > 0}
                        className="text-xs text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
                      >
                        {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend code'}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={verifyPhoneOTP}
                          disabled={otp.length !== 6}
                          className="text-xs text-blue-500 hover:text-blue-600 font-semibold disabled:opacity-50"
                        >
                          Verify
                        </button>
                        <button
                          onClick={cancelPhoneVerify}
                          className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : phoneVerifyStep === 'verifying' ? (
                  // Loading state
                  <div className="flex items-center gap-2 h-10">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Sending...</span>
                  </div>
                ) : editingField === 'workPhone' ? (
                  // Edit phone number
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">+971</span>
                    <input
                      autoFocus
                      type="tel"
                      inputMode="numeric"
                      value={form.workPhone}
                      onChange={(e) => updateField({ workPhone: e.target.value.replace(/[^\d]/g, '').slice(0, 9) })}
                      placeholder="50 000 0000"
                      className="flex-1 h-10 bg-muted/20 rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                      maxLength={9}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveField('workPhone');
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                    <button
                      onClick={() => saveField('workPhone')}
                      disabled={saving}
                      className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
                    >
                      {saving ? '...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  // Display phone number
                  <div 
                    className="cursor-pointer hover:bg-muted/30 -mx-5 px-5 py-1 transition-colors rounded"
                    onClick={() => setEditingField('workPhone')}
                  >
                    <p className="text-sm font-medium text-foreground">
                      {form.workPhone ? `+971 ${form.workPhone}` : <span className="text-muted-foreground/50">Tap to add</span>}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Note about phone usage */}
            <p className="text-xs text-muted-foreground border-t border-border/20 pt-3">
              Clients will call or WhatsApp this number for inquiries
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
