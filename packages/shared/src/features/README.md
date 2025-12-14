# Shared Feature Modules

Group cross-platform domain logic here so both web and mobile can import the same contracts. Keep feature folders small and focused:

- `listings/` – listing data contracts, mappers, and shared helpers
- `auth/` – authentication types, guards, and session utilities (see sibling folder)
- `profile/` – base user profile contracts and validators shared across clients

Add a dedicated `index.ts` in each feature directory to expose the public surface area. Keep UI-specific code out of this package to avoid leaks into non-React runtimes.
