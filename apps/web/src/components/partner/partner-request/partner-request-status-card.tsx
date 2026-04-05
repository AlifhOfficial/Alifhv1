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
  Loader2,
  AlertTriangle
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
      <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-12">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
          iconColor: 'text-yellow-500',
          title: 'Under Review',
          description: 'Your application is being reviewed by our team. We\'ll notify you once a decision has been made.',
          badge: 'Pending Review',
        };
      case 'approved':
        return {
          icon: CheckCircle2,
          iconColor: 'text-green-500',
          title: 'Application Approved',
          description: 'Congratulations! Your partner application has been approved. You can now access your partner dashboard and start listing vehicles.',
          badge: 'Approved',
        };
      case 'rejected':
        return {
          icon: XCircle,
          iconColor: 'text-red-500',
          title: 'Application Not Approved',
          description: 'Unfortunately, your partner application was not approved at this time. Please review the feedback below and consider re-applying.',
          badge: 'Rejected',
        };
      default:
        return {
          icon: AlertCircle,
          title: 'Application Status',
          description: 'Your application status is being processed.',
          badge: 'Processing',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <>
      <div className="bg-card rounded-2xl border border-border/40 p-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-6 mb-10">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Icon className={`w-5 h-5 ${config.iconColor || 'text-muted-foreground'}`} />
          </div>
          <div className="space-y-3">
            <h2 className="text-title3 font-semibold text-foreground">{config.title}</h2>
            <p className="text-subhead text-muted-foreground/70 max-w-md">
              {config.description}
            </p>
          </div>
        </div>

        {/* Company Details Grid */}
        <div className="space-y-6 mb-8">
          <div className="space-y-2">
            <p className="text-caption1 text-muted-foreground/70">Company Name</p>
            <p className="text-subhead text-foreground">{request.companyNameLegal}</p>
          </div>

          <div className="space-y-2">
            <p className="text-caption1 text-muted-foreground/70">Trade License</p>
            <p className="text-subhead font-mono text-foreground">{request.tradeLicense}</p>
          </div>

          <div className="space-y-2">
            <p className="text-caption1 text-muted-foreground/70">Applied Date</p>
            <p className="text-subhead text-foreground">
              {new Date(request.createdAt).toLocaleDateString('en-AE', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {request.status === 'approved' && request.reviewedAt && (
            <div className="space-y-2">
              <p className="text-caption1 text-muted-foreground/70">Approved On</p>
              <p className="text-subhead text-foreground">
                {new Date(request.reviewedAt).toLocaleDateString('en-AE', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Rejection Reason */}
        {request.status === 'rejected' && request.rejectionReason && (
          <div className="space-y-2 mb-8">
            <p className="text-caption1 text-muted-foreground/70">Feedback</p>
            <p className="text-subhead text-foreground">{request.rejectionReason}</p>
          </div>
        )}

        {/* Actions */}
        {request.status === 'pending' && (
          <div className="flex justify-center pt-6 border-t border-border/40">
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-caption1 text-red-500 hover:text-red-600 transition-colors"
            >
              Cancel Application
            </button>
          </div>
        )}
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-2xl flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl border border-border/40 shadow-2xl p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-headline font-semibold text-foreground mb-1">Cancel Application?</h3>
                <p className="text-subhead text-muted-foreground leading-relaxed">
                  Are you sure you want to cancel your partner application? This action cannot be undone and you'll need to start over if you want to reapply.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
                className="flex-1 px-6 py-3 rounded-full border border-border/40 hover:bg-secondary/30 font-medium transition-all"
              >
                Keep Application
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
