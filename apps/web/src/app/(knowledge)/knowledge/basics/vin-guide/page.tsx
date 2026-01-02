/**
 * VIN Guide - Clean macOS-inspired Guide
 * Following Alifh Design System
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, CheckCircle2, MapPin, FileText, Car, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'What is a VIN Number? Complete Guide for UAE | Alifh',
  description: 'Learn everything about Vehicle Identification Numbers (VIN) in UAE. How to find, decode, and verify VINs when buying used cars in Dubai and UAE.',
  keywords: ['VIN number', 'VIN decoder UAE', 'vehicle identification number Dubai', 'check VIN UAE'],
};

export default function VINGuidePage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="space-y-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
            Getting Started
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">What is a VIN Number?</h1>
        </div>
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          A complete guide to Vehicle Identification Numbers for car buyers in UAE. 
          Learn how to find, decode, and verify VINs.
        </p>
        <div className="flex gap-3 text-xs text-muted-foreground/50">
          <span>5 min read</span>
          <span>•</span>
          <span>Updated Jan 2026</span>
        </div>
      </header>

      {/* Quick decode CTA */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-muted/15">
        <div className="flex-1">
          <p className="text-sm font-medium">Have a VIN to check?</p>
          <p className="text-xs text-muted-foreground/60">Decode it instantly with our free tool</p>
        </div>
        <Link
          href="/tools/vin-decoder"
          className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors flex items-center gap-1.5"
        >
          Decode VIN
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Section 1: Understanding */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">Understanding VINs</h2>
        </div>
        
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          A <strong className="text-foreground">Vehicle Identification Number (VIN)</strong> is a unique 17-character 
          code assigned to every vehicle manufactured since 1981. Think of it as your car's fingerprint—no two vehicles 
          share the same VIN.
        </p>

        <div className="p-5 bg-muted/15 rounded-xl border border-border/40 space-y-3">
          <p className="text-[10px] font-medium text-blue-500 uppercase tracking-wider">Example VIN</p>
          <p className="font-mono text-lg font-semibold tracking-widest">1HGCM82633A123456</p>
          <p className="text-xs text-muted-foreground/60">
            17 characters containing manufacturer, specs, and production info
          </p>
        </div>
      </section>

      {/* Section 2: Why it matters */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">Why VINs Matter</h2>
        </div>
        
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          When buying a used car in Dubai or anywhere in UAE, the VIN is your first line of defense against fraud.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: CheckCircle2, title: 'Verify Authenticity', desc: 'Confirm identity matches all documentation', color: 'text-green-500' },
            { icon: FileText, title: 'Check History', desc: 'Reveal accidents, recalls, ownership', color: 'text-blue-500' },
            { icon: Car, title: 'Decode Specs', desc: 'Verify make, model, year, specs', color: 'text-purple-500' },
            { icon: ShieldAlert, title: 'Avoid Fraud', desc: 'Detect cloned or stolen vehicles', color: 'text-yellow-500' },
          ].map((item) => (
            <div key={item.title} className="p-4 bg-card/50 rounded-xl border border-border/40 space-y-2">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="text-xs text-muted-foreground/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Where to find */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">Where to Find the VIN</h2>
        </div>

        <div className="space-y-2">
          {[
            { location: 'Dashboard', detail: 'Visible through windshield, driver side corner' },
            { location: 'Driver Door Jamb', detail: 'Sticker on door frame or pillar' },
            { location: 'Mulkiya', detail: 'Vehicle registration card in UAE' },
            { location: 'Insurance Docs', detail: 'Printed on certificate and policy' },
          ].map((item) => (
            <div key={item.location} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.location}</p>
                <p className="text-xs text-muted-foreground/60">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 px-4 py-3 bg-muted/15 border border-border/40 rounded-lg text-xs">
          <span className="text-base">💡</span>
          <p className="text-muted-foreground/70">
            <strong className="text-yellow-500">Pro tip:</strong> Always verify the Mulkiya VIN matches the physical VIN on the car. 
            This is mandatory during RTA transfer.
          </p>
        </div>
      </section>

      {/* Section 4: Decoding */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">How to Decode a VIN</h2>
        </div>
        
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          Each section of the 17-character VIN reveals specific information.
        </p>

        <div className="space-y-2">
          {[
            { pos: '1-3', name: 'World Manufacturer ID', desc: 'Country & manufacturer' },
            { pos: '4-8', name: 'Vehicle Descriptor', desc: 'Model, body, engine, trim' },
            { pos: '9', name: 'Check Digit', desc: 'Validation number' },
            { pos: '10', name: 'Model Year', desc: 'Year of manufacture' },
            { pos: '11', name: 'Plant Code', desc: 'Manufacturing facility' },
            { pos: '12-17', name: 'Serial Number', desc: 'Unique vehicle ID' },
          ].map((item) => (
            <div key={item.pos} className="flex items-center gap-4 p-3 rounded-lg bg-card/50 border border-border/40">
              <span className="px-2 py-1 bg-muted rounded font-mono text-xs text-purple-500 w-12 text-center flex-shrink-0">
                {item.pos}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground/60">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Warning signs */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">Warning Signs</h2>
        </div>
        
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          Be alert for these red flags when checking VINs:
        </p>

        <div className="space-y-2">
          <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium">Mismatched VIN</h3>
              <span className="px-2 py-0.5 bg-red-500/10 rounded-full text-[10px] font-medium text-red-500 uppercase">
                Critical
              </span>
            </div>
            <p className="text-xs text-muted-foreground/60">
              Dashboard VIN doesn't match door jamb or documents
            </p>
          </div>
          
          <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium">Altered VIN</h3>
              <span className="px-2 py-0.5 bg-red-500/10 rounded-full text-[10px] font-medium text-red-500 uppercase">
                Critical
              </span>
            </div>
            <p className="text-xs text-muted-foreground/60">
              Signs of scratching, welding, or re-stamping
            </p>
          </div>
          
          <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium">Missing VIN Plate</h3>
              <span className="px-2 py-0.5 bg-yellow-500/10 rounded-full text-[10px] font-medium text-yellow-600 uppercase">
                High Risk
              </span>
            </div>
            <p className="text-xs text-muted-foreground/60">
              VIN plate removed or absent from standard location
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-4 bg-red-500/5 rounded-xl border border-red-500/20">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground/70">
            <strong className="text-foreground">Important:</strong> If you discover VIN discrepancies or tampering, 
            do not proceed. Report suspicious vehicles to Dubai Police.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">FAQ</h2>
        </div>
        
        <div className="space-y-4">
          {[
            { q: 'Is VIN checking mandatory in UAE?', a: 'Not legally required for private sales, but standard during RTA transfer. Highly recommended before any purchase.' },
            { q: 'Can I check VIN history for free?', a: 'Basic decoding (make, model, specs) is free. Full history reports may require paid services or RTA inquiries.' },
            { q: 'What if VIN doesn\'t match documents?', a: 'Serious red flag. Do not proceed. The vehicle may be stolen or have fraudulent documentation.' },
          ].map((item) => (
            <div key={item.q} className="space-y-1">
              <h3 className="text-sm font-medium">{item.q}</h3>
              <p className="text-xs text-muted-foreground/60 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="p-6 rounded-xl border border-border/40 bg-muted/15 text-center space-y-4">
        <h3 className="text-base font-medium">Ready to check a VIN?</h3>
        <p className="text-xs text-muted-foreground/60">
          Use our free decoder to instantly verify any vehicle
        </p>
        <Link
          href="/tools/vin-decoder"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          Decode VIN
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
