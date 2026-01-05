/**
 * Paste Routes - API endpoints for paste operations
 * Production-grade REST API handlers
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import {
    generatePasteId,
    calculateExpiresAt,
    isExpired,
    calculateRemainingViews,
    getExpirationReason,
} from '../lib/utils';
import {
    CreatePasteSchema,
    GetPasteParamsSchema,
    validateRequest,
} from '../lib/validation';
import { ErrorCodes } from '../lib/types';

const router = Router();

// ============================================
// POST /api/pastes - Create a new paste
// ============================================

router.post('/', async (req: Request, res: Response) => {
    try {
        // Validate request body
        const validation = validateRequest(CreatePasteSchema, req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: ErrorCodes.VALIDATION_ERROR,
                    message: 'Invalid request data',
                    details: validation.errors.join(', '),
                },
            });
        }

        const { content, language, expiresIn, maxViews } = validation.data;

        // Generate unique paste ID
        const id = generatePasteId();

        // Calculate expiration date
        const expiresAt = calculateExpiresAt(expiresIn ?? undefined);

        // Create paste in database
        const paste = await prisma.paste.create({
            data: {
                id,
                content,
                language,
                expiresAt,
                maxViews: maxViews ?? null,
            },
        });

        // Build response
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;

        return res.status(201).json({
            success: true,
            data: {
                id: paste.id,
                url: `${baseUrl}/api/pastes/${paste.id}`,
                expiresAt: paste.expiresAt,
                maxViews: paste.maxViews,
                createdAt: paste.createdAt,
            },
        });
    } catch (error) {
        console.error('Error creating paste:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: ErrorCodes.INTERNAL_ERROR,
                message: 'Failed to create paste',
            },
        });
    }
});

// ============================================
// GET /api/pastes/:id - Retrieve a paste
// ============================================

router.get('/:id', async (req: Request, res: Response) => {
    try {
        // Validate paste ID
        const validation = validateRequest(GetPasteParamsSchema, req.params);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: ErrorCodes.VALIDATION_ERROR,
                    message: 'Invalid paste ID',
                    details: validation.errors.join(', '),
                },
            });
        }

        const { id } = validation.data;

        // Fetch paste from database
        const paste = await prisma.paste.findUnique({
            where: { id },
        });

        // Check if paste exists
        if (!paste) {
            return res.status(404).json({
                success: false,
                error: {
                    code: ErrorCodes.NOT_FOUND,
                    message: 'Paste not found',
                },
            });
        }

        // Check if paste has expired
        if (isExpired(paste)) {
            // Mark as expired if not already
            if (!paste.isExpired) {
                await prisma.paste.update({
                    where: { id },
                    data: { isExpired: true },
                });
            }

            return res.status(410).json({
                success: false,
                error: {
                    code: ErrorCodes.PASTE_EXPIRED,
                    message: getExpirationReason(paste) || 'This paste has expired',
                },
            });
        }

        // Increment view count atomically
        const updatedPaste = await prisma.paste.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });

        // Check if this view caused expiration
        if (updatedPaste.maxViews !== null && updatedPaste.viewCount >= updatedPaste.maxViews) {
            await prisma.paste.update({
                where: { id },
                data: { isExpired: true },
            });
        }

        // Calculate remaining views
        const remainingViews = calculateRemainingViews(updatedPaste);

        return res.status(200).json({
            success: true,
            data: {
                id: updatedPaste.id,
                content: updatedPaste.content,
                language: updatedPaste.language,
                createdAt: updatedPaste.createdAt,
                expiresAt: updatedPaste.expiresAt,
                viewCount: updatedPaste.viewCount,
                maxViews: updatedPaste.maxViews,
                remainingViews,
                isExpired: updatedPaste.isExpired,
            },
        });
    } catch (error) {
        console.error('Error retrieving paste:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: ErrorCodes.INTERNAL_ERROR,
                message: 'Failed to retrieve paste',
            },
        });
    }
});

// ============================================
// GET /api/pastes/:id/raw - Get raw paste content
// ============================================

router.get('/:id/raw', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const paste = await prisma.paste.findUnique({
            where: { id },
        });

        if (!paste) {
            return res.status(404).send('Paste not found');
        }

        if (isExpired(paste)) {
            return res.status(410).send('Paste has expired');
        }

        // Increment view count
        await prisma.paste.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });

        // Return raw content as plain text
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send(paste.content);
    } catch (error) {
        console.error('Error retrieving raw paste:', error);
        return res.status(500).send('Internal server error');
    }
});

export default router;
