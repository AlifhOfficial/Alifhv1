/**
 * Services Section Component
 * Signature services, VIP perks, and location info
 */

'use client';

import React from 'react';
import { Plus, Zap } from 'lucide-react';
import type { PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';
import type { ShowroomService } from '@alifh/database';
import { EditableField, ServiceCard } from '../components';

interface ServicesSectionProps {
  form: Partial<PartnerShowroom>;
  getEditableFieldProps: (field: keyof PartnerShowroom) => {
    isEditing: boolean;
    isUpdating: boolean;
    onStartEdit: () => void;
    onChange: (val: string | number | null) => void;
    onSave: () => void;
    onCancel: () => void;
  };
  updateField: <K extends keyof PartnerShowroom>(field: K, value: PartnerShowroom[K]) => void;
  updateShowroom: (data: Partial<PartnerShowroom>) => Promise<void>;
}

export function ServicesSection({
  form,
  getEditableFieldProps,
  updateField,
  updateShowroom,
}: ServicesSectionProps) {
  // Service helpers
  const addService = async () => {
    const newService: ShowroomService = {
      id: crypto.randomUUID(),
      icon: 'star',
      title: 'New Service',
      description: null,
      order: (form.signatureServices?.length || 0),
    };
    const updated = [...(form.signatureServices || []), newService];
    await updateShowroom({ signatureServices: updated });
  };

  const updateService = async (id: string, updates: Partial<ShowroomService>) => {
    const updated = (form.signatureServices || []).map(s => s.id === id ? { ...s, ...updates } : s);
    await updateShowroom({ signatureServices: updated });
  };

  const removeService = async (id: string) => {
    const updated = (form.signatureServices || []).filter(s => s.id !== id);
    await updateShowroom({ signatureServices: updated });
  };

  return (
    <div className="space-y-6">
      {/* Signature Services */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold tracking-tight text-foreground">Signature Services</h3>
          <button
            onClick={addService}
            disabled={(form.signatureServices?.length || 0) >= 6}
            className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 font-semibold disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {(form.signatureServices || []).map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onUpdate={(updates) => updateService(service.id, updates)}
              onRemove={() => removeService(service.id)}
            />
          ))}
        </div>
        {(form.signatureServices?.length || 0) === 0 && (
          <div className="rounded-xl border border-dashed border-border/40 p-8 text-center">
            <Zap className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No services added</p>
          </div>
        )}
      </section>

      {/* VIP Perks */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">VIP Perks</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5">
          <p className="text-xs text-muted-foreground mb-3">Add exclusive perks (one per line)</p>
          <textarea
            value={(form.vipPerks || []).join('\n')}
            onChange={(e) => updateField('vipPerks', e.target.value.split('\n').filter(Boolean))}
            onBlur={(e) => {
              const perks = e.target.value.split('\n').filter(Boolean);
              updateShowroom({ vipPerks: perks });
            }}
            placeholder="Complimentary pickup & delivery&#10;Priority access to new arrivals&#10;Dedicated relationship manager"
            rows={4}
            className="w-full bg-muted/20 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none placeholder:text-muted-foreground/50"
          />
        </div>
      </section>

      {/* Visit Info */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Visit Information</h3>
        <p className="text-xs text-muted-foreground mb-3">Your address is set in your <span className="text-primary">Basic Profile</span>. Add additional details below.</p>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5">
          <EditableField
            {...getEditableFieldProps('parkingInfo')}
            label="Parking & Access"
            value={form.parkingInfo || null}
            placeholder="Complimentary valet parking available"
          />
          <EditableField
            {...getEditableFieldProps('showroomAddress')}
            label="Additional Location Notes"
            value={form.showroomAddress || null}
            placeholder="Inside Dubai Mall, Level 2 near main entrance..."
            type="textarea"
          />
          <EditableField
            {...getEditableFieldProps('appointmentCtaText')}
            label="Visit CTA Button Text"
            value={form.appointmentCtaText || 'Book Your Private Viewing'}
            placeholder="Book Your Private Viewing"
          />
        </div>
      </section>
    </div>
  );
}
