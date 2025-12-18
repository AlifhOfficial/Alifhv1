# Utils Directory

This directory contains centralized utility functions organized by domain.

## Structure

```
utils/
├── index.ts          # Main exports for all utilities
├── cn.ts             # Tailwind CSS class merging
├── auth.ts           # Authentication utilities
└── storage.ts        # Storage key generation and normalization
```

## Usage

Import utilities from `@/utils`:

```typescript
// Tailwind class merging
import { cn } from "@/utils";

// Authentication utilities
import { validateEmail, handleAuthResult } from "@/utils";

// Storage utilities
import { normalizeKey, buildKey } from "@/utils";
```

## Domain Files

### cn.ts
Tailwind CSS class name merging with conflict resolution.

**Functions:**
- `cn(...inputs)` - Merges class names with proper conflict resolution

**Usage:**
```typescript
import { cn } from "@/utils";

const className = cn(
  "base-class",
  condition && "conditional-class",
  { "active": isActive }
);
```

### auth.ts
Authentication validation and error handling utilities.

**Functions:**
- `handleAuthResult<T>(result)` - Extracts data from Better Auth results
- `safeAuthOperation<T>(operation)` - Wraps auth operations with error handling
- `validateEmail(email)` - Validates email format
- `validatePassword(password)` - Validates password strength
- `normalizeEmail(email)` - Normalizes email to lowercase
- `normalizeName(name)` - Normalizes name with proper capitalization

**Usage:**
```typescript
import { validateEmail, handleAuthResult } from "@/utils";

// Validate email
const isValid = validateEmail("user@example.com");

// Handle auth result
const data = handleAuthResult(authResponse);
```

### storage.ts
Storage key generation and data normalization utilities.

**Functions:**
- `normalizeKey(key)` - Normalizes storage keys (removes extra slashes)
- `buildKey(params)` - Builds storage keys with CUID and safe file names
- `toUint8Array(data)` - Converts various data formats to Uint8Array

**Usage:**
```typescript
import { buildKey, toUint8Array } from "@/utils";

// Build storage key
const key = buildKey({
  directory: "avatars",
  fileName: "profile-pic.jpg"
});

// Convert data to Uint8Array
const buffer = await toUint8Array(fileData);
```

## Migration Notes

Utilities were previously scattered across:
- `/lib/utils.ts` → Now re-exports from `@/utils` (deprecated)
- `/lib/auth/utils.ts` → Now re-exports from `@/utils/auth` (deprecated)
- `/lib/storage/utils.ts` → Now re-exports from `@/utils/storage` (deprecated)

The old files maintain backward compatibility through deprecated re-exports but should be updated to use the new paths.

## Best Practices

1. **Import from main barrel**: Use `@/utils` for all imports
2. **Domain organization**: Keep utilities grouped by feature domain
3. **Type safety**: All functions include TypeScript types and JSDoc
4. **Pure functions**: Utils should be stateless and side-effect free
5. **Testing**: Add tests for complex validation or transformation logic

## Adding New Utils

When adding new utility functions:

1. Create a new domain file if needed (e.g., `utils/dates.ts`)
2. Add production-ready JSDoc comments
3. Export from `utils/index.ts`
4. Update this README with usage examples
5. Consider if the utility truly belongs here (avoid dumping ground)
