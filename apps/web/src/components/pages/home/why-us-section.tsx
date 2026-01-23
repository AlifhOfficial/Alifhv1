/**
 * Why Us Section - Alifh Home Page
 * Consistent with Hero Section design patterns
 */

import Image from 'next/image';
import Link from 'next/link';
import { Banknote, FileText, Calendar, Sparkles, Clock, PenLine, Zap, Timer, CheckCircle2 } from 'lucide-react';

export function WhyUsSection() {
  return (
    <section className="relative bg-background">

      {/* Section 1: The Problem */}
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Content */}
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Why Alifh exists
              </p>
              
              <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
                Most UAE Platforms Charge to List.
                <br />
                <span className="text-muted-foreground/70">We Never Will.</span>
              </h2>
              
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                Other platforms charge listing fees—some over AED 1,000. They run ads everywhere. 
                Anyone can pay to rank first. VIN numbers are optional. Listings stay up forever. 
                You can't book test drives online.
              </p>
              
              <div className="flex items-center gap-8 pt-4 border-t border-border/40">
                <div className="text-center space-y-1">
                  <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">AED 0</div>
                  <div className="text-xs text-muted-foreground">Listing fees</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">100%</div>
                  <div className="text-xs text-muted-foreground">VIN verified</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">24/7</div>
                  <div className="text-xs text-muted-foreground">Online booking</div>
                </div>
              </div>
            </div>
            
            {/* Abstract Image */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="/Abstract/rsx7.png"
                alt="Abstract"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: What We Do Different */}
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="text-center mb-16 space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              What makes us different
            </p>
            <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
              Human First.
              <br />
              <span className="text-muted-foreground/70">Not Corporate First.</span>
            </h2>
          </div>

          {/* Mix & Match Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Image Card - Standalone */}
            <div className="lg:col-span-2 aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="/Abstract/rsx3.png"
                alt="Abstract design"
                fill
                className="object-cover !relative"
              />
            </div>

            {/* Quality Card */}
            <div className="lg:col-span-2 p-8 rounded-lg border border-border/40 bg-background flex flex-col justify-center">
              <h3 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
                Ranking that makes sense
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Listings rank by photo quality, description completeness, response time, and seller rating. Not who pays the most.
              </p>
              <Link 
                href="/how-ranking-works" 
                className="text-sm text-muted-foreground hover:text-[#0066FF] transition-colors mt-4 inline-flex items-center gap-1"
              >
                See how it works →
              </Link>
            </div>

            {/* Feature Cards Row */}
            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Banknote className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">No listing fee</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Not now. Not ever. Not even later.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <FileText className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">VIN is public</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Because hiding it is sketchy.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Calendar className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Test drives book themselves</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No haggling over WhatsApp at 11 PM.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#0066FF] text-white">
              <Sparkles className="w-5 h-5 text-white/80 mb-3" />
              <h3 className="text-sm font-medium mb-1">No ads. Zero clutter.</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Clean, fast, focused experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Industry Standard */}
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            {/* Content Side */}
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Industry standard
              </p>
              <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
                How Car Listings Usually Work.
                <br />
                <span className="text-muted-foreground/70">Tiers. Add-Ons. Extras.</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                Most platforms offer a free tier with limits. Photos, visibility, contact buttons—all behind paywalls.
              </p>
            </div>
            
            {/* Image Side */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="/Abstract/rs4.png"
                alt="Abstract"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Typical Pricing Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Typical Free Tier */}
            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Typical free tier</p>
              <p className="text-2xl font-semibold text-foreground mb-4">AED 0</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Limited photos</p>
                <p>• 1 active listing</p>
                <p>• Basic visibility</p>
                <p>• No contact shortcuts</p>
              </div>
            </div>

            {/* Typical Paid Tier */}
            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Typical paid tier</p>
              <p className="text-2xl font-semibold text-foreground mb-4">AED 99+ <span className="text-sm font-normal text-muted-foreground">+ VAT</span></p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• More photos</p>
                <p>• Featured placement</p>
                <p>• Contact buttons</p>
                <p>• Special badges</p>
              </div>
            </div>

            {/* Common Add-ons */}
            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Common add-ons</p>
              <div className="space-y-3">
                <div>
                  <p className="text-lg font-semibold text-foreground">AED 30+</p>
                  <p className="text-sm text-muted-foreground">Basic tags</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">AED 2–10/day</p>
                  <p className="text-sm text-muted-foreground">Daily boost fees</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">AED 200+</p>
                  <p className="text-sm text-muted-foreground">Spotlight packages</p>
                </div>
              </div>
            </div>

            {/* Blue Alifh Card */}
            <div className="p-6 rounded-lg bg-[#0066FF] text-white">
              <p className="text-xs uppercase tracking-widest text-white/60 mb-3">Alifh</p>
              <p className="text-2xl font-semibold mb-4">AED 0</p>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white/60" />
                  <span>Unlimited photos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white/60" />
                  <span>No listing limits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white/60" />
                  <span>Quality-based ranking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white/60" />
                  <span>No add-ons needed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stat Row */}
          <div className="flex items-center justify-center gap-12 pt-12 mt-12 border-t border-border/40">
            <div className="text-center space-y-1">
              <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">AED 0</div>
              <div className="text-xs text-muted-foreground">To list</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">AED 0</div>
              <div className="text-xs text-muted-foreground">To boost</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">AED 0</div>
              <div className="text-xs text-muted-foreground">To feature</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">AED 0</div>
              <div className="text-xs text-muted-foreground">Period.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Simple Comparison */}
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="text-center mb-16 space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Side by side
            </p>
            <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
              What You Get Elsewhere.
              <br />
              <span className="text-muted-foreground/70">What You Get Here.</span>
            </h2>
          </div>

          {/* Comparison Grid */}
          <div className="grid sm:grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40 max-w-4xl mx-auto">
            
            {/* Others Column */}
            <div className="p-8 bg-background">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-8">Typical UAE Platforms</p>
              <div className="space-y-6">
                {[
                  { label: 'Listing cost', value: 'Up to AED 1,000+' },
                  { label: 'Visibility', value: 'Pay to appear first' },
                  { label: 'Experience', value: 'Ads everywhere' },
                  { label: 'Transparency', value: 'VIN optional' },
                  { label: 'Test drives', value: 'Call and negotiate' },
                  { label: 'Stale listings', value: 'Stay up forever' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm text-foreground/60">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alifh Column */}
            <div className="p-8 bg-[#0066FF] text-white">
              <p className="text-xs uppercase tracking-widest text-white/60 mb-8">Alifh</p>
              <div className="space-y-6">
                {[
                  { label: 'Listing cost', value: 'Free for individuals' },
                  { label: 'Visibility', value: 'Photos + response time' },
                  { label: 'Experience', value: 'Zero ads, ever' },
                  { label: 'Transparency', value: 'VIN required' },
                  { label: 'Test drives', value: 'Book online 24/7' },
                  { label: 'Stale listings', value: 'Auto-expire' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm text-white/70">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.value}</span>
                      <CheckCircle2 className="w-4 h-4 text-white/60" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Features */}
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="text-center mb-16 space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Built in Dubai
            </p>
            <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
              Everything You Need.
              <br />
              <span className="text-muted-foreground/70">Nothing You Don't.</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto pt-2">
              Local team. Clean experience. Every feature designed with purpose.
            </p>
          </div>

          {/* Features Grid - Mix & Match */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Image Card - Standalone */}
            <div className="sm:col-span-2 lg:col-span-2 aspect-[16/9] rounded-lg overflow-hidden">
              <Image
                src="/Abstract/rsxx.png"
                alt=""
                fill
                className="object-cover !relative"
              />
            </div>

            {/* Security Card - Separate */}
            <div className="sm:col-span-2 lg:col-span-2 p-8 rounded-lg border border-border/40 bg-background flex flex-col justify-center">
              <h3 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">Your data stays yours</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                End-to-end encryption. No data sold. Ever.
              </p>
            </div>

            {/* Small Feature Cards */}
            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Clock className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Book anytime</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Found your car at 2 AM? Book a test drive instantly.</p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <PenLine className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Unlimited edits</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Update your listing anytime. No restrictions.</p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Zap className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Actually fast</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Not "loading spinner" fast. Actually fast.</p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Timer className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Auto-expire after 24 days</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">No messaging about cars that sold 3 months ago.</p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
