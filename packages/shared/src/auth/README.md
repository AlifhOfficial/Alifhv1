# Shared Auth Module

Universal authentication utilities used across web, mobile, and WebSocket apps.

## Files Overview

### `types.ts`
Core TypeScript interfaces:
```typescript
interface User {
  id: string;
  email: string;
  platformRole: PlatformRole;
  activePartnerId?: string;
}

type PlatformRole = 'user' | 'staff' | 'admin' | 'super-admin';
type PartnerRole = 'staff' | 'admin' | 'owner';
```

### `constants.ts` 
Role mappings and display names:
```typescript
export const PLATFORM_ROLES = ['user', 'staff', 'admin', 'super-admin'];
export const PARTNER_ROLES = ['staff', 'admin', 'owner'];
```

### `validators.ts`
Zod schemas for forms:
```typescript
export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### `access-control.ts`
Portal access logic:
```typescript
export function getUserPortalAccess(user): PortalAccess {
  return {
    public: true,
    user: !!user,
    partner: isPartnerUser(user),
    admin: isAlifhUser(user)
  };
}
```

## Usage

```typescript
import { getUserPortalAccess, signInSchema } from '@alifh/shared';

// Check access
const access = getUserPortalAccess(user);

// Validate form data  
const result = signInSchema.safeParse(formData);
```