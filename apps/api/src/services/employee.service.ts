import { Prisma, PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../prisma';
import { 
  EmployeeQueryParams, 
  PaginatedEmployeesResponse, 
  EmployeeResponseDto 
} from '../types/employee.types';

export class EmployeeService {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  /**
   * Fetches employees using database-level filtering, deterministic sorting, and server-side pagination.
   * Never loads all records into Node.js memory.
   */
  async getEmployees(params: EmployeeQueryParams): Promise<PaginatedEmployeesResponse> {
    const where: Prisma.EmployeeWhereInput = {};

    // 1. Database-level search across employee code, first name, last name, full name, and email
    if (params.search) {
      where.OR = [
        { employeeCode: { contains: params.search, mode: 'insensitive' } },
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    // 2. Database-level exact/case-insensitive filters
    if (params.country) {
      where.country = { equals: params.country, mode: 'insensitive' };
    }

    if (params.department) {
      where.department = { equals: params.department, mode: 'insensitive' };
    }

    if (params.currency) {
      where.currency = { equals: params.currency, mode: 'insensitive' };
    }

    // 3. Deterministic sorting with unique tie-breaker on `id`
    // Ensures stable ordering across paginated pages even when sort keys are identical
    const orderBy: Prisma.EmployeeOrderByWithRelationInput[] = [
      { [params.sortBy]: params.sortOrder },
      { id: 'asc' },
    ];

    // 4. Server-side pagination calculation
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    // 5. Atomic query execution via Prisma transaction
    const [employees, totalCount] = await this.db.$transaction([
      this.db.employee.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.db.employee.count({ where }),
    ]);

    // 6. Compute pagination metadata
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / params.limit);
    const hasNextPage = params.page < totalPages;
    const hasPreviousPage = params.page > 1 && totalPages > 0 && params.page <= totalPages + 1;

    // 7. Format data output with strict Decimal string preservation
    const data: EmployeeResponseDto[] = employees.map((emp) => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      name: emp.name,
      email: emp.email,
      jobTitle: emp.jobTitle,
      department: emp.department,
      country: emp.country,
      currency: emp.currency,
      salary: emp.salary.toFixed(2),
      createdAt: emp.createdAt.toISOString(),
      updatedAt: emp.updatedAt.toISOString(),
    }));

    return {
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }
}

export const employeeService = new EmployeeService();
