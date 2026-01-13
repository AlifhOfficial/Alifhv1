/**
 * About Team Section
 * Who we are. Bootstrapped. Independent.
 */

'use client';

export function AboutTeamSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-border/40">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Who we are
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A small team based in Dubai. Some of us have been in automotive for years. 
          Some of us are engineers who just really, really love cars. All of us have 
          been burned by the same broken system we're trying to fix. We're not funded 
          by VCs who want 10x returns by next quarter. We're building this for the long 
          haul—the way you build a project car. Slowly. Carefully. With obsessive 
          attention to what matters.
        </p>
      </div>
    </section>
  );
}
