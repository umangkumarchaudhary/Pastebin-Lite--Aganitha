"use strict";
/**
 * Main Express Server
 * Production-grade Pastebin API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const pastes_1 = __importDefault(require("./routes/pastes"));
const cleanup_1 = __importDefault(require("./routes/cleanup"));
const prisma_1 = require("./lib/prisma");
const ratelimit_1 = require("./lib/ratelimit");
// ============================================
// App Configuration
// ============================================
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// ============================================
// Trust Proxy (for rate limiting behind reverse proxy)
// ============================================
app.set('trust proxy', 1);
// ============================================
// Security Middleware
// ============================================
// Helmet for security headers
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
// ============================================
// Rate Limiting (Global)
// ============================================
app.use(ratelimit_1.globalRateLimiter);
// ============================================
// Body Parser
// ============================================
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
// ============================================
// Request Logging (Development)
// ============================================
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
        next();
    });
}
// ============================================
// Health Check Endpoints
// ============================================
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
    });
});
app.get('/health/db', async (req, res) => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
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
// Apply route-specific rate limiters
app.use('/api/pastes', (req, res, next) => {
    if (req.method === 'POST') {
        return (0, ratelimit_1.createPasteLimiter)(req, res, next);
    }
    if (req.method === 'GET') {
        return (0, ratelimit_1.getPasteLimiter)(req, res, next);
    }
    next();
});
// Mount paste routes
app.use('/api/pastes', pastes_1.default);
// Mount cleanup routes (for cron jobs)
app.use('/api/cleanup', cleanup_1.default);
// ============================================
// Root Endpoint
// ============================================
app.get('/', (req, res) => {
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
            cleanup: 'GET /api/cleanup (requires auth)',
            cleanupStats: 'GET /api/cleanup/stats (requires auth)',
        },
        documentation: 'https://github.com/umangkumarchaudhary/Pastebin-Lite--Aganitha',
    });
});
// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
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
app.use((err, req, res, next) => {
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
        await prisma_1.prisma.$disconnect();
        console.log('Database connection closed');
    }
    catch (error) {
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
║   🚀 Pastebin API Server v1.0.0                               ║
║                                                               ║
║   Server running on: http://localhost:${PORT}                    ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(15)}                   ║
║                                                               ║
║   Endpoints:                                                  ║
║   • POST /api/pastes         - Create a new paste             ║
║   • GET  /api/pastes/:id     - Retrieve a paste               ║
║   • GET  /api/pastes/:id/raw - Get raw paste content          ║
║   • GET  /api/cleanup        - Cleanup cron endpoint          ║
║   • GET  /api/cleanup/stats  - Get paste statistics           ║
║   • GET  /health             - Health check                   ║
║   • GET  /health/db          - Database health check          ║
║                                                               ║
║   Rate Limits:                                                ║
║   • Global: 1000 req/15min                                    ║
║   • Create: 10 pastes/min                                     ║
║   • Read:   100 req/min                                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});
exports.default = app;
//# sourceMappingURL=server.js.map