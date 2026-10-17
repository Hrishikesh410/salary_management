import { Prisma } from '@prisma/client';

export interface TestEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  country: string;
  currency: string;
  salary: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export const FIXTURE_EMPLOYEES: TestEmployee[] = [
  {
    id: 'emp-uuid-001',
    employeeCode: 'EMP-001',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    email: 'john.doe@example.com',
    jobTitle: 'Senior Software Engineer',
    department: 'Engineering',
    country: 'US',
    currency: 'USD',
    salary: new Prisma.Decimal('125000.00'),
    createdAt: new Date('2024-01-15T10:00:00.000Z'),
    updatedAt: new Date('2024-01-15T10:00:00.000Z'),
  },
  {
    id: 'emp-uuid-002',
    employeeCode: 'EMP-002',
    firstName: 'Alice',
    lastName: 'Schmidt',
    name: 'Alice Schmidt',
    email: 'alice.schmidt@example.de',
    jobTitle: 'Engineering Lead',
    department: 'Engineering',
    country: 'DE',
    currency: 'EUR',
    salary: new Prisma.Decimal('95000.50'),
    createdAt: new Date('2024-02-01T10:00:00.000Z'),
    updatedAt: new Date('2024-02-01T10:00:00.000Z'),
  },
  {
    id: 'emp-uuid-003',
    employeeCode: 'EMP-003',
    firstName: 'Bob',
    lastName: 'Smith',
    name: 'Bob Smith',
    email: 'bob.smith@example.co.uk',
    jobTitle: 'Product Manager',
    department: 'Product',
    country: 'UK',
    currency: 'GBP',
    salary: new Prisma.Decimal('85000.00'),
    createdAt: new Date('2024-02-15T10:00:00.000Z'),
    updatedAt: new Date('2024-02-15T10:00:00.000Z'),
  },
  {
    id: 'emp-uuid-004',
    employeeCode: 'EMP-004',
    firstName: 'Priya',
    lastName: 'Sharma',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.in',
    jobTitle: 'Senior DevOps Engineer',
    department: 'Engineering',
    country: 'IN',
    currency: 'INR',
    salary: new Prisma.Decimal('2800000.00'),
    createdAt: new Date('2024-03-01T10:00:00.000Z'),
    updatedAt: new Date('2024-03-01T10:00:00.000Z'),
  },
  {
    id: 'emp-uuid-005',
    employeeCode: 'EMP-005',
    firstName: 'Kenji',
    lastName: 'Tanaka',
    name: 'Kenji Tanaka',
    email: 'kenji.tanaka@example.jp',
    jobTitle: 'HR Director',
    department: 'Human Resources',
    country: 'JP',
    currency: 'JPY',
    salary: new Prisma.Decimal('12000000.00'),
    createdAt: new Date('2024-03-15T10:00:00.000Z'),
    updatedAt: new Date('2024-03-15T10:00:00.000Z'),
  },
  {
    id: 'emp-uuid-006',
    employeeCode: 'EMP-006',
    firstName: 'Elena',
    lastName: 'Mueller',
    name: 'Elena Mueller',
    email: 'elena.mueller@example.de',
    jobTitle: 'HR Specialist',
    department: 'Human Resources',
    country: 'DE',
    currency: 'EUR',
    salary: new Prisma.Decimal('60000.00'),
    createdAt: new Date('2024-04-01T10:00:00.000Z'),
    updatedAt: new Date('2024-04-01T10:00:00.000Z'),
  },
  {
    id: 'emp-uuid-007',
    employeeCode: 'EMP-007',
    firstName: 'Michael',
    lastName: 'Brown',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    jobTitle: 'Account Executive',
    department: 'Sales',
    country: 'US',
    currency: 'USD',
    salary: new Prisma.Decimal('95000.50'), // Equal to Alice for tie-breaker verification
    createdAt: new Date('2024-04-15T10:00:00.000Z'),
    updatedAt: new Date('2024-04-15T10:00:00.000Z'),
  },
  {
    id: 'emp-uuid-008',
    employeeCode: 'EMP-008',
    firstName: 'Sarah',
    lastName: 'Connor',
    name: 'Sarah Connor',
    email: 'sarah.connor@example.com',
    jobTitle: 'Financial Analyst',
    department: 'Finance',
    country: 'US',
    currency: 'USD',
    salary: new Prisma.Decimal('92000.00'),
    createdAt: new Date('2024-05-01T10:00:00.000Z'),
    updatedAt: new Date('2024-05-01T10:00:00.000Z'),
  },
];

/**
 * Creates an isolated mock PrismaClient that filters, sorts, and paginates in-memory data
 * mimicking PostgreSQL behavior without network or database dependencies.
 */
export function createMockPrismaClient(fixtures: TestEmployee[] = FIXTURE_EMPLOYEES) {
  const employees = [...fixtures];

  function matchesWhere(emp: TestEmployee, where?: Prisma.EmployeeWhereInput): boolean {
    if (!where) return true;

    // Check OR condition
    if (where.OR && Array.isArray(where.OR)) {
      const orMatched = where.OR.some((condition) => {
        return Object.entries(condition).some(([field, filterObj]) => {
          const empVal = String((emp as unknown as Record<string, unknown>)[field] || '');
          const filter = filterObj as { contains?: string; equals?: string };
          if (filter.contains) {
            return empVal.toLowerCase().includes(filter.contains.toLowerCase());
          }
          if (filter.equals) {
            return empVal.toLowerCase() === filter.equals.toLowerCase();
          }
          return false;
        });
      });
      if (!orMatched) return false;
    }

    // Check Country
    if (where.country) {
      const countryFilter = where.country as { equals?: string };
      const expected = countryFilter.equals || String(where.country);
      if (emp.country.toLowerCase() !== expected.toLowerCase()) {
        return false;
      }
    }

    // Check Department
    if (where.department) {
      const deptFilter = where.department as { equals?: string };
      const expected = deptFilter.equals || String(where.department);
      if (emp.department.toLowerCase() !== expected.toLowerCase()) {
        return false;
      }
    }

    // Check Currency
    if (where.currency) {
      const currFilter = where.currency as { equals?: string };
      const expected = currFilter.equals || String(where.currency);
      if (emp.currency.toUpperCase() !== expected.toUpperCase()) {
        return false;
      }
    }

    return true;
  }

  const mockClient = {
    employee: {
      findMany: async (args: Prisma.EmployeeFindManyArgs) => {
        let results = employees.filter((emp) => matchesWhere(emp, args.where));

        // Sorting
        if (args.orderBy && Array.isArray(args.orderBy)) {
          results.sort((a, b) => {
            for (const orderClause of args.orderBy as Prisma.EmployeeOrderByWithRelationInput[]) {
              const [field, direction] = Object.entries(orderClause)[0] as [keyof TestEmployee, 'asc' | 'desc'];
              const valA = a[field];
              const valB = b[field];

              let comparison = 0;
              if (valA instanceof Prisma.Decimal && valB instanceof Prisma.Decimal) {
                comparison = valA.comparedTo(valB);
              } else if (valA instanceof Date && valB instanceof Date) {
                comparison = valA.getTime() - valB.getTime();
              } else if (typeof valA === 'string' && typeof valB === 'string') {
                comparison = valA.localeCompare(valB);
              } else if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
              }

              if (comparison !== 0) {
                return direction === 'desc' ? -comparison : comparison;
              }
            }
            return 0;
          });
        }

        // Pagination
        const skip = args.skip || 0;
        const take = args.take !== undefined ? args.take : results.length;
        return results.slice(skip, skip + take);
      },

      count: async (args?: Prisma.EmployeeCountArgs) => {
        const results = employees.filter((emp) => matchesWhere(emp, args?.where));
        return results.length;
      },

      findUnique: async (args: Prisma.EmployeeFindUniqueArgs) => {
        const found = employees.find((emp) => {
          if (args.where.id && emp.id === args.where.id) return true;
          if (args.where.email && emp.email === args.where.email) return true;
          if (args.where.employeeCode && emp.employeeCode === args.where.employeeCode) return true;
          return false;
        });
        return found ? { ...found } : null;
      },

      update: async (args: Prisma.EmployeeUpdateArgs) => {
        const index = employees.findIndex((emp) => {
          if (args.where.id && emp.id === args.where.id) return true;
          if (args.where.email && emp.email === args.where.email) return true;
          if (args.where.employeeCode && emp.employeeCode === args.where.employeeCode) return true;
          return false;
        });

        if (index === -1) {
          throw new Error('Record to update not found.');
        }

        const current = employees[index];
        const data = args.data as Partial<TestEmployee>;
        const updated: TestEmployee = {
          ...current,
          ...data,
          salary: data.salary !== undefined ? new Prisma.Decimal(data.salary.toString()) : current.salary,
          updatedAt: (data.updatedAt instanceof Date ? data.updatedAt : new Date()),
        };

        employees[index] = updated;
        return { ...updated };
      },
    },

    $transaction: async (queries: unknown) => {
      if (Array.isArray(queries)) {
        return Promise.all(queries);
      }
      if (typeof queries === 'function') {
        return (queries as (tx: unknown) => Promise<unknown>)(mockClient);
      }
      return queries;
    },
  };

  return mockClient;
}
