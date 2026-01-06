/**
 * Utility functions for Pastebin API
 * Production-grade helper functions
 */
import { Paste } from '@prisma/client';
/**
 * Generate a unique, URL-safe paste ID
 * Uses collision-resistant nanoid with custom alphabet
 */
export declare function generatePasteId(): string;
/**
 * Calculate expiration date from minutes
 */
export declare function calculateExpiresAt(expiresInMinutes?: number): Date | null;
/**
 * Check if a paste has expired (time-based or view-based)
 */
export declare function isExpired(paste: Paste): boolean;
/**
 * Get expiration reason for display
 */
export declare function getExpirationReason(paste: Paste): string | null;
/**
 * Calculate remaining views
 */
export declare function calculateRemainingViews(paste: Paste): number | null;
/**
 * Format expiration time for display
 */
export declare function formatExpirationTime(expiresAt: Date | null): string;
/**
 * Format view count for display
 */
export declare function formatViewInfo(viewCount: number, maxViews: number | null): string;
/**
 * Maximum content size in bytes (500KB)
 */
export declare const MAX_CONTENT_SIZE: number;
/**
 * Validate paste content
 */
export declare function validateContent(content: string): {
    valid: boolean;
    error?: string;
};
/**
 * Validate expiration minutes
 */
export declare function validateExpiresIn(expiresIn?: number): {
    valid: boolean;
    error?: string;
};
/**
 * Validate max views
 */
export declare function validateMaxViews(maxViews?: number): {
    valid: boolean;
    error?: string;
};
export declare const SUPPORTED_LANGUAGES: readonly ["text", "javascript", "typescript", "python", "java", "cpp", "c", "csharp", "go", "rust", "ruby", "php", "swift", "kotlin", "html", "css", "scss", "json", "xml", "yaml", "markdown", "sql", "bash", "powershell"];
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
/**
 * Validate language
 */
export declare function validateLanguage(language?: string): {
    valid: boolean;
    normalized?: string | null;
};
//# sourceMappingURL=utils.d.ts.map