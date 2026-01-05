/**
 * Type definitions for Pastebin API
 * Production-grade TypeScript types
 */

import { Paste } from '@prisma/client';

// ============================================
// Request Types
// ============================================

export interface CreatePasteRequest {
    content: string;
    language?: string;
    expiresIn?: number; // minutes until expiration
    maxViews?: number;  // maximum number of views
}

// ============================================
// Response Types
// ============================================

export interface CreatePasteResponse {
    success: true;
    data: {
        id: string;
        url: string;
        expiresAt: Date | null;
        maxViews: number | null;
        createdAt: Date;
    };
}

export interface GetPasteResponse {
    success: true;
    data: {
        id: string;
        content: string;
        language: string | null;
        createdAt: Date;
        expiresAt: Date | null;
        viewCount: number;
        maxViews: number | null;
        remainingViews: number | null;
        isExpired: boolean;
    };
}

// ============================================
// Error Types
// ============================================

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: string;
    };
}

export type ApiResponse<T> = T | ApiError;

// ============================================
// Error Codes
// ============================================

export const ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    PASTE_EXPIRED: 'PASTE_EXPIRED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    CONTENT_TOO_LARGE: 'CONTENT_TOO_LARGE',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// ============================================
// Paste Type Extensions
// ============================================

export type PasteWithMetadata = Paste & {
    remainingViews?: number | null;
};

// ============================================
// Expiration Types
// ============================================

export type ExpirationPreset =
    | 'never'
    | '10min'
    | '1hour'
    | '1day'
    | '1week';

export const ExpirationMinutes: Record<ExpirationPreset, number | null> = {
    never: null,
    '10min': 10,
    '1hour': 60,
    '1day': 1440,
    '1week': 10080,
};
