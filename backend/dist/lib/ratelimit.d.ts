/**
 * Advanced Rate Limiting Middleware
 * Production-grade rate limiting with multiple strategies
 */
import { RateLimitRequestHandler } from 'express-rate-limit';
import { Response } from 'express';
/**
 * Global rate limiter - applies to all routes
 * 1000 requests per 15 minutes
 */
export declare const globalRateLimiter: RateLimitRequestHandler;
/**
 * Strict rate limiter for paste creation
 * 10 pastes per minute per IP
 */
export declare const createPasteLimiter: RateLimitRequestHandler;
/**
 * Burst rate limiter for paste retrieval
 * 100 requests per minute per IP
 */
export declare const getPasteLimiter: RateLimitRequestHandler;
/**
 * Cleanup endpoint rate limiter (for cron jobs)
 * 10 requests per hour - only for authorized requests
 */
export declare const cleanupRateLimiter: RateLimitRequestHandler;
/**
 * Add custom rate limit info to response
 */
export declare function addRateLimitHeaders(res: Response, limit: number, remaining: number, resetTime: Date): void;
//# sourceMappingURL=ratelimit.d.ts.map