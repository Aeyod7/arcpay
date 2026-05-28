import { createClerkClient } from '@clerk/clerk-sdk-node';
import { PrismaClient } from '../prisma/client/index.js';

const prisma = new PrismaClient();

/**
 * Clerk Authentication Middleware for Express API
 *
 * Verifies the Bearer JWT token from the Authorization header using Clerk's SDK.
 * Sets `req.auth.userId` and `req.merchantId` on success.
 *
 * Dev mode fallback: If CLERK_SECRET_KEY is not set, uses 'default_merchant'
 * so the API works without Clerk in development.
 */
const clerkClient = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

// Paths that should skip Clerk auth (dev/admin endpoints)
const SKIP_AUTH_PATHS = [
  '/api/db-init',
  '/api/seed',
  '/api/settings'
];

/**
 * Middleware: Attaches merchant identity to the request.
 *
 * Priority:
 * 1. Dev-only: Check for x-merchant-id header (for internal/trusted callers)
 * 2. Authorization: Bearer <clerk-jwt> → verify with Clerk → extract userId
 * 3. Fallback to 'default_merchant' in dev mode (no Clerk configured)
 */
export async function clerkAuth(req, res, next) {
  try {
    // Skip auth for admin/dev endpoints (match against full original URL)
    const fullPath = req.originalUrl || req.url;
    if (SKIP_AUTH_PATHS.some(p => fullPath === p || fullPath.endsWith(p))) {
      req.auth = { userId: 'default_merchant' };
      req.merchantId = 'default_merchant';
      return next();
    }

    // 1. Check for explicit x-merchant-id header (internal use only)
    const merchantIdHeader = req.headers['x-merchant-id'];
    if (merchantIdHeader) {
      // In production, only allow x-merchant-id for authenticated users
      if (process.env.NODE_ENV === 'production' && process.env.CLERK_SECRET_KEY) {
        // Fall through to JWT verification instead
      } else {
        // Dev mode: trust the header
        req.auth = { userId: merchantIdHeader };
        req.merchantId = merchantIdHeader;
        return next();
      }
    }

    // 2. Check Authorization header for Clerk JWT
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);

      if (clerkClient) {
        try {
          // Verify the JWT using Clerk's JWKS endpoint
          const claims = await clerkClient.verifyToken(token);
          if (claims && claims.sub) {
            req.auth = { userId: claims.sub };
            req.merchantId = claims.sub;
            return next();
          }
        } catch (verifyErr) {
          // Token invalid — return 401 in production, fallback in dev
          if (process.env.CLERK_SECRET_KEY && process.env.NODE_ENV === 'production') {
            return res.status(401).json({
              success: false,
              error: 'Invalid or expired authentication token'
            });
          }
          // Dev fallback through to default_merchant
        }
      }
    }

    // 3. Dev mode fallback
    req.auth = { userId: 'default_merchant' };
    req.merchantId = 'default_merchant';
    next();
  } catch (err) {
    console.error('[ClerkAuth] Middleware error:', err.message);
    req.auth = { userId: 'default_merchant' };
    req.merchantId = 'default_merchant';
    next();
  }
}

/**
 * Optional: Hard-protect a route — requires valid Clerk session
 */
export function requireClerkAuth(req, res, next) {
  if (req.auth?.userId && req.auth.userId !== 'default_merchant') {
    return next();
  }
  if (!process.env.CLERK_SECRET_KEY) {
    // Dev mode: allow through with default
    return next();
  }
  return res.status(401).json({ success: false, error: 'Authentication required' });
}
