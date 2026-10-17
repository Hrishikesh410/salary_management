import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app';

describe('GET /api/health', () => {
  it('should return 200 with ok status and server metadata', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('service', 'incubyte-salary-management-api');
    expect(response.body).toHaveProperty('uptime');
    expect(typeof response.body.uptime).toBe('number');
    expect(response.body).toHaveProperty('timestamp');
    expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });
});
