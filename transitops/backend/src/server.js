import dotenv from 'dotenv';
import app from './app.js';
import prisma from './config/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Catch Uncaught Exceptions immediately
process.on('uncaughtException', (err) => {
  console.error(`[CRITICAL] Uncaught Exception: ${err.stack || err.message}`);
  console.log('Shutting down application...');
  process.exit(1);
});

// Main async runner to verify DB and start the Express server
const startServer = async () => {
  let server;
  try {
    console.log('Initializing database connection...');
    await prisma.$connect();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error(`[WARNING] Database connection failed: ${error.message}`);
    console.log('Starting server in fallback mode (database operations will fail)...');
  }

  server = app.listen(PORT, () => {
    console.log(`[INFO] Server running in [${process.env.NODE_ENV || 'development'}] mode on http://localhost:${PORT}`);
  });

  // Handle Unhandled Promise Rejections gracefully
  process.on('unhandledRejection', (err) => {
    console.error(`[CRITICAL] Unhandled Rejection: ${err.stack || err.message}`);
    console.log('Shutting down server gracefully...');
    if (server) {
      server.close(() => {
        prisma.$disconnect();
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });

  // Handle shutdown signals
  const shutdown = async (signal) => {
    console.log(`[INFO] Received ${signal}. Shutting down application gracefully...`);
    if (server) {
      server.close(async () => {
        await prisma.$disconnect();
        console.log('[INFO] Server and Database connections closed. Exit complete.');
        process.exit(0);
      });
    } else {
      await prisma.$disconnect();
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
