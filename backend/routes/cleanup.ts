/**
 * Cleanup Routes - Cron job endpoint for expired paste cleanup
 * Production-grade maintenance endpoints
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { cleanupRateLimiter } from '../lib/ratelimit';
import { ErrorCodes } from '../lib/types';

const router = Router();

// ============================================
// Middleware: Verify Cron Secret
// ============================================

function verifyCronSecret(req: Request, res: Response, next: Function) {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    // Skip auth in non-production if no secret is set
    if (process.env.NODE_ENV !== 'production' && !cronSecret) {
        console.log('Skipping cron auth in development mode');
        return next();
    }

    if (!cronSecret) {
        console.error('CRON_SECRET not configured');
        return res.status(500).json({
            success: false,
            error: {
                code: ErrorCodes.INTERNAL_ERROR,
                message: 'Server misconfiguration',
            },
        });
    }

    // Check Bearer token
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Invalid or missing authorization',
            },
        });
    }

    next();
}

// ============================================
// GET /api/cleanup - Main cleanup endpoint
// ============================================

router.get('/', cleanupRateLimiter, verifyCronSecret, async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        const now = new Date();

        // Find and mark time-expired pastes
        const timeExpired = await prisma.paste.updateMany({
            where: {
                isExpired: false,
                expiresAt: {
                    lte: now,
                },
            },
            data: {
                isExpired: true,
            },
        });

        // Find and mark view-expired pastes
        // Using raw query for comparing viewCount >= maxViews
        const viewExpiredResult = await prisma.$executeRaw`
      UPDATE "Paste" 
      SET "isExpired" = true 
      WHERE "isExpired" = false 
        AND "maxViews" IS NOT NULL 
        AND "viewCount" >= "maxViews"
    `;

        // Get statistics
        const totalExpired = await prisma.paste.count({
            where: { isExpired: true },
        });

        const totalActive = await prisma.paste.count({
            where: { isExpired: false },
        });

        const oldestActive = await prisma.paste.findFirst({
            where: { isExpired: false },
            orderBy: { createdAt: 'asc' },
            select: { createdAt: true },
        });

        const duration = Date.now() - startTime;

        return res.status(200).json({
            success: true,
            data: {
                timestamp: now.toISOString(),
                duration: `${duration}ms`,
                cleaned: {
                    timeExpired: timeExpired.count,
                    viewExpired: Number(viewExpiredResult),
                    total: timeExpired.count + Number(viewExpiredResult),
                },
                statistics: {
                    totalExpired,
                    totalActive,
                    oldestActiveDate: oldestActive?.createdAt || null,
                },
            },
        });
    } catch (error) {
        console.error('Cleanup error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: ErrorCodes.INTERNAL_ERROR,
                message: 'Cleanup failed',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
            },
        });
    }
});

// ============================================
// POST /api/cleanup/purge - Permanently delete expired pastes
// ============================================

router.post('/purge', cleanupRateLimiter, verifyCronSecret, async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        // Optional: Only purge pastes expired for more than X days
        const retentionDays = parseInt(req.query.retentionDays as string) || 7;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        // Count before deletion
        const toDelete = await prisma.paste.count({
            where: {
                isExpired: true,
                createdAt: {
                    lte: cutoffDate,
                },
            },
        });

        // Permanently delete old expired pastes
        const deleted = await prisma.paste.deleteMany({
            where: {
                isExpired: true,
                createdAt: {
                    lte: cutoffDate,
                },
            },
        });

        const duration = Date.now() - startTime;

        return res.status(200).json({
            success: true,
            data: {
                timestamp: new Date().toISOString(),
                duration: `${duration}ms`,
                retentionDays,
                cutoffDate: cutoffDate.toISOString(),
                purged: deleted.count,
            },
        });
    } catch (error) {
        console.error('Purge error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: ErrorCodes.INTERNAL_ERROR,
                message: 'Purge failed',
            },
        });
    }
});

// ============================================
// GET /api/cleanup/stats - Get cleanup statistics
// ============================================

router.get('/stats', verifyCronSecret, async (req: Request, res: Response) => {
    try {
        const [
            totalPastes,
            activePastes,
            expiredPastes,
            totalViews,
            pastesWithExpiry,
            pastesWithMaxViews,
        ] = await Promise.all([
            prisma.paste.count(),
            prisma.paste.count({ where: { isExpired: false } }),
            prisma.paste.count({ where: { isExpired: true } }),
            prisma.paste.aggregate({ _sum: { viewCount: true } }),
            prisma.paste.count({ where: { expiresAt: { not: null } } }),
            prisma.paste.count({ where: { maxViews: { not: null } } }),
        ]);

        // Get pastes by language
        const byLanguage = await prisma.paste.groupBy({
            by: ['language'],
            _count: true,
            orderBy: { _count: { language: 'desc' } },
            take: 10,
        });

        return res.status(200).json({
            success: true,
            data: {
                timestamp: new Date().toISOString(),
                totals: {
                    pastes: totalPastes,
                    active: activePastes,
                    expired: expiredPastes,
                    totalViews: totalViews._sum.viewCount || 0,
                },
                expirationTypes: {
                    withTimeExpiry: pastesWithExpiry,
                    withViewLimit: pastesWithMaxViews,
                    noExpiry: totalPastes - Math.max(pastesWithExpiry, pastesWithMaxViews),
                },
                topLanguages: byLanguage.map(l => ({
                    language: l.language || 'plain text',
                    count: l._count,
                })),
            },
        });
    } catch (error) {
        console.error('Stats error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: ErrorCodes.INTERNAL_ERROR,
                message: 'Failed to get statistics',
            },
        });
    }
});

export default router;
