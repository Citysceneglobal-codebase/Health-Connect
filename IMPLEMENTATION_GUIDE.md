# Production Implementation Guide

**Objective**: Make Health-Connect production-ready with SQLite  
**Time Estimate**: 2-3 hours  
**Difficulty**: Intermediate  

---

## STEP 1: Apply Database Session Store Fix ⭐ CRITICAL

### File: `server/replitAuth.ts`

**Change 1.1**: Import conditional session store

Find line 1-8 and replace:
```typescript
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import cookieParser from "cookie-parser";
```

With:
```typescript
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import cookieParser from "cookie-parser";
```

**Change 1.2**: Update getSession() function

Find the `getSession()` function (lines 24-32) and replace entire function:

```typescript
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  let sessionStore: any;

  // Use PostgreSQL session store if DATABASE_URL is PostgreSQL
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("postgres")) {
    try {
      const pgStore = connectPg(session);
      sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: false,
        ttl: sessionTtl,
        tableName: "sessions",
      });
      console.log("✓ Using PostgreSQL session store");
    } catch (error) {
      console.warn("⚠️ PostgreSQL session store failed, falling back to memory store:", error);
      const memoryStore = new (MemoryStore as any)(session);
      sessionStore = new memoryStore({
        checkInterval: 86400000, // prune expired entries every 24h
      });
    }
  } else {
    // Use in-memory store for SQLite or no database configured
    const memoryStore = new (MemoryStore as any)(session);
    sessionStore = new memoryStore({
      checkInterval: 86400000, // prune expired entries every 24h
    });
    console.warn("⚠️ Using in-memory session store. Not suitable for multi-instance production deployments. For production, use PostgreSQL or implement SQLite session store.");
  }

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: sessionTtl,
    },
  });
}
```

**✅ Verify**: Save file. No errors should appear in TypeScript checking.

---

## STEP 2: Fix CORS for Production

### File: `server/index.ts`

Find lines 14-23 (CORS middleware) and replace:

```typescript
// Add CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

With:

```typescript
// Add CORS headers - environment-aware
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',            // Local dev frontend
    'http://127.0.0.1:5173',            // Local dev alternative
    'http://localhost:3000',            // Local alternative port
    process.env.FRONTEND_URL || '',     // Production/staging frontend
  ].filter((url) => url.length > 0);

  const origin = req.headers.origin as string;
  
  // In development, be permissive; in production, be strict
  const isOriginAllowed = process.env.NODE_ENV === 'development' 
    ? true 
    : allowedOrigins.includes(origin);

  if (isOriginAllowed) {
    res.header('Access-Control-Allow-Origin', origin || 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

**✅ Verify**: Save file. CORS should now be configurable via FRONTEND_URL env var.

---

## STEP 3: Add OAuth Validation

### File: `server/index.ts`

Find where routes are registered (around lines 150-160) and add this validation **before** route registration:

Add just before this line:
```typescript
export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
```

Insert:
```typescript
// Validate production authentication setup
function validateProductionConfig() {
  if (process.env.NODE_ENV === "production") {
    const requiredAuthVars = [
      'SESSION_SECRET',
      'ISSUER_URL',
      'CLIENT_ID',
      'CLIENT_SECRET',
      'REDIRECT_URI',
      'FRONTEND_URL'
    ];

    const missingVars = requiredAuthVars.filter((v) => !process.env[v]);
    
    if (missingVars.length > 0) {
      console.error('');
      console.error('❌ PRODUCTION ENVIRONMENT VALIDATION FAILED');
      console.error('Missing required authentication variables:', missingVars);
      console.error('');
      console.error('Set these in your .env.production file:');
      missingVars.forEach(v => console.error(`  - ${v}`));
      console.error('');
      process.exit(1);
    }

    // Validate URLs
    try {
      new URL(process.env.REDIRECT_URI!);
      new URL(process.env.ISSUER_URL!);
      new URL(process.env.FRONTEND_URL!);
      console.log('✓ All authentication URLs are valid');
    } catch (err: any) {
      console.error('❌ Invalid URL format:', err.message);
      process.exit(1);
    }

    // Validate SESSION_SECRET length
    if ((process.env.SESSION_SECRET || '').length < 32) {
      console.error('❌ SESSION_SECRET must be at least 32 characters');
      process.exit(1);
    }

    console.log('✓ Production configuration validated successfully');
  }
}
```

Then call this function at the very start of `registerRoutes()`:

```typescript
export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  validateProductionConfig();
  await setupAuth(app);
  
  // ... rest of code
```

**✅ Verify**: File should parse without errors.

---

## STEP 4: Add Health Check Endpoint

### File: `server/routes.ts`

Find the start of `registerRoutes()` function (around line 27, after `await setupAuth(app)`) and add:

```typescript
export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);

  // ============================================================
  // Health Check Endpoints (required for Docker/Kubernetes)
  // ============================================================
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: process.uptime()
    });
  });

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ============================================================
  // Auth Routes
  // ============================================================
```

**✅ Verify**: You should be able to `curl http://localhost:5007/api/health` and get a 200 response.

---

## STEP 5: Fix API Proxy Configuration

### File: `vite.config.ts`

Find the `server.proxy` section (lines 33-52) and replace:

```typescript
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5007',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Forward cookies
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Forward set-cookie headers
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              res.setHeader('set-cookie', setCookie);
            }
          });
        }
      }
    }
  },
```

With:

```typescript
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5007',
        changeOrigin: true,
        secure: process.env.NODE_ENV === 'production',
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Forward cookies
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Forward set-cookie headers
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              res.setHeader('set-cookie', setCookie);
            }
          });
        }
      }
    }
  },
```

**✅ Verify**: Vite should still start without errors. `VITE_API_URL` can now be configured via env vars.

---

## STEP 6: Create Production Docker Compose File

### File: `infrastructure/docker-compose.sqlite.yml` (CREATE NEW)

Create this file:

```yaml
version: '3.8'

services:
  # Reverse Proxy & Load Balancer
  nginx:
    image: nginx:alpine
    container_name: healthconnect-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - app
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - healthconnect-network

  # Application Server
  app:
    image: healthconnect-app:latest
    container_name: healthconnect-app
    build:
      context: ..
      dockerfile: Dockerfile
    ports:
      - "5007:5007"
    environment:
      - NODE_ENV=production
      - PORT=5007
      - SESSION_SECRET=${SESSION_SECRET}
      - ISSUER_URL=${ISSUER_URL}
      - CLIENT_ID=${CLIENT_ID}
      - CLIENT_SECRET=${CLIENT_SECRET}
      - REDIRECT_URI=${REDIRECT_URI}
      - FRONTEND_URL=${FRONTEND_URL}
      # Uncomment and set when needed:
      # - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      # - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      # - SENDGRID_API_KEY=${SENDGRID_API_KEY}
    volumes:
      # Persist SQLite database
      - ./sqlite.db:/app/sqlite.db
      # Persist logs
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5007/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - healthconnect-network
    depends_on:
      - nginx

volumes:
  sqlite_data:
    driver: local

networks:
  healthconnect-network:
    driver: bridge
```

**✅ Verify**: File syntax is valid YAML.

---

## STEP 7: Update Build Script (Optional Optimization)

### File: `script/build.ts`

Find the `allowlist` array (around line 11) and update it:

```typescript
const allowlist = [
  "@google/generative-ai",
  "axios",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

// Add PostgreSQL drivers only if using PostgreSQL
if (process.env.USE_POSTGRES === "true") {
  allowlist.push("connect-pg-simple", "pg");
}
```

**✅ Verify**: Build still works with `npm run build`.

---

## VERIFICATION CHECKLIST

After making all changes:

```bash
# 1. TypeScript check
npm run check

# 2. Build the project
npm run build

# 3. Test locally with production config
cp .env.example .env.production
# Edit .env.production with real values (or use dev values)
NODE_ENV=production node dist/index.cjs

# 4. Test health endpoint
curl http://localhost:5007/api/health

# 5. Test CORS (from different origin)
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:5007/api/health
```

---

## ENVIRONMENT SETUP FOR PRODUCTION

### 1. Generate Session Secret
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Create .env.production
```bash
cp .env.example .env.production
# Edit .env.production with your real values:
# - SESSION_SECRET (from above)
# - ISSUER_URL (your OAuth provider)
# - CLIENT_ID, CLIENT_SECRET (from OAuth provider)
# - REDIRECT_URI (must match your OAuth provider config)
# - FRONTEND_URL (your actual domain)
```

### 3. Optional: Set PostgreSQL (if you change your mind)
```env
DATABASE_URL=postgresql://user:password@postgres-host:5432/healthconnect
```

---

## DEPLOYMENT TO DOCKER

```bash
# 1. Build Docker image
docker build -t healthconnect-app:latest .

# 2. Create .env file for docker-compose
cp .env.example .env  # Edit with real values

# 3. Start with SQLite compose file
docker-compose -f infrastructure/docker-compose.sqlite.yml up -d

# 4. Check logs
docker-compose -f infrastructure/docker-compose.sqlite.yml logs -f app

# 5. Test health
curl http://localhost/api/health
```

---

## ROLLBACK CHECKLIST

If anything goes wrong:

```bash
# Stop containers
docker-compose -f infrastructure/docker-compose.sqlite.yml down

# Clear bad builds
docker system prune -f

# Reset to last known good
npm run build
docker-compose -f infrastructure/docker-compose.sqlite.yml up --build -d
```

---

## NEXT STEPS

1. ✅ Make all 7 code changes above
2. ✅ Run `npm run check` to verify TypeScript
3. ✅ Run `npm run build` to verify build
4. ✅ Create `.env.production` with real values
5. ✅ Test locally: `NODE_ENV=production npm start`
6. ✅ Deploy Docker container to production

---

**Need help?** Check `PRODUCTION_REPORT.md` for detailed explanations of each change.
