'use client';

import { useAsyncQuery } from '@/hooks/use-async-query';
import { X, Loader2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { AdminPartnerOperations } from '@/components/admin/partner-operations';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';

interface AdminPartnerDetailModalProps {
  partnerId: string;
  onClose: () => void;
}

export function AdminPartnerDetailModal({ partnerId, onClose }: AdminPartnerDetailModalProps) {
  const { data: partner, isLoading } = useAsyncQuery({
    queryFn: async () => {
      const res = await fetch(`/api/admin/partners?partnerId=${partnerId}`);
      if (!res.ok) throw new Error('Failed to fetch partner');
      const data = await res.json();
      return data.data[0]; // API returns array
    },
  });

  return (
    <div className="fixed inset-0 bg-background/40 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border/30 sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <BrandAvatar
              logoUrl={isLoading ? null : partner?.logo}
              brandName={isLoading ? 'Loading...' : partner?.brandName || partner?.companyNameLegal || 'Partner'}
              size="sm"
            />
            <h2 className="text-title3 font-semibold tracking-tight">
              {isLoading ? 'Loading...' : partner?.brandName || partner?.companyNameLegal}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : partner ? (
          <div className="px-8 py-8 space-y-12">
            
            {/* Company Information */}
            <section className="space-y-6">
              <div className="border-b border-border/40 pb-2">
                <h3 className="text-headline tracking-tight">Company Information</h3>
              </div>

              <div className="rounded-xl border border-border p-6 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-caption1 text-muted-foreground">Legal Name</label>
                    <p className="text-subhead mt-1">{partner.companyNameLegal}</p>
                  </div>
                  <div>
                    <label className="text-caption1 text-muted-foreground">Brand Name</label>
                    <p className="text-subhead mt-1">{partner.brandName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-caption1 text-muted-foreground">Trade License</label>
                    <p className="text-subhead mt-1">{partner.tradeLicense}</p>
                  </div>
                  <div>
                    <label className="text-caption1 text-muted-foreground">VAT Number</label>
                    <p className="text-subhead mt-1">{partner.vatNumber || '-'}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact & Location */}
            <section className="space-y-6">
              <div className="border-b border-border/40 pb-2">
                <h3 className="text-headline tracking-tight">Contact & Location</h3>
              </div>

              <div className="rounded-xl border border-border p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="text-subhead">{partner.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="text-subhead">{partner.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-subhead">{partner.city}, {partner.emirate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-subhead">Joined {new Date(partner.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </section>

            {/* Status & Tier */}
            <section className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border p-6">
                <p className="text-caption1 text-muted-foreground mb-2">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    partner.status === 'active' ? 'bg-success' :
                    partner.status === 'suspended' ? 'bg-warning' :
                    'bg-destructive'
                  }`} />
                  <p className="text-headline font-semibold capitalize">{partner.status}</p>
                </div>
              </div>
              <div className="rounded-xl border border-border p-6">
                <p className="text-caption1 text-muted-foreground mb-2">Tier</p>
                <p className="text-headline font-semibold capitalize text-primary">{partner.tier}</p>
              </div>
            </section>

            {/* Partner Operations */}
            <section className="space-y-6">
              <div className="border-b border-border/40 pb-2">
                <h3 className="text-headline tracking-tight">Partner Management</h3>
              </div>
              <AdminPartnerOperations partner={partner} onOperationComplete={onClose} />
            </section>

          </div>
        ) : (
          <div className="px-8 py-16 text-center text-muted-foreground">
            Partner not found
          </div>
        )}
      </div>
    </div>
  );
}
