/**
 * KYC Verification Modal
 * Allows users to upload documents for identity verification
 */

'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KycVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'emirates_id', label: 'Emirates ID' },
  { value: 'driving_license', label: 'Driving License' },
];

export function KycVerificationModal({ isOpen, onClose, onSubmit }: KycVerificationModalProps) {
  const { toast } = useToast();
  const [documentType, setDocumentType] = useState('emirates_id');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentFront, setDocumentFront] = useState<File | null>(null);
  const [documentBack, setDocumentBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, WebP, or PDF file.',
        variant: 'destructive',
      });
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setFile(file);
    }
    e.target.value = '';
  };

  const handleSubmit = async () => {
    // Validation
    if (!documentType) {
      toast({
        title: 'Document type required',
        description: 'Please select a document type.',
        variant: 'destructive',
      });
      return;
    }

    if (!documentNumber.trim()) {
      toast({
        title: 'Document number required',
        description: 'Please enter your document number.',
        variant: 'destructive',
      });
      return;
    }

    if (!documentFront) {
      toast({
        title: 'Document front required',
        description: 'Please upload the front side of your document.',
        variant: 'destructive',
      });
      return;
    }

    if (!documentBack && documentType !== 'passport') {
      toast({
        title: 'Document back required',
        description: 'Please upload the back side of your document.',
        variant: 'destructive',
      });
      return;
    }

    if (!selfie) {
      toast({
        title: 'Selfie required',
        description: 'Please upload a selfie holding your document.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload document front
      const frontFormData = new FormData();
      frontFormData.append('file', documentFront);
      frontFormData.append('directory', 'kyc/documents');
      frontFormData.append('fileName', documentFront.name);
      frontFormData.append('contentType', documentFront.type);

      const frontResponse = await fetch('/api/storage/upload', {
        method: 'POST',
        body: frontFormData,
        credentials: 'include',
      });

      const frontPayload = await frontResponse.json();
      if (!frontResponse.ok || !frontPayload.key) {
        throw new Error('Failed to upload document front');
      }

      // Upload document back (if provided)
      let backKey = null;
      if (documentBack) {
        const backFormData = new FormData();
        backFormData.append('file', documentBack);
        backFormData.append('directory', 'kyc/documents');
        backFormData.append('fileName', documentBack.name);
        backFormData.append('contentType', documentBack.type);

        const backResponse = await fetch('/api/storage/upload', {
          method: 'POST',
          body: backFormData,
          credentials: 'include',
        });

        const backPayload = await backResponse.json();
        if (!backResponse.ok || !backPayload.key) {
          throw new Error('Failed to upload document back');
        }
        backKey = backPayload.key;
      }

      // Upload selfie
      const selfieFormData = new FormData();
      selfieFormData.append('file', selfie);
      selfieFormData.append('directory', 'kyc/selfies');
      selfieFormData.append('fileName', selfie.name);
      selfieFormData.append('contentType', selfie.type);

      const selfieResponse = await fetch('/api/storage/upload', {
        method: 'POST',
        body: selfieFormData,
        credentials: 'include',
      });

      const selfiePayload = await selfieResponse.json();
      if (!selfieResponse.ok || !selfiePayload.key) {
        throw new Error('Failed to upload selfie');
      }

      // Submit KYC request
      const kycResponse = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          documentType,
          documentNumber,
          documentFrontUrl: frontPayload.key,
          documentBackUrl: backKey,
          selfieUrl: selfiePayload.key,
        }),
      });

      const kycPayload = await kycResponse.json();
      if (!kycResponse.ok) {
        throw new Error(kycPayload.error || 'Failed to submit KYC request');
      }

      toast({
        title: 'Verification submitted',
        description: 'Your KYC request has been submitted. We will review it shortly.',
      });

      onSubmit?.();
      onClose();
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Failed to submit verification',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-background border border-border rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-medium text-foreground">KYC Verification</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload your documents to verify your identity
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Info Notice */}
          <div className="bg-muted/20 border border-border/40 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Why do we need this?
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We verify all users to ensure a safe and trusted marketplace. Your documents are encrypted and stored securely.
              </p>
            </div>
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Document Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Document Number
            </label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Enter document number"
              disabled={isSubmitting}
              className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Document Front */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Document Front Side
            </label>
            <input
              ref={frontInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e, setDocumentFront)}
              className="hidden"
            />
            <button
              onClick={() => frontInputRef.current?.click()}
              disabled={isSubmitting}
              className="w-full h-32 border-2 border-dashed border-border/40 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-muted/20 transition-colors disabled:opacity-50"
            >
              {documentFront ? (
                <>
                  <FileText className="w-8 h-8 text-primary" />
                  <p className="text-sm text-foreground font-medium">{documentFront.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(documentFront.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload front side</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WebP or PDF (max 10MB)</p>
                </>
              )}
            </button>
          </div>

          {/* Document Back (not for passport) */}
          {documentType !== 'passport' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Document Back Side
              </label>
              <input
                ref={backInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileChange(e, setDocumentBack)}
                className="hidden"
              />
              <button
                onClick={() => backInputRef.current?.click()}
                disabled={isSubmitting}
                className="w-full h-32 border-2 border-dashed border-border/40 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-muted/20 transition-colors disabled:opacity-50"
              >
                {documentBack ? (
                  <>
                    <FileText className="w-8 h-8 text-primary" />
                    <p className="text-sm text-foreground font-medium">{documentBack.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(documentBack.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload back side</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WebP or PDF (max 10MB)</p>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Selfie */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Selfie with Document
            </label>
            <p className="text-xs text-muted-foreground">
              Take a photo of yourself holding your document
            </p>
            <input
              ref={selfieInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setSelfie)}
              className="hidden"
            />
            <button
              onClick={() => selfieInputRef.current?.click()}
              disabled={isSubmitting}
              className="w-full h-32 border-2 border-dashed border-border/40 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-muted/20 transition-colors disabled:opacity-50"
            >
              {selfie ? (
                <>
                  <FileText className="w-8 h-8 text-primary" />
                  <p className="text-sm text-foreground font-medium">{selfie.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selfie.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload selfie</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG or WebP (max 10MB)</p>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 px-4 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-10 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </div>
      </div>
    </div>
  );
}
