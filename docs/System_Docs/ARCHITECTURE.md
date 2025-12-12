# Architecture Overview

## Tech Stack

- **Runtime**: Bun 1.3.4+ (ultra-fast JavaScript runtime & package manager)
- **Web Framework**: Next.js 16.0.0+ with Turbopack
- **Mobile**: Expo SDK 54.0.27 (React Native 0.81)
- **UI Library**: React 19.1.0 (exact pinned version)
- **Real-time**: Bun Native WebSocket Server
- **Database**: PostgreSQL 17 (Neon Cloud) + Drizzle ORM
- **Package Manager**: Bun (native workspaces)
- **Build System**: Turbo 2.0.0+ (monorepo orchestration)
- **Language**: TypeScript 5.3.3
- **Validation**: Zod 3.22.0
- **Authentication**: Better Auth with Google OAuth
- **Email**: Resend API
- **SMS**: Twilio
- **Storage**: Cloudflare R2
- **AI**: OpenAI / Anthropic Claude

## Monorepo Structure

This is a **Bun-native monorepo** using Turbo to orchestrate builds across multiple apps and shared packages.

```
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
├── package.json               # Root workspace config (packageManager: "bun@1.3.4")
├── bunfig.toml                # Bun configuration (overrides for React types)
├── turbo.json                 # Turbo build pipeline
├── tsconfig.json              # Shared TypeScript config (path aliases)
├── .env.local                 # Environment variables (all services)
└── bun.lockb                  # Bun lockfile (binary format)
```

               🧁 PRESENTATION LAYER
    ------------------------------------------------
    |  apps/web       | apps/mobile   | apps/ws    |
    |  (Next.js)      | (Expo)        | (WebSocket)|
    ------------------------------------------------
                   User Interface Layer
             - Shows screens, dashboards, pages
             - Calls API routes, shows errors
             - Does NOT know database logic


             🎂 LOGIC & RULES LAYER (MIDDLE)
    ------------------------------------------------
    |  packages/shared    | packages/ai           |
    |  (types, validators)| (valuation, moderation) |
    ------------------------------------------------
             Shared Application Logic
             - Types: shapes of your data
             - Validators: check if data is valid
             - Utils, constants, role logic
             - Used by web, mobile, ws, database


                  🍞 DATA LAYER (BOTTOM)
    ------------------------------------------------
    |           packages/database                  |
    |  (Drizzle schemas, queries, migrations)      |
    ------------------------------------------------
                 Data Storage Engine
             - Tables (schemas)
             - Queries to fetch/insert/update
             - The ONE source of truth



             

## Application Architecture

### Web App (`apps/web`)

**Next.js 16.0.8 with Turbopack** - Main frontend for the vehicle marketplace.

**Current State**: Basic App Router structure established
- ✅ `layout.tsx` - Root layout with metadata
- ✅ `page.tsx` - Homepage component
- ✅ `globals.css` - Global styles (Tailwind ready)
- ✅ `next.config.mjs` - ESM config with `transpilePackages`

**Route Structure** (Ready to implement):
```
apps/web/src/app/
├── layout.tsx              # Root layout (HTML, body, metadata)
├── page.tsx                # Homepage - "Alifh - Vehicle Marketplace"
├── globals.css             # Global styles + Tailwind directives
│
├── public/                 # Public routes (no auth)
│   ├── listings/          # Browse vehicles
│   ├── search/            # Search & filters
│   └── about/             # About Alifh
│
├── user/                   # User dashboard (auth required)
│   ├── dashboard/         # User overview
│   ├── offers/            # Offers sent/received
│   ├── messages/          # Chat inbox
│   └── profile/           # Profile settings
│
├── partner/                # Partner/seller portal (auth required)
│   ├── dashboard/         # Partner overview
│   ├── listings/          # Manage listings
│   └── analytics/         # Listing performance
│
├── admin/                  # Admin dashboard (admin role)
│   ├── dashboard/         # Admin overview
│   ├── users/             # User management
│   ├── listings/          # Listing moderation
│   └── reports/           # Reports & analytics
│
└── api/                    # API routes
    ├── auth/              # Better Auth endpoints
    ├── webhooks/          # External service webhooks
    └── listings/          # Listing CRUD operations
```

**Key Technologies**:
- **React 19.1.0** (Server & Client Components)
- **Next.js 16** App Router (file-based routing)
- **Turbopack** (fast dev server & builds)
- **TypeScript** (type safety)
- **Workspace packages**: `@alifh/shared`, `@alifh/database`

**Package Configuration**:
```json
{
  "name": "@alifh/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Next.js web application",
  "packageManager": "bun@1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@alifh/shared": "workspace:*",
    "@alifh/database": "workspace:*",
    "next": "^16.0.0",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "19.1.10",
    "@types/react-dom": "19.1.10",
    "eslint": "^8.0.0",
    "eslint-config-next": "^16.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.3.3"
  }
}
```

**Dev Server**: `http://localhost:3000` (auto-increments if port busy)

### WebSocket Server (`apps/ws`)

**Bun Native WebSocket** - Real-time communication server using `Bun.serve`.

**Current State**: Fully functional WebSocket server with room management

**Implementation** (`apps/ws/src/index.ts`):
```typescript
const server = Bun.serve<{ userId?: string }>({
  port: 3001,
  fetch(req, server) {
    const success = server.upgrade(req, {
      data: { userId: undefined }
    });
    return success 
      ? undefined 
      : new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    open(ws) { /* Connection handling */ },
    message(ws, message) { /* Message routing */ },
    close(ws) { /* Cleanup */ }
  }
});
```

**Features Implemented**:
- ✅ WebSocket connection handling
- ✅ Message type routing (ping/pong, broadcast, notification)
- ✅ Room-based messaging
- ✅ Connection lifecycle management
- ✅ User ID tracking per connection

**Message Types**:
```typescript
// Ping/Pong - Connection health check
{ type: "ping" } → { type: "pong" }

// Broadcast - Send to all connected clients
{ type: "broadcast", message: "..." }

// Notification - Targeted messages
{ type: "notification", userId: "...", message: "..." }

// Room - Join/leave/message specific rooms
{ type: "join_room", room: "listing-123" }
{ type: "leave_room", room: "listing-123" }
{ type: "room_message", room: "...", message: "..." }
```

**Use Cases**:
- 📍 Listing update notifications (new listings, price changes)
- 💬 Live chat between buyers and sellers
- 📊 Real-time offer updates
- 👥 User presence tracking ("viewing listing now")
- 🔔 System notifications

**Package Configuration**:
```json
{
  "name": "@alifh/ws",
  "version": "0.1.0",
  "private": true,
  "description": "WebSocket server for real-time updates",
  "packageManager": "bun@1.0.0",
  "scripts": {
    "dev": "bun src/index.ts",
    "build": "bun build ./src/index.ts --outdir dist",
    "start": "bun dist/index.js",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  },
  "dependencies": {
    "@alifh/shared": "workspace:*",
    "@alifh/database": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.3.3"
  }
}
```

**Server Details**:
- **Port**: `3001`
- **URL**: `ws://localhost:3001`
- **Build output**: `apps/ws/dist/index.js` (2.81 KB)
- **Started with**: `bun run dev` or `bun src/index.ts`
- **Production**: `bun run start` (runs built version)

**Future Enhancements**:
- Authentication middleware (JWT validation)
- Redis pub/sub for multi-server scaling
- Message persistence/history
- Rate limiting per connection

### Mobile App (`apps/mobile`)

**Expo SDK 54.0.27** - React Native mobile app for iOS & Android.

**Current State**: Complete native project setup with Expo Router

**Project Structure**:
```
apps/mobile/
├── app/                    # Expo Router screens (to implement)
├── components/             # Mobile UI components (to implement)
├── lib/                    # Mobile utilities (to implement)
│
├── android/                # Android native project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/alifh/
│   │   │   └── res/        # App icons, splash screens
│   │   └── build.gradle
│   ├── build.gradle
│   └── settings.gradle
│
├── ios/                    # iOS native project
│   ├── Alifh/
│   │   ├── AppDelegate.swift
│   │   ├── Info.plist
│   │   ├── Images.xcassets/
│   │   └── SplashScreen.storyboard
│   ├── Alifh.xcodeproj/
│   └── Podfile
│
├── app.json                # Expo configuration
└── package.json            # React Native 0.81, React 19.1.0
```

**Native Projects**:
- ✅ Android project configured (Gradle 8.11.1, SDK 35)
- ✅ iOS project configured (Xcode project, Swift)
- ✅ App icons and splash screens set up
- ✅ Build configurations (debug, debugOptimized, release)

**Development**:
```bash
# Start Metro bundler
bun run dev --filter=@alifh/mobile

# Run on device
# Scan QR code with Expo Go app (iOS/Android)
```

**Production Builds** (requires EAS account):
```bash
# First time: login to EAS
eas login

# Build for iOS
bun run build:mobile --profile production

# Build for Android  
bun run build:mobile --profile production --platform android
```

**Package Configuration**:
```json
{
  "name": "@alifh/mobile",
  "version": "0.1.0",
  "private": true,
  "description": "Expo mobile application (future phase)",
  "packageManager": "bun@1.0.0",
  "scripts": {
    "dev": "expo start",
    "build": "eas build",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@alifh/shared": "workspace:*",
    "expo": "^54.0.27",
    "react": "19.1.0",
    "react-native": "^0.81.0"
  },
  "devDependencies": {
    "@types/react": "19.1.10",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.3.3"
  }
}
```

**Status**: 
- ✅ Native setup complete
- ⏳ Screens & navigation to implement
- ⏳ Component library to build
- ⏳ Integration with backend APIs

## Package Architecture

### Database Package (`packages/database`)

**Drizzle ORM** - Type-safe PostgreSQL database layer.

**Package**: `@alifh/database`

**Current State**: Structure ready, schema implementation pending

**Package Configuration**:
```json
{
  "name": "@alifh/database",
  "version": "0.1.0",
  "private": true,
  "description": "Drizzle ORM database schema and queries",
  "packageManager": "bun@1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "dev": "bun build ./src/index.ts --outdir dist --watch",
    "build": "bun build ./src/index.ts --outdir dist",
    "generate": "drizzle-kit generate:pg",
    "migrate": "bun ./src/migrate.ts",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  },
  "dependencies": {
    "drizzle-orm": "^0.28.0",
    "pg": "^8.10.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "drizzle-kit": "^0.20.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.3.3"
  }
}
```

**Files**:
```
packages/database/src/
├── client.ts              # PostgreSQL connection (placeholder)
├── schema/
│   └── index.ts           # Table definitions (empty - ready for schemas)
├── queries/
│   └── index.ts           # Database queries (empty - ready for queries)
├── migrate.ts             # Database migration script
└── index.ts               # Package exports (schema, queries, client)
```

**Database Connection**:
- **Provider**: Neon (Serverless PostgreSQL)
- **Region**: ap-southeast-1 (Singapore)
- **Connection**: `ep-aged-fog-a119hbhb-pooler.ap-southeast-1.aws.neon.tech`
- **Database**: `alifhdb`
- **PostgreSQL Version**: 17
- **Connection String**: Stored in `.env.local` as `DATABASE_URL`

**Planned Schema** (to implement):
```typescript
// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('user'),
  createdAt: timestamp('created_at').defaultNow()
});

// Listings table (vehicles)
export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  make: varchar('make', { length: 100 }),
  model: varchar('model', { length: 100 }),
  year: integer('year'),
  price: integer('price'),
  status: varchar('status', { length: 50 }).default('active'),
  createdAt: timestamp('created_at').defaultNow()
});

// Offers table
// Messages table
// etc.
```

**Usage in Apps**:
```typescript
import { db, schema, queries } from '@alifh/database';

// Example query (once implemented)
const listings = await queries.getActiveListings();
```

**Build Output**: `packages/database/dist/index.js` (49 bytes currently)

### Shared Package (`packages/shared`)

**Shared utilities** - Common code used across all apps (web, mobile, ws).

**Package**: `@alifh/shared`

**Current State**: Structure ready with basic constants

**Package Configuration**:
```json
{
  "name": "@alifh/shared",
  "version": "0.1.0",
  "private": true,
  "description": "Shared types, validators, and utilities",
  "packageManager": "bun@1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./types": "./dist/types/index.js",
    "./validators": "./dist/validators/index.js",
    "./constants": "./dist/constants/index.js",
    "./utils": "./dist/utils/index.js"
  },
  "scripts": {
    "dev": "bun build ./src/index.ts ./src/types/index.ts ./src/validators/index.ts ./src/constants/index.ts ./src/utils/index.ts --outdir dist --watch",
    "build": "bun build ./src/index.ts ./src/types/index.ts ./src/validators/index.ts ./src/constants/index.ts ./src/utils/index.ts --outdir dist",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.3.3"
  }
}
```

**Files**:
```
packages/shared/src/
├── types/
│   └── index.ts           # TypeScript types (empty - ready for types)
├── validators/
│   └── index.ts           # Zod schemas (empty - ready for validators)
├── constants/
│   └── index.ts           # Constants (API_VERSION = 'v1')
├── utils/
│   └── index.ts           # Utilities (empty - ready for helpers)
└── index.ts               # Package exports
```

**Implemented**:
```typescript
// constants/index.ts
export const API_VERSION = 'v1';
```

**Planned Additions**:

**Types** (TypeScript interfaces):
```typescript
// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'partner' | 'admin';
}

// Listing types
export interface Listing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  status: 'active' | 'sold' | 'pending';
}
```

**Validators** (Zod schemas):
```typescript
import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().min(5).max(255),
  make: z.string(),
  model: z.string(),
  year: z.number().int().min(1900).max(2030),
  price: z.number().positive()
});
```

**Utils** (Helper functions):
```typescript
// ✅ IMPLEMENTED: Winston Logging System
export { logger, securityLogger, auditLogger } from './logger';

// Security event logging
securityLogger.authSuccess(userId, email, ip, userAgent);
securityLogger.authFailure(email, reason, ip, userAgent);
securityLogger.suspiciousActivity(userId, activity, details, ip);

// Audit trail logging
auditLogger.userCreated(userId, email, createdBy);
auditLogger.userUpdated(userId, updatedFields, updatedBy);
auditLogger.adminAction(adminId, action, targetUserId, details);

// Application logging
logger.info('API request', { method, endpoint, userId, duration });
logger.error('Application error', { error, context, userId });

// Planned utility functions
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED'
  }).format(amount);
}
```

**Usage**:
```typescript
// In web, mobile, or ws
import { API_VERSION, User, createListingSchema } from '@alifh/shared';
```

**Build Output**: `packages/shared/dist/index.js` (76 bytes currently)

### AI Package (`packages/ai`)

**AI helpers** - Machine learning for vehicle valuation & content moderation.

**Package**: `@alifh/ai`

**Current State**: Structure ready, integration pending

**Package Configuration**:
```json
{
  "name": "@alifh/ai",
  "version": "0.1.0",
  "private": true,
  "description": "AI helpers for valuation and moderation",
  "packageManager": "bun@1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./valuation": "./dist/valuation/index.js",
    "./moderation": "./dist/moderation/index.js"
  },
  "scripts": {
    "dev": "bun build ./src/index.ts ./src/valuation/index.ts ./src/moderation/index.ts --outdir dist --watch",
    "build": "bun build ./src/index.ts ./src/valuation/index.ts ./src/moderation/index.ts --outdir dist",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  },
  "dependencies": {
    "@alifh/shared": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.3.3"
  }
}
```

**Files**:
```
packages/ai/src/
├── valuation/
│   └── index.ts           # Vehicle valuation (placeholder)
├── moderation/
│   └── index.ts           # Content moderation (placeholder)
└── index.ts               # Package exports
```

**Planned Features**:

**Vehicle Valuation** (`valuation/index.ts`):
```typescript
// Estimate vehicle value based on:
// - Make, model, year
// - Mileage, condition
// - Market trends
// - Historical sales data

export async function estimateVehicleValue(params: {
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}): Promise<{
  estimatedValue: number;
  confidenceScore: number;
  marketTrend: 'rising' | 'stable' | 'falling';
}> {
  // OpenAI API integration
}
```

**Content Moderation** (`moderation/index.ts`):
```typescript
// Moderate listing content for:
// - Inappropriate language
// - Spam detection
// - Image content verification
// - Compliance with platform rules

export async function moderateListingContent(content: {
  title: string;
  description: string;
  images?: string[];
}): Promise<{
  approved: boolean;
  flags: string[];
  suggestions?: string[];
}> {
  // OpenAI/Anthropic moderation API
}
```

**AI Providers**:
- **Primary**: OpenAI (GPT-4, DALL-E, Moderation API)
- **Fallback**: Anthropic Claude
- **API Keys**: Stored in `.env.local`

**Integration Ready**:
- Environment variables configured
- Package structure in place
- Ready for API implementation

**Build Output**: `packages/ai/dist/index.js` (builds successfully)

## Development Workflow

### Initial Setup

```bash
# 1. Install dependencies (Bun native)
bun install
# Installs 1728+ packages in seconds

# 2. Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your service credentials

# 3. Start development
bun run dev
```

### Running the Project

```bash
# Start all apps in parallel (via Turbo)
bun run dev

# This starts:
# ✓ @alifh/web     - http://localhost:3000 (Next.js 16 + Turbopack)
# ✓ @alifh/ws      - ws://localhost:3001 (Bun WebSocket)
# ✓ @alifh/mobile  - Expo Metro bundler (scan QR code)
```

**Port Auto-increment**: If port 3000 is busy, Next.js automatically uses 3001, 3002, etc.

### Building for Production

```bash
# Build all packages + web (default - excludes mobile)
bun run build

# Build output:
# ✓ @alifh/shared    → packages/shared/dist/index.js (76 bytes)
# ✓ @alifh/database  → packages/database/dist/index.js (49 bytes)  
# ✓ @alifh/ai        → packages/ai/dist/index.js
# ✓ @alifh/ws        → apps/ws/dist/index.js (2.81 KB)
# ✓ @alifh/web       → apps/web/.next/ (optimized production build)

# Build with mobile (requires EAS account)
bun run build:all

# Build specific apps:
bun run build:web      # Next.js only
bun run build:mobile   # Expo EAS build
```

**Turbo Caching**: Second builds are instant (cached)
```
Tasks: 5 successful, 5 total
Cached: 5 cached, 5 total
Time: 154ms >>> FULL TURBO
```

### Database Commands

```bash
# Seed database with initial data
bun run db:seed

# Reset database to clean state
bun run db:reset
```

### Code Quality

```bash
# Lint all code
bun run lint

# Format all code
bun run format

# Run tests (when implemented)
bun run test
```

### Individual App Development

```bash
# Web only
bun run dev --filter=@alifh/web

# WebSocket only
bun run dev --filter=@alifh/ws

# Mobile only
bun run dev --filter=@alifh/mobile
```

## How Data Flows

### User Request Flow

1. **User** → Visits `http://localhost:3000` (Next.js web app)
2. **Web App** → Queries database via `@alifh/database` package
3. **Database** → Returns data from PostgreSQL (Neon)
4. **Web App** → Validates response with `@alifh/shared` (Zod)
5. **Response** → Rendered to browser as HTML/React

### Real-time Updates Flow

1. **Client** → Connects to `ws://localhost:3001` (Bun WebSocket)
2. **WebSocket Server** → Receives event message
3. **Server** → Processes event, queries database if needed
4. **Server** → Broadcasts update to all connected clients
5. **Clients** → Receive real-time update instantly

## Services & Integrations

### Authentication (Better Auth)
- User sign up/login
- OAuth (Google, Apple)
- Session management

### Email (Resend)
- Transactional emails
- Notifications
- Receipts

### SMS/Phone (Twilio)
- Two-factor authentication
- User notifications
- Alerts

### File Storage (Cloudflare R2)
- Vehicle listing images/videos
- Document storage
- CDN distribution via public URL

### AI Services
- **OpenAI**: Vehicle listing valuation + content moderation
- **Anthropic Claude**: Alternative AI provider (optional)

## File Structure Summary

### Root Configuration Files

**`package.json`** - Workspace root
```json
{
  "name": "alifh",
  "version": "0.1.0",
  "private": true,
  "description": "Alifh - Vehicle Marketplace & Valuation Platform",
  "packageManager": "bun@1.0.0",
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build --filter='!@alifh/mobile'",
    "build:all": "turbo run build",
    "build:web": "turbo run build --filter=@alifh/web",
    "build:mobile": "turbo run build --filter=@alifh/mobile",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "turbo run format",
    "db:seed": "bun scripts/seed.ts",
    "db:reset": "bun scripts/reset-db.ts"
  },
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.3.3"
  },
  "overrides": {
    "@types/react": "19.1.10",
    "@types/react-dom": "19.1.10"
  }
}
```

**`bunfig.toml`** - Bun configuration
```toml
[install]
saveExactVersions = true

[install.overrides]
"@types/react" = "19.1.10"

[run]
typescript = "latest"
```

**`turbo.json`** - Build pipeline
```json
{
  "globalDependencies": ["**/.env", "**/.env.local"],
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "test": {},
    "lint": {},
    "format": {}
  }
}
```

**`tsconfig.json`** - Shared TypeScript config
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "@shared/*": ["./packages/shared/src/*"],
      "@database/*": ["./packages/database/src/*"],
      "@ai/*": ["./packages/ai/src/*"]
    }
  }
}
```

**`.env.local`** - Environment variables
```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
BETTER_AUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Services
RESEND_API_KEY="..."
TWILIO_ACCOUNT_SID="..."
R2_ACCOUNT_ID="..."
OPENAI_API_KEY="..."
```

### Key Dependencies & Versions

**Core Runtime**:
- Bun 1.0.0+ (package manager + runtime)
- TypeScript 5.3.3
- Turbo 2.0.0

**Web Stack**:
- Next.js 16.0.0+
- React 19.1.0 (exact pinned)
- React DOM 19.1.0
- @types/react 19.1.10 (forced via overrides)
- ESLint 8.0.0+
- Prettier 3.0.0+

**Mobile Stack**:
- Expo 54.0.27
- React Native 0.81.0
- React 19.1.0 (exact pinned)

**Database**:
- PostgreSQL 17 (Neon)
- Drizzle ORM 0.28.0
- Drizzle Kit 0.20.0
- pg 8.10.0

**Validation & Types**:
- Zod 3.22.0 (schema validation)
- TypeScript strict mode

**Why Exact React Version?**
```json
// Root package.json forces exact versions
"overrides": {
  "@types/react": "19.1.10"  // Prevents 19.2.x canary
}

// All apps use exact version
"react": "19.1.0"  // No caret (^)
```
This ensures Expo SDK 54 compatibility across the entire monorepo.

## Deployment Strategy

### Web App (`@alifh/web`)

**Platform**: Vercel (recommended)

```bash
# Vercel auto-detects Next.js 16
# Just connect repository and deploy

# Or manual deployment:
vercel --prod

# Environment variables required on Vercel:
# - DATABASE_URL
# - BETTER_AUTH_SECRET
# - GOOGLE_CLIENT_ID/SECRET
# - All API keys
```

**Build Command**: `bun run build:web`
**Output Directory**: `apps/web/.next`
**Node Version**: Use Bun runtime (if supported) or Node 20+

### WebSocket Server (`@alifh/ws`)

**Platform**: VPS / Cloud (DigitalOcean, AWS, Railway)

```bash
# Build
bun run build --filter=@alifh/ws

# Deploy to server
scp -r apps/ws/dist user@server:/app

# Start with PM2 or systemd
ssh user@server "cd /app && bun run dist/index.js"

# Or with PM2:
pm2 start dist/index.js --interpreter bun --name alifh-ws
```

**Requirements**:
- Bun runtime installed
- Port 3001 exposed
- WebSocket support enabled

**Scaling**: 
- Multiple instances behind load balancer
- Redis pub/sub for cross-instance messaging
- Sticky sessions for connection persistence

### Mobile App (`@alifh/mobile`)

**Platform**: EAS (Expo Application Services)

```bash
# First time: Login to EAS
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

**Build Profiles** (eas.json):
```json
{
  "build": {
    "development": {
      "developmentClient": true
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

**Requirements**:
- EAS account (free tier available)
- Apple Developer account ($99/year for iOS)
- Google Play Console ($25 one-time for Android)

### Database (PostgreSQL)

**Platform**: Neon (Serverless PostgreSQL)

**Current Setup**:
- Region: ap-southeast-1 (Singapore)
- PostgreSQL 17
- Connection pooling enabled
- Automatic backups

**Scaling**:
```bash
# Neon auto-scales compute
# - Scales to zero when idle
# - Scales up under load

# Database branching for testing:
# - Create branch from main
# - Test migrations safely
# - Merge when ready
```

**Migrations**:
```bash
# Using Drizzle Kit
bun drizzle-kit generate
bun drizzle-kit migrate
```

### CI/CD Pipeline

**GitHub Actions** (`.github/workflows/ci.yml`):

```yaml
name: CI

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install
      - run: bun run lint

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run build

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run test
```

**Deployment Flow**:
1. Push to `main` branch
2. GitHub Actions runs CI
3. If CI passes:
   - Web auto-deploys to Vercel
   - WebSocket can auto-deploy via SSH/CD tool
   - Mobile builds manually triggered via EAS

### Environment Variables by Platform

**Vercel** (Web):
```
DATABASE_URL
BETTER_AUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
RESEND_API_KEY
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
```

**VPS** (WebSocket):
```
DATABASE_URL (for user lookup/auth)
```

**EAS** (Mobile):
```
EXPO_PUBLIC_API_URL
EXPO_PUBLIC_WS_URL
```

### Monitoring & Observability

**Recommended Tools**:
- **Sentry**: Error tracking (web, mobile, ws)
- **Vercel Analytics**: Web performance
- **Neon Metrics**: Database performance
- **Uptime Robot**: WebSocket server monitoring

### Cost Estimation

**Monthly Operating Costs** (estimated):

- **Neon Database**: $0-19 (free tier → pro)
- **Vercel Hosting**: $0-20 (hobby → pro)
- **VPS (WebSocket)**: $5-12 (DigitalOcean droplet)
- **Cloudflare R2**: $0-5 (storage + bandwidth)
- **EAS Builds**: $0 (free tier, or $29/month)
- **Services**: $10-50 (Resend, Twilio, OpenAI)

**Total**: ~$15-135/month depending on usage and tier selections
