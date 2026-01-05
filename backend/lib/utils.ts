/**
 * Utility functions for Pastebin API
 * Production-grade helper functions
 */

import { customAlphabet } from 'nanoid';
import { Paste } from '@prisma/client';
import { addMinutes, formatDistanceToNow, isPast } from 'date-fns';

// ============================================
// ID Generation
// ============================================

/**
 * Custom alphabet for URL-safe, readable IDs
 * Excludes similar-looking characters: 0, O, I, l, 1
 */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
const ID_LENGTH = 8;

const nanoid = customAlphabet(ALPHABET, ID_LENGTH);

/**
 * Generate a unique, URL-safe paste ID
 * Uses collision-resistant nanoid with custom alphabet
 */
export function generatePasteId(): string {
    return nanoid();
}

// ============================================
// Expiration Logic
// ============================================

/**
 * Calculate expiration date from minutes
 */
export function calculateExpiresAt(expiresInMinutes?: number): Date | null {
    if (!expiresInMinutes || expiresInMinutes <= 0) {
        return null;
    }
    return addMinutes(new Date(), expiresInMinutes);
}

/**
 * Check if a paste has expired (time-based or view-based)
 */
export function isExpired(paste: Paste): boolean {
    // Already marked as expired
    if (paste.isExpired) {
        return true;
    }

    // Time-based expiration
    if (paste.expiresAt && isPast(paste.expiresAt)) {
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
export function getExpirationReason(paste: Paste): string | null {
    if (!isExpired(paste)) {
        return null;
    }

    if (paste.expiresAt && isPast(paste.expiresAt)) {
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
export function calculateRemainingViews(paste: Paste): number | null {
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
export function formatExpirationTime(expiresAt: Date | null): string {
    if (!expiresAt) {
        return 'Never';
    }

    if (isPast(expiresAt)) {
        return 'Expired';
    }

    return `Expires ${formatDistanceToNow(expiresAt, { addSuffix: true })}`;
}

/**
 * Format view count for display
 */
export function formatViewInfo(viewCount: number, maxViews: number | null): string {
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
export const MAX_CONTENT_SIZE = 500 * 1024;

/**
 * Validate paste content
 */
export function validateContent(content: string): { valid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
        return { valid: false, error: 'Content is required' };
    }

    const byteSize = new TextEncoder().encode(content).length;
    if (byteSize > MAX_CONTENT_SIZE) {
        return {
            valid: false,
            error: `Content too large. Maximum size is ${MAX_CONTENT_SIZE / 1024}KB`
        };
    }

    return { valid: true };
}

/**
 * Validate expiration minutes
 */
export function validateExpiresIn(expiresIn?: number): { valid: boolean; error?: string } {
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
export function validateMaxViews(maxViews?: number): { valid: boolean; error?: string } {
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

export const SUPPORTED_LANGUAGES = [
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
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Validate language
 */
export function validateLanguage(language?: string): { valid: boolean; normalized?: string | null } {
    if (!language) {
        return { valid: true, normalized: null };
    }

    const normalized = language.toLowerCase().trim();

    // Accept any language - we just normalize common ones
    if (SUPPORTED_LANGUAGES.includes(normalized as SupportedLanguage)) {
        return { valid: true, normalized };
    }

    // Accept unknown languages but log for potential future support
    return { valid: true, normalized };
}
