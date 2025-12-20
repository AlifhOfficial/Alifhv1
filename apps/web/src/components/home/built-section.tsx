/**
 * Built Section - Alifh Home Page
 * Modern stack visualization - simple dots and lines
 */

export function BuiltSection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-xl font-medium text-foreground tracking-tight mb-2">
            Built different
          </h2>
          <p className="text-sm text-muted-foreground">
            Modern tools. No legacy baggage.
          </p>
        </div>

        {/* Flow visualization */}
        <div className="relative">
          
          {/* Connection lines - hidden on mobile */}
          <div className="hidden sm:block absolute inset-0 pointer-events-none">
            {/* Horizontal line through middle */}
            <div className="absolute top-1/2 left-[15%] right-[15%] h-px bg-border/60" />
            {/* Vertical connectors */}
            <div className="absolute top-[25%] bottom-[25%] left-[25%] w-px bg-border/60" />
            <div className="absolute top-[25%] bottom-[25%] left-[50%] w-px bg-border/60" />
            <div className="absolute top-[25%] bottom-[25%] left-[75%] w-px bg-border/60" />
          </div>

          {/* Grid of nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6 relative">
            
            {/* Row 1 - Top concepts */}
            <Node label="Fast" sublabel="Sub-second loads" />
            <Node label="Secure" sublabel="Industry standard auth" />
            <Node label="Scalable" sublabel="Edge-ready infra" />
            <Node label="Modern" sublabel="2024 stack" />
            
            {/* Row 2 - Tech */}
            <TechNode name="Bun" description="Runtime" />
            <TechNode name="Next.js" description="Framework" />
            <TechNode name="Neon" description="Database" />
            <TechNode name="Better Auth" description="Authentication" />
            
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground mt-16 text-center max-w-md mx-auto">
          We chose tools that let us move fast without cutting corners. 
          No WordPress plugins. No duct tape.
        </p>

      </div>
    </section>
  );
}

function Node({ label, sublabel }: { label: string; sublabel: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-3 h-3 rounded-full bg-blue-600 mb-3" />
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{sublabel}</span>
    </div>
  );
}

function TechNode({ name, description }: { name: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 mb-3" />
      <span className="text-xs font-medium text-muted-foreground">{name}</span>
      <span className="text-xs text-muted-foreground/60">{description}</span>
    </div>
  );
}
