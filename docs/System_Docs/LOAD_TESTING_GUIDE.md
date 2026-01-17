# Load Testing Guide - 10K Concurrent Users

This guide explains how to verify your webapp can handle 10,000 concurrent users.

## Quick Start

### 1. Install K6

```bash
# macOS
brew install k6

# Linux
curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz
sudo mv k6-v0.47.0-linux-amd64/k6 /usr/local/bin/

# Windows
choco install k6
```

### 2. Run Load Tests

```bash
# Smoke Test (2 users, 30 seconds) - Start here!
k6 run scripts/k6-load-test.js

# Load Test (100 users, 5 minutes) - Typical production load
k6 run --env SCENARIO=load scripts/k6-load-test.js

# Stress Test (up to 1500 users) - Find breaking point
k6 run --env SCENARIO=stress scripts/k6-load-test.js

# Spike Test (10K users instantly!) - Ultimate test
k6 run --env SCENARIO=spike --env TARGET_VUS=10000 scripts/k6-load-test.js

# Against production/staging
k6 run --env BASE_URL=https://your-app.vercel.app --env SCENARIO=spike scripts/k6-load-test.js
```

## Test Scenarios Explained

### 🔹 Smoke Test (Default)
- **Users:** 2 concurrent
- **Duration:** 30 seconds
- **Purpose:** Verify basic functionality
- **When to use:** Before every deployment

### 🔸 Load Test
- **Users:** 0 → 50 → 100 → 0
- **Duration:** 5 minutes
- **Purpose:** Test normal peak traffic
- **When to use:** Weekly performance validation

### 🔶 Stress Test
- **Users:** 0 → 100 → 500 → 1000 → 1500 → 0
- **Duration:** 15 minutes
- **Purpose:** Find breaking point
- **When to use:** Before major launches

### 🔴 Spike Test
- **Users:** 0 → 10,000 (instant) → 0
- **Duration:** 3 minutes
- **Purpose:** Simulate viral traffic surge
- **When to use:** Before Black Friday, product launches

### ⏰ Soak Test
- **Users:** 100 constant
- **Duration:** 1 hour
- **Purpose:** Detect memory leaks, degradation
- **When to use:** Monthly infrastructure health check

## Understanding Results

### ✅ Passing Thresholds
Your app is ready for 10K users if:

```
✓ http_req_duration..............: avg=45ms   p(95)=250ms  p(99)=800ms
✓ http_req_failed................: 0.5%       (below 5%)
✓ errors.........................: 0.2%       (below 1%)
✓ http_reqs......................: 12,000/s
```

### ❌ Failing Indicators

**High Response Times**
```
✗ http_req_duration..............: p(95)=3000ms  ❌ (threshold: <500ms)
```
**Fix:** 
- Check database query performance
- Add caching
- Optimize slow API endpoints
- Scale up database (Neon autoscaling)

**High Error Rate**
```
✗ http_req_failed................: 15%  ❌ (threshold: <5%)
```
**Fix:**
- Check for database connection limits
- Review 429 rate limiting rules
- Check WebSocket connection limits
- Monitor memory usage

**Database Bottleneck**
```
✗ http_req_duration{name:search}..: p(95)=5000ms
```
**Fix:**
- Run: `bun run scripts/analyze-partner-query.ts`
- Add database indexes
- Enable query caching
- Use Neon read replicas

## Performance Checklist

### Before Testing

- [ ] Deploy to production-like environment (not localhost)
- [ ] Use same infrastructure as production (Vercel/Railway)
- [ ] Database is production-spec (Neon Scale plan)
- [ ] Caching is enabled (check `/api/admin/cache/stats`)
- [ ] CDN is active for static assets
- [ ] WebSocket server is running (`apps/ws`)

### During Testing

Monitor these dashboards:

1. **K6 Output** - Real-time metrics
2. **Vercel Analytics** - Server response times
3. **Neon Dashboard** - Database CPU/memory
4. **Railway Logs** - WebSocket connections
5. **Application Logs** - Error rates

### Critical Endpoints to Monitor

```javascript
// From your api-bench.ts
Priority 1: /api/listings/search          (most critical)
Priority 2: /api/listings/car-card        (homepage)
Priority 3: /api/bookings/slots           (booking flow)
Priority 4: /api/partners/*/dealer-profile (partner pages)
```

## Bottleneck Identification

### Database is the Bottleneck

**Symptoms:**
- Slow queries (>500ms)
- High database CPU
- Connection pool exhaustion

**Solutions:**
```bash
# 1. Analyze slow queries
bun run scripts/full-api-audit.ts

# 2. Check cache effectiveness
bun run scripts/monitor-cache.ts

# 3. Optimize queries
# Add indexes, use materialized views, enable caching
```

### Vercel Functions are the Bottleneck

**Symptoms:**
- Cold starts
- Timeout errors (504)
- Memory limits hit

**Solutions:**
- Enable Vercel Edge Functions for hot paths
- Increase function memory allocation
- Reduce bundle size
- Add more warm instances

### WebSocket Server is the Bottleneck

**Symptoms:**
- Connection drops
- Message delays
- Railway memory limits

**Solutions:**
- Scale WebSocket server horizontally
- Use Redis for pub/sub
- Implement connection pooling

## Current Architecture Strengths

✅ **Neon HTTP Database**
- Serverless-optimized (no connection pools)
- Sub-10ms latency
- Autoscaling

✅ **In-Memory Caching**
- `memoryCache` reduces DB load
- Cache warming via cron (`/api/internal/warm-cache`)

✅ **Optimized Queries**
- Drizzle ORM with prepared statements
- Indexed searches

✅ **Rate Limiting**
- Prevents abuse
- Protects infrastructure

## Expected Performance at 10K Users

Based on your architecture:

| Metric | Expected | Notes |
|--------|----------|-------|
| Response Time (P95) | 200-500ms | With cache hits |
| Response Time (P99) | 500-1000ms | With DB queries |
| Error Rate | <1% | Mostly rate limits |
| Requests/Second | 5,000-15,000 | Depends on endpoint mix |
| Database CPU | 30-60% | Neon autoscales |
| Function Memory | <512MB | Per instance |

## Cost Implications at 10K Users

### Vercel
- **Pro Plan:** $20/mo base
- **Function Invocations:** ~$0.40 per 1M
- **Bandwidth:** ~$0.10 per 1GB
- **Estimated:** $100-300/mo at sustained 10K users

### Neon
- **Scale Plan:** $69/mo
- **Compute:** Autoscales to 4 CU
- **Storage:** ~$0.13/GB
- **Estimated:** $100-200/mo

### Railway (WebSocket)
- **Pro Plan:** $20/mo
- **Usage:** ~$0.000231/GB-hour RAM
- **Estimated:** $50-100/mo

**Total:** $270-600/mo for 10K concurrent users

## Running Your First Test

```bash
# 1. Health check
curl http://localhost:3000/api/storage/status

# 2. Start your dev server
cd apps/web
bun run dev

# 3. Run smoke test
k6 run scripts/k6-load-test.js

# 4. If passing, run load test
k6 run --env SCENARIO=load scripts/k6-load-test.js

# 5. If still passing, try stress test
k6 run --env SCENARIO=stress scripts/k6-load-test.js

# 6. Final validation: spike test
k6 run --env SCENARIO=spike --env TARGET_VUS=1000 scripts/k6-load-test.js

# 7. For 10K test (against staging/production only!)
k6 run --env BASE_URL=https://staging.yourapp.com --env SCENARIO=spike --env TARGET_VUS=10000 scripts/k6-load-test.js
```

## Interpreting K6 Output

```
✓ status is 200-299 or 429........: 98.5%   ✅ Success rate
✓ response time < 2s...............: 99.9%   ✅ Speed

data_received......................: 120 MB   40 kB/s
data_sent..........................: 1.2 MB   0.4 kB/s
http_req_blocked...................: avg=1ms    max=150ms   ⏱️ DNS/TCP
http_req_connecting................: avg=0.5ms  max=100ms   ⏱️ TCP handshake
http_req_duration..................: avg=45ms   max=2.1s    ⏱️ Request time
http_req_receiving.................: avg=0.3ms  max=50ms    ⏱️ Download time
http_req_sending...................: avg=0.1ms  max=20ms    ⏱️ Upload time
http_req_waiting...................: avg=44ms   max=2s      ⏱️ Server processing
http_reqs..........................: 12,000    4000/s       📊 Throughput
iteration_duration.................: avg=1.2s   max=5s      🔄 Full cycle
iterations.........................: 10,000    3333/iter/s  🔄 Test iterations
vus................................: 10,000    active       👥 Virtual users
vus_max............................: 10,000    max          👥 Peak users
```

## Troubleshooting Common Issues

### "Connection refused"
```bash
# Ensure dev server is running
cd apps/web && bun run dev
```

### "Too many open files"
```bash
# macOS: Increase limits
ulimit -n 10000
```

### "Memory limit exceeded"
```bash
# Run k6 with fewer VUs
k6 run --env TARGET_VUS=1000 scripts/k6-load-test.js
```

### "Rate limit 429 errors"
```javascript
// Temporarily disable rate limiting for testing
// In your API routes, comment out rate limiter middleware
```

## Next Steps

1. ✅ Run smoke test
2. ✅ Run load test
3. ✅ Run stress test
4. ✅ Deploy to staging
5. ✅ Run spike test against staging
6. ✅ Monitor all dashboards
7. ✅ Optimize bottlenecks
8. ✅ Re-run tests
9. ✅ Document baseline performance
10. ✅ Set up continuous load testing (CI/CD)

## Continuous Monitoring

Add to your CI/CD:

```yaml
# .github/workflows/load-test.yml
name: Weekly Load Test
on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday 2 AM
jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: grafana/setup-k6-action@v1
      - run: k6 run --env BASE_URL=${{ secrets.STAGING_URL }} --env SCENARIO=load scripts/k6-load-test.js
```

## Resources

- [K6 Documentation](https://k6.io/docs/)
- [Vercel Function Limits](https://vercel.com/docs/limits)
- [Neon Autoscaling](https://neon.tech/docs/introduction/autoscaling)
- [Your API Benchmark Tool](../scripts/api-bench.ts)
