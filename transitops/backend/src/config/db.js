import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
console.log('db.js loaded. connectionString =', connectionString);

// Create LibSQL database adapter directly from connection string for SQLite support in Prisma 7
const adapter = new PrismaLibSql({ url: connectionString });

let prisma;

// Configure database-agnostic Prisma Client with selective logging
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
