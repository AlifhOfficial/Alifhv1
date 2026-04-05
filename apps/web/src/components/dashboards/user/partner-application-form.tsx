/**
 * Partner Application Form Component
 * Clean typography-first design, no icons
 */

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePartnerRequest, usePartnerRequestSubmit } from '@/hooks/partner';
import { useUser } from '@/hooks/auth/use-auth';
import { format } from 'date-fns';
import { cn } from '@/utils';
import { PartnerApplicationFeedbackModal } from './partner-application-feedback-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// ============================================================================
// Shared Components
// ============================================================================

function SectionHeader({ 
  title, 
  subtitle 
}: { 
  title: string; 
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-subhead font-bold tracking-tight text-foreground">{title}</h3>
      {subtitle && <p className="text-caption1 text-muted-foreground/70 mt-1">{subtitle}</p>}
    </div>
  );
}

function FieldWrapper({ 
  label, 
  required, 
  error, 
  children 
}: { 
  label: string; 
  required?: boolean; 
  error?: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-subhead font-semibold text-muted-foreground/70">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-caption1 font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

export function PartnerApplicationForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const { user } = useUser();
  const { data: existingRequest, isLoading: loadingRequest } = usePartnerRequest();
  const { submit, isSubmitting } = usePartnerRequestSubmit();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    companyNameLegal: '',
    tradeLicense: '',
    tradeLicenseExpiry: '',
    tradeLicenseDocumentUrl: '',
    vatNumber: '',
    partnerType: 'car_dealer' as 'car_dealer' | 'showroom',
    companySize: 'small' as 'small' | 'medium' | 'large' | 'enterprise',
  });
  
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [_dateInputValue, setDateInputValue] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Allow PDF or any image (server detects image format by magic bytes)
    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/') || file.type === '' || file.type === 'application/octet-stream';
    if (!isPdf && !isImage) {
      setErrors(prev => ({ ...prev, tradeLicenseDocumentUrl: 'Please upload a PDF or image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, tradeLicenseDocumentUrl: 'Maximum file size is 5MB' }));
      return;
    }

    setIsUploading(true);
    setErrors(prev => ({ ...prev, tradeLicenseDocumentUrl: '' }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', 'partner-documents');

      const response = await fetch('/api/storage/upload-private', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      setUploadedFile(file);
      updateField('tradeLicenseDocumentUrl', data.key);
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({ ...prev, tradeLicenseDocumentUrl: 'Failed to upload document. Please try again.' }));
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    updateField('tradeLicenseDocumentUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

    setShowFeedback(true);
    setSubmissionSuccess(false);
    setSubmissionError(null);

    submit(submissionData, {
      onSuccess: () => {
        setSubmissionSuccess(true);
      },
      onError: (error) => {
        setSubmissionError(error.message || 'Failed to submit application. Please try again.');
      },
    });
  };

  const handleFeedbackClose = () => {
    if (submissionSuccess) {
      // Reset form on success
      setFormData({
        companyNameLegal: '',
        tradeLicense: '',
        tradeLicenseExpiry: '',
        tradeLicenseDocumentUrl: '',
        vatNumber: '',
        partnerType: 'car_dealer',
        companySize: 'small',
      });
      setSelectedDate(undefined);
      setUploadedFile(null);
      onSuccess?.();
    }
    setShowFeedback(false);
    setSubmissionSuccess(false);
    setSubmissionError(null);
  };

  // ============================================================================
  // Loading State
  // ============================================================================
  
  if (loadingRequest) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted/40 rounded-lg animate-pulse" />
          <div className="rounded-xl border border-border/40 bg-sidebar p-6 h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  // ============================================================================
  // Staff Member Block
  // ============================================================================
  
  const userWithPartner = user as typeof user & { 
    partnerMemberships?: Array<{ partnerId: string; partnerName?: string }>;
    hasPartnerAccess?: boolean;
  };
  const isStaffMember = userWithPartner?.hasPartnerAccess === true || 
    (userWithPartner?.partnerMemberships && userWithPartner.partnerMemberships.length > 0);
  
  if (isStaffMember) {
    const membership = userWithPartner.partnerMemberships?.[0];
    return (
      <div className="max-w-2xl mx-auto py-16">
        <div className="rounded-xl border border-border/40 bg-sidebar p-8 text-center space-y-5">
          <div>
            <p className="text-headline font-semibold text-foreground">Staff Membership Active</p>
            <p className="text-subhead text-muted-foreground/70 mt-2 max-w-md mx-auto">
              You're currently a staff member of {membership?.partnerName || 'a partner organization'}. 
              To apply as a partner, you must first leave your current organization.
            </p>
          </div>
          
          <button
            onClick={() => router.push('/staff-dashboard')}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground text-subhead font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            Go to Staff Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Existing Application - Don't show form
  // ============================================================================
  
  const hasActiveRequest = existingRequest && 
    (existingRequest.status === 'pending' || existingRequest.status === 'approved');

  if (hasActiveRequest) {
    return null;
  }

  // ============================================================================
  // Main Form
  // ============================================================================

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-2xl mx-auto space-y-8">
      
        {/* Header */}
        <div>
          <h1 className="text-title3 font-semibold tracking-tight">Partner Application</h1>
          <p className="text-subhead text-muted-foreground mt-0.5">
            Join Revvup as a verified partner
          </p>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Company Information */}
          <section>
            <SectionHeader 
              title="Company Information" 
              subtitle="Tell us about your business"
            />
            
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-6">
              <FieldWrapper label="Company Name (Legal)" required error={errors.companyNameLegal}>
                <input
                  type="text"
                  value={formData.companyNameLegal}
                  onChange={(e) => updateField('companyNameLegal', e.target.value)}
                  placeholder="Enter your company's legal name"
                  className={cn(
                    "w-full h-12 bg-transparent border-b-2 border-border/40 focus:border-primary",
                    "outline-none transition-colors px-0 text-subhead font-medium",
                    "placeholder:text-muted-foreground/40"
                  )}
                />
              </FieldWrapper>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FieldWrapper label="Partner Type" required>
                  <Select value={formData.partnerType} onValueChange={(value) => updateField('partnerType', value)}>
                    <SelectTrigger className="h-12 border-0 border-b-2 border-border/40 rounded-none bg-transparent px-0 focus:ring-0 focus:border-primary">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car_dealer">Car Dealer</SelectItem>
                      <SelectItem value="showroom">Showroom</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldWrapper>

                <FieldWrapper label="Company Size" required>
                  <Select value={formData.companySize} onValueChange={(value) => updateField('companySize', value)}>
                    <SelectTrigger className="h-12 border-0 border-b-2 border-border/40 rounded-none bg-transparent px-0 focus:ring-0 focus:border-primary">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (1-10 employees)</SelectItem>
                      <SelectItem value="medium">Medium (11-50 employees)</SelectItem>
                      <SelectItem value="large">Large (51-200 employees)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (200+ employees)</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldWrapper>
              </div>
            </div>
          </section>

          {/* Legal Documents */}
          <section>
            <SectionHeader 
              title="Legal Documents" 
              subtitle="Provide your business registration details"
            />
            
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FieldWrapper label="Trade License Number" required error={errors.tradeLicense}>
                  <input
                    type="text"
                    value={formData.tradeLicense}
                    onChange={(e) => updateField('tradeLicense', e.target.value)}
                    placeholder="TL-123456"
                    className={cn(
                      "w-full h-12 bg-transparent border-b-2 border-border/40 focus:border-primary",
                      "outline-none transition-colors px-0 text-subhead font-medium",
                      "placeholder:text-muted-foreground/40"
                    )}
                  />
                </FieldWrapper>

                <FieldWrapper label="Expiry Date" required error={errors.tradeLicenseExpiry}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "w-full h-12 bg-transparent border-b-2 border-border/40 hover:border-primary/60 focus:border-primary",
                          "outline-none transition-colors px-0 text-subhead font-medium text-left",
                          !selectedDate && "text-muted-foreground/40"
                        )}
                      >
                        {selectedDate ? format(selectedDate, 'dd MMM yyyy') : 'Select date'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setDateInputValue(date ? format(date, 'dd/MM/yyyy') : '');
                          updateField('tradeLicenseExpiry', date ? format(date, 'yyyy-MM-dd') : '');
                          setErrors(prev => ({ ...prev, tradeLicenseExpiry: '' }));
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        captionLayout="dropdown"
                        fromYear={2025}
                        toYear={2050}
                      />
                    </PopoverContent>
                  </Popover>
                </FieldWrapper>
              </div>

              {/* Trade License Document Upload */}
              <FieldWrapper label="Trade License Document" required error={errors.tradeLicenseDocumentUrl}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="hidden"
                />

                {uploadedFile ? (
                  <div className="rounded-lg bg-muted/20 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-subhead font-medium text-foreground truncate">{uploadedFile.name}</p>
                        <p className="text-caption1 text-muted-foreground/70 mt-0.5">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-caption1 font-semibold text-red-500 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={cn(
                      "w-full rounded-lg border-2 border-dashed border-border/40 bg-muted/10",
                      "hover:bg-muted/20 hover:border-primary/40 transition-all p-8",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {isUploading ? (
                      <div className="text-center">
                        <p className="text-subhead font-medium text-foreground">Uploading...</p>
                        <p className="text-caption1 text-muted-foreground/70 mt-1">Please wait</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-subhead font-medium text-foreground">Click to upload</p>
                        <p className="text-caption1 text-muted-foreground/70 mt-1">PDF, JPG, or PNG • Max 5MB</p>
                      </div>
                    )}
                  </button>
                )}
              </FieldWrapper>

              <FieldWrapper label="VAT Number" required error={errors.vatNumber}>
                <input
                  type="text"
                  value={formData.vatNumber}
                  onChange={(e) => updateField('vatNumber', e.target.value)}
                  placeholder="Enter VAT registration number"
                  className={cn(
                    "w-full h-12 bg-transparent border-b-2 border-border/40 focus:border-primary",
                    "outline-none transition-colors px-0 text-subhead font-medium",
                    "placeholder:text-muted-foreground/40"
                  )}
                />
              </FieldWrapper>
            </div>
          </section>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/user-dashboard/requests')}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-muted text-foreground text-subhead font-medium hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className={cn(
                "w-full sm:w-auto px-8 py-3 rounded-lg text-subhead font-medium transition-colors shadow-sm",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>

      </div>

      {/* Feedback Modal */}
      <PartnerApplicationFeedbackModal
        open={showFeedback}
        onClose={handleFeedbackClose}
        success={submissionSuccess}
        isSubmitting={isSubmitting}
        error={submissionError}
      />
    </div>
  );
}
