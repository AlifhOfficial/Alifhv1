/**
 * Slide: Mission
 * A fair, transparent ecosystem.
 */

'use client';

export function SlideMission() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-sidebar">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Our Mission
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground max-w-3xl mx-auto">
            A Fair, Transparent Ecosystem Where Your Brand Is the Hero.
          </h2>
        </div>

        {/* Statement */}
        <p className="text-xl sm:text-2xl text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
          We believe you shouldn't have to pay the platform that competes against you. 
          Your margins stay yours. Your profits are protected.
        </p>

      </div>
    </section>
  );
}
