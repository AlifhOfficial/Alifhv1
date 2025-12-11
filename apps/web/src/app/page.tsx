/**
 * Root Page - Public Marketplace Landing
 * This serves as the main landing page for the public marketplace
 */

export default function RootPage() {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Alifh Marketplace</h1>
          <p className="text-gray-600 mt-2">Buy and sell vehicles with AI-powered valuations</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Find Your Perfect Vehicle</h2>
          <p className="text-xl text-gray-600">Browse thousands of vehicles from trusted dealers and owners</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Browse Vehicles</h3>
            <p className="text-gray-600">Explore our marketplace</p>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">AI Valuations</h3>
            <p className="text-gray-600">Get accurate pricing</p>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
            <p className="text-gray-600">Safe and trusted deals</p>
          </div>
        </div>
      </main>
    </div>
  );
}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-medium">Alifh Design System</h1>
            <p className="text-sm text-muted-foreground">
              Apple-inspired minimalism with premium feel
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Color Palette */}
        <ColorPalette />

        {/* Typography */}
        <Typography />

        {/* Buttons */}
        <ButtonShowcase />

        {/* Form Components */}
        <FormComponents />

        {/* Badges */}
        <BadgeShowcase />

        {/* Avatars */}
        <AvatarShowcase />

        {/* Cards */}
        <CardShowcase />

        {/* Modals */}
        <ModalShowcase />
      </div>
    </div>
  );
}

// Color Palette Section
function ColorPalette() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium mb-2">Color Palette</h2>
        <p className="text-sm text-muted-foreground">
          Semantic color tokens that adapt to light and dark modes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Background Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Backgrounds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ColorSwatch name="background" color="bg-background" />
            <ColorSwatch name="card" color="bg-card" />
            <ColorSwatch name="muted" color="bg-muted" />
            <ColorSwatch name="muted/20" color="bg-muted/20" />
          </CardContent>
        </Card>

        {/* Text Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <p className="text-foreground text-sm">foreground</p>
              <p className="text-xs text-muted-foreground">Primary text color</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">muted-foreground</p>
              <p className="text-xs text-muted-foreground">Secondary text</p>
            </div>
            <div className="space-y-1">
              <p className="text-primary text-sm">primary</p>
              <p className="text-xs text-muted-foreground">Links & CTAs</p>
            </div>
            <div className="space-y-1">
              <p className="text-destructive text-sm">destructive</p>
              <p className="text-xs text-muted-foreground">Error messages</p>
            </div>
          </CardContent>
        </Card>

        {/* Border & Accent Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Borders & Accents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border border-border/40 rounded-lg">
              <p className="text-xs">border/40 (standard)</p>
            </div>
            <div className="p-3 border border-border/20 rounded-lg">
              <p className="text-xs">border/20 (subtle)</p>
            </div>
            <div className="p-3 bg-primary text-primary-foreground rounded-lg">
              <p className="text-xs">primary</p>
            </div>
            <div className="p-3 bg-destructive text-destructive-foreground rounded-lg">
              <p className="text-xs">destructive</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// Color Swatch Component
function ColorSwatch({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg border border-border/40 ${color}`} />
      <div>
        <p className="text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">{color}</p>
      </div>
    </div>
  );
}

// Typography Section
function Typography() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium mb-2">Typography</h2>
        <p className="text-sm text-muted-foreground">
          Clean hierarchy with Inter font family
        </p>
      </div>

      <Card>
        <CardContent className="space-y-8 pt-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-medium text-foreground">Page Heading</h1>
            <p className="text-xs text-muted-foreground">text-4xl font-medium</p>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-medium text-foreground">Section Heading</h2>
            <p className="text-xs text-muted-foreground">text-2xl font-medium</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium text-foreground">Card Title / Modal Title</h3>
            <p className="text-xs text-muted-foreground">text-xl font-medium - Used in cards and modals</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Label / Small Heading</p>
            <p className="text-xs text-muted-foreground">text-sm font-medium - Form labels, small headings</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-foreground">Body Text</p>
            <p className="text-xs text-muted-foreground">text-sm - Main body text, descriptions, paragraphs</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Caption / Hint Text</p>
            <p className="text-xs text-muted-foreground">text-xs text-muted-foreground - Hints, captions, helper text</p>
          </div>

          <div className="space-y-2 pt-4 border-t border-border/20">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This is a paragraph of body text to demonstrate line height and readability.
              We use text-sm (14px) for most body content with proper line spacing.
              The muted-foreground color provides good hierarchy without being too loud.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// Button Showcase
function ButtonShowcase() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium mb-2">Buttons</h2>
        <p className="text-sm text-muted-foreground">
          Height: 40px (h-10) • Text: text-sm font-medium • No icons inside
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* Button Variants */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link Button</Button>
            </div>
          </div>

          {/* Button Sizes */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small (h-9)</Button>
              <Button size="default">Default (h-10)</Button>
              <Button size="lg">Large (h-11)</Button>
              <Button size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Button States */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">States</h3>
            <div className="flex flex-wrap gap-3">
              <Button>Normal State</Button>
              <Button loading>Loading State</Button>
              <Button disabled>Disabled State</Button>
            </div>
          </div>

          {/* Full Width */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Full Width</h3>
            <Button className="w-full">Full Width Button</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// Form Components
function FormComponents() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium mb-2">Form Components</h2>
        <p className="text-sm text-muted-foreground">
          Input fields, textareas, and form layouts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In Form</CardTitle>
            <CardDescription>Example of a clean sign-in form</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button className="w-full">Sign In</Button>

            <div className="pt-2 border-t border-border/20">
              <button className="text-xs text-center text-muted-foreground hover:text-foreground transition-colors w-full">
                Forgot password?
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Input Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Input Variants</CardTitle>
            <CardDescription>Different input types and states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Input</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disabled">Disabled Input</Label>
              <Input
                id="disabled"
                placeholder="Disabled"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Textarea</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box Example */}
      <Card>
        <CardHeader>
          <CardTitle>Info Box Pattern</CardTitle>
          <CardDescription>Subtle information boxes with minimal styling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Single Message</h3>
            <div className="p-3 bg-muted/20 border border-border/20 rounded-lg">
              <div className="flex gap-2">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This is an info box with bg-muted/20 and border-border/20.
                  Used for helpful hints and non-critical information.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Multiple Points</h3>
            <div className="p-3 bg-muted/20 border border-border/20 rounded-lg">
              <div className="flex gap-2">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    • The verification link may have expired
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    • The link may have already been used
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    • Check your internet connection
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">With Context</h3>
            <div className="p-3 bg-muted/20 border border-border/20 rounded-lg">
              <div className="flex gap-2">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click the link in the email to verify your account. The link will expire in 24 hours.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// Badge Showcase
function BadgeShowcase() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium mb-2">Badges</h2>
        <p className="text-sm text-muted-foreground">
          Small status indicators and labels
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Variants</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Default Badge</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Use Cases</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>New</Badge>
              <Badge variant="secondary">Active</Badge>
              <Badge variant="outline">Pending</Badge>
              <Badge variant="destructive">Sold</Badge>
              <Badge>Featured</Badge>
              <Badge variant="secondary">Verified</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// Avatar Showcase
function AvatarShowcase() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium mb-2">Avatars</h2>
        <p className="text-sm text-muted-foreground">
          User profile images with fallback initials
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar size="xs" initials="XS" />
              <Avatar size="sm" initials="SM" />
              <Avatar size="md" initials="MD" />
              <Avatar size="lg" initials="LG" />
              <Avatar size="xl" initials="XL" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">With Initials</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Avatar initials="JD" />
              <Avatar initials="AS" />
              <Avatar initials="MK" />
              <Avatar initials="LP" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">User Examples</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar initials="JD" size="sm" />
                <div>
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">john@example.com</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Avatar initials="AS" size="sm" />
                <div>
                  <p className="text-sm font-medium">Alice Smith</p>
                  <p className="text-xs text-muted-foreground">alice@example.com</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// Card Showcase
function CardShowcase() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium mb-2">Cards</h2>
        <p className="text-sm text-muted-foreground">
          Container components with clean borders and backgrounds
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Simple Card</CardTitle>
            <CardDescription>
              A basic card with title and description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Cards use bg-card with border-border/40 for clean separation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>With Badge</CardTitle>
            <CardDescription>
              Card featuring a status badge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge>Featured</Badge>
            <p className="text-sm">
              Combine badges with cards for status indicators.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>With Footer</CardTitle>
            <CardDescription>
              Card with action button
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Cards can have footers with action buttons.
            </p>
            <Button className="w-full" variant="secondary">
              Learn More
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// Modal Showcase
function ModalShowcase() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium mb-2">Modals</h2>
        <p className="text-sm text-muted-foreground">
          Modal patterns following Alifh Design Philosophy
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <EmailSentDemo />
            <LoadingDemo />
            <SuccessDemo />
            <ErrorDemo />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// Example: Email Sent Modal
function EmailSentDemo() {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          Email Sent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Mail className="w-4 h-4 text-muted-foreground" />
        
        <DialogHeader className="space-y-2">
          <DialogTitle>Check your inbox</DialogTitle>
          <DialogDescription>
            We sent a verification link to{" "}
            <span className="text-foreground font-medium">user@example.com</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 bg-muted/20 border border-border/20 rounded-lg">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Click the link in the email to verify your account. 
            The link will expire in 24 hours.
          </p>
        </div>

        <div className="space-y-3">
          <Button className="w-full" disabled={!canResend}>
            {canResend ? "Resend email" : `Resend in ${countdown}s`}
          </Button>
        </div>

        <div className="pt-2 border-t border-border/20">
          <button className="text-xs text-center text-muted-foreground hover:text-foreground transition-colors w-full">
            Back to sign in
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Example: Loading Modal
function LoadingDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          Loading
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        
        <DialogHeader className="space-y-2">
          <DialogTitle>
            Verifying email<span className="animate-pulse">...</span>
          </DialogTitle>
          <DialogDescription>
            Please wait a moment
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

// Example: Success Modal
function SuccessDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          Success
        </Button>
      </DialogTrigger>
      <DialogContent className="text-center">
        <div className="flex justify-center items-center gap-4">
          <span className="text-2xl animate-sparkle">✨</span>
          <CheckCircle2 className="w-20 h-20 text-primary" />
          <span className="text-2xl animate-sparkle animation-delay-300">✨</span>
        </div>
        
        <DialogHeader className="space-y-2">
          <DialogTitle>You&apos;re all set</DialogTitle>
          <DialogDescription>
            Your email has been verified
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          <p className="text-xs text-muted-foreground">
            Redirecting...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Example: Error Modal
function ErrorDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          Error
        </Button>
      </DialogTrigger>
      <DialogContent>
        <AlertCircle className="w-4 h-4 text-destructive" />
        
        <DialogHeader className="space-y-2">
          <DialogTitle>Verification failed</DialogTitle>
          <DialogDescription>
            We couldn&apos;t verify your email address
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 bg-muted/20 border border-border/20 rounded-lg space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            • The verification link may have expired
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            • The link may have already been used
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            • Check your internet connection
          </p>
        </div>

        <div className="space-y-3">
          <Button className="w-full">Try Again</Button>
          <Button variant="secondary" className="w-full">
            Resend Email
          </Button>
        </div>

        <div className="pt-2 border-t border-border/20">
          <button className="text-xs text-center text-muted-foreground hover:text-foreground transition-colors w-full">
            Contact support: help@alifh.com
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
