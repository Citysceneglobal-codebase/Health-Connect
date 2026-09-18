import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import cookieParser from "cookie-parser";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use in-memory store for SQLite (suitable for single-instance deployments)
  const memoryStore = new (MemoryStore as any)(session);
  const sessionStore = new memoryStore({
    checkInterval: 86400000, // prune expired entries every 24h
  });

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  // Add cookie parser middleware
  app.use(cookieParser());
  
  if (process.env.NODE_ENV !== "production") {
    // Local dev bypass: treat all requests as authenticated with a mock user
    app.use(async (req, res, next) => {
      // Check if a role was selected in development
      const devRole = req.cookies['devRole'] || 'patient';
      
      // Log the detected role for debugging
      console.log("Detected devRole:", devRole);
      console.log("All cookies:", req.cookies);
      
      // Default mock user data based on role
      let mockUserData = {
        id: "dev-user",
        email: "dev@localhost",
        firstName: "Dev",
        lastName: "User",
        profileImageUrl: "",
        role: devRole,
        phone: "+1 (555) 123-4567",
        dateOfBirth: "1985-06-15",
        gender: "Male",
        address: "123 Main St, City, State 12345"
      };
      
      // Customize mock data based on role
      if (devRole === "doctor") {
        mockUserData = {
          id: "dev-doctor",
          email: "dr.dev@hospital.com",
          firstName: "Dr. Dev",
          lastName: "User",
          profileImageUrl: "",
          role: "doctor",
          phone: "+1 (555) 111-2222",
          dateOfBirth: "1980-01-15",
          gender: "Female",
          address: "456 Medical Ave, Health City, HC 56789"
        };
      } else if (devRole === "admin") {
        mockUserData = {
          id: "dev-admin",
          email: "admin@hospital.com",
          firstName: "Admin",
          lastName: "User",
          profileImageUrl: "",
          role: "admin",
          phone: "+1 (555) 777-8888",
          dateOfBirth: "1975-12-10",
          gender: "Other",
          address: "789 Admin Plaza, System City, SC 98765"
        };
      }
      
      (req as any).isAuthenticated = () => true;
      (req as any).user = {
        claims: {
          sub: mockUserData.id,
          email: mockUserData.email,
          first_name: mockUserData.firstName,
          last_name: mockUserData.lastName,
          profile_image_url: mockUserData.profileImageUrl,
        },
        expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        access_token: "dev-token",
        refresh_token: "dev-refresh",
      };
      
      // Ensure dev user exists in DB, but handle errors gracefully
      try {
        await storage.upsertUser({
          id: mockUserData.id,
          email: mockUserData.email,
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          profileImageUrl: mockUserData.profileImageUrl
        });
      } catch (err) {
        console.warn("Warning: Could not upsert dev user to database. Database may not be available.", err);
        // Continue anyway since this is dev mode
      }
      next();
    });
    
    // Endpoint to set role in development
    app.get("/api/set-role/:role", (req, res) => {
      const role = req.params.role;
      console.log("Server: Setting role:", role);
      if (["patient", "doctor", "admin"].includes(role)) {
        res.cookie("devRole", role, {
          maxAge: 900000,
          httpOnly: false, // Allow JS to read for dev
          sameSite: "lax",
          path: "/"
        });
        // Add CORS headers
        res.header("Access-Control-Allow-Origin", "http://localhost:5173");
        res.header("Access-Control-Allow-Credentials", "true");
        console.log("Server: Role set successfully:", role, "Cookies set:", res.get('Set-Cookie'));
        res.redirect("/");
      } else {
        console.log("Server: Invalid role:", role);
        res.status(400).json({ message: "Invalid role" });
      }
    });
    
    // Dummy login/logout endpoints
    app.get("/api/login", (req, res) => res.json({ message: "Dev login bypass" }));
    app.get("/api/logout", (req, res) => {
      // Log cookies before clearing
      console.log("Cookies before logout:", req.cookies);
      // Clear the devRole cookie on logout
      res.clearCookie('devRole');
      // Also clear any other auth-related cookies
      res.clearCookie('connect.sid');
      // Add CORS headers for development
      res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
      res.header('Access-Control-Allow-Credentials', 'true');
      // Log cookies after clearing
      console.log("Cookies after logout:", req.cookies);
      // Redirect to home page after logout
      res.redirect('/');
    });
    app.get("/api/callback", (req, res) => res.json({ message: "Dev callback bypass" }));
    return;
  }
  const oidcConfig = await getOidcConfig();
  const Client = new (client as any).Issuer(oidcConfig).Client({
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    redirect_uris: [process.env.REDIRECT_URI!],
    response_types: ["code"],
  });

  const verify: VerifyFunction = async (tokenset, claims) => {
    await upsertUser(claims);
    return claims;
  };

  passport.use(new Strategy(Client, verify));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user as any);
  });

  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/api/login", passport.authenticate("openidconnect"));
  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out" });
    });
  });
  app.get("/api/callback", passport.authenticate("openidconnect", { failureRedirect: "/login" }), (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    updateUserSession((req as any).user, (req as any).account);
    res.redirect("/");
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Check for devRole cookie (works for dev role switcher and demo login in all environments)
  const devRole = req.cookies?.devRole;
  if (devRole) {
    let userId = "dev-user";
    if (devRole === "doctor" || devRole === "dev-doctor") {
      userId = "dev-doctor";
    } else if (devRole === "doctor-1-user") {
      userId = "doctor-1-user";
    } else if (devRole === "doctor-2-user") {
      userId = "doctor-2-user";
    } else if (devRole === "doctor-3-user") {
      userId = "doctor-3-user";
    } else if (devRole === "admin") {
      userId = "dev-admin";
    }

    (req as any).user = {
      claims: {
        sub: userId,
        email: devRole === "doctor" ? "dr.dev@hospital.com" : devRole === "admin" ? "admin@hospital.com" : "dev@localhost",
        first_name: devRole === "doctor" ? "Dr. Dev" : devRole === "admin" ? "Admin" : "Dev",
        last_name: "User",
        role: devRole
      }
    };
    return next();
  }

  if (process.env.NODE_ENV !== "production") {
    // Local dev bypass default when no devRole cookie
    (req as any).user = {
      claims: {
        sub: "dev-user",
        email: "dev@localhost",
        first_name: "Dev",
        last_name: "User",
        role: "patient"
      }
    };
    return next();
  }

  if ((req as any).isAuthenticated && (req as any).isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};