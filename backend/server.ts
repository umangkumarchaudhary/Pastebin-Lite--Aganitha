/**
 * Main Express Server
 * Production-grade Pastebin API
 */

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pasteRoutes from './routes/pastes';
import { prisma } from './lib/prisma';

// ============================================
// App Configuration
// ============================================

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// Security Middleware
// ============================================

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// ============================================
// Rate Limiting
// ============================================

// Global rate limit
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 minutes
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limit for paste creation
const createPasteLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 pastes per minute
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many pastes created. Please wait a moment.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(globalLimiter);

// ============================================
// Body Parser
// ============================================

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ============================================
// Request Logging (Development)
// ============================================

if (process.env.NODE_ENV !== 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
        next();
    });
}

// ============================================
// Health Check Endpoints
// ============================================

app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

app.get('/health/db', async (req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            database: 'disconnected',
            timestamp: new Date().toISOString(),
        });
    }
});

// ============================================
// API Routes
// ============================================

// Apply stricter rate limit to paste creation
app.use('/api/pastes', (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST') {
        return createPasteLimiter(req, res, next);
    }
    next();
});

// Mount paste routes
app.use('/api/pastes', pasteRoutes);

// ============================================
// Root Endpoint
// ============================================

app.get('/', (req: Request, res: Response) => {
    res.json({
        name: 'Pastebin API',
        version: '1.0.0',
        description: 'Fast, secure paste sharing with expiration options',
        endpoints: {
            health: 'GET /health',
            healthDb: 'GET /health/db',
            createPaste: 'POST /api/pastes',
            getPaste: 'GET /api/pastes/:id',
            getRawPaste: 'GET /api/pastes/:id/raw',
        },
        documentation: 'https://github.com/your-repo/pastebin-api',
    });
});

// ============================================
// 404 Handler
// ============================================

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
    });
});

// ============================================
// Global Error Handler
// ============================================

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', err);

    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message,
        },
    });
});

// ============================================
// Graceful Shutdown
// ============================================

async function gracefulShutdown() {
    console.log('Shutting down gracefully...');

    try {
        await prisma.$disconnect();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error disconnecting from database:', error);
    }

    process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 Pastebin API Server                                      ║
║                                                               ║
║   Server running on: http://localhost:${PORT}                    ║
║   Environment: ${process.env.NODE_ENV || 'development'}                               ║
║                                                               ║
║   Endpoints:                                                  ║
║   • POST /api/pastes       - Create a new paste               ║
║   • GET  /api/pastes/:id   - Retrieve a paste                 ║
║   • GET  /api/pastes/:id/raw - Get raw paste content          ║
║   • GET  /health           - Health check                     ║
║   • GET  /health/db        - Database health check            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
