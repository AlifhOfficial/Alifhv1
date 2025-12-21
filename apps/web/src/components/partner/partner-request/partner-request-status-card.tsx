/**
 * Partner Request Status Card
 * 
 * Shows user's current partner request status
 * - Pending, Approved, or Rejected
 * - With appropriate actions for each state
 */

'use client';

import { usePartnerRequest, usePartnerRequestCancel } from '@/hooks/partner';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Trash2,
  Loader2,
  Calendar,
  Building2
} from 'lucide-react';
import { useState } from 'react';

interface PartnerRequestStatusCardProps {
  onUpdate?: () => void;
}

export function PartnerRequestStatusCard({ onUpdate }: PartnerRequestStatusCardProps) {
  const { data: request, isLoading } = usePartnerRequest();
  const { cancel, isCancelling } = usePartnerRequestCancel();
  const { toast } = useToast();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const handleCancel = () => {
    cancel(undefined, {
      onSuccess: () => {
        toast({
          title: 'Application Cancelled',
          description: 'Your partner application has been cancelled.',
        });
        setShowCancelConfirm(false);
        onUpdate?.();
      },
      onError: (error) => {
        toast({
          title: 'Cancellation Failed',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const getStatusConfig = () => {
    switch (request.status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600 dark:text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
          borderColor: 'border-yellow-200 dark:border-yellow-900/30',
          title: 'Application Under Review',
          description: 'Your partner application is being reviewed by our team.',
        };
      case 'approved':
        return {
          icon: CheckCircle2,
          color: 'text-green-600 dark:text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          borderColor: 'border-green-200 dark:border-green-900/30',
          title: 'Application Approved',
          description: 'Congratulations! Your partner application has been approved.',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600 dark:text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-200 dark:border-red-900/30',
          title: 'Application Rejected',
          description: 'Unfortunately, your partner application was not approved.',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/20',
          borderColor: 'border-border',
          title: 'Application Status',
          description: 'Your application status is being processed.',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <>
      <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-6`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${config.bgColor} ${config.color}`}>
            <Icon className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{config.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{config.description}</p>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{request.companyNameLegal}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Applied {new Date(request.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {request.status === 'rejected' && request.rejectionReason && (
                <div className="mt-4 p-3 bg-background rounded-lg border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Rejection Reason
                  </p>
                  <p className="text-sm">{request.rejectionReason}</p>
                </div>
              )}

              {request.status === 'approved' && request.reviewedAt && (
                <div className="mt-4 p-3 bg-background rounded-lg border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Approved On
                  </p>
                  <p className="text-sm">
                    {new Date(request.reviewedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>

            {request.status === 'pending' && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={onUpdate}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Update Application
                </button>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4">
            <h3 className="font-semibold text-lg mb-2">Cancel Application?</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to cancel your partner application? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors"
              >
                Keep Application
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Application'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
