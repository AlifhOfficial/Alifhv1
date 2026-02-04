/**
 * Partner Contact Settings Component
 * Edit admin contact info (fallback numbers)
 * Matches staff-profile tap-to-edit pattern
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { authClient } from '@/lib/auth/client';
import { Loader2, CheckCircle2, Info, Phone, Building2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PartnerProfile {
  id: string;
  brandName: string;
  phone: string;
  adminName: string | null;
  adminPhone: string | null;
  adminPhoneVerified: boolean;
  tollNumber: string | null;
}

type EditingField = null | 'adminName' | 'adminPhone' | 'tollNumber';

export function PartnerContactSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ profile: PartnerProfile }>({
    queryKey: ['partner-profile'],
    queryFn: async () => {
      const res = await fetch('/api/partner/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
  });

  const profile = data?.profile;

  const [editingField, setEditingField] = useState<EditingField>(null);
  const [saving, setSaving] = useState(false);
  
  // Phone verification state
  const [phoneVerifyStep, setPhoneVerifyStep] = useState<'idle' | 'otp' | 'verifying'>('idle');
  const [otp, setOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [phoneJustVerified, setPhoneJustVerified] = useState(false);

  const [form, setForm] = useState({
    adminName: '',
    adminPhone: '',
    tollNumber: '',
  });

  // Populate form when data loads
  useEffect(() => {
    if (profile) {
      setForm({
        adminName: profile.adminName || '',
        adminPhone: profile.adminPhone?.replace(/^\+971/, '') || '',
        tollNumber: profile.tollNumber?.replace(/^800/, '') || '',
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
    mutationFn: async (data: Partial<PartnerProfile>) => {
      const res = await fetch('/api/partner/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
    },
  });

  // Save single field
  const saveField = async (field: EditingField) => {
    if (!field) return;
    
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      
      switch (field) {
        case 'adminName':
          payload.adminName = form.adminName.trim() || null;
          break;
        case 'adminPhone':
          const cleanPhone = form.adminPhone.replace(/[^\d]/g, '');
          payload.adminPhone = cleanPhone ? `+971${cleanPhone}` : null;
          // Reset verification when phone changes
          if (profile?.adminPhone !== (cleanPhone ? `+971${cleanPhone}` : null)) {
            payload.adminPhoneVerified = false;
            setPhoneJustVerified(false);
          }
          break;
        case 'tollNumber':
          const cleanToll = form.tollNumber.replace(/[^\d]/g, '');
          payload.tollNumber = cleanToll ? `800${cleanToll}` : null;
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
        adminName: profile.adminName || '',
        adminPhone: profile.adminPhone?.replace(/^\+971/, '') || '',
        tollNumber: profile.tollNumber?.replace(/^800/, '') || '',
      });
    }
    setEditingField(null);
  };

  // Send phone OTP for admin phone verification
  const sendPhoneOTP = async () => {
    const cleanPhone = form.adminPhone.replace(/[^\d]/g, '');
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

  // Verify phone OTP
  const verifyPhoneOTP = async () => {
    if (otp.length !== 6) {
      toast({ title: 'Invalid code', description: 'Enter 6-digit code', variant: 'destructive' });
      return;
    }

    const cleanPhone = form.adminPhone.replace(/[^\d]/g, '');
    const fullPhone = `+971${cleanPhone}`;
    setPhoneVerifyStep('verifying');

    try {
      // Use custom endpoint that doesn't update user's personal phone
      const res = await fetch('/api/partner/verify-admin-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhone, code: otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: 'Invalid code', description: data.error || 'Verification failed', variant: 'destructive' });
        setPhoneVerifyStep('otp');
        return;
      }

      // Invalidate to refresh the verified status
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
      
      toast({ title: 'Admin phone verified!' });
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

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Contact Settings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {profile.brandName}
          </p>
        </div>

        {/* Info Banner */}
        <div className="rounded-xl border border-border/40 bg-blue-500/5 p-3 sm:p-4">
          <div className="flex gap-3">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              These contact numbers are used as fallbacks when staff don&apos;t respond, and for customers to reach your dealership directly.
            </p>
          </div>
        </div>

        {/* Admin Contact Person */}
        <section>
          <h3 className="text-sm sm:text-[15px] font-bold tracking-tight text-foreground mb-2 sm:mb-3">Admin Contact</h3>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-4 sm:p-5 space-y-3 sm:space-y-4">
            
            {/* Admin Name */}
            <div 
              className={cn(
                "py-2 sm:py-3",
                editingField !== 'adminName' && "cursor-pointer hover:bg-muted/30 -mx-4 sm:-mx-5 px-4 sm:px-5 transition-colors rounded"
              )}
              onClick={() => editingField !== 'adminName' && setEditingField('adminName')}
            >
              <p className="text-xs font-medium text-muted-foreground/70 mb-1">Admin Name</p>
              {editingField === 'adminName' ? (
                <div className="space-y-2">
                  <input
                    autoFocus
                    type="text"
                    value={form.adminName}
                    onChange={(e) => updateField({ adminName: e.target.value })}
                    placeholder="e.g. Ahmed Al Mansouri"
                    className="w-full h-9 sm:h-10 bg-muted/20 rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveField('adminName');
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <div className="flex items-center justify-end gap-2 sm:gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                      className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); saveField('adminName'); }}
                      disabled={saving}
                      className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
                    >
                      {saving ? '...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium text-foreground">
                  {form.adminName || <span className="text-muted-foreground/50">Tap to add</span>}
                </p>
              )}
            </div>

            <div className="border-t border-border/20" />

            {/* Admin Phone with verification */}
            <div className="py-2 sm:py-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-xs font-medium text-muted-foreground/70">Admin Phone (requires verification)</p>
                {(profile?.adminPhoneVerified || phoneJustVerified) ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : form.adminPhone && phoneVerifyStep === 'idle' && editingField !== 'adminPhone' ? (
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
                    Enter the 6-digit code sent to +971{form.adminPhone}
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
              ) : editingField === 'adminPhone' ? (
                // Edit phone number
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground shrink-0">+971</span>
                    <input
                      autoFocus
                      type="tel"
                      inputMode="numeric"
                      value={form.adminPhone}
                      onChange={(e) => updateField({ adminPhone: e.target.value.replace(/[^\d]/g, '').slice(0, 9) })}
                      placeholder="50 000 0000"
                      className="flex-1 h-9 sm:h-10 bg-muted/20 rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                      maxLength={9}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveField('adminPhone');
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 sm:gap-3">
                    <button
                      onClick={cancelEdit}
                      className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveField('adminPhone')}
                      disabled={saving}
                      className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
                    >
                      {saving ? '...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                // Display phone number
                <div 
                  className="cursor-pointer hover:bg-muted/30 -mx-4 sm:-mx-5 px-4 sm:px-5 py-1 transition-colors rounded"
                  onClick={() => setEditingField('adminPhone')}
                >
                  <p className="text-sm font-medium text-foreground">
                    {form.adminPhone ? `+971 ${form.adminPhone}` : <span className="text-muted-foreground/50">Tap to add</span>}
                  </p>
                </div>
              )}
            </div>

            {/* Note about admin contact usage */}
            <p className="text-xs text-muted-foreground border-t border-border/20 pt-3">
              This person will be contacted if staff don&apos;t respond to inquiries
            </p>
          </div>
        </section>

        {/* Toll-Free Number */}
        <section>
          <h3 className="text-sm sm:text-[15px] font-bold tracking-tight text-foreground mb-2 sm:mb-3">Toll-Free Number</h3>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-4 sm:p-5">
            <div 
              className={cn(
                "py-2 sm:py-3",
                editingField !== 'tollNumber' && "cursor-pointer hover:bg-muted/30 -mx-4 sm:-mx-5 px-4 sm:px-5 transition-colors rounded"
              )}
              onClick={() => editingField !== 'tollNumber' && setEditingField('tollNumber')}
            >
              <p className="text-xs font-medium text-muted-foreground/70 mb-1">800 Number (no verification needed)</p>
              {editingField === 'tollNumber' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground shrink-0">800</span>
                    <input
                      autoFocus
                      type="tel"
                      inputMode="numeric"
                      value={form.tollNumber}
                      onChange={(e) => updateField({ tollNumber: e.target.value.replace(/[^\d]/g, '').slice(0, 10) })}
                      placeholder="DEALER"
                      className="flex-1 h-9 sm:h-10 bg-muted/20 rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                      maxLength={10}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveField('tollNumber');
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 sm:gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                      className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); saveField('tollNumber'); }}
                      disabled={saving}
                      className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
                    >
                      {saving ? '...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium text-foreground">
                  {form.tollNumber ? `800 ${form.tollNumber}` : <span className="text-muted-foreground/50">Tap to add</span>}
                </p>
              )}
            </div>
            
            {/* Note about toll number usage */}
            <p className="text-xs text-muted-foreground border-t border-border/20 pt-3 mt-3">
              Displayed on your showroom page for customers to call
            </p>
          </div>
        </section>

        {/* Current Main Phone (read-only reference) */}
        <section>
          <h3 className="text-sm sm:text-[15px] font-bold tracking-tight text-foreground mb-2 sm:mb-3">Registered Business Phone</h3>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-4 sm:p-5">
            <div className="py-2 sm:py-3">
              <p className="text-xs font-medium text-muted-foreground/70 mb-1">Main business line (from registration)</p>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">{profile.phone}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground border-t border-border/20 pt-3">
              Contact support to change your registered business phone
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
