"use strict";
/**
 * Zod validation schemas for API requests
 * Production-grade request validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPasteParamsSchema = exports.CreatePasteSchema = void 0;
exports.validateRequest = validateRequest;
const zod_1 = require("zod");
const utils_1 = require("./utils");
// ============================================
// Create Paste Schema
// ============================================
exports.CreatePasteSchema = zod_1.z.object({
    content: zod_1.z
        .string()
        .min(1, 'Content is required')
        .max(utils_1.MAX_CONTENT_SIZE, `Content must not exceed ${utils_1.MAX_CONTENT_SIZE / 1024}KB`)
        .transform(val => val.trim()),
    language: zod_1.z
        .string()
        .optional()
        .transform(val => val?.toLowerCase().trim() || null),
    expiresIn: zod_1.z
        .number()
        .int('Expiration time must be an integer')
        .min(0, 'Expiration time cannot be negative')
        .max(365 * 24 * 60, 'Maximum expiration is 1 year')
        .optional()
        .nullable(),
    maxViews: zod_1.z
        .number()
        .int('Max views must be an integer')
        .min(1, 'Max views must be at least 1')
        .max(1000000, 'Maximum view limit is 1,000,000')
        .optional()
        .nullable(),
});
// ============================================
// Get Paste Params Schema
// ============================================
exports.GetPasteParamsSchema = zod_1.z.object({
    id: zod_1.z
        .string()
        .min(1, 'Paste ID is required')
        .max(20, 'Invalid paste ID')
        .regex(/^[a-zA-Z0-9]+$/, 'Invalid paste ID format'),
});
// ============================================
// Validation Helper
// ============================================
function validateRequest(schema, data) {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    // Zod 4 uses 'issues' property
    const errors = result.error.issues.map((issue) => {
        const path = issue.path.join('.');
        return path ? `${path}: ${issue.message}` : issue.message;
    });
    return { success: false, errors };
}
//# sourceMappingURL=validation.js.map