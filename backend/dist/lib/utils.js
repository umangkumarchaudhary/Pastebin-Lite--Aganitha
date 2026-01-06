"use strict";
/**
 * Utility functions for Pastebin API
 * Production-grade helper functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_LANGUAGES = exports.MAX_CONTENT_SIZE = void 0;
exports.generatePasteId = generatePasteId;
exports.calculateExpiresAt = calculateExpiresAt;
exports.isExpired = isExpired;
exports.getExpirationReason = getExpirationReason;
exports.calculateRemainingViews = calculateRemainingViews;
exports.formatExpirationTime = formatExpirationTime;
exports.formatViewInfo = formatViewInfo;
exports.validateContent = validateContent;
exports.validateExpiresIn = validateExpiresIn;
exports.validateMaxViews = validateMaxViews;
exports.validateLanguage = validateLanguage;
const nanoid_1 = require("nanoid");
const date_fns_1 = require("date-fns");
// ============================================
// ID Generation
// ============================================
/**
 * Custom alphabet for URL-safe, readable IDs
 * Excludes similar-looking characters: 0, O, I, l, 1
 */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
const ID_LENGTH = 8;
const nanoid = (0, nanoid_1.customAlphabet)(ALPHABET, ID_LENGTH);
/**
 * Generate a unique, URL-safe paste ID
 * Uses collision-resistant nanoid with custom alphabet
 */
function generatePasteId() {
    return nanoid();
}
// ============================================
// Expiration Logic
// ============================================
/**
 * Calculate expiration date from minutes
 */
function calculateExpiresAt(expiresInMinutes) {
    if (!expiresInMinutes || expiresInMinutes <= 0) {
        return null;
    }
    return (0, date_fns_1.addMinutes)(new Date(), expiresInMinutes);
}
/**
 * Check if a paste has expired (time-based or view-based)
 */
function isExpired(paste) {
    // Already marked as expired
    if (paste.isExpired) {
        return true;
    }
    // Time-based expiration
    if (paste.expiresAt && (0, date_fns_1.isPast)(paste.expiresAt)) {
        return true;
    }
    // View-based expiration
    if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
        return true;
    }
    return false;
}
/**
 * Get expiration reason for display
 */
function getExpirationReason(paste) {
    if (!isExpired(paste)) {
        return null;
    }
    if (paste.expiresAt && (0, date_fns_1.isPast)(paste.expiresAt)) {
        return 'This paste has expired due to time limit';
    }
    if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
        return 'This paste has expired due to view limit';
    }
    return 'This paste has been deleted';
}
/**
 * Calculate remaining views
 */
function calculateRemainingViews(paste) {
    if (paste.maxViews === null) {
        return null;
    }
    return Math.max(0, paste.maxViews - paste.viewCount);
}
// ============================================
// Formatting Utilities
// ============================================
/**
 * Format expiration time for display
 */
function formatExpirationTime(expiresAt) {
    if (!expiresAt) {
        return 'Never';
    }
    if ((0, date_fns_1.isPast)(expiresAt)) {
        return 'Expired';
    }
    return `Expires ${(0, date_fns_1.formatDistanceToNow)(expiresAt, { addSuffix: true })}`;
}
/**
 * Format view count for display
 */
function formatViewInfo(viewCount, maxViews) {
    if (maxViews === null) {
        return `${viewCount} views`;
    }
    return `${viewCount}/${maxViews} views`;
}
// ============================================
// Validation Utilities
// ============================================
/**
 * Maximum content size in bytes (500KB)
 */
exports.MAX_CONTENT_SIZE = 500 * 1024;
/**
 * Validate paste content
 */
function validateContent(content) {
    if (!content || content.trim().length === 0) {
        return { valid: false, error: 'Content is required' };
    }
    const byteSize = new TextEncoder().encode(content).length;
    if (byteSize > exports.MAX_CONTENT_SIZE) {
        return {
            valid: false,
            error: `Content too large. Maximum size is ${exports.MAX_CONTENT_SIZE / 1024}KB`
        };
    }
    return { valid: true };
}
/**
 * Validate expiration minutes
 */
function validateExpiresIn(expiresIn) {
    if (expiresIn === undefined || expiresIn === null) {
        return { valid: true };
    }
    if (!Number.isInteger(expiresIn) || expiresIn < 0) {
        return { valid: false, error: 'Expiration time must be a positive integer' };
    }
    // Maximum expiration: 1 year
    const maxMinutes = 365 * 24 * 60;
    if (expiresIn > maxMinutes) {
        return { valid: false, error: 'Maximum expiration time is 1 year' };
    }
    return { valid: true };
}
/**
 * Validate max views
 */
function validateMaxViews(maxViews) {
    if (maxViews === undefined || maxViews === null) {
        return { valid: true };
    }
    if (!Number.isInteger(maxViews) || maxViews < 1) {
        return { valid: false, error: 'Max views must be at least 1' };
    }
    // Maximum views limit
    const maxAllowed = 1000000;
    if (maxViews > maxAllowed) {
        return { valid: false, error: 'Maximum view limit is 1,000,000' };
    }
    return { valid: true };
}
// ============================================
// Supported Languages
// ============================================
exports.SUPPORTED_LANGUAGES = [
    'text',
    'javascript',
    'typescript',
    'python',
    'java',
    'cpp',
    'c',
    'csharp',
    'go',
    'rust',
    'ruby',
    'php',
    'swift',
    'kotlin',
    'html',
    'css',
    'scss',
    'json',
    'xml',
    'yaml',
    'markdown',
    'sql',
    'bash',
    'powershell',
];
/**
 * Validate language
 */
function validateLanguage(language) {
    if (!language) {
        return { valid: true, normalized: null };
    }
    const normalized = language.toLowerCase().trim();
    // Accept any language - we just normalize common ones
    if (exports.SUPPORTED_LANGUAGES.includes(normalized)) {
        return { valid: true, normalized };
    }
    // Accept unknown languages but log for potential future support
    return { valid: true, normalized };
}
//# sourceMappingURL=utils.js.map