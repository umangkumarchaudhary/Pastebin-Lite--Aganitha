/**
 * API Types
 * TypeScript interfaces for API requests and responses
 */

// ============================================
// Create Paste
// ============================================

export interface CreatePasteParams {
    content: string;
    language?: string;
    expiresIn?: number;
    maxViews?: number;
}

export interface PasteResponse {
    id: string;
    url: string;
    expiresAt: string | null;
    maxViews: number | null;
    createdAt: string;
}

// ============================================
// Get Paste
// ============================================

export interface GetPasteResponse {
    id: string;
    content: string;
    language: string | null;
    createdAt: string;
    expiresAt: string | null;
    viewCount: number;
    maxViews: number | null;
    remainingViews: number | null;
    isExpired: boolean;
}

// ============================================
// API Response Wrapper
// ============================================

export type ApiResponse<T> =
    | { success: true; data: T }
    | { success: false; error: string };
