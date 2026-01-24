/**
 * Vision Pillars Section - Our Contribution to We the UAE 2031
 * All 4 pillars with compelling narrative showing how Alifh supports national goals
 */

import Image from 'next/image';
import { Users, Shield, TrendingUp, Globe, Cpu, Leaf, Building2, CheckCircle2, Heart, Scale } from 'lucide-react';

export function VisionPillarsSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Section Intro */}
        <div className="text-center mb-20 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            The Four Pillars
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            Forward Society. Forward Economy.
            <br />
            <span className="text-muted-foreground/70">Forward Diplomacy. Forward Ecosystem.</span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            The 'We the UAE 2031' vision is built on four pillars covering society, economy, diplomacy, and ecosystem. 
            Here's how we aspire to contribute to each pillar through our work in the automotive sector.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════
            PILLAR 1: FORWARD SOCIETY
        ═══════════════════════════════════════════════════════════════════════════ */}
        <div className="mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 text-[#0066FF] text-xs font-semibold">
                <Users className="w-3.5 h-3.5" />
                Pillar 1
              </div>
              <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
                Forward Society.
                <br />
                <span className="text-muted-foreground/70">Prosperity through trust.</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                The UAE envisions "an integrated social system that empowers and unleashes the potential of Emiratis, 
                protects cultural heritage, and instills national identity and human values." A society built on 
                "harmony, tolerance and generosity."
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                <strong className="text-foreground">In automotive, trust can be strengthened.</strong> With visible VINs. 
                Clear pricing. Verified sellers. We want to help build that trust—one transparent transaction at a time.
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="/Abstract/ae2.jpg"
                alt="Forward Society - Building trust in UAE automotive"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* How Alifh Contributes */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 p-8 rounded-lg bg-[#0066FF] text-white flex flex-col justify-center">
              <p className="text-xs uppercase tracking-widest text-white/60 mb-4">Our Aspiration</p>
              <h3 className="text-2xl font-semibold mb-3 tracking-tight">
                Transparency as a foundation.
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                We aim to show the VIN on every listing. Verify every seller through KYC. Check every dealer. 
                Our goal is a marketplace where buyers can trust what they see—because transparency should be the standard.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Shield className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">VIN on every listing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Full vehicle history. Complete transparency.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <CheckCircle2 className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">KYC verified users</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Know who you're dealing with.
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════
            PILLAR 2: FORWARD ECONOMY
        ═══════════════════════════════════════════════════════════════════════════ */}
        <div className="mb-32">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 text-[#0066FF] text-xs font-semibold mx-auto">
              <TrendingUp className="w-3.5 h-3.5" />
              Pillar 2
            </div>
            <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
              Forward Economy.
              <br />
              <span className="text-muted-foreground/70">Growth through empowerment.</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              The UAE aims for "a competitive value-adding, diversified economy that grows at a high rate" with 
              a goal to "double the country's GDP from AED 1.49 trillion to AED 3 trillion" and "generate AED 800 billion 
              in non-oil exports."
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Image */}
            <div className="lg:col-span-2 aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="/Abstract/ae3.jpg"
                alt="Forward Economy - Supporting UAE economic growth"
                fill
                className="object-cover !relative"
              />
            </div>

            {/* Highlight */}
            <div className="lg:col-span-2 p-8 rounded-lg border border-border/40 bg-background flex flex-col justify-center">
              <h3 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
                Fair pricing. Full margins.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Industry-standard commission models can take 2-5% per transaction. On a AED 200,000 car, that's AED 4,000-10,000. 
                We believe in a model that lets dealers keep more of their earnings—
                supporting growth, hiring, and reinvestment in the UAE economy.
              </p>
            </div>

            {/* Cards */}
            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Building2 className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">SME empowerment</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Small dealers compete on equal footing.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Users className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Job creation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Healthy dealers hire more staff.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Globe className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Local tech</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built in UAE. Revenue stays here.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#0066FF] text-white">
              <TrendingUp className="w-5 h-5 text-white/80 mb-3" />
              <h3 className="text-sm font-medium mb-1">Private sector growth</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Enabling the economy of the future.
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════
            PILLAR 3: FORWARD DIPLOMACY
        ═══════════════════════════════════════════════════════════════════════════ */}
        <div className="mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-12">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden order-2 lg:order-1">
              <Image
                src="/Abstract/ae4.jpg"
                alt="Forward Diplomacy - UAE as a global automotive hub"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 text-[#0066FF] text-xs font-semibold">
                <Heart className="w-3.5 h-3.5" />
                Pillar 3
              </div>
              <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
                Forward Diplomacy.
                <br />
                <span className="text-muted-foreground/70">A force for good.</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                The UAE positions itself as "a significant force in global diplomacy, a trusted bridge for trade 
                and partnerships" and "a leading country in supporting the global agenda for environmental sustainability."
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                <strong className="text-foreground">The automotive sector is evolving.</strong> Electric vehicles. 
                Sustainable practices. Green innovation. We aim to build a platform that supports this transition—
                making it easier to buy and sell EVs, promoting sustainable choices, and reducing friction in the market.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Leaf className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">EV-ready platform</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Full support for electric vehicles.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Globe className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Global standards</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Best practices in transparency.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Scale className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Fair marketplace</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Equal access for all participants.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#0066FF] text-white">
              <Heart className="w-5 h-5 text-white/80 mb-3" />
              <h3 className="text-sm font-medium mb-1">Values-driven</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Integrity at every step.
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════
            PILLAR 4: FORWARD ECOSYSTEM
        ═══════════════════════════════════════════════════════════════════════════ */}
        <div>
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 text-[#0066FF] text-xs font-semibold mx-auto">
              <Cpu className="w-3.5 h-3.5" />
              Pillar 4
            </div>
            <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
              Forward Ecosystem.
              <br />
              <span className="text-muted-foreground/70">Digital infrastructure.</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              The UAE aims to be "the most seamlessly connected country in the world" with "a cutting-edge, 
              next generation digital infrastructure" and "the world's smartest, most dynamic and agile government, 
              capable of achieving the impossible."
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Highlight */}
            <div className="lg:col-span-2 p-8 rounded-lg bg-[#0066FF] text-white flex flex-col justify-center">
              <p className="text-xs uppercase tracking-widest text-white/60 mb-4">Our Aspiration</p>
              <h3 className="text-2xl font-semibold mb-3 tracking-tight">
                Infrastructure for automotive commerce.
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                We aspire to build digital rails for automotive transactions in the UAE. Online test drive booking. 
                Secure messaging. Verified listings. Real-time inventory. A platform designed for how the UAE 
                will do business in 2031 and beyond.
              </p>
            </div>

            {/* Image */}
            <div className="lg:col-span-2 aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="/Abstract/ae5.jpg"
                alt="Forward Ecosystem - Digital automotive infrastructure"
                fill
                className="object-cover !relative"
              />
            </div>

            {/* Cards */}
            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Cpu className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Modern tech stack</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built for speed and security.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <CheckCircle2 className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">24/7 availability</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Always on. Always accessible.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Shield className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Data security</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your information protected.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Globe className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">API-first design</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ready for integration.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
