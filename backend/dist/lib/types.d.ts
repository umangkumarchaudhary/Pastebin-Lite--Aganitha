/**
 * Type definitions for Pastebin API
 * Production-grade TypeScript types
 */
import { Paste } from '@prisma/client';
export interface CreatePasteRequest {
    content: string;
    language?: string;
    expiresIn?: number;
    maxViews?: number;
}
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
export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: string;
    };
}
export type ApiResponse<T> = T | ApiError;
export declare const ErrorCodes: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly PASTE_EXPIRED: "PASTE_EXPIRED";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
    readonly CONTENT_TOO_LARGE: "CONTENT_TOO_LARGE";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
};
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
export type PasteWithMetadata = Paste & {
    remainingViews?: number | null;
};
export type ExpirationPreset = 'never' | '10min' | '1hour' | '1day' | '1week';
export declare const ExpirationMinutes: Record<ExpirationPreset, number | null>;
//# sourceMappingURL=types.d.ts.map