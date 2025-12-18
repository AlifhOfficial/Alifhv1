# API Tests

API test suite using Bun's built-in test runner.

## Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/api/listings.test.ts

# Run with watch mode (not built-in, use nodemon or similar)
bun test --watch
```

## Test Structure

```
tests/
├── setup.ts              # Test utilities and fixtures
└── api/
    ├── auth.test.ts      # Authentication tests
    ├── listings.test.ts  # Listings API tests
    ├── favorites.test.ts # Favorites/superlikes tests
    └── consistency.test.ts # Cross-API consistency tests
```

## What We Test

### 1. **Authentication**
- Unauthorized access returns 401
- Session caching works (no redundant calls)
- Auth checks complete fast (<10ms cached)

### 2. **Performance**
- Response times tracked per endpoint
- Benchmarks: listings <200ms, auth <10ms
- Reports generated after test run

### 3. **Cache Headers**
- Public data has CDN cache (s-maxage)
- User data has no-cache headers
- POST/PATCH/DELETE never cached

### 4. **Consistency**
- All errors return { error: string }
- Status codes consistent (400/401/429/500)
- Content-Type is application/json

### 5. **Input Validation**
- Missing required fields return 400
- Invalid pagination rejected
- Type checking enforced

## Performance Report

After tests run, you'll see:

```
📊 Performance Report:
  auth-check:
    Avg: 8.45ms
    Min: 5.23ms
    Max: 12.67ms
    Count: 3
  listings-browse:
    Avg: 156.78ms
    Min: 142.34ms
    Max: 189.12ms
    Count: 2
```

## Notes

- Tests hit actual dev server (localhost:3000)
- Requires dev server running: `bun run dev`
- Set `TEST_BASE_URL` env var for custom URL
- Mock session available but not fully wired yet
- Some tests may fail if DB is empty (404s are OK)

## Next Steps

- [ ] Add authenticated request tests
- [ ] Mock database responses
- [ ] Add rate limit tests (429)
- [ ] Test file upload endpoints
- [ ] Add integration tests with real DB
