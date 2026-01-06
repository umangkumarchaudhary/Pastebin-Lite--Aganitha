/**
 * Frontend Type Definitions
 * Centralized TypeScript types for the Pastebin frontend
 */

// ============================================
// API Types (re-exported from api/types.ts)
// ============================================

export type {
    CreatePasteParams,
    PasteResponse,
    GetPasteResponse,
    ApiResponse
} from './api/types';

// ============================================
// Component Props
// ============================================

export interface PasteFormProps {
    onSuccess?: (paste: import('./api/types').PasteResponse) => void;
}

// ============================================
// Route Params
// ============================================

export interface PasteRouteParams {
    id: string;
}

// ============================================
// UI State Types
// ============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface FormState {
    content: string;
    language: string;
    expiresIn: string;
    maxViews: string;
}

export interface FormErrors {
    content?: string;
    language?: string;
    expiresIn?: string;
    maxViews?: string;
}
