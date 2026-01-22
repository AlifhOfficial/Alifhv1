/**
 * Become Partner Steps Section
 * Just the steps - no fluff
 */

export function BecomePartnerStepsSection() {
  return (
    <section className="pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        <div className="space-y-6">
          
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Create an account</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sign up on Alifh. You need an account to apply.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Fill out the application</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Go to your dashboard → Requests → Partner Application. Tell us about your business.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">We review</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our team looks at every application. Usually takes 2-3 business days.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
              4
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">You get a response</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Approved or rejected. Either way, we'll let you know.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
