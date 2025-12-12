# Build Setup Guide

Complete guide for setting up and building the Alifh monorepo project.

## Prerequisites

- **Bun** v1.0.0+ (JavaScript runtime & package manager)
- **Git** for version control
- **PostgreSQL** access (Neon cloud database)

### Installing Bun

```bash
# macOS, Linux, or WSL
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version
```

## Initial Setup

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd Alifhv1

# Install all dependencies (uses Bun)
bun install
```

### 2. Environment Variables

Copy and configure your environment variables:

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit with your credentials
nano .env.local
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `BETTER_AUTH_SECRET` - Authentication secret key
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - OAuth
- `RESEND_API_KEY` - Email service
- `TWILIO_*` - SMS/Phone verification
- `R2_*` - Cloudflare R2 storage
- `OPENAI_API_KEY` - AI services (optional)

## Development

### Start All Apps

```bash
# Start all apps in parallel (web, mobile, websocket)
bun run dev
```

This will start:
- **Web App**: http://localhost:3000 (Next.js 16)
- **WebSocket Server**: ws://localhost:3001 (Bun WS)
- **Mobile App**: Metro bundler on http://localhost:8081 (Expo)

### Start Individual Apps

```bash
# Web only
bun run dev --filter=@alifh/web

# Mobile only
bun run dev --filter=@alifh/mobile

# WebSocket server only
bun run dev --filter=@alifh/ws
```

## Building

### Production Build

```bash
# Build all packages and web app (excludes mobile)
bun run build
```

This builds:
- ✅ `@alifh/shared` - Shared utilities (76 bytes)
- ✅ `@alifh/database` - Database layer (49 bytes)
- ✅ `@alifh/ai` - AI helpers
- ✅ `@alifh/ws` - WebSocket server (2.81 KB)
- ✅ `@alifh/web` - Next.js app

### Build Commands

```bash
# Build everything including mobile (requires EAS account)
bun run build:all

# Build web app only
bun run build:web

# Build mobile app only (requires EAS login)
bun run build:mobile
```

### Build Output

```
packages/*/dist/        # Compiled library code
apps/web/.next/         # Next.js production build
apps/ws/dist/           # WebSocket server bundle
```

## Package Structure

### Workspace Packages

All packages use workspace references (`@alifh/*`):

```json
{
  "dependencies": {
    "@alifh/shared": "workspace:*",
    "@alifh/database": "workspace:*"
  }
}
```

### Package Details

**`@alifh/shared`** - Shared utilities
- Types, validators, constants, utilities
- Built with: `bun build`
- Output: `dist/index.js`

**`@alifh/database`** - Drizzle ORM
- PostgreSQL schemas and queries
- Built with: `bun build`
- Output: `dist/index.js`

**`@alifh/ai`** - AI helpers
- Valuation and moderation
- Built with: `bun build`
- Output: `dist/index.js`

## Testing & Quality

```bash
# Run tests (when implemented)
bun run test

# Lint all code
bun run lint

# Format all code
bun run format
```

## Database Commands

```bash
# Seed database with initial data
bun run db:seed

# Reset database to clean state
bun run db:reset
```

## Turborepo Caching

Turbo automatically caches build outputs for faster rebuilds.

### Cache Behavior

```bash
# First build
bun run build
# Tasks: 5 successful, 5 total
# Cached: 0 cached, 5 total

# Second build (with cache)
bun run build
# Tasks: 5 successful, 5 total
# Cached: 5 cached, 5 total (instant!)
```

### Clear Cache

```bash
# Clear Turbo cache
rm -rf .turbo

# Clear all build artifacts
rm -rf packages/*/dist apps/web/.next apps/ws/dist
```

## Mobile App Setup

### Development

Mobile development uses Expo - no build needed:

```bash
# Start Expo dev server
bun run dev --filter=@alifh/mobile

# Or directly
cd apps/mobile
bun run dev
```

Scan the QR code with:
- **iOS**: Camera app or Expo Go
- **Android**: Expo Go app

### Production Builds (EAS)

Only needed for App Store/Play Store submissions:

```bash
# First time: Login to EAS
eas login

# Build for iOS
bun run build:mobile --profile production

# Build for Android
bun run build:mobile --profile production --platform android
```

## Troubleshooting

### Port Conflicts

If ports are in use:

```bash
# Web app will auto-increment (3000 → 3001 → 3002)
# WebSocket fixed at 3001
# Mobile Metro at 8081
```

### Module Resolution Issues

```bash
# Clear all caches and reinstall
rm -rf node_modules bun.lockb
bun install
```

### Build Failures

```bash
# Check individual package builds
cd packages/shared && bun run build
cd packages/database && bun run build

# Check web build
cd apps/web && bun run build
```

### Type Errors

```bash
# Ensure TypeScript is properly configured
bun run lint
```

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):

- **Lint**: Runs ESLint on all packages
- **Build**: Builds all production artifacts
- **Test**: Runs test suite (when implemented)

Workflow uses Bun for fast installation and execution.

## Performance Tips

### Fast Installation

```bash
# Bun is already fast, but you can:
bun install --frozen-lockfile  # CI environments
```

### Faster Builds

```bash
# Build only changed packages
bun run build  # Turbo handles this automatically

# Skip type checking (faster, but risky)
cd apps/web && bun run build -- --no-type-check
```

### Development Speed

```bash
# Use Turbo filters for faster iteration
bun run dev --filter=@alifh/web --filter=@alifh/shared
```

## Production Deployment

### Web App (Vercel)

```bash
# Vercel auto-detects Next.js
# Just connect your repo and deploy

# Or manual deploy:
vercel --prod
```

### WebSocket Server

```bash
# Build
bun run build --filter=@alifh/ws

# Deploy to VPS/Cloud
scp -r apps/ws/dist user@server:/app
ssh user@server "cd /app && bun run dist/index.js"
```

### Mobile App

```bash
# Build and submit to stores
bun run build:mobile

# Follow EAS prompts for submission
```

## Dependencies

### Key Dependencies

- **Next.js 16** - Web framework (with Turbopack)
- **React 19.1.0** - UI library
- **Expo SDK 54** - Mobile framework
- **Drizzle ORM** - Type-safe database queries
- **Zod** - Schema validation
- **Turbo** - Build orchestration
- **TypeScript 5.3+** - Type safety

### Override Configuration

The project uses overrides to ensure consistent package versions:

```json
{
  "overrides": {
    "@types/react": "19.1.10",
    "@types/react-dom": "19.1.10"
  }
}
```

## FAQ

**Q: Why Bun instead of npm/yarn/pnpm?**
A: Bun is significantly faster (10x+ in many cases) and has native TypeScript support, eliminating the need for ts-node.

**Q: Do I need to build packages before development?**
A: No, Bun handles TypeScript natively. Just run `bun run dev`.

**Q: How do I add a new package?**
A: Create a new folder in `packages/`, add `package.json`, and reference it with `workspace:*` in other packages.

**Q: Mobile build requires EAS account?**
A: Only for production builds (App Store submission). Development uses Expo Go - no account needed.

**Q: Can I use npm packages?**
A: Yes! Bun is compatible with npm packages. Install normally: `bun add <package>`

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev)
- [Turborepo Guide](https://turbo.build/repo/docs)
- [Drizzle ORM](https://orm.drizzle.team)
