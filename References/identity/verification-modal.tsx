/**
 * Verification Modal Component
 * Allows users to verify their identity via UAE Pass or document upload
 * Follows Alifh Design Philosophy: minimal, clean, premium
 * Pure UI component - all logic handled by parent via callbacks
 */

"use client";

import { CheckCircle2, Upload, FileText, Shield, Loader2, X, ArrowLeft } from "lucide-react";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: 'method' | 'upload';
  onStepChange: (step: 'method' | 'upload') => void;
  documentType: 'EMIRATES_ID' | 'PASSPORT' | 'TRADE_LICENSE' | null;
  onDocumentTypeChange: (type: 'EMIRATES_ID' | 'PASSPORT' | 'TRADE_LICENSE') => void;
  files: Array<{ name: string; size: number }>;
  onFileSelect: (files: FileList) => void;
  onFileRemove: (index: number) => void;
  uploading: boolean;
  onUAEPassVerification: () => void;
  onDocumentUpload: () => void;
}

export function VerificationModal({ 
  isOpen, 
  onClose,
  step,
  onStepChange,
  documentType,
  onDocumentTypeChange,
  files,
  onFileSelect,
  onFileRemove,
  uploading,
  onUAEPassVerification,
  onDocumentUpload
}: VerificationModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    onStepChange('method');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="sm:max-w-[600px] w-full bg-card border border-border/40 rounded-lg">
        {/* Header */}
        <div className="border-b border-border/40 p-6">
          <h2 className="text-xl font-medium text-foreground mb-2">Identity Verification</h2>
          <p className="text-sm text-muted-foreground">
            Verify your identity to gain access to premium features and build trust
          </p>
        </div>

        {step === 'method' && (
          <div className="p-6 space-y-4">
            <p className="text-xs text-muted-foreground">
              Choose Verification Method
            </p>

            {/* UAE Pass Option */}
            <button
              onClick={onUAEPassVerification}
              disabled={uploading}
              className="w-full p-4 bg-card border border-border/40 hover:bg-muted/20 transition-colors text-left rounded-lg disabled:opacity-50"
            >
              <div className="flex items-start gap-4">
                <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Verify with UAE Pass
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Quick and secure verification using your UAE Pass digital identity
                  </p>
                </div>
              </div>
            </button>

            {/* Document Upload Option */}
            <button
              onClick={() => onStepChange('upload')}
              disabled={uploading}
              className="w-full p-4 bg-card border border-border/40 hover:bg-muted/20 transition-colors text-left rounded-lg disabled:opacity-50"
            >
              <div className="flex items-start gap-4">
                <Upload className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Upload Documents
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Upload your Emirates ID, Passport, or Trade License for manual verification
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {step === 'upload' && (
          <div className="p-6 space-y-6">
            {/* Back Button */}
            <button
              onClick={() => onStepChange('method')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Methods
            </button>

            {/* Document Type Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Select Document Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => onDocumentTypeChange('EMIRATES_ID')}
                  className={`p-4 border text-center transition-colors rounded-lg ${
                    documentType === 'EMIRATES_ID'
                      ? 'border-primary bg-primary/10'
                      : 'border-border/40 bg-card hover:bg-muted/20'
                  }`}
                >
                  <FileText className="w-4 h-4 mx-auto mb-2 text-foreground" />
                  <span className="text-xs font-medium text-foreground">Emirates ID</span>
                </button>
                <button
                  onClick={() => onDocumentTypeChange('PASSPORT')}
                  className={`p-4 border text-center transition-colors rounded-lg ${
                    documentType === 'PASSPORT'
                      ? 'border-primary bg-primary/10'
                      : 'border-border/40 bg-card hover:bg-muted/20'
                  }`}
                >
                  <FileText className="w-4 h-4 mx-auto mb-2 text-foreground" />
                  <span className="text-xs font-medium text-foreground">Passport</span>
                </button>
                <button
                  onClick={() => onDocumentTypeChange('TRADE_LICENSE')}
                  className={`p-4 border text-center transition-colors rounded-lg ${
                    documentType === 'TRADE_LICENSE'
                      ? 'border-primary bg-primary/10'
                      : 'border-border/40 bg-card hover:bg-muted/20'
                  }`}
                >
                  <FileText className="w-4 h-4 mx-auto mb-2 text-foreground" />
                  <span className="text-xs font-medium text-foreground">Trade License</span>
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Upload Documents (Max 3)
              </label>
              <div className="border-2 border-dashed border-border/40 bg-muted/10 p-8 text-center hover:bg-muted/20 transition-colors rounded-lg">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files && onFileSelect(e.target.files)}
                  className="hidden"
                  disabled={files.length >= 3}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground font-medium">
                    Click to Upload
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG, PDF • Max 10MB each
                  </span>
                </label>
              </div>

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted/10 border border-border/40 rounded-lg"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm flex-1 truncate font-medium text-foreground">{file.name}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button
                        onClick={() => onFileRemove(index)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Important Notes */}
            <div className="bg-muted/10 border border-border/40 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Important Notes
              </h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>• Ensure all documents are clear and readable</li>
                <li>• Documents must be valid and not expired</li>
                <li>• Personal information must match your profile details</li>
                <li>• Review typically takes 24-48 hours</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClose}
                disabled={uploading}
                className="flex-1 h-10 px-4 bg-card border border-border/40 text-foreground text-sm font-medium hover:bg-muted/20 transition-colors disabled:opacity-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={onDocumentUpload}
                disabled={uploading || !documentType || files.length === 0}
                className="flex-1 h-10 px-4 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 rounded-lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Review'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
