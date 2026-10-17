export const ALLOWED_SORT_FIELDS = [
  'name',
  'firstName',
  'lastName',
  'employeeCode',
  'department',
  'country',
  'salary',
  'createdAt',
] as const;

export type AllowedSortField = typeof ALLOWED_SORT_FIELDS[number];

export const ALLOWED_SORT_ORDERS = ['asc', 'desc'] as const;
export type AllowedSortOrder = typeof ALLOWED_SORT_ORDERS[number];

export interface EmployeeQueryParams {
  search?: string;
  country?: string;
  department?: string;
  currency?: string;
  page: number;
  limit: number;
  sortBy: AllowedSortField;
  sortOrder: AllowedSortOrder;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface EmployeeResponseDto {
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
  salary: string; // Serialized string to preserve decimal precision without IEEE-754 drift
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedEmployeesResponse {
  data: EmployeeResponseDto[];
  pagination: PaginationMetadata;
}
