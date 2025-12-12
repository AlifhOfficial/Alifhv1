Alifhv1/
├── apps/                       # Production applications
│   ├── web/                   # Next.js 16 web app (vehicle marketplace)
│   │   ├── src/
│   │   │   ├── app/           # Next.js 16 App Router
│   │   │   │   ├── layout.tsx         # Root layout
│   │   │   │   ├── page.tsx           # Homepage
│   │   │   │   ├── globals.css        # Global styles
│   │   │   │   ├── public/            # Public routes
│   │   │   │   ├── user/              # User dashboard
│   │   │   │   ├── partner/           # Partner/seller portal
│   │   │   │   ├── admin/             # Admin dashboard
│   │   │   │   └── api/               # API routes
│   │   │   ├── components/
│   │   │   │   ├── ui/                # Reusable UI components
│   │   │   │   ├── features/          # Feature components
│   │   │   │   └── layouts/           # Layout components
│   │   │   └── lib/                   # Web utilities
│   │   ├── public/                    # Static assets
│   │   ├── next.config.mjs            # Next.js ESM config
│   │   ├── package.json               # type: "module"
│   │   └── tsconfig.json
│   │
│   ├── mobile/                # Expo SDK 54 mobile app
│   │   ├── app/               # Expo Router screens
│   │   ├── components/        # Mobile components
│   │   ├── lib/               # Mobile utilities
│   │   ├── android/           # Android native code
│   │   │   └── app/src/main/
│   │   ├── ios/               # iOS native code
│   │   │   └── Alifh/
│   │   ├── app.json           # Expo config
│   │   └── package.json
│   │
│   └── ws/                    # Bun WebSocket server (real-time)
│       ├── src/
│       │   ├── index.ts       # WebSocket server entry
│       │   ├── handlers/      # Event handlers (ready)
│       │   ├── middleware/    # Auth & validation (ready)
│       │   └── utils/         # Helper functions (ready)
│       └── package.json
│
├── packages/                  # Shared code (workspace packages)
│   ├── database/              # @alifh/database
│   │   ├── src/
│   │   │   ├── client.ts      # PostgreSQL connection
│   │   │   ├── schema/        # Drizzle table definitions
│   │   │   │   └── index.ts   # Schema exports
│   │   │   ├── queries/       # Database queries
│   │   │   │   └── index.ts   # Query exports
│   │   │   └── index.ts       # Package exports
│   │   └── package.json       # @alifh/database
│   │
│   ├── shared/                # @alifh/shared
│   │   ├── src/
│   │   │   ├── types/         # TypeScript types
│   │   │   │   └── index.ts
│   │   │   ├── validators/    # Zod validation schemas
│   │   │   │   └── index.ts
│   │   │   ├── constants/     # App constants
│   │   │   │   └── index.ts   # API_VERSION = 'v1'
│   │   │   ├── utils/         # Utility functions
│   │   │   │   └── index.ts
│   │   │   └── index.ts       # Package exports
│   │   └── package.json       # @alifh/shared
│   │
│   └── ai/                    # @alifh/ai
│       ├── src/
│       │   ├── valuation/     # Vehicle valuation algorithms
│       │   │   └── index.ts
│       │   ├── moderation/    # Content moderation
│       │   │   └── index.ts
│       │   └── index.ts       # Package exports
│       └── package.json       # @alifh/ai
│
├── scripts/                   # Database & utility scripts
│   ├── seed.ts                # Database seeding (Bun)
│   └── reset-db.ts            # Database reset (Bun)
│
├── docs/                      # Project documentation
│   ├── README.md              # Project overview
│   ├── ARCHITECTURE.md        # This file
│   └── BUILD_SETUP.md         # Build & setup guide
│
├── .github/                   # CI/CD
│   └── workflows/
│       └── ci.yml             # GitHub Actions (Bun-based)
│
├── package.json               # Root workspace config (packageManager: "bun@1.0.0")
├── bunfig.toml                # Bun configuration (overrides for React types)
├── turbo.json                 # Turbo build pipeline
├── tsconfig.json              # Shared TypeScript config (path aliases)
├── .env.local                 # Environment variables (all services)
└── bun.lockb                  # Bun lockfile (binary format)
```
