/**
 * Slide: Why You Win
 * The long game.
 */

'use client';

export function SlideWhyYouWin() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-sidebar">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            The Long Game
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            Why You'll Win With Revvup.
          </h2>
        </div>

        {/* Points */}
        <div className="space-y-8 max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl text-center text-muted-foreground">
            We're new. We won't pretend otherwise.
          </p>
          <p className="text-xl sm:text-2xl text-center text-muted-foreground">
            We can't promise 50 sales next month.
          </p>
          <p className="text-xl sm:text-2xl text-center text-muted-foreground">
            But we're <span className="text-foreground font-medium">self-funded</span>. No investors. No pressure.
          </p>
          <p className="text-xl sm:text-2xl text-center text-muted-foreground">
            We succeed when you <span className="text-foreground font-medium">stay</span>—not when you sell.
          </p>
          <p className="text-xl sm:text-2xl text-center text-muted-foreground">
            That's the alignment that wins <span className="text-foreground font-medium">long-term</span>.
          </p>
        </div>

      </div>
    </section>
  );
}
