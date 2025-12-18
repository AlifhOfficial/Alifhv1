# Types Directory

Centralized TypeScript type definitions organized by domain.

## Structure

```
types/
├── auth/           # Authentication & authorization types
│   └── index.ts   # User roles, permissions, session types
└── README.md      # This file
```

## Usage

Import types using the `@/types/{domain}` path:

```typescript
// Authentication types
import type { ExtendedUser, UserRole, PartnerMembership } from "@/types/auth";

// Utils types
import type { AuthResult, AuthResponse } from "@/types/auth";
```

## Guidelines

1. **Domain Organization**: Each domain (auth, profile, partner, etc.) gets its own subfolder
2. **Index Files**: Use `index.ts` to re-export all types from a domain
3. **Naming**: Use clear, descriptive names that reflect the type's purpose
4. **Documentation**: Include JSDoc comments for complex types
5. **Centralization**: Avoid defining types inline; add them here for reusability

## Adding New Types

When adding types for a new domain:

1. Create a new folder: `types/{domain}/`
2. Create `index.ts` with type definitions
3. Add JSDoc documentation
4. Update this README with the new domain

## Migration Note

Types are being migrated from various `lib/**/types.ts` files to this centralized location for better organization and discoverability.
