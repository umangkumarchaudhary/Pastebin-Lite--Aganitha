"use strict";
/**
 * Paste Routes - API endpoints for paste operations
 * Production-grade REST API handlers
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const utils_1 = require("../lib/utils");
const validation_1 = require("../lib/validation");
const types_1 = require("../lib/types");
const router = (0, express_1.Router)();
// ============================================
// POST /api/pastes - Create a new paste
// ============================================
router.post('/', async (req, res) => {
    try {
        // Validate request body
        const validation = (0, validation_1.validateRequest)(validation_1.CreatePasteSchema, req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: types_1.ErrorCodes.VALIDATION_ERROR,
                    message: 'Invalid request data',
                    details: validation.errors.join(', '),
                },
            });
        }
        const { content, language, expiresIn, maxViews } = validation.data;
        // Generate unique paste ID
        const id = (0, utils_1.generatePasteId)();
        // Calculate expiration date
        const expiresAt = (0, utils_1.calculateExpiresAt)(expiresIn ?? undefined);
        // Create paste in database
        const paste = await prisma_1.prisma.paste.create({
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
    }
    catch (error) {
        console.error('Error creating paste:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: types_1.ErrorCodes.INTERNAL_ERROR,
                message: 'Failed to create paste',
            },
        });
    }
});
// ============================================
// GET /api/pastes/:id - Retrieve a paste
// ============================================
router.get('/:id', async (req, res) => {
    try {
        // Validate paste ID
        const validation = (0, validation_1.validateRequest)(validation_1.GetPasteParamsSchema, req.params);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: types_1.ErrorCodes.VALIDATION_ERROR,
                    message: 'Invalid paste ID',
                    details: validation.errors.join(', '),
                },
            });
        }
        const { id } = validation.data;
        // Fetch paste from database
        const paste = await prisma_1.prisma.paste.findUnique({
            where: { id },
        });
        // Check if paste exists
        if (!paste) {
            return res.status(404).json({
                success: false,
                error: {
                    code: types_1.ErrorCodes.NOT_FOUND,
                    message: 'Paste not found',
                },
            });
        }
        // Check if paste has expired
        if ((0, utils_1.isExpired)(paste)) {
            // Mark as expired if not already
            if (!paste.isExpired) {
                await prisma_1.prisma.paste.update({
                    where: { id },
                    data: { isExpired: true },
                });
            }
            return res.status(410).json({
                success: false,
                error: {
                    code: types_1.ErrorCodes.PASTE_EXPIRED,
                    message: (0, utils_1.getExpirationReason)(paste) || 'This paste has expired',
                },
            });
        }
        // Increment view count atomically
        const updatedPaste = await prisma_1.prisma.paste.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });
        // Check if this view caused expiration
        if (updatedPaste.maxViews !== null && updatedPaste.viewCount >= updatedPaste.maxViews) {
            await prisma_1.prisma.paste.update({
                where: { id },
                data: { isExpired: true },
            });
        }
        // Calculate remaining views
        const remainingViews = (0, utils_1.calculateRemainingViews)(updatedPaste);
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
    }
    catch (error) {
        console.error('Error retrieving paste:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: types_1.ErrorCodes.INTERNAL_ERROR,
                message: 'Failed to retrieve paste',
            },
        });
    }
});
// ============================================
// GET /api/pastes/:id/raw - Get raw paste content
// ============================================
router.get('/:id/raw', async (req, res) => {
    try {
        const { id } = req.params;
        const paste = await prisma_1.prisma.paste.findUnique({
            where: { id },
        });
        if (!paste) {
            return res.status(404).send('Paste not found');
        }
        if ((0, utils_1.isExpired)(paste)) {
            return res.status(410).send('Paste has expired');
        }
        // Increment view count
        await prisma_1.prisma.paste.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });
        // Return raw content as plain text
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send(paste.content);
    }
    catch (error) {
        console.error('Error retrieving raw paste:', error);
        return res.status(500).send('Internal server error');
    }
});
exports.default = router;
//# sourceMappingURL=pastes.js.map