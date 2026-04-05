/**
 * Admin Partners List
 * Admin view for managing active partners
 * Following profile-view design system
 */

'use client';

import { useState } from 'react';
import { useAdminPartners } from '@/hooks/admin';
import { Building2, MapPin, Award } from 'lucide-react';
import { AdminPartnerDetailModal } from './admin-partner-detail-modal';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';

export function AdminPartnersList() {
  const [statusFilter, setStatusFilter] = useState<'active' | 'suspended' | 'cancelled' | undefined>();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  const { partners, isLoading } = useAdminPartners({
    status: statusFilter,
  });

  const counts = {
    total: partners.length,
    active: partners.filter(p => p.status === 'active').length,
    suspended: partners.filter(p => p.status === 'suspended').length,
    cancelled: partners.filter(p => p.status === 'cancelled').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Stats */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
            <h3 className="text-headline tracking-tight">Overview</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border divide-x divide-border bg-background">
            <div className="p-8 flex flex-col gap-3">
              <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Total</span>
              <span className="text-title2 font-semibold text-foreground">{counts.total}</span>
            </div>
            <button
              onClick={() => setStatusFilter('active')}
              className={`p-8 flex flex-col gap-3 hover:bg-secondary/20 transition-colors ${
                statusFilter === 'active' ? 'bg-secondary/40' : ''
              }`}
            >
              <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Active</span>
              <span className="text-title2 font-semibold text-success">{counts.active}</span>
            </button>
            <button
              onClick={() => setStatusFilter('suspended')}
              className={`p-8 flex flex-col gap-3 hover:bg-secondary/20 transition-colors ${
                statusFilter === 'suspended' ? 'bg-secondary/40' : ''
              }`}
            >
              <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Suspended</span>
              <span className="text-title2 font-semibold text-warning">{counts.suspended}</span>
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`p-8 flex flex-col gap-3 hover:bg-secondary/20 transition-colors ${
                statusFilter === 'cancelled' ? 'bg-secondary/40' : ''
              }`}
            >
              <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Cancelled</span>
              <span className="text-title2 font-semibold text-foreground">{counts.cancelled}</span>
            </button>
          </div>
        </section>

        {/* Partners List */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
            <h3 className="text-headline tracking-tight">Partners</h3>
            {statusFilter && (
              <button
                onClick={() => setStatusFilter(undefined)}
                className="text-subhead text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>

          {partners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-subhead text-muted-foreground">
                {statusFilter ? `No ${statusFilter} partners found` : 'No partners yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-0 border border-border rounded-xl overflow-hidden divide-y divide-border">
              {partners.map((partner) => (
                <div key={partner.id} className="p-6 hover:bg-secondary/10 transition-colors">
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <BrandAvatar
                          logoUrl={partner.logo || undefined}
                          brandName={partner.brandName}
                          size="md"
                        />
                        <div>
                          <h3 className="text-callout text-foreground">{partner.companyNameLegal}</h3>
                          <p className="text-subhead text-muted-foreground">{partner.brandName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-subhead text-muted-foreground mt-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            partner.status === 'active' ? 'bg-success' :
                            partner.status === 'suspended' ? 'bg-warning' :
                            'bg-foreground/30'
                          }`} />
                          <span className={
                            partner.status === 'active' ? 'text-success' :
                            partner.status === 'suspended' ? 'text-warning' :
                            'text-foreground'
                          }>
                            {partner.status}
                          </span>
                        </div>
                        
                        {partner.tier && (
                          <div className="flex items-center gap-2">
                            <Award className="w-3.5 h-3.5" />
                            <span className="capitalize">{partner.tier}</span>
                          </div>
                        )}

                        {partner.tradeLicense && (
                          <div>
                            <span className="font-medium">License:</span> {partner.tradeLicense}
                          </div>
                        )}

                        {partner.emirate && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{partner.emirate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPartnerId(partner.id)}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary hover:bg-primary/90 text-white text-subhead transition-colors"
                    >
                      Manage
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {selectedPartnerId && (
        <AdminPartnerDetailModal
          key={selectedPartnerId}
          partnerId={selectedPartnerId}
          onClose={() => setSelectedPartnerId(null)}
        />
      )}
    </>
  );
}
