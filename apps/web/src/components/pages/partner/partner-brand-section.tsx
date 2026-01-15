/**
 * Partner Brand Section - Alifh Partners Page
 * Visual showcase - how we present partners
 */

import Image from 'next/image';
import { Star, Clock, Package, TrendingUp, CheckCircle2 } from 'lucide-react';

export function PartnerBrandSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Content Side */}
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Your brand
            </p>
            
            <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
              We make you look good.
              <br />
              <span className="text-muted-foreground/70">Really good.</span>
            </h2>
            
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
              Others show your name and phone. We show inventory, sales, response time, Google reviews, location—everything that builds trust.
            </p>

            {/* Quick Stats Preview */}
            <div className="grid grid-cols-4 gap-3 pt-4">
              <div className="text-center p-3 rounded-lg border border-border/40">
                <Package className="w-4 h-4 text-[#0066FF] mx-auto mb-1" />
                <p className="text-sm font-semibold text-foreground">47</p>
                <p className="text-xs text-muted-foreground">Cars</p>
              </div>
              <div className="text-center p-3 rounded-lg border border-border/40">
                <TrendingUp className="w-4 h-4 text-[#0066FF] mx-auto mb-1" />
                <p className="text-sm font-semibold text-foreground">234</p>
                <p className="text-xs text-muted-foreground">Sales</p>
              </div>
              <div className="text-center p-3 rounded-lg border border-border/40">
                <Clock className="w-4 h-4 text-[#0066FF] mx-auto mb-1" />
                <p className="text-sm font-semibold text-foreground">&lt;2h</p>
                <p className="text-xs text-muted-foreground">Response</p>
              </div>
              <div className="text-center p-3 rounded-lg border border-border/40">
                <Star className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                <p className="text-sm font-semibold text-foreground">4.8</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center gap-3 pt-2">
              <CheckCircle2 className="w-4 h-4 text-[#0066FF] shrink-0" />
              <span className="text-sm font-medium text-foreground">Google Reviews sync</span>
              <span className="text-xs text-muted-foreground">— One tap. We handle the rest.</span>
            </div>
          </div>

          {/* Image Side */}
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="/Abstract/rs22.png"
                alt="Abstract design"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
