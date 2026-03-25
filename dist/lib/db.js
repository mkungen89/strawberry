"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.getDb = getDb;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
function createPrismaClient() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new client_1.PrismaClient({ adapter });
}
function getDb() {
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = createPrismaClient();
    }
    return globalForPrisma.prisma;
}
// Keep db as a shorthand
exports.db = new Proxy({}, {
    get(_target, prop) {
        return getDb()[prop];
    },
});
