# API Tests

Route-level API tests powered by Bun's test runner. Dependencies are mocked, so no dev server or database is required.

## Running

```bash
cd apps/web
bun test
```

## Layout

- `tests/setup.ts` – shared mocks for auth, database, storage, plus request helpers
- `tests/api/routes.test.ts` – coverage for auth validation, favorites/superlikes, profiles, listings, partners, storage, KYC, and misc endpoints

## Behaviors Covered

- Auth validation flows and CORS on `/api/auth/[...auth]`
- Favorites/superlikes toggles, quota responses, and guest fallbacks
- Profile fetch/update/delete behaviors and cache headers
- Listing detail/card caching paths and cache writes
- Partner mini-profile fetch/update rules
- Storage status, signed URLs, and uploads parsing
- KYC submit/list/update paths and error handling
- Dev utilities (email log stub)

## Notes

- Tests call route handlers directly with mocked modules (no network)
- Mocks reset before each test; adjust `mockState` in tests to shape responses
