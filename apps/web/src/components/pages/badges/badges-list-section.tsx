/**
 * Badges List Section - Alifh Badges Page
 * Mix & match grid - following partner page patterns
 */

import Image from 'next/image';
import { Award, Crown, Users, Star, Heart, Gem, Shield, Trophy, Zap, Rocket } from 'lucide-react';

export function BadgesListSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            For Users
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            User Badges.
            <br />
            <span className="text-muted-foreground/70">Part of the journey.</span>
          </h2>
        </div>

        {/* User Badges - Mix & Match Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-28">
          
          {/* Image Card */}
          <div className="lg:col-span-2 aspect-[4/3] rounded-lg overflow-hidden">
            <Image
              src="/Abstract/B2.png"
              alt="Abstract design"
              fill
              className="object-cover !relative"
            />
          </div>

          {/* Highlight Card - Alifh First */}
          <div className="lg:col-span-2 p-8 rounded-lg bg-[#0066FF] text-white flex flex-col justify-center">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-4">Early believers</p>
            <h3 className="text-2xl font-semibold mb-3 tracking-tight">
              Alifh First
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Those who believed in us from the very beginning. A badge of honour for trusting the vision before anyone else did.
            </p>
          </div>

          {/* Badge Cards */}
          <div className="p-6 rounded-lg border border-border/40 bg-background">
            <Crown className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">Alifh Ambassador</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Official representatives of Alifh.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-background">
            <Users className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">Community Member</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Part of the exclusive Alifh community.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-background">
            <Star className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">Founding Member</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Part of our founding story.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-background">
            <Heart className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">Community Hero</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Going above and beyond to help.
            </p>
          </div>
        </div>

        {/* Dealer Badges Section */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            For Dealers
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            Dealer Badges.
            <br />
            <span className="text-muted-foreground/70">Trust. Earned.</span>
          </h2>
        </div>

        {/* Dealer Badges - Mix & Match Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Highlight Card - Alifh Choice */}
          <div className="lg:col-span-2 p-8 rounded-lg bg-[#0066FF] text-white flex flex-col justify-center">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-4">Team pick</p>
            <h3 className="text-2xl font-semibold mb-3 tracking-tight">
              Alifh Choice
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Hand-picked by Team Alifh. Dealers who exemplify excellence, integrity, and genuine customer care. Our personal recommendation.
            </p>
          </div>

          {/* Image Card */}
          <div className="lg:col-span-2 aspect-[4/3] rounded-lg overflow-hidden">
            <Image
              src="/Abstract/b3.png"
              alt="Abstract design"
              fill
              className="object-cover !relative"
            />
          </div>

          {/* Badge Cards */}
          <div className="p-6 rounded-lg border border-border/40 bg-background">
            <Gem className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">Luxury Specialist</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium vehicle expertise.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-background">
            <Shield className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">Trusted Dealer</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Verified and reliable.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-background">
            <Trophy className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">Top Performer</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Best in class. Quarterly.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-background">
            <Zap className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">Founding Partner</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              With us from day one.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
