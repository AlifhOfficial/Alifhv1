/**
 * Partner Application Form Component
 * Logged-in users apply to become partners
 * Following profile-view minimal design system
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePartnerRequest, usePartnerRequestSubmit } from '@/hooks/partner';
import { useUser } from '@/hooks/auth/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { 
  Building2, 
  FileText, 
  Calendar,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users
} from 'lucide-react';

export function PartnerApplicationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { data: existingRequest, isLoading: loadingRequest } = usePartnerRequest();
  const { submit, isSubmitting } = usePartnerRequestSubmit();

  const [formData, setFormData] = useState({
    companyNameLegal: '',
    tradeLicense: '',
    tradeLicenseExpiry: '',
    tradeLicenseDocumentUrl: '',
    vatNumber: '',
    partnerType: 'car_dealer' as 'car_dealer' | 'showroom',
    companySize: 'small' as 'small' | 'medium' | 'large' | 'enterprise',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyNameLegal.trim()) {
      newErrors.companyNameLegal = 'Company name is required';
    }
    if (!formData.tradeLicense.trim()) {
      newErrors.tradeLicense = 'Trade license number is required';
    }
    if (!formData.tradeLicenseExpiry) {
      newErrors.tradeLicenseExpiry = 'Expiry date is required';
    }
    if (!formData.tradeLicenseDocumentUrl.trim()) {
      newErrors.tradeLicenseDocumentUrl = 'Trade license document is required';
    }
    if (!formData.vatNumber.trim()) {
      newErrors.vatNumber = 'VAT number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submissionData = {
      ...formData,
      tradeLicenseExpiry: new Date(formData.tradeLicenseExpiry).toISOString(),
    };

    submit(submissionData, {
      onSuccess: () => {
        toast({
          title: 'Application Submitted!',
          description: 'Your partner application has been submitted for review.',
        });
        router.push('/user-dashboard/requests');
      },
      onError: (error) => {
        toast({
          title: 'Submission Failed',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  if (loadingRequest) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Check if user is currently a staff member of any partner
  // They must leave their organization before applying to become a partner
  // Cast user to include partnerMemberships from custom session
  const userWithPartner = user as typeof user & { 
    partnerMemberships?: Array<{ partnerId: string; partnerName?: string }>;
    hasPartnerAccess?: boolean;
  };
  const isStaffMember = userWithPartner?.hasPartnerAccess === true || 
    (userWithPartner?.partnerMemberships && userWithPartner.partnerMemberships.length > 0);
  
  if (isStaffMember) {
    const membership = userWithPartner.partnerMemberships?.[0];
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center py-16 rounded-xl border border-orange-500/30 bg-orange-500/5">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-orange-500" />
          </div>
          
          <h2 className="text-2xl font-semibold tracking-tight mb-3">Staff Membership Active</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            You are currently a staff member of <span className="font-medium text-foreground">{membership.partnerName || 'a partner organization'}</span>.
          </p>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            To apply as a partner, you must first leave your current organization.
          </p>
          
          <button
            onClick={() => router.push('/staff-dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
          >
            Go to Staff Dashboard
          </button>
        </div>
      </div>
    );
  }

  // User already has an ACTIVE application (pending or approved)
  // Allow re-application if previous request was rejected
  const hasActiveRequest = existingRequest && 
    (existingRequest.status === 'pending' || existingRequest.status === 'approved');
  
  if (hasActiveRequest) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center py-16 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
          
          <h2 className="text-2xl font-semibold tracking-tight mb-3">Application Already Submitted</h2>
          <p className="text-sm text-muted-foreground mb-8">
            You've already submitted a partner application. Check your dashboard for status updates.
          </p>
          
          <button
            onClick={() => router.push('/user-dashboard/requests')}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
          >
            Go to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-16">
      
      {/* Header */}
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Partner Application</h1>
        <p className="text-sm text-muted-foreground">
          Apply to become a verified partner on Alifh
        </p>
      </section>

      {/* Application Form */}
      <form onSubmit={handleSubmit} className="space-y-16">
        
        {/* Company Information */}
        <section className="space-y-8">
          <div className="border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Company Information</h3>
          </div>

          <div className="space-y-10">
            {/* Company Name */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                Company Name (Legal) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.companyNameLegal}
                onChange={(e) => updateField('companyNameLegal', e.target.value)}
                placeholder="Enter company legal name"
                className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0 placeholder:text-muted-foreground/30"
              />
              {errors.companyNameLegal && (
                <p className="text-xs text-red-500">{errors.companyNameLegal}</p>
              )}
            </div>

            {/* Partner Type */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                Partner Type <span className="text-red-500">*</span>
              </label>
              <Select value={formData.partnerType} onValueChange={(value) => updateField('partnerType', value)}>
                <SelectTrigger className="h-10 border-0 border-b border-border rounded-none bg-transparent capitalize">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car_dealer">Car Dealer</SelectItem>
                  <SelectItem value="showroom">Showroom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company Size */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                Company Size <span className="text-red-500">*</span>
              </label>
              <Select value={formData.companySize} onValueChange={(value) => updateField('companySize', value)}>
                <SelectTrigger className="h-10 border-0 border-b border-border rounded-none bg-transparent">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (1-10 employees)</SelectItem>
                  <SelectItem value="medium">Medium (11-50 employees)</SelectItem>
                  <SelectItem value="large">Large (51-200 employees)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (200+ employees)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Legal Documents */}
        <section className="space-y-8">
          <div className="border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Legal Documents</h3>
          </div>

          <div className="space-y-10">
            {/* Trade License */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                Trade License Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.tradeLicense}
                onChange={(e) => updateField('tradeLicense', e.target.value)}
                placeholder="Enter trade license number"
                className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0 placeholder:text-muted-foreground/30"
              />
              {errors.tradeLicense && (
                <p className="text-xs text-red-500">{errors.tradeLicense}</p>
              )}
            </div>

            {/* Trade License Expiry */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Trade License Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.tradeLicenseExpiry}
                onChange={(e) => updateField('tradeLicenseExpiry', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0"
              />
              {errors.tradeLicenseExpiry && (
                <p className="text-xs text-red-500">{errors.tradeLicenseExpiry}</p>
              )}
            </div>

            {/* Trade License Document URL */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                Trade License Document URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.tradeLicenseDocumentUrl}
                onChange={(e) => updateField('tradeLicenseDocumentUrl', e.target.value)}
                placeholder="https://example.com/license.pdf"
                className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0 placeholder:text-muted-foreground/30"
              />
              <p className="text-xs text-muted-foreground">
                Upload your trade license document and paste the URL here
              </p>
              {errors.tradeLicenseDocumentUrl && (
                <p className="text-xs text-red-500">{errors.tradeLicenseDocumentUrl}</p>
              )}
            </div>

            {/* VAT Number */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                VAT Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.vatNumber}
                onChange={(e) => updateField('vatNumber', e.target.value)}
                placeholder="Enter VAT number"
                className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0 placeholder:text-muted-foreground/30"
              />
              {errors.vatNumber && (
                <p className="text-xs text-red-500">{errors.vatNumber}</p>
              )}
            </div>
          </div>
        </section>

        {/* Submit Actions */}
        <div className="flex items-center gap-3 pt-8 border-t border-border">
          <button
            type="button"
            onClick={() => router.push('/user-dashboard/requests')}
            className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Application
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
}
