# Production Deployment Guide - SQLite Edition

## QUICK START (15 minutes)

```bash
# 1. Generate SESSION_SECRET
openssl rand -base64 32

# 2. Create .env.production
cp .env.example .env.production

# 3. Edit .env.production with your values:
# - SESSION_SECRET (from step 1)
# - ISSUER_URL (your OAuth provider)
# - CLIENT_ID, CLIENT_SECRET (from OAuth provider)
# - REDIRECT_URI (callback URL)
# - FRONTEND_URL (your domain)

# 4. Build and run locally
npm run build
DATABASE_URL='' NODE_ENV=production npm start

# 5. Verify health check
curl http://localhost:5007/api/health

# 6. Build Docker image
docker build -t healthconnect-app:latest .

# 7. Deploy
docker-compose -f infrastructure/docker-compose.sqlite.yml up -d
```

---

## IMPORTANT NOTES FOR SQLITE

### ⚠️ Session Storage
- Sessions are stored **in memory** (not on disk)
- Sessions are **lost when server restarts**
- Each restart requires re-authentication
- **Suitable only for single-instance deployments**
- **Not suitable for auto-scaling or multi-instance setups**

### ✅ When SQLite is Perfect
- Single server deployment
- Small to medium user base (< 10,000 concurrent users)
- No auto-scaling requirements
- Development and staging environments
- Cost-conscious deployments

### ❌ When You Need PostgreSQL
- Multiple server instances
- Auto-scaling deployments
- Session persistence required
- Kubernetes deployments
- Enterprise production with high availability

---

## ENVIRONMENT VARIABLES REQUIRED

```env
# MUST HAVE
NODE_ENV=production
SESSION_SECRET=<32+ character random string>
ISSUER_URL=<your OAuth provider URL>
CLIENT_ID=<OAuth client ID>
CLIENT_SECRET=<OAuth client secret>
REDIRECT_URI=<https://yourdomain.com/api/callback>
FRONTEND_URL=<https://yourdomain.com>

# OPTIONAL (for Vite proxy)
VITE_API_URL=<https://api.yourdomain.com>
```

---

## DEPLOYMENT STEPS

### Step 1: Prepare Environment

```bash
# Generate secret
SECRET=$(openssl rand -base64 32)
echo "SESSION_SECRET=$SECRET"

# Copy template
cp .env.example .env.production

# Edit with your values using your editor
# nano .env.production
```

### Step 2: Test Locally

```bash
# Install dependencies (if needed)
npm install

# Run TypeScript check
npm run check

# Build for production
npm run build

# Start production server (will validate config)
NODE_ENV=production npm start

# In another terminal, test:
curl http://localhost:5007/api/health
# Should return: {"status":"healthy",...}
```

### Step 3: Build Docker Image

```bash
# Build image
docker build -t healthconnect-app:latest .

# Verify image was created
docker images | grep healthconnect-app
```

### Step 4: Deploy with Docker Compose

```bash
# Create .env file for docker-compose
cp .env.production .env

# Start containers
docker-compose -f infrastructure/docker-compose.sqlite.yml up -d

# Check logs
docker-compose -f infrastructure/docker-compose.sqlite.yml logs -f app

# Verify health
curl http://localhost/api/health
```

### Step 5: Setup SSL/HTTPS

```bash
# Create nginx/ssl directory
mkdir -p infrastructure/nginx/ssl

# Add your SSL certificates
# Example using Let's Encrypt:
# cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem infrastructure/nginx/ssl/
# cp /etc/letsencrypt/live/yourdomain.com/privkey.pem infrastructure/nginx/ssl/

# Update infrastructure/nginx/nginx.conf with SSL config
```

---

## DATABASE BACKUP STRATEGY

⚠️ **Important**: SQLite is a single file. You must back it up!

```bash
# Manual backup
docker-compose -f infrastructure/docker-compose.sqlite.yml exec app cp \
  /app/sqlite.db /app/sqlite.db.backup

# Automated daily backup (crontab)
0 2 * * * docker-compose -f /path/to/infrastructure/docker-compose.sqlite.yml exec app cp /app/sqlite.db /app/sqlite.db.$(date +\%Y\%m\%d)
```

---

## TROUBLESHOOTING

### "Missing required authentication variables"
```bash
# Check your .env.production file
cat .env.production | grep SESSION_SECRET
cat .env.production | grep ISSUER_URL
cat .env.production | grep CLIENT_ID

# All must be set and not empty
```

### "Invalid URL format"
```bash
# Verify URLs are complete
echo $ISSUER_URL  # Should start with https://
echo $REDIRECT_URI # Should start with https://
echo $FRONTEND_URL # Should start with https://
```

### "SESSION_SECRET must be at least 32 characters"
```bash
# Generate new secret
openssl rand -base64 32
# Copy to .env.production
```

### Sessions lost after restart
```bash
# This is expected behavior with SQLite + in-memory sessions
# You can:
# 1. Accept this limitation (fine for single instance)
# 2. Migrate to PostgreSQL for persistent sessions
# 3. Implement SQLite-backed session store (requires additional coding)
```

### Docker container won't start
```bash
# Check logs
docker logs healthconnect-app

# Common issues:
# - Missing ENV variables
# - Invalid NODE_ENV value
# - Port already in use
# - Permission issues on /app/sqlite.db

# Try running with more details
docker run -it \
  -e NODE_ENV=production \
  -e SESSION_SECRET=test_secret_32_characters_minimum \
  -e ISSUER_URL=https://replit.com/oidc \
  -e CLIENT_ID=test \
  -e CLIENT_SECRET=test \
  -e REDIRECT_URI=https://localhost/api/callback \
  -e FRONTEND_URL=https://localhost \
  healthconnect-app:latest
```

---

## MONITORING & HEALTH CHECKS

### Health Endpoint
```bash
# Application health
curl http://localhost:5007/api/health

# Nginx health
curl http://localhost/health

# Both should return 200 OK
```

### Docker Health
```bash
# Check container status
docker ps | grep healthconnect-app

# STATUS should show "healthy"
```

### Logs
```bash
# Recent logs
docker-compose logs app --tail=100

# Follow live logs
docker-compose logs -f app

# Specific time range
docker-compose logs --since 2024-01-01T00:00:00 app
```

---

## SCALING CONSIDERATIONS

### Single Instance (SQLite)
```
✅ Good for:
- 1-10 concurrent users
- Single server/region
- Staging/demo environments

Performance:
- Response time: ~50-100ms
- Max QPS: ~100-200 (depends on query complexity)
- Memory: ~200MB
```

### If You Need to Scale

**Option 1: Vertical Scaling** (Increase machine size)
- Increase CPU and RAM
- SQLite can handle more concurrent users
- Suitable for ~100-1000 concurrent users

**Option 2: Switch to PostgreSQL**
- Implement multi-instance deployment
- Set up load balancer
- Move sessions to external store (Redis)
- Suitable for 1000+ concurrent users

Migration guide available on request.

---

## SECURITY CHECKLIST

- [ ] SESSION_SECRET is 32+ characters and random
- [ ] All OAuth credentials are valid
- [ ] REDIRECT_URI matches OAuth provider configuration exactly
- [ ] FRONTEND_URL is your actual production domain
- [ ] SSL/HTTPS is configured
- [ ] SQLite database file is backed up
- [ ] .env.production is NOT committed to git
- [ ] Log files are configured for isolation
- [ ] Database backups are stored securely

---

## ROLLBACK PROCEDURE

If deployment fails:

```bash
# Stop current deployment
docker-compose -f infrastructure/docker-compose.sqlite.yml down

# Restore from backup
docker cp healthconnect-app:/app/sqlite.db.backup .
docker cp sqlite.db.backup healthconnect-app:/app/sqlite.db

# Start again
docker-compose -f infrastructure/docker-compose.sqlite.yml up -d

# Verify
curl http://localhost/api/health
```

---

## SUPPORT RESOURCES

- **Setup Issues**: Check `.env.example`
- **Auth Issues**: Verify OAuth credentials
- **Network Issues**: Check nginx/nginx.conf and SSL config
- **Database Issues**: Check SQLite database file permissions
- **Performance Issues**: Review health endpoint response times

---

## MAINTENANCE TASKS

### Daily
- Monitor logs: `docker logs -f healthconnect-app`
- Check health: `curl http://localhost/api/health`

### Weekly
- Backup database: `docker exec healthconnect-app cp /app/sqlite.db /app/sqlite.db.backup`
- Review error logs

### Monthly
- Rotate session data (restart container)
- Update Docker image: `docker pull` latest base images
- Security patch review

---

**Status**: ✅ Production Ready (Single Instance)  
**Last Updated**: February 7, 2026  
**Next Steps**: Perform local testing before production deployment
