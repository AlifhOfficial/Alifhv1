# Railway Deployment Architecture

## Budget: 2,000 AED/month (~$545 USD)

### Recommended Setup

| Service | Specs | Cost/mo | Purpose |
|---------|-------|---------|---------|
| Web App | 4GB RAM, 2 vCPU | $40 | Next.js + API |
| WebSocket | 1GB RAM | $10 | Real-time messaging |
| Redis | 256MB | $10 | Distributed cache (optional) |
| Database | Neon Pro or Railway Postgres | $20-50 | PostgreSQL |
| **Total** | | **~$80-110** | |

### Why This Works

1. **4GB RAM is plenty** - Your warm cache is only ~5MB
2. **The real bottleneck is DB queries** - Already optimized with:
   - 2-step query pattern
   - Proper indexes
   - Memory caching with TTL
   - Startup warming

### Scaling Path

| MAU | Setup Needed |
|-----|--------------|
| 10k | Single 4GB instance ✅ |
| 20k | Single 4GB instance ✅ |
| 50k | Add Redis for distributed cache |
| 100k | Multiple instances + load balancer |

### Cron Jobs on Railway

For cache warming, use Railway's cron feature or free external:

**Option A: Railway Cron Service**
- Create separate cron service in Railway dashboard
- Schedule: `*/10 * * * *`
- Command: `curl -X POST $RAILWAY_PUBLIC_URL/api/internal/warm-cache`

**Option B: Free External (cron-job.org)**
- URL: `https://your-app.up.railway.app/api/internal/warm-cache`
- Schedule: Every 10 minutes
- Method: POST

### Environment Variables for Railway

```env
# Required
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app

# Optional - for cron auth
INTERNAL_API_SECRET=your-internal-secret
CRON_SECRET=your-cron-secret
```

### Startup Command

```bash
bun run start
```

### Health Check

```
/api/storage/status
```

---

## Summary

Your budget of $545/month is **5x more than needed** for your scale.
A $80-110/month setup handles 20k MAU easily with room to grow.

Save the rest for:
- CDN (Cloudflare - free tier is great)
- Email service (Resend, ~$20/mo)
- Monitoring (Railway built-in is free)
- Marketing / growth 🚀
