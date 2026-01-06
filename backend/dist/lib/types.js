"use strict";
/**
 * Type definitions for Pastebin API
 * Production-grade TypeScript types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpirationMinutes = exports.ErrorCodes = void 0;
// ============================================
// Error Codes
// ============================================
exports.ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    PASTE_EXPIRED: 'PASTE_EXPIRED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    CONTENT_TOO_LARGE: 'CONTENT_TOO_LARGE',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
};
exports.ExpirationMinutes = {
    never: null,
    '10min': 10,
    '1hour': 60,
    '1day': 1440,
    '1week': 10080,
};
//# sourceMappingURL=types.js.map