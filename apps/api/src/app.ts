import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';

export function createApp(): Application {
  const app: Application = express();

  // Standard middleware
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health endpoint required by requirements
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'incubyte-salary-management-api',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource does not exist.',
    });
  });

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled server error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
    });
  });

  return app;
}

export const app = createApp();
