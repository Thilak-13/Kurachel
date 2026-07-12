import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

let prisma;

// Create pg connection pool
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Configure Prisma Client with selective logging and driver adapter
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ 
    adapter,
    log: ['error']
  });
} else {
  // Prevent multiple instances of Prisma Client in development during nodemon reloads
  if (!global.globalPrisma) {
    global.globalPrisma = new PrismaClient({
      adapter,
      log: ['query', 'info', 'warn', 'error']
    });
  }
  prisma = global.globalPrisma;
}

export default prisma;
export { pool }; // Export raw pool in case it's needed elsewhere
