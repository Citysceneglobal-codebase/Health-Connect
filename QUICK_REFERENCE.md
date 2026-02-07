# PRODUCTION DEPLOYMENT QUICK REFERENCE CARD

## 7 CRITICAL CODE CHANGES REQUIRED

### Change #1: Database Session Store (MOST CRITICAL)
📁 File: `server/replitAuth.ts` (Lines 8-32)
- Import `MemoryStore from "memorystore"`
- Make session store conditional (PostgreSQL or in-memory)
- ⏱️ Time: 10 min | 🔴 Severity: CRITICAL

### Change #2: CORS Configuration  
📁 File: `server/index.ts` (Lines 14-23)
- Replace hardcoded localhost CORS
- Use `process.env.FRONTEND_URL`
- ⏱️ Time: 5 min | 🔴 Severity: CRITICAL

### Change #3: OAuth Validation
📁 File: `server/index.ts` (Before route registration)
- Add config validation function
- Check SESSION_SECRET, ISSUER_URL, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
- ⏱️ Time: 15 min | 🟠 Severity: HIGH

### Change #4: Health Check Endpoint
📁 File: `server/routes.ts` (After setupAuth)
- Add `/api/health` and `/health` endpoints
- Required for Docker health checks
- ⏱️ Time: 5 min | 🟠 Severity: HIGH

### Change #5: API Proxy Environment
📁 File: `vite.config.ts` (Lines 33-52)
- Use `process.env.VITE_API_URL || 'http://localhost:5007'`
- ⏱️ Time: 5 min | 🟠 Severity: HIGH

### Change #6: Docker Compose SQLite
📁 File: `infrastructure/docker-compose.sqlite.yml` (NEW FILE)
- Create production-optimized docker-compose
- Single app instance + Nginx only
- ⏱️ Time: 10 min | 🟠 Severity: HIGH

### Change #7: Build Script Optimization
📁 File: `script/build.ts` (Allowlist)
- Make PostgreSQL driver optional
- ⏱️ Time: 5 min | 🟡 Severity: MEDIUM

---

## REQUIRED ENVIRONMENT VARIABLES

| Variable | Example | Must Have? |
|----------|---------|-----------|
| `SESSION_SECRET` | `aB3cD4eF5gH6iJ7k8L9m0N1o2P3q4r5s` | ✅ Yes |
| `ISSUER_URL` | `https://replit.com/oidc` | ✅ Yes |
| `CLIENT_ID` | `client123` | ✅ Yes |
| `CLIENT_SECRET` | `secret456` | ✅ Yes |
| `REDIRECT_URI` | `https://yourdomain.com/api/callback` | ✅ Yes |
| `FRONTEND_URL` | `https://yourdomain.com` | ✅ Yes |
| `VITE_API_URL` | `https://api.yourdomain.com` | ✅ Yes |
| `NODE_ENV` | `production` | ✅ Yes |

---

## QUICK COMMANDS

### Generate Session Secret
```bash
openssl rand -base64 32
```

### Test Locally
```bash
cp .env.example .env.production
# Edit .env.production with values
NODE_ENV=production npm start
```

### Verify Health
```bash
curl http://localhost:5007/api/health
```

### Build Docker
```bash
npm run build
docker build -t healthconnect-app:latest .
```

### Deploy
```bash
docker-compose -f infrastructure/docker-compose.sqlite.yml up -d
```

### Check Logs
```bash
docker-compose -f infrastructure/docker-compose.sqlite.yml logs -f app
```

---

## VALIDATION CHECKLIST

- [ ] All 7 code changes applied
- [ ] `npm run check` passes
- [ ] `npm run build` completes
- [ ] `.env.production` created with all required vars
- [ ] `NODE_ENV=production npm start` works
- [ ] `curl /api/health` returns 200
- [ ] Docker image builds
- [ ] Docker container starts
- [ ] Health check passes
- [ ] Frontend can reach backend

---

## COMMON MISTAKES TO AVOID

❌ **DON'T**: Leave localhost in CORS  
✅ **DO**: Use FRONTEND_URL env var

❌ **DON'T**: Use weak SESSION_SECRET  
✅ **DO**: Generate with openssl rand -base64 32

❌ **DON'T**: Skip REDIRECT_URI validation  
✅ **DO**: Ensure it matches OAuth provider exactly

❌ **DON'T**: Deploy without health checks working  
✅ **DO**: Test `/api/health` endpoint first

❌ **DON'T**: Use development docker-compose in production  
✅ **DO**: Use docker-compose.sqlite.yml

---

## IF SOMETHING BREAKS

### Application won't start
```bash
# Check for missing env vars
echo $SESSION_SECRET $ISSUER_URL $CLIENT_ID

# Check logs
docker-compose logs app

# Check config validation
NODE_ENV=production npm start
```

### CORS errors in frontend
```bash
# Verify FRONTEND_URL matches your domain
echo $FRONTEND_URL

# Check actual request origin
curl -H "Origin: $(echo $FRONTEND_URL)" http://localhost:5007/api/health
```

### Health check failing
```bash
# Manually test endpoint
curl http://localhost:5007/api/health

# Check if server is listening
netstat -an | grep 5007

# Check app logs
docker logs healthconnect-app
```

### Session issues
```bash
# If using in-memory store, restart clears sessions (expected)
# For production, migrate to PostgreSQL or implement SQLite store

# Check if memorystore is being used
docker logs app | grep "session store"
```

---

## DATABASE NOTES

**Using SQLite?**
- Sessions stored in memory (lost on restart)
- Single instance only
- Volume mount required: `-v ./sqlite.db:/app/sqlite.db`
- Backup before updates

**Need PostgreSQL?**
- Set `DATABASE_URL=postgresql://user:pass@host:5432/db`
- Uncomment in docker-compose.yml
- Persistent session storage
- Supports multi-instance

---

## SECURITY REMINDERS

🔒 Session Secret
- Minimum 32 characters
- Random (use openssl)
- Different for each environment
- Never commit to git

🔒 OAuth Credentials
- Use vault/secret manager in production
- Rotate periodically
- Never commit to repository

🔒 CORS
- Whitelist specific domains only
- Never use `*` in production
- Validate REDIRECT_URI format

---

## TOTAL TIME ESTIMATE

| Phase | Time | Status |
|-------|------|--------|
| Code Changes | 1.5 hrs | 🔴 Required |
| Testing | 1 hr | 🔴 Required |
| Deployment | 0.5 hrs | 🟠 High |
| Monitoring | 0.5 hrs | 🟠 High |
| **TOTAL** | **~3.5 hrs** | |

---

**Need Details?** See `PRODUCTION_REPORT.md` or `IMPLEMENTATION_GUIDE.md`  
**Last Updated**: Feb 7, 2026
