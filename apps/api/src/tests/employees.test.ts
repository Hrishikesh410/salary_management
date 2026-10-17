import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { createEmployeeRouter } from '../routes/employee.routes';
import { EmployeeController } from '../controllers/employee.controller';
import { EmployeeService } from '../services/employee.service';
import { createMockPrismaClient, FIXTURE_EMPLOYEES } from './fixtures';
import { PrismaClient } from '@prisma/client';

describe('GET /api/employees API Endpoint', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    // Isolated test setup: creates a dedicated in-memory Prisma client with deterministic fixtures
    const mockPrisma = createMockPrismaClient();
    const service = new EmployeeService(mockPrisma as unknown as PrismaClient);
    const controller = new EmployeeController(service);
    const router = createEmployeeRouter(controller);
    app = createApp({ employeeRouter: router });
  });

  describe('1. Search Functionality', () => {
    it('searches by exact employee code', async () => {
      const res = await request(app).get('/api/employees?search=EMP-003');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].employeeCode).toBe('EMP-003');
      expect(res.body.data[0].name).toBe('Bob Smith');
      expect(res.body.pagination.totalCount).toBe(1);
    });

    it('searches by first name case-insensitively', async () => {
      const res = await request(app).get('/api/employees?search=aLiCe');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].firstName).toBe('Alice');
      expect(res.body.data[0].lastName).toBe('Schmidt');
    });

    it('searches by last name', async () => {
      const res = await request(app).get('/api/employees?search=Mueller');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].lastName).toBe('Mueller');
      expect(res.body.data[0].firstName).toBe('Elena');
    });

    it('searches by email address', async () => {
      const res = await request(app).get('/api/employees?search=john.doe@example.com');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].email).toBe('john.doe@example.com');
    });

    it('supports alias parameter `q` for search', async () => {
      const res = await request(app).get('/api/employees?q=Priya');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Priya Sharma');
    });
  });

  describe('2. Filter Functionality', () => {
    it('filters employees by country', async () => {
      const res = await request(app).get('/api/employees?country=DE');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data.every((e: { country: string }) => e.country === 'DE')).toBe(true);
      expect(res.body.pagination.totalCount).toBe(2);
    });

    it('filters employees by department', async () => {
      const res = await request(app).get('/api/employees?department=Engineering');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data.every((e: { department: string }) => e.department === 'Engineering')).toBe(true);
      expect(res.body.pagination.totalCount).toBe(3);
    });

    it('filters by both country and department combined', async () => {
      const res = await request(app).get('/api/employees?country=DE&department=Engineering');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Alice Schmidt');
      expect(res.body.data[0].country).toBe('DE');
      expect(res.body.data[0].department).toBe('Engineering');
    });

    it('combines search and country filter', async () => {
      const res = await request(app).get('/api/employees?country=US&search=John');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('John Doe');
    });
  });

  describe('3. Server-side Pagination & Metadata', () => {
    it('applies default pagination of page 1 and limit 25', async () => {
      const res = await request(app).get('/api/employees');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(FIXTURE_EMPLOYEES.length);
      expect(res.body.pagination).toEqual({
        page: 1,
        limit: 25,
        totalCount: 8,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('respects custom limit parameter and calculates totalPages', async () => {
      const res = await request(app).get('/api/employees?limit=3');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.pagination).toEqual({
        page: 1,
        limit: 3,
        totalCount: 8,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it('navigates to page 2 with accurate offset and navigation flags', async () => {
      const resPage1 = await request(app).get('/api/employees?limit=3&page=1');
      const resPage2 = await request(app).get('/api/employees?limit=3&page=2');

      expect(resPage2.status).toBe(200);
      expect(resPage2.body.data).toHaveLength(3);
      expect(resPage2.body.pagination.page).toBe(2);
      expect(resPage2.body.pagination.hasNextPage).toBe(true);
      expect(resPage2.body.pagination.hasPreviousPage).toBe(true);

      // Verify records on page 2 are distinct from page 1
      const page1Ids = resPage1.body.data.map((e: { id: string }) => e.id);
      const page2Ids = resPage2.body.data.map((e: { id: string }) => e.id);
      const intersection = page1Ids.filter((id: string) => page2Ids.includes(id));
      expect(intersection).toHaveLength(0);
    });

    it('returns remaining elements on the final page', async () => {
      const res = await request(app).get('/api/employees?limit=3&page=3');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2); // 8 total - 6 = 2
      expect(res.body.pagination.hasNextPage).toBe(false);
      expect(res.body.pagination.hasPreviousPage).toBe(true);
    });

    it('allows maximum allowed limit of 100', async () => {
      const res = await request(app).get('/api/employees?limit=100');

      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(100);
    });
  });

  describe('4. Allowlisted Deterministic Sorting & Tie-Breaker', () => {
    it('sorts by salary ascending', async () => {
      const res = await request(app).get('/api/employees?sortBy=salary&sortOrder=asc');

      expect(res.status).toBe(200);
      const salaries = res.body.data.map((e: { salary: string }) => parseFloat(e.salary));
      for (let i = 0; i < salaries.length - 1; i++) {
        expect(salaries[i]).toBeLessThanOrEqual(salaries[i + 1]);
      }
      expect(res.body.data[0].name).toBe('Elena Mueller'); // 60000.00
    });

    it('sorts by salary descending', async () => {
      const res = await request(app).get('/api/employees?sortBy=salary&sortOrder=desc');

      expect(res.status).toBe(200);
      const salaries = res.body.data.map((e: { salary: string }) => parseFloat(e.salary));
      for (let i = 0; i < salaries.length - 1; i++) {
        expect(salaries[i]).toBeGreaterThanOrEqual(salaries[i + 1]);
      }
      expect(res.body.data[0].name).toBe('Kenji Tanaka'); // 12000000.00
    });

    it('sorts by department ascending', async () => {
      const res = await request(app).get('/api/employees?sortBy=department&sortOrder=asc');

      expect(res.status).toBe(200);
      const departments = res.body.data.map((e: { department: string }) => e.department);
      const sorted = [...departments].sort();
      expect(departments).toEqual(sorted);
    });

    it('deterministically breaks ties using unique id ascending when sort values are identical', async () => {
      // In fixture data, Alice Schmidt ('emp-uuid-002') and Michael Brown ('emp-uuid-007') both have salary 95000.50
      const res = await request(app).get('/api/employees?sortBy=salary&sortOrder=asc');

      expect(res.status).toBe(200);
      const tiedEmployees = res.body.data.filter((e: { salary: string }) => e.salary === '95000.50');
      expect(tiedEmployees).toHaveLength(2);
      expect(tiedEmployees[0].id).toBe('emp-uuid-002'); // Alice
      expect(tiedEmployees[1].id).toBe('emp-uuid-007'); // Michael
    });
  });

  describe('5. Parameter Validation & Useful 400 Bad Request Errors', () => {
    it('returns 400 when page is less than 1', async () => {
      const res = await request(app).get('/api/employees?page=0');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Bad Request');
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'page' }),
        ])
      );
    });

    it('returns 400 when page is non-numeric', async () => {
      const res = await request(app).get('/api/employees?page=invalid');

      expect(res.status).toBe(400);
      expect(res.body.details[0].field).toBe('page');
    });

    it('returns 400 when limit exceeds maximum of 100', async () => {
      const res = await request(app).get('/api/employees?limit=101');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Bad Request');
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'limit' }),
        ])
      );
    });

    it('returns 400 when limit is less than 1', async () => {
      const res = await request(app).get('/api/employees?limit=0');

      expect(res.status).toBe(400);
      expect(res.body.details[0].field).toBe('limit');
    });

    it('returns 400 with documented allowed fields when sortBy is not allowlisted', async () => {
      const res = await request(app).get('/api/employees?sortBy=unauthorizedSecretField');

      expect(res.status).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'sortBy',
            message: expect.stringContaining('name, firstName, lastName, employeeCode'),
          }),
        ])
      );
    });

    it('returns 400 when sortOrder is neither asc nor desc', async () => {
      const res = await request(app).get('/api/employees?sortOrder=horizontal');

      expect(res.status).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'sortOrder',
            message: expect.stringContaining('asc, desc'),
          }),
        ])
      );
    });

    it('returns 400 when search query exceeds 100 characters', async () => {
      const longQuery = 'a'.repeat(101);
      const res = await request(app).get(`/api/employees?search=${longQuery}`);

      expect(res.status).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'search' }),
        ])
      );
    });

    it('returns multiple validation errors simultaneously', async () => {
      const res = await request(app).get('/api/employees?page=-1&limit=200&sortBy=badField');

      expect(res.status).toBe(400);
      expect(res.body.details).toHaveLength(3);
      const fields = res.body.details.map((d: { field: string }) => d.field);
      expect(fields).toContain('page');
      expect(fields).toContain('limit');
      expect(fields).toContain('sortBy');
    });
  });

  describe('6. Empty Result Handling', () => {
    it('returns empty array and zero metadata when search finds no matches', async () => {
      const res = await request(app).get('/api/employees?search=NonExistentQueryXYZ123');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination).toEqual({
        page: 1,
        limit: 25,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('returns empty array when filter combination produces no results', async () => {
      const res = await request(app).get('/api/employees?country=JP&department=Engineering');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.totalCount).toBe(0);
    });

    it('handles an entirely empty employee database gracefully', async () => {
      const emptyMockPrisma = createMockPrismaClient([]);
      const service = new EmployeeService(emptyMockPrisma as unknown as PrismaClient);
      const controller = new EmployeeController(service);
      const router = createEmployeeRouter(controller);
      const emptyApp = createApp({ employeeRouter: router });

      const res = await request(emptyApp).get('/api/employees');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination).toEqual({
        page: 1,
        limit: 25,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });
  });
});
