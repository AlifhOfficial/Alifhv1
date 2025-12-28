/**
 * Partner Application Form Component
 * Logged-in users apply to become partners
 * Following Alifh design system
 */

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePartnerRequest, usePartnerRequestSubmit } from '@/hooks/partner';
import { useUser } from '@/hooks/auth/use-auth';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
import { 
  Building2, 
  FileText, 
  CalendarIcon,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  X,
  File
} from 'lucide-react';

export function PartnerApplicationForm() {
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
  const [dateInputValue, setDateInputValue] = useState('');
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

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, tradeLicenseDocumentUrl: 'Please upload a PDF, JPEG, or PNG file' }));
      return;
    }

    // Validate file size (5MB max)
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
        setTimeout(() => {
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
          setShowFeedback(false);
          router.push('/user-dashboard/requests');
        }, 2000);
      },
      onError: (error) => {
        setSubmissionError(error.message || 'Failed to submit application. Please try again.');
      },
    });
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    setSubmissionSuccess(false);
    setSubmissionError(null);
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
      <div className="max-w-2xl mx-auto px-6 py-24">
        <div className="text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Staff Membership Active</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              You are currently a staff member of {membership.partnerName || 'a partner organization'}. 
              To apply as a partner, you must first leave your current organization.
            </p>
          </div>
          
          <button
            onClick={() => router.push('/staff-dashboard')}
            className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-all shadow-sm"
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
      <div className="max-w-2xl mx-auto px-6 py-24">
        <div className="text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Application Already Submitted</h2>
            <p className="text-sm text-muted-foreground">
              You've already submitted a partner application. Check your dashboard for status updates.
            </p>
          </div>
          
          <button
            onClick={() => router.push('/user-dashboard/requests')}
            className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-all shadow-sm"
          >
            Go to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-3xl mx-auto px-8 py-24 space-y-24">
      
        {/* Header */}
        <section className="space-y-4 text-center">
          <h1 className="text-foreground">Partner Application</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join Alifh as a verified partner and grow your business with our platform
          </p>
        </section>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Company Information Card */}
          <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-8 md:p-12 space-y-10">
            <div className="space-y-2">
              <h2 className="text-foreground">Company Information</h2>
              <p className="text-sm text-muted-foreground">Tell us about your business</p>
            </div>

            <div className="space-y-8">
              {/* Company Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  Company Name (Legal)
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.companyNameLegal}
                    onChange={(e) => updateField('companyNameLegal', e.target.value)}
                    placeholder="Enter your company's legal name"
                    className="w-full h-11 pl-7 pr-4 bg-transparent border-b border-border/40 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40 text-foreground"
                  />
                </div>
                {errors.companyNameLegal && (
                  <small className="text-red-500 block mt-1">{errors.companyNameLegal}</small>
                )}
              </div>

              {/* Partner Type & Company Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    Partner Type
                    <span className="text-red-500">*</span>
                  </label>
                  <Select value={formData.partnerType} onValueChange={(value) => updateField('partnerType', value)}>
                    <SelectTrigger className="h-11 border border-border/40 bg-background/50 hover:bg-background transition-colors">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car_dealer">Car Dealer</SelectItem>
                      <SelectItem value="showroom">Showroom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    Company Size
                    <span className="text-red-500">*</span>
                  </label>
                  <Select value={formData.companySize} onValueChange={(value) => updateField('companySize', value)}>
                    <SelectTrigger className="h-11 border border-border/40 bg-background/50 hover:bg-background transition-colors">
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
            </div>
          </div>

          {/* Legal Documents Card */}
          <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-8 md:p-12 space-y-10">
            <div className="space-y-2">
              <h2 className="text-foreground">Legal Documents</h2>
              <p className="text-sm text-muted-foreground">Provide your business registration details</p>
            </div>

            <div className="space-y-8">
              {/* Trade License Number & Expiry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    Trade License Number
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.tradeLicense}
                      onChange={(e) => updateField('tradeLicense', e.target.value)}
                      placeholder="TL-123456"
                      className="w-full h-11 pl-7 pr-4 bg-transparent border-b border-border/40 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40 text-foreground"
                    />
                  </div>
                  {errors.tradeLicense && (
                    <small className="text-red-500 block mt-1">{errors.tradeLicense}</small>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    Expiry Date
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={dateInputValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        const digits = value.replace(/\D/g, '');
                        
                        let formatted = digits;
                        if (digits.length >= 2) {
                          formatted = digits.slice(0, 2) + '/' + digits.slice(2);
                        }
                        if (digits.length >= 4) {
                          formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4, 8);
                        }
                        
                        setDateInputValue(formatted.slice(0, 10));
                        
                        if (digits.length === 8) {
                          const day = parseInt(digits.slice(0, 2));
                          const month = parseInt(digits.slice(2, 4));
                          const year = parseInt(digits.slice(4, 8));
                          
                          if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2025) {
                            const date = new Date(year, month - 1, day);
                            if (!isNaN(date.getTime()) && date > new Date()) {
                              setSelectedDate(date);
                              updateField('tradeLicenseExpiry', format(date, 'yyyy-MM-dd'));
                              setErrors(prev => ({ ...prev, tradeLicenseExpiry: '' }));
                            }
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        if (digits.length > 0 && digits.length !== 8) {
                          setErrors(prev => ({ ...prev, tradeLicenseExpiry: 'Please enter a valid date (DD/MM/YYYY)' }));
                        } else if (digits.length === 8 && !selectedDate) {
                          setErrors(prev => ({ ...prev, tradeLicenseExpiry: 'Invalid date or must be in the future' }));
                        }
                      }}
                      placeholder="DD/MM/YYYY"
                      className="w-full h-11 pl-4 pr-11 bg-transparent border-b border-border/40 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40 text-foreground"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="absolute right-0 top-1/2 -translate-y-1/2 h-9 w-9 hover:bg-secondary/60 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end" sideOffset={4}>
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
                  </div>
                  {errors.tradeLicenseExpiry && (
                    <small className="text-red-500 block mt-1">{errors.tradeLicenseExpiry}</small>
                  )}
                </div>
              </div>

              {/* Trade License Document Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  Trade License Document
                  <span className="text-red-500">*</span>
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="hidden"
                />

                {uploadedFile ? (
                  <div className="rounded-xl border border-border/40 bg-card/50 p-4 transition-all hover:border-border/60">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <File className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{uploadedFile.name}</p>
                          <small className="text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </small>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full rounded-xl border-2 border-dashed border-border/40 bg-secondary/20 hover:bg-secondary/30 hover:border-primary/40 transition-all p-12 flex flex-col items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isUploading ? (
                      <>
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-foreground mb-1">Uploading document...</p>
                          <small className="text-muted-foreground">Please wait</small>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-foreground mb-1">Upload Trade License</p>
                          <small className="text-muted-foreground">PDF, JPG, or PNG • Maximum 5MB</small>
                        </div>
                      </>
                    )}
                  </button>
                )}
                
                {errors.tradeLicenseDocumentUrl && (
                  <small className="text-red-500 block mt-1">{errors.tradeLicenseDocumentUrl}</small>
                )}
              </div>

              {/* VAT Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  VAT Number
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.vatNumber}
                    onChange={(e) => updateField('vatNumber', e.target.value)}
                    placeholder="Enter VAT registration number"
                    className="w-full h-11 pl-7 pr-4 bg-transparent border-b border-border/40 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40 text-foreground"
                  />
                </div>
                {errors.vatNumber && (
                  <small className="text-red-500 block mt-1">{errors.vatNumber}</small>
                )}
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button
              type="button"
              onClick={() => router.push('/user-dashboard/requests')}
              className="w-full sm:w-auto px-8 py-3 rounded-full border border-border/40 hover:bg-secondary/50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
