import dotenv from 'dotenv';
import { app } from './app';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[API] Server listening on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`[API] Health check available at http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  // eslint-disable-next-line no-console
  console.log(`\n[API] Received ${signal}. Closing HTTP server gracefully...`);
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('[API] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
