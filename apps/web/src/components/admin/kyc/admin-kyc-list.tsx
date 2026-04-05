/**
 * Admin KYC List Component
 * 
 * Displays all KYC submissions with filtering, stats, and actions
 * Following profile-view and admin-users-list design patterns
 */

'use client';

import { useState } from 'react';
import {
  useAdminKyc,
  useAdminKycActions,
  type KycRecordData,
} from '@/hooks/admin';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import {
  ShieldCheck,
  ShieldX,
  Clock,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { AdminKycDetailModal } from './admin-kyc-detail-modal';
import { cn } from '@/utils/cn';

// ============================================================================
// Status Badge Component
// ============================================================================

function StatusBadge({ status }: { status: KycRecordData['status'] }) {
  const configMap = {
    pending: {
      icon: Clock,
      color: 'bg-warning-muted text-warning',
      label: 'Pending',
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
      color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
      label: 'Expired',
    },
  };

  const config = configMap[status as keyof typeof configMap] || {
    icon: AlertTriangle,
    color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    label: status || 'Unknown',
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-caption1 font-semibold ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

// ============================================================================
// Score Badge Component
// ============================================================================

function ScoreBadge({ 
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
  if (score === null && !status) return null;
  
  const isGood = score !== null ? score >= threshold : status === 'Approved';
  
  return (
    <div className="flex flex-col gap-1">
      <span className="text-caption1 text-muted-foreground">{label}</span>
      {score !== null ? (
        <span className={cn(
          "text-subhead font-semibold",
          isGood ? "text-success" : "text-destructive"
        )}>
          {Math.round(score)}%
        </span>
      ) : status ? (
        <span className={cn(
          "text-subhead font-semibold",
          status === 'Approved' ? "text-success" : "text-destructive"
        )}>
          {status}
        </span>
      ) : null}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AdminKycList() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRecord, setSelectedRecord] = useState<KycRecordData | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { records, stats, isLoading, refetch: _refetch } = useAdminKyc({ 
    status: statusFilter,
    limit: 50,
  });
  
  const { approve, reject, isApproving, isRejecting } = useAdminKycActions();

  const handleViewDetails = (record: KycRecordData) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleApprove = async (id: string) => {
    try {
      await approve(id);
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await reject({ id, reason });
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      
      {/* Stats Overview */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
          <h3 className="text-headline tracking-tight">Overview</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border divide-x divide-border bg-background">
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Total</span>
            <span className="text-title2 font-semibold text-foreground">{stats?.total ?? 0}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Pending</span>
            <span className="text-title2 font-semibold text-warning">{stats?.pending ?? 0}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Approved</span>
            <span className="text-title2 font-semibold text-success">{stats?.approved ?? 0}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Rejected</span>
            <span className="text-title2 font-semibold text-destructive">{stats?.rejected ?? 0}</span>
          </div>
        </div>
      </section>

      {/* Filters & List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <h3 className="text-headline tracking-tight">KYC Submissions</h3>
          
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KYC Records List */}
        {records.length > 0 ? (
          <div className="space-y-0 border border-border rounded-xl overflow-hidden divide-y divide-border">
            {records.map((record) => (
              <div key={record.id} className="p-6 hover:bg-secondary/10 transition-colors">
                
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <UserAvatar
                      src={record.userAvatar}
                      name={record.userName || record.userEmail}
                      size="md"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-callout text-foreground">
                          {record.userName || 'Unknown User'}
                        </h3>
                        <StatusBadge status={record.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-subhead text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          {record.userEmail}
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(record.createdAt).toLocaleDateString('en-AE', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>

                        {record.documentType && (
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            {record.documentType}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-muted text-foreground text-subhead transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                  </div>
                </div>

                {/* Extracted Info & Scores */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-4 border-t border-border text-subhead">
                  {/* Extracted Name */}
                  <div>
                    <p className="text-caption1 text-muted-foreground mb-1">Extracted Name</p>
                    <p className="font-medium">
                      {record.extractedFullName ||
                        (record.extractedFirstName || record.extractedLastName 
                          ? `${record.extractedFirstName || ''} ${record.extractedLastName || ''}`.trim()
                          : '—')
                      }
                    </p>
                  </div>

                  {/* Nationality */}
                  <div>
                    <p className="text-caption1 text-muted-foreground mb-1">Nationality</p>
                    <p className="font-medium">{record.extractedNationality || '—'}</p>
                  </div>

                  {/* DOB */}
                  <div>
                    <p className="text-caption1 text-muted-foreground mb-1">Date of Birth</p>
                    <p className="font-medium">{record.extractedDateOfBirth || '—'}</p>
                  </div>

                  {/* Face Match */}
                  <ScoreBadge 
                    label="Face Match" 
                    score={record.faceMatchScore} 
                    status={record.faceMatchStatus}
                  />

                  {/* Liveness */}
                  <ScoreBadge 
                    label="Liveness" 
                    score={record.livenessScore} 
                    status={record.livenessStatus}
                  />

                  {/* IP Info */}
                  <div>
                    <p className="text-caption1 text-muted-foreground mb-1">Location</p>
                    <p className="font-medium">
                      {record.ipCity && record.ipCountryCode 
                        ? `${record.ipCity}, ${record.ipCountryCode}`
                        : record.ipCountry || '—'
                      }
                    </p>
                    {record.isVpnOrTor && (
                      <span className="inline-flex items-center gap-1 text-caption1 text-destructive font-medium mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        VPN/Tor
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons for Pending */}
                {record.status === 'pending' && (
                  <div className="flex items-center gap-3 pt-4 mt-4 border-t border-border">
                    <button
                      onClick={() => handleApprove(record.id)}
                      disabled={isApproving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-success hover:bg-success/90 text-white text-subhead font-semibold transition-colors disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(record.id)}
                      disabled={isRejecting}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-destructive-muted hover:bg-destructive/15 text-destructive text-subhead font-semibold transition-colors disabled:opacity-50"
                    >
                      <ShieldX className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}

                {/* Rejection Reason */}
                {record.status === 'rejected' && record.rejectionReason && (
                  <div className="flex items-start gap-2 pt-4 mt-4 border-t border-border">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-caption1 text-muted-foreground mb-1">Rejection Reason</p>
                      <p className="text-subhead text-destructive font-medium">
                        {record.rejectionReason}
                      </p>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-subhead text-muted-foreground">
              {statusFilter === 'all' 
                ? 'No KYC submissions yet'
                : `No ${statusFilter} submissions`
              }
            </p>
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {selectedRecord && (
        <AdminKycDetailModal
          record={selectedRecord}
          open={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedRecord(null);
          }}
          onApprove={() => handleApprove(selectedRecord.id)}
          onReject={() => handleReject(selectedRecord.id)}
          isApproving={isApproving}
          isRejecting={isRejecting}
        />
      )}
    </div>
  );
}
