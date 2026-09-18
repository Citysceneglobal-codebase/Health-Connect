import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { resolve } from "path";
import { db } from "./db";
import { sql } from "drizzle-orm";

// Create express app
const app = express();

// Add CORS headers - environment-aware
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',            // Local dev frontend
    'http://127.0.0.1:5173',            // Local dev alternative
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

// Parse JSON bodies
app.use(express.json());

const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// Validate production configuration
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

// Import serveStatic function
async function serveStatic(app: express.Application) {
  const fs = await import("fs");
  const candidates = [
    resolve(__dirname, "public"),
    resolve(__dirname, "..", "dist", "public"),
    resolve(__dirname, "..", "client", "dist"),
  ];
  const staticPath = candidates.find(p => fs.existsSync(p)) || candidates[0];
  app.use(express.static(staticPath));

  // Serve index.html for all routes in production
  app.get("*", (req, res) => {
    res.sendFile(resolve(staticPath, "index.html"));
  });
}

(async () => {
  validateProductionConfig();
  // Create all database tables
  console.log("Setting up database tables...");
  
  // Create users table
  await db.run(sql`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    firstName TEXT,
    lastName TEXT,
    profileImageUrl TEXT,
    role TEXT NOT NULL DEFAULT 'patient',
    phone TEXT,
    dateOfBirth TEXT,
    gender TEXT,
    address TEXT,
    pushToken TEXT,
    createdAt INTEGER,
    updatedAt INTEGER
  )`);
  
  // Create messages table
  await db.run(sql`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId TEXT NOT NULL REFERENCES users(id),
    receiverId TEXT NOT NULL REFERENCES users(id),
    appointmentId INTEGER,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    isRead INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    expiresAt INTEGER,
    createdAt INTEGER
  )`);
  
  console.log("Database tables ready");
  
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Use 'localhost' for development, '0.0.0.0' for production
  const port = parseInt(process.env.PORT || "5007", 10); // Changed to 5007
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
  httpServer.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();