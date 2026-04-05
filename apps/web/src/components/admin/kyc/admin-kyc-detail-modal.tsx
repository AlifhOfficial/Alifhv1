/**
 * Admin KYC Detail Modal
 * 
 * Full-screen modal showing complete KYC submission details
 * Including document images, extracted data, verification scores,
 * IP analysis, and device information.
 */

'use client';

import { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ShieldX,
  Clock,
  Calendar,
  FileText,
  User,
  Globe,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wifi,
  Smartphone,
  Monitor,
  Camera,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { KycLocationMap } from './kyc-location-map';
import type { KycRecordData } from '@/hooks/admin';
import { cn } from '@/utils/cn';

// ============================================================================
// Types
// ============================================================================

interface AdminKycDetailModalProps {
  record: KycRecordData;
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}

// ============================================================================
// Info Row Component
// ============================================================================

function InfoRow({ 
  label, 
  value, 
  icon: Icon,
  highlight,
  mono,
}: { 
  label: string; 
  value: string | number | boolean | null | undefined;
  icon?: React.ComponentType<{ className?: string }>;
  highlight?: 'good' | 'bad' | 'warning';
  mono?: boolean;
}) {
  let displayValue: string;
  if (value === null || value === undefined) {
    displayValue = '—';
  } else if (typeof value === 'boolean') {
    displayValue = value ? 'Yes' : 'No';
  } else {
    displayValue = String(value);
  }
  
  return (
    <div className="py-2.5 border-b border-border/20 last:border-0 flex items-start justify-between gap-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        <span className="text-subhead font-semibold text-muted-foreground/70">{label}</span>
      </div>
      <span className={cn(
        "text-subhead text-right max-w-[60%] break-all",
        highlight === 'good' && "text-success",
        highlight === 'bad' && "text-destructive",
        highlight === 'warning' && "text-warning",
        !highlight && "text-foreground",
        mono && "font-mono text-caption1"
      )}>
        {displayValue}
      </span>
    </div>
  );
}

// ============================================================================
// Score Card Component
// ============================================================================

function ScoreCard({ 
  label, 
  score, 
  status,
  threshold = 70 
}: { 
  label: string; 
  score: number | null; 
  status?: string | null;
  threshold?: number;
}) {
  const hasScore = score !== null;
  const isGood = hasScore ? score >= threshold : status === 'Approved';
  
  return (
    <div className={cn(
      "p-4 rounded-lg text-center border",
      isGood ? "bg-success-muted border-success/20" : hasScore ? "bg-destructive-muted border-destructive/20" : "bg-muted/20 border-border/40"
    )}>
      <p className="text-caption1 text-muted-foreground mb-1">{label}</p>
      {hasScore ? (
        <p className={cn(
          "text-title3 font-bold",
          isGood ? "text-success" : "text-destructive"
        )}>
          {Math.round(score)}%
        </p>
      ) : status ? (
        <p className={cn(
          "text-subhead font-semibold",
          status === 'Approved' ? "text-success" : "text-destructive"
        )}>
          {status}
        </p>
      ) : (
        <p className="text-headline font-semibold text-muted-foreground">—</p>
      )}
    </div>
  );
}

// ============================================================================
// Image Viewer Component
// ============================================================================

function ImageViewer({ 
  src, 
  alt, 
  label 
}: { 
  src: string | null | undefined; 
  alt: string; 
  label: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!src) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-muted/20 border border-border/40">
        <Camera className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-caption1 text-muted-foreground">{label} not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-caption1 text-muted-foreground font-medium">{label}</p>
      <div 
        className="relative cursor-pointer group rounded-xl overflow-hidden border border-border/40"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full object-cover transition-all",
            isExpanded ? "max-h-[500px]" : "max-h-[200px]"
          )}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Collapsible Section
// ============================================================================

function CollapsibleSection({ 
  title, 
  children,
  defaultOpen = true 
}: { 
  title: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <section className="space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border-b border-border/40 pb-2 hover:text-primary transition-colors"
      >
        <h3 className="text-callout tracking-tight">{title}</h3>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && children}
    </section>
  );
}

// ============================================================================
// Status Badge
// ============================================================================

function StatusBadge({ status }: { status: KycRecordData['status'] }) {
  const configMap = {
    pending: {
      icon: Clock,
      color: 'bg-warning-muted text-warning',
      label: 'Pending Review',
    },
    approved: {
      icon: CheckCircle2,
      color: 'bg-success-muted text-success',
      label: 'Approved',
    },
    rejected: {
      icon: XCircle,
      color: 'bg-destructive-muted text-destructive',
      label: 'Rejected',
    },
    expired: {
      icon: AlertTriangle,
      color: 'bg-gray-500/10 text-gray-500',
      label: 'Expired',
    },
  };

  const config = configMap[status as keyof typeof configMap] || {
    icon: AlertTriangle,
    color: 'bg-gray-500/10 text-gray-500',
    label: status || 'Unknown',
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-subhead font-semibold ${config.color}`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AdminKycDetailModal({
  record,
  open,
  onClose,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: AdminKycDetailModalProps) {
  // Fetch full record with signed URLs
  const [fullRecord, setFullRecord] = useState<KycRecordData | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  useEffect(() => {
    if (open && record.id) {
      setIsLoadingImages(true);
      fetch(`/api/admin/kyc/${record.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.record) {
            setFullRecord(data.record);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingImages(false));
    }
  }, [open, record.id]);

  const displayRecord = fullRecord || record;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-background/40 backdrop-blur-2xl"
        onClick={onClose}
      />
      
      <div className="relative z-50 w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background border border-border rounded-xl shadow-xl m-4 flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-background">
          <div className="flex items-center gap-4">
            <UserAvatar
              src={displayRecord.userAvatar}
              name={displayRecord.userName || displayRecord.userEmail}
              size="md"
            />
            <div>
              <h2 className="text-headline font-semibold tracking-tight">
                {displayRecord.userName || 'Unknown User'}
              </h2>
              <p className="text-subhead text-muted-foreground">{displayRecord.userEmail}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <StatusBadge status={displayRecord.status} />
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Verification Scores */}
          <section className="space-y-4">
            <div className="border-b border-border/40 pb-2">
              <h3 className="text-callout tracking-tight">Verification Results</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ScoreCard 
                label="Face Match" 
                score={displayRecord.faceMatchScore} 
                status={displayRecord.faceMatchStatus}
              />
              <ScoreCard 
                label="Liveness" 
                score={displayRecord.livenessScore} 
                status={displayRecord.livenessStatus}
              />
              <div className="p-4 rounded-lg text-center bg-muted/20 border border-border/40">
                <p className="text-caption1 text-muted-foreground mb-1">Liveness Method</p>
                <p className="text-subhead font-semibold">{displayRecord.livenessMethod || '—'}</p>
              </div>
              <div className="p-4 rounded-lg text-center bg-muted/20 border border-border/40">
                <p className="text-caption1 text-muted-foreground mb-1">Est. Age</p>
                <p className="text-subhead font-semibold">
                  {displayRecord.livenessAgeEstimation ? `${Math.round(displayRecord.livenessAgeEstimation)} yrs` : '—'}
                </p>
              </div>
            </div>
            
            {displayRecord.diditDecision && (
              <div className="rounded-xl border border-border/40 p-4 mt-4">
                <InfoRow 
                  label="Didit Decision" 
                  value={displayRecord.diditDecision.status || JSON.stringify(displayRecord.diditDecision)} 
                  highlight={displayRecord.diditDecision.status === 'Approved' ? 'good' : 'bad'}
                />
              </div>
            )}
          </section>

          {/* Document Images */}
          <CollapsibleSection title="Document Images">
            {isLoadingImages ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ImageViewer 
                  src={displayRecord.signedDocumentFrontUrl || displayRecord.documentFrontUrl} 
                  alt="Document Front" 
                  label="Document Front"
                />
                <ImageViewer 
                  src={displayRecord.signedDocumentBackUrl || displayRecord.documentBackUrl} 
                  alt="Document Back" 
                  label="Document Back"
                />
                <ImageViewer 
                  src={displayRecord.signedSelfieUrl || displayRecord.selfieUrl} 
                  alt="Selfie" 
                  label="Selfie / Portrait"
                />
              </div>
            )}
          </CollapsibleSection>

          {/* Face Match Images */}
          <CollapsibleSection title="Face Match Comparison" defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageViewer 
                src={displayRecord.signedFaceSourceImage || displayRecord.faceSourceImage} 
                alt="Face Source" 
                label="Source (from ID)"
              />
              <ImageViewer 
                src={displayRecord.signedFaceTargetImage || displayRecord.faceTargetImage} 
                alt="Face Target" 
                label="Target (Selfie)"
              />
            </div>
          </CollapsibleSection>

          {/* Extracted Personal Info */}
          <CollapsibleSection title="Extracted Personal Information">
            <div className="rounded-xl border border-border/40 p-4">
              <InfoRow 
                label="Full Name" 
                value={displayRecord.extractedFullName || `${displayRecord.extractedFirstName || ''} ${displayRecord.extractedLastName || ''}`.trim() || null} 
                icon={User}
              />
              <InfoRow 
                label="First Name" 
                value={displayRecord.extractedFirstName} 
                icon={User}
              />
              <InfoRow 
                label="Last Name" 
                value={displayRecord.extractedLastName} 
                icon={User}
              />
              <InfoRow 
                label="Date of Birth" 
                value={displayRecord.extractedDateOfBirth} 
                icon={Calendar}
              />
              <InfoRow 
                label="Age" 
                value={displayRecord.extractedAge} 
                icon={User}
              />
              <InfoRow 
                label="Gender" 
                value={displayRecord.extractedGender === 'M' ? 'Male' : displayRecord.extractedGender === 'F' ? 'Female' : displayRecord.extractedGender} 
                icon={User}
              />
              <InfoRow 
                label="Nationality" 
                value={displayRecord.extractedNationality} 
                icon={Globe}
              />
              <InfoRow 
                label="Nationality Code" 
                value={displayRecord.extractedNationalityCode} 
                icon={Globe}
                mono
              />
            </div>
          </CollapsibleSection>

          {/* Document Information */}
          <CollapsibleSection title="Document Information">
            <div className="rounded-xl border border-border/40 p-4">
              <InfoRow 
                label="Document Type" 
                value={displayRecord.documentType} 
                icon={FileText}
              />
              <InfoRow 
                label="Document Number" 
                value={displayRecord.documentNumber} 
                icon={CreditCard}
                mono
              />
              <InfoRow 
                label="Issuing Country" 
                value={displayRecord.documentCountry} 
                icon={Globe}
              />
              <InfoRow 
                label="Country Code" 
                value={displayRecord.documentCountryCode} 
                icon={Globe}
                mono
              />
              <InfoRow 
                label="Issue Date" 
                value={displayRecord.documentIssueDate} 
                icon={Calendar}
              />
              <InfoRow 
                label="Expiry Date" 
                value={displayRecord.documentExpiryDate} 
                icon={Calendar}
                highlight={displayRecord.documentExpiryDate && new Date(displayRecord.documentExpiryDate) < new Date() ? 'bad' : undefined}
              />
            </div>
          </CollapsibleSection>

          {/* IP & Device Analysis */}
          <CollapsibleSection title="IP & Device Analysis">
            {/* Map showing IP location */}
            {displayRecord.ipLatitude && displayRecord.ipLongitude && (
              <div className="mb-4">
                <KycLocationMap
                  latitude={displayRecord.ipLatitude}
                  longitude={displayRecord.ipLongitude}
                  city={displayRecord.ipCity}
                  country={displayRecord.ipCountry}
                  isVpnOrTor={displayRecord.isVpnOrTor}
                />
              </div>
            )}
            
            <div className="rounded-xl border border-border/40 p-4">
              <InfoRow 
                label="IP Address" 
                value={displayRecord.ipAddress} 
                icon={Wifi}
                mono
              />
              <InfoRow 
                label="Location" 
                value={displayRecord.ipCity && displayRecord.ipCountry ? `${displayRecord.ipCity}, ${displayRecord.ipCountry}` : null} 
                icon={MapPin}
              />
              <InfoRow 
                label="Coordinates" 
                value={displayRecord.ipLatitude && displayRecord.ipLongitude 
                  ? `${displayRecord.ipLatitude.toFixed(4)}, ${displayRecord.ipLongitude.toFixed(4)}` 
                  : null} 
                icon={Globe}
                mono
              />
              <InfoRow 
                label="VPN / Tor Detected" 
                value={displayRecord.isVpnOrTor} 
                icon={ShieldX}
                highlight={displayRecord.isVpnOrTor ? 'bad' : 'good'}
              />
              <InfoRow 
                label="Data Center IP" 
                value={displayRecord.isDataCenter} 
                icon={Monitor}
                highlight={displayRecord.isDataCenter ? 'warning' : undefined}
              />
              <InfoRow 
                label="Platform" 
                value={displayRecord.devicePlatform} 
                icon={displayRecord.devicePlatform === 'mobile' ? Smartphone : Monitor}
              />
              <InfoRow 
                label="Device Brand" 
                value={displayRecord.deviceBrand} 
                icon={Smartphone}
              />
              <InfoRow 
                label="Browser" 
                value={displayRecord.deviceBrowser} 
                icon={Globe}
              />
            </div>
          </CollapsibleSection>

          {/* Session Details */}
          <CollapsibleSection title="Session Details" defaultOpen={false}>
            <div className="rounded-xl border border-border/40 p-4">
              {displayRecord.diditSessionId && (
                <InfoRow 
                  label="Didit Session ID" 
                  value={displayRecord.diditSessionId}
                  mono
                />
              )}
              {displayRecord.diditSessionNumber && (
                <InfoRow 
                  label="Session Number" 
                  value={displayRecord.diditSessionNumber}
                />
              )}
              <InfoRow 
                label="Submitted At" 
                value={new Date(displayRecord.createdAt).toLocaleString('en-AE', { 
                  dateStyle: 'medium', 
                  timeStyle: 'short' 
                })} 
                icon={Calendar}
              />
              {displayRecord.verifiedAt && (
                <InfoRow 
                  label="Verified At" 
                  value={new Date(displayRecord.verifiedAt).toLocaleString('en-AE', { 
                    dateStyle: 'medium', 
                    timeStyle: 'short' 
                  })} 
                  icon={Calendar}
                />
              )}
              {displayRecord.verifiedBy && (
                <InfoRow 
                  label="Verified By" 
                  value={displayRecord.verifiedBy} 
                  icon={User}
                />
              )}
            </div>
          </CollapsibleSection>

          {/* Warnings */}
          {displayRecord.warnings && displayRecord.warnings.length > 0 && (
            <section className="space-y-4">
              <div className="border-b border-border/40 pb-2">
                <h3 className="text-callout tracking-tight text-warning">Warnings</h3>
              </div>
              
              <div className="space-y-2">
                {displayRecord.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-warning-muted border border-warning/20">
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-subhead text-warning">{warning.risk}</p>
                      <p className="text-subhead text-muted-foreground">{warning.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Rejection Reason */}
          {displayRecord.status === 'rejected' && displayRecord.rejectionReason && (
            <section className="space-y-4">
              <div className="border-b border-border/40 pb-2">
                <h3 className="text-callout tracking-tight text-destructive">Rejection Details</h3>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive-muted border border-destructive/20">
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-subhead text-destructive">
                    {displayRecord.rejectionReason}
                  </p>
                </div>
              </div>
            </section>
          )}

        </div>

        {/* Footer Actions */}
        {displayRecord.status === 'pending' && (
          <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-sidebar">
            <button
              onClick={onReject}
              disabled={isRejecting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-destructive-muted hover:bg-destructive/15 text-destructive text-subhead font-semibold transition-colors disabled:opacity-50"
            >
              <ShieldX className="w-4 h-4" />
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </button>
            <button
              onClick={onApprove}
              disabled={isApproving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-success hover:bg-success/90 text-white text-subhead font-semibold transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              {isApproving ? 'Approving...' : 'Approve KYC'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
