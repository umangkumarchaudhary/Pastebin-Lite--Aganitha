"use strict";
/**
 * Advanced Rate Limiting Middleware
 * Production-grade rate limiting with multiple strategies
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupRateLimiter = exports.getPasteLimiter = exports.createPasteLimiter = exports.globalRateLimiter = void 0;
exports.addRateLimitHeaders = addRateLimitHeaders;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const types_1 = require("./types");
// ============================================
// Custom Key Generator
// ============================================
/**
 * Get client IP address considering proxies
 */
function getClientIP(req) {
    // X-Forwarded-For header (from reverse proxy/load balancer)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
        return ips.trim();
    }
    // X-Real-IP header (nginx)
    const realIP = req.headers['x-real-ip'];
    if (realIP) {
        return Array.isArray(realIP) ? realIP[0] : realIP;
    }
    // Direct connection
    return req.ip || req.socket.remoteAddress || 'unknown';
}
// ============================================
// Rate Limiters
// ============================================
/**
 * Global rate limiter - applies to all routes
 * 1000 requests per 15 minutes
 */
exports.globalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: {
        success: false,
        error: {
            code: types_1.ErrorCodes.RATE_LIMIT_EXCEEDED,
            message: 'Too many requests. Please try again later.',
            retryAfter: '15 minutes',
        },
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    keyGenerator: getClientIP,
    skip: (req) => {
        // Skip rate limiting for health check endpoints
        return req.path === '/health' || req.path === '/health/db';
    },
});
/**
 * Strict rate limiter for paste creation
 * 10 pastes per minute per IP
 */
exports.createPasteLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: {
        success: false,
        error: {
            code: types_1.ErrorCodes.RATE_LIMIT_EXCEEDED,
            message: 'Too many pastes created. Please wait before creating more.',
            retryAfter: '1 minute',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIP,
    skipFailedRequests: true, // Don't count failed requests
});
/**
 * Burst rate limiter for paste retrieval
 * 100 requests per minute per IP
 */
exports.getPasteLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: {
        success: false,
        error: {
            code: types_1.ErrorCodes.RATE_LIMIT_EXCEEDED,
            message: 'Too many requests. Please slow down.',
            retryAfter: '1 minute',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIP,
});
/**
 * Cleanup endpoint rate limiter (for cron jobs)
 * 10 requests per hour - only for authorized requests
 */
exports.cleanupRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        success: false,
        error: {
            code: types_1.ErrorCodes.RATE_LIMIT_EXCEEDED,
            message: 'Cleanup rate limit exceeded.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// ============================================
// Rate Limit Headers Helper
// ============================================
/**
 * Add custom rate limit info to response
 */
function addRateLimitHeaders(res, limit, remaining, resetTime) {
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.floor(resetTime.getTime() / 1000));
}
//# sourceMappingURL=ratelimit.js.map