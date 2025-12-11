# Alifh - Property Valuation Platform

A monorepo for the Alifh property valuation platform built with modern web technologies.

## Tech Stack

- **Web**: Next.js 14
- **Mobile**: Expo (future phase)
- **Backend**: Node.js with WebSocket server
- **Database**: PostgreSQL with Drizzle ORM
- **Package Manager**: pnpm
- **Build System**: Turbo

## Project Structure

### Apps
- `web/` - Next.js 14 web application
- `mobile/` - Expo mobile app (future)
- `ws/` - WebSocket server for real-time updates

### Packages
- `database/` - Drizzle ORM schema and database queries
- `shared/` - Shared types, validators, and utilities
- `ai/` - AI helpers for valuation and moderation

### Scripts
- `seed.ts` - Database seeding
- `reset-db.ts` - Database reset utility

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Development

```bash
# Start all apps in development mode
pnpm dev

# Build all apps
pnpm build

# Run tests
pnpm test

# Lint all code
pnpm lint
```

### Database

```bash
# Seed the database
pnpm db:seed

# Reset the database
pnpm db:reset
```

## Development Guidelines

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Create shared code in `/packages` for reuse across apps
- Use Turbo for efficient builds and task execution

## License

Proprietary - All rights reserved
