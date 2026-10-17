import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { createEmployeeRouter } from '../routes/employee.routes';
import { EmployeeController } from '../controllers/employee.controller';
import { EmployeeService } from '../services/employee.service';
import { createMockPrismaClient, FIXTURE_EMPLOYEES } from './fixtures';
import { PrismaClient } from '@prisma/client';

describe('PATCH /api/employees/:id/salary Endpoint', () => {
  let app: ReturnType<typeof createApp>;
  let mockPrisma: ReturnType<typeof createMockPrismaClient>;

  beforeEach(() => {
    // Isolated test database with known deterministic fixtures
    mockPrisma = createMockPrismaClient();
    const service = new EmployeeService(mockPrisma as unknown as PrismaClient);
    const controller = new EmployeeController(service);
    const router = createEmployeeRouter(controller);
    app = createApp({ employeeRouter: router });
  });

  describe('1. Valid Salary Updates & Decimal Preservation', () => {
    it('updates salary with a valid 2-decimal string and updates updatedAt', async () => {
      const targetId = 'emp-uuid-002'; // Alice Schmidt, initial salary 95000.50 EUR
      const originalUpdatedAt = FIXTURE_EMPLOYEES.find(e => e.id === targetId)?.updatedAt.toISOString();

      const res = await request(app)
        .patch(`/api/employees/${targetId}/salary`)
        .send({ salary: '98500.75' });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(targetId);
      expect(res.body.data.salary).toBe('98500.75');
      expect(res.body.data.currency).toBe('EUR'); // Preserves currency
      expect(new Date(res.body.data.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(originalUpdatedAt!).getTime()
      );
    });

    it('updates salary with an integer string formatted to 2 decimals', async () => {
      const targetId = 'emp-uuid-001'; // John Doe, initial 125000.00 USD

      const res = await request(app)
        .patch(`/api/employees/${targetId}/salary`)
        .send({ salary: '130000' });

      expect(res.status).toBe(200);
      expect(res.body.data.salary).toBe('130000.00');
    });

    it('updates salary with a numeric input value', async () => {
      const targetId = 'emp-uuid-003'; // Bob Smith, 85000.00 GBP

      const res = await request(app)
        .patch(`/api/employees/${targetId}/salary`)
        .send({ salary: 89500.25 });

      expect(res.status).toBe(200);
      expect(res.body.data.salary).toBe('89500.25');
    });

    it('supports `amount` field alias in request body', async () => {
      const targetId = 'emp-uuid-001';

      const res = await request(app)
        .patch(`/api/employees/${targetId}/salary`)
        .send({ amount: '128000.00' });

      expect(res.status).toBe(200);
      expect(res.body.data.salary).toBe('128000.00');
    });

    it('allows salary update when matching contract currency is provided', async () => {
      const targetId = 'emp-uuid-002'; // EUR employee

      const res = await request(app)
        .patch(`/api/employees/${targetId}/salary`)
        .send({ salary: '102000.00', currency: 'EUR' });

      expect(res.status).toBe(200);
      expect(res.body.data.currency).toBe('EUR');
      expect(res.body.data.salary).toBe('102000.00');
    });

    it('accepts minimum allowable salary (0.01)', async () => {
      const targetId = 'emp-uuid-001';

      const res = await request(app)
        .patch(`/api/employees/${targetId}/salary`)
        .send({ salary: '0.01' });

      expect(res.status).toBe(200);
      expect(res.body.data.salary).toBe('0.01');
    });

    it('accepts maximum allowable salary (999,999,999.99)', async () => {
      const targetId = 'emp-uuid-001';

      const res = await request(app)
        .patch(`/api/employees/${targetId}/salary`)
        .send({ salary: '999999999.99' });

      expect(res.status).toBe(200);
      expect(res.body.data.salary).toBe('999999999.99');
    });
  });

  describe('2. Strict Currency Immutability', () => {
    it('rejects attempt to change employee contract currency with 400 error', async () => {
      const targetId = 'emp-uuid-002'; // Contract currency EUR

      const res = await request(app)
        .patch(`/api/employees/${targetId}/salary`)
        .send({ salary: '98500.00', currency: 'USD' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Bad Request');
      expect(res.body.message).toContain('Currency code is immutable');
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'currency',
            message: expect.stringContaining('EUR'),
          }),
        ])
      );
    });
  });

  describe('3. Validation of Malformed, Zero and Negative Values', () => {
    it('returns 400 for negative numeric salary', async () => {
      const res = await request(app)
        .patch('/api/employees/emp-uuid-001/salary')
        .send({ salary: -5000 });

      expect(res.status).toBe(400);
      expect(res.body.details[0].field).toBe('salary');
    });

    it('returns 400 for negative string salary', async () => {
      const res = await request(app)
        .patch('/api/employees/emp-uuid-001/salary')
        .send({ salary: '-50000.00' });

      expect(res.status).toBe(400);
      expect(res.body.details[0].field).toBe('salary');
    });

    it('returns 400 for zero salary', async () => {
      const res = await request(app)
        .patch('/api/employees/emp-uuid-001/salary')
        .send({ salary: '0.00' });

      expect(res.status).toBe(400);
      expect(res.body.details[0].field).toBe('salary');
    });

    it('returns 400 when salary has more than 2 decimal places', async () => {
      const res = await request(app)
        .patch('/api/employees/emp-uuid-001/salary')
        .send({ salary: '85000.555' });

      expect(res.status).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'salary',
            message: expect.stringContaining('more than 2 decimal places'),
          }),
        ])
      );
    });

    it('returns 400 when salary exceeds maximum ceiling', async () => {
      const res = await request(app)
        .patch('/api/employees/emp-uuid-001/salary')
        .send({ salary: '1000000000.00' });

      expect(res.status).toBe(400);
      expect(res.body.details[0].field).toBe('salary');
    });

    it('returns 400 for non-numeric input strings', async () => {
      const res = await request(app)
        .patch('/api/employees/emp-uuid-001/salary')
        .send({ salary: 'one-hundred-thousand' });

      expect(res.status).toBe(400);
      expect(res.body.details[0].field).toBe('salary');
    });

    it('returns 400 for scientific notation', async () => {
      const res = await request(app)
        .patch('/api/employees/emp-uuid-001/salary')
        .send({ salary: '1e5' });

      expect(res.status).toBe(400);
      expect(res.body.details[0].field).toBe('salary');
    });

    it('returns 400 when salary field is missing', async () => {
      const res = await request(app)
        .patch('/api/employees/emp-uuid-001/salary')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.details[0].field).toBe('salary');
    });
  });

  describe('4. Missing & Non-Existent Employees', () => {
    it('returns 404 when employee does not exist', async () => {
      const res = await request(app)
        .patch('/api/employees/non-existent-uuid-999/salary')
        .send({ salary: '85000.00' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not Found');
      expect(res.body.message).toContain('non-existent-uuid-999');
    });
  });

  describe('5. Persistence Verification', () => {
    it('persists updated salary across subsequent reads', async () => {
      const targetId = 'emp-uuid-002'; // Alice Schmidt
      const newSalary = '99999.00';

      // 1. Update salary
      const updateRes = await request(app)
        .patch(`/api/employees/${targetId}/salary`)
        .send({ salary: newSalary });
      expect(updateRes.status).toBe(200);

      // 2. Fetch employee via GET endpoint
      const readRes = await request(app).get('/api/employees?search=Alice');
      expect(readRes.status).toBe(200);
      expect(readRes.body.data).toHaveLength(1);
      expect(readRes.body.data[0].id).toBe(targetId);
      expect(readRes.body.data[0].salary).toBe('99999.00');
    });
  });
});
