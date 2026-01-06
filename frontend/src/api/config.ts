/**
 * API Configuration
 * Configure the backend API URL for different environments
 */

import type { CreatePasteParams, PasteResponse, GetPasteResponse, ApiResponse } from './types';

// Re-export types for convenience
export type { CreatePasteParams, PasteResponse, GetPasteResponse, ApiResponse };

// API Base URL - Change this to your Render backend URL after deployment
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
    pastes: `${API_BASE_URL}/api/pastes`,
    health: `${API_BASE_URL}/health`,
} as const;

/**
 * Fetch wrapper with error handling
 */
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error?.message || `Request failed with status ${response.status}`,
            };
        }

        return data;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error occurred',
        };
    }
}

/**
 * Create a new paste
 */
export async function createPaste(params: CreatePasteParams): Promise<ApiResponse<PasteResponse>> {
    return apiRequest<PasteResponse>(API_ENDPOINTS.pastes, {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

/**
 * Get a paste by ID
 */
export async function getPaste(id: string): Promise<ApiResponse<GetPasteResponse>> {
    return apiRequest<GetPasteResponse>(`${API_ENDPOINTS.pastes}/${id}`);
}

/**
 * Get raw paste content
 */
export async function getRawPaste(id: string): Promise<string | null> {
    try {
        const response = await fetch(`${API_ENDPOINTS.pastes}/${id}/raw`);
        if (!response.ok) return null;
        return response.text();
    } catch {
        return null;
    }
}
