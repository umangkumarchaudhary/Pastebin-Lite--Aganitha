"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Test database connection
require("dotenv/config");
const prisma_1 = require("./lib/prisma");
async function testConnection() {
    try {
        // Try to connect and create a test paste
        const paste = await prisma_1.prisma.paste.create({
            data: {
                content: 'Hello World - Test Paste',
                language: 'text',
            },
        });
        console.log('✅ Database connection successful!');
        console.log('✅ Created test paste:', paste.id);
        // Clean up - delete the test paste
        await prisma_1.prisma.paste.delete({
            where: { id: paste.id },
        });
        console.log('✅ Deleted test paste');
        console.log('');
        console.log('🎉 Phase 1 Complete - Database is ready!');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
testConnection();
//# sourceMappingURL=test-db.js.map