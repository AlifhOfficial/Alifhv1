import Link from "next/link";

const REASON_MESSAGES: Record<string, { badge: string; title: string; subtitle: string }> = {
  'billing-inactive': {
    badge: 'Billing',
    title: 'Subscription required.',
    subtitle: 'Your dealership\'s subscription is inactive.',
  },
  'not-dealer-owner': {
    badge: 'Access',
    title: 'Owner access required.',
    subtitle: 'This area is restricted to partner owners.',
  },
  'not-dealer-staff': {
    badge: 'Access',
    title: 'Staff access required.',
    subtitle: 'This area is restricted to partner staff.',
  },
  'insufficient-permissions': {
    badge: 'Access',
    title: 'Permission denied.',
    subtitle: 'You don\'t have the required permissions.',
  },
  default: {
    badge: 'Access',
    title: 'Not authorized.',
    subtitle: 'You don\'t have permission to view this page.',
  },
};

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string; current?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const reason = params.reason || "default";
  const message = REASON_MESSAGES[reason] || REASON_MESSAGES.default;

  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center">
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            {message.badge}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            {message.title}
            <br />
            <span className="text-muted-foreground">{message.subtitle}</span>
          </h1>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto h-11 px-8 bg-muted text-foreground text-sm font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            Contact Support
          </Link>
        </div>

      </div>
    </section>
  );
}
