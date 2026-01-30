/**
 * About Team Section
 * Who we are. Bootstrapped. Independent.
 */

'use client';

export function AboutTeamSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-border/40">
      <div className="max-w-3xl mx-auto text-center space-y-5">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary block">
          Who we are
        </span>
        <p className="text-base text-muted-foreground leading-relaxed">
          A small team in Dubai. Automotive veterans and engineers who happen to 
          love cars. No VC funding. No pressure for quick exits. We're building this 
          the way you'd build a project car—slowly, carefully, with attention to 
          what actually matters.
        </p>
      </div>
    </section>
  );
}
