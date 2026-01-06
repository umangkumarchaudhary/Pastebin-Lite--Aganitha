/**
 * Zod validation schemas for API requests
 * Production-grade request validation
 */
import { z } from 'zod';
export declare const CreatePasteSchema: z.ZodObject<{
    content: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    language: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | null, string | undefined>>;
    expiresIn: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    maxViews: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export type CreatePasteInput = z.infer<typeof CreatePasteSchema>;
export declare const GetPasteParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type GetPasteParams = z.infer<typeof GetPasteParamsSchema>;
export declare function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: true;
    data: T;
} | {
    success: false;
    errors: string[];
};
//# sourceMappingURL=validation.d.ts.map