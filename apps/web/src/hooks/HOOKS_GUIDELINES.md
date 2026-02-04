# React Hooks Guidelines

## Overview

This document outlines production-ready standards for building clean, maintainable React hooks in the Revvup codebase. These guidelines ensure consistency, performance, and code quality across all custom hooks.

## Documentation Standards

### JSDoc Headers

Every hook must include a JSDoc header with:
- Brief description of the hook's purpose
- `@param` tags for all parameters (if applicable)
- `@returns` tag describing the return value
- Additional context when necessary

```typescript
/**
 * Authentication Hook
 * 
 * Provides user authentication state and session information.
 * Built on top of better-auth's useSession hook.
 * 
 * @returns Authentication state with user, loading status, and error information
 */
```

### Inline Comments

Use concise inline comments (`//`) for:
- Type definitions that need clarification
- Constants explaining their purpose
- Complex logic that isn't immediately obvious

Avoid verbose comments that simply restate the code.

## Code Structure

### Constants

Define constants at the module level, before the hook definition:

```typescript
const CACHE_DURATION = 30000; // 30 seconds
const DEFAULT_STATUS = { isFavorite: false, isSuperliked: false };
```

### Type Definitions

- Export interfaces that consumers need
- Define internal types before use
- Use descriptive names that indicate purpose
- Group related fields with inline comments

```typescript
export interface UserProfile {
  id: string;
  userId: string;
  // Profile fields
  firstName?: string | null;
  lastName?: string | null;
}

interface AuthState {
  show: boolean;
  message: string;
  feature: 'favorites' | 'superlikes';
}
```

## Best Practices

### State Management

1. **Use appropriate state primitives**: Choose between `useState`, `useReducer`, or shared state based on complexity
2. **Initialize with meaningful defaults**: Use constants for default values to avoid duplication
3. **Minimize state updates**: Batch related state changes when possible

### Error Handling

1. **Use ternary operators for simple cases**: `err instanceof Error ? err.message : 'Fallback message'`
2. **Handle specific HTTP status codes**: Check for 401, 404, etc. when relevant
3. **Provide meaningful error messages**: Be specific about what failed

### API Calls

1. **Use nullish coalescing (`??`)**: Prefer `??` over `||` for proper null/undefined handling
2. **Omit unnecessary fetch options**: Remove defaults like `method: 'GET'`
3. **Add timestamps for cache busting**: Use `?_t=${Date.now()}` when needed
4. **Handle cleanup properly**: Implement cancellation and cleanup logic

### Dependencies

1. **Be explicit with useCallback/useMemo dependencies**: Include all referenced values
2. **Use ESLint disable comments sparingly**: Only when you're certain about the dependency array
3. **Avoid stale closures**: Include state/props that your callback uses

### Performance

1. **Implement caching strategies**: Use stale-time, cache-time for React Query
2. **Deduplicate requests**: Check for pending requests before making new ones
3. **Optimize re-renders**: Use `useCallback` and `useMemo` appropriately

## Patterns

### Simple Hooks

For straightforward data fetching or state management:

```typescript
export function useAuth() {
  const { data: session, isPending, error } = useSession();

  return {
    user: session?.user ?? null,
    isLoading: isPending,
    isSignedIn: !!session?.user,
    error,
    session,
  };
}
```

### React Query Hooks

For server state with caching:

```typescript
export function useListingDetail(id: string | null | undefined) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListingDetail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
```

### Shared State Hooks

For global state with deduplication:

```typescript
interface StoreState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

let store: StoreState = { profile: null, isLoading: false, error: null };
const listeners = new Set<(state: StoreState) => void>();

const notify = () => listeners.forEach(listener => listener(store));
const updateStore = (partial: Partial<StoreState>) => {
  store = { ...store, ...partial };
  notify();
};
```

## What to Avoid

1. **Complex state when simple will do**: Don't use `useReducer` for boolean flags
2. **Verbose comments**: Remove comments that don't add value beyond the code
3. **Unnecessary abstractions**: Keep helper functions inline if they're only used once
4. **Premature optimization**: Profile before optimizing
5. **Console.log statements**: Remove debugging logs before committing
6. **Unused imports**: Clean up unused dependencies
7. **Inline styles or magic numbers**: Use constants for meaningful values

## Testing Considerations

While not covered in detail here, production-ready hooks should:
- Have unit tests for core logic
- Test error states and edge cases
- Verify cleanup functions execute properly
- Mock external dependencies appropriately

## Review Checklist

Before committing a hook:
- [ ] JSDoc header is complete and accurate
- [ ] All constants are defined at module level
- [ ] Interfaces are exported if needed externally
- [ ] Error handling is comprehensive
- [ ] No console.log or debug statements
- [ ] Dependencies arrays are correct
- [ ] Code follows established patterns
- [ ] Unnecessary comments are removed
- [ ] Build passes without TypeScript errors
