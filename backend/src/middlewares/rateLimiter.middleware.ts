/**
 * rateLimiter.middleware.ts
 * Rate limiting middleware to prevent abuse.
 *
 * Limits requests per IP or user to prevent DDoS and brute force attacks.
 */

import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Requests per window

/**
 * Generic rate limiter
 */
export function rateLimit(windowMs = WINDOW_MS, maxRequests = MAX_REQUESTS) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.ip || req.socket.remoteAddress || "unknown";
      const now = Date.now();

      let record = requestCounts.get(key);

      if (!record || now > record.resetTime) {
        requestCounts.set(key, {
          count: 1,
          resetTime: now + windowMs,
        });
        return next();
      }

      record.count++;

      if (record.count > maxRequests) {
        logger.warn(`Rate limit exceeded for IP ${key}`);
        return res.status(429).json({
          error: "Too many requests",
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        });
      }

      next();
    } catch (error) {
      logger.error("Rate limiter error:", error);
      next();
    }
  };
}

/**
 * Stricter rate limit for auth endpoints
 */
export function authRateLimit() {
  return rateLimit(15 * 60 * 1000, 5); // 5 requests per 15 minutes
}

/**
 * Cleaner to remove old entries from memory (run periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}

// Clean up every hour
setInterval(cleanupRateLimitStore, 60 * 60 * 1000);
