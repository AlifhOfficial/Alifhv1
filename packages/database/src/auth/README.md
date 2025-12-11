# Database Auth Schema

PostgreSQL auth schema with Better Auth integration and performance optimization.

## Tables

### Core Tables
- **auth_user**: Main user records (8 indexes)
- **auth_account**: OAuth connections (2 indexes)  
- **auth_session**: User sessions (6 indexes)
- **auth_verification**: Email/phone tokens (4 indexes)

### Org Management
- **partner**: Client organizations (4 indexes)
- **partner_member**: User-org links (6 indexes) 
- **audit_log**: Action tracking (7 indexes)
- **partner_stats**: Analytics cache (3 indexes)

Total: **37 strategic indexes** for optimal performance

## Better Auth Integration

Uses Better Auth's `drizzleAdapter` with optimized session management:

```typescript
// Auto-configured in database package
export const auth = betterAuth({
  adapter: drizzleAdapter(db, {
    // Optimized table mappings
  }),
  database: {
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24,     // 24 hours
    },
  },
});
```

## Performance Features

- Compound indexes on frequently queried columns
- Partial indexes for active sessions only
- Optimized partner hierarchy queries
- Fast user role lookups

## Usage

```typescript
import { auth } from '@alifh/database';

// Better Auth handles all DB operations
const session = await auth.api.getSession({
  headers: request.headers
});
```