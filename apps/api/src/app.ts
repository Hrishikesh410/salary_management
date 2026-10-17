import express, { Application, Request, Response, Router } from 'express';
import cors from 'cors';
import { employeeRouter as defaultEmployeeRouter } from './routes/employee.routes';
import { errorHandler } from './middleware/errorHandler';

export interface CreateAppOptions {
  employeeRouter?: Router;
}

export function createApp(options?: CreateAppOptions): Application {
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

  // Employee read/management routes
  app.use('/api/employees', options?.employeeRouter || defaultEmployeeRouter);

  // 404 handler for unknown routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource does not exist.',
    });
  });

  // Centralized error handling middleware
  app.use(errorHandler);

  return app;
}

export const app = createApp();
