import { 
  ALLOWED_SORT_FIELDS, 
  ALLOWED_SORT_ORDERS, 
  AllowedSortField, 
  AllowedSortOrder, 
  EmployeeQueryParams 
} from '../types/employee.types';
import { ValidationError, ValidationErrorItem } from '../errors/AppError';

export function validateEmployeeQueryParams(rawQuery: Record<string, unknown>): EmployeeQueryParams {
  const errors: ValidationErrorItem[] = [];

  // 1. Search / Keyword filter (supports query param `search` or alias `q`)
  let search: string | undefined;
  const rawSearch = rawQuery.search ?? rawQuery.q;
  if (rawSearch !== undefined && rawSearch !== null && rawSearch !== '') {
    if (typeof rawSearch !== 'string') {
      errors.push({
        field: 'search',
        message: 'Search parameter must be a string.',
        received: rawSearch,
      });
    } else {
      const trimmed = rawSearch.trim();
      if (trimmed.length > 100) {
        errors.push({
          field: 'search',
          message: 'Search query must not exceed 100 characters.',
          received: trimmed.length,
        });
      } else if (trimmed.length > 0) {
        search = trimmed;
      }
    }
  }

  // 2. Country filter
  let country: string | undefined;
  if (rawQuery.country !== undefined && rawQuery.country !== null && rawQuery.country !== '') {
    if (typeof rawQuery.country !== 'string') {
      errors.push({
        field: 'country',
        message: 'Country parameter must be a string.',
        received: rawQuery.country,
      });
    } else {
      const trimmed = rawQuery.country.trim();
      if (trimmed.length > 100) {
        errors.push({
          field: 'country',
          message: 'Country filter must not exceed 100 characters.',
          received: trimmed.length,
        });
      } else if (trimmed.length > 0) {
        country = trimmed;
      }
    }
  }

  // 3. Department filter
  let department: string | undefined;
  if (rawQuery.department !== undefined && rawQuery.department !== null && rawQuery.department !== '') {
    if (typeof rawQuery.department !== 'string') {
      errors.push({
        field: 'department',
        message: 'Department parameter must be a string.',
        received: rawQuery.department,
      });
    } else {
      const trimmed = rawQuery.department.trim();
      if (trimmed.length > 100) {
        errors.push({
          field: 'department',
          message: 'Department filter must not exceed 100 characters.',
          received: trimmed.length,
        });
      } else if (trimmed.length > 0) {
        department = trimmed;
      }
    }
  }

  // 4. Currency filter (optional)
  let currency: string | undefined;
  if (rawQuery.currency !== undefined && rawQuery.currency !== null && rawQuery.currency !== '') {
    if (typeof rawQuery.currency !== 'string') {
      errors.push({
        field: 'currency',
        message: 'Currency parameter must be a string.',
        received: rawQuery.currency,
      });
    } else {
      const trimmed = rawQuery.currency.trim().toUpperCase();
      if (!/^[A-Z]{3}$/.test(trimmed)) {
        errors.push({
          field: 'currency',
          message: 'Currency filter must be a valid 3-letter ISO code (e.g. USD, EUR, INR).',
          received: trimmed,
        });
      } else {
        currency = trimmed;
      }
    }
  }

  // 5. Pagination: Page
  let page = 1;
  if (rawQuery.page !== undefined && rawQuery.page !== null && rawQuery.page !== '') {
    const parsedPage = Number(rawQuery.page);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      errors.push({
        field: 'page',
        message: 'Page parameter must be an integer greater than or equal to 1.',
        received: rawQuery.page,
      });
    } else {
      page = parsedPage;
    }
  }

  // 6. Pagination: Limit (default 25, max 100)
  let limit = 25;
  if (rawQuery.limit !== undefined && rawQuery.limit !== null && rawQuery.limit !== '') {
    const parsedLimit = Number(rawQuery.limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      errors.push({
        field: 'limit',
        message: 'Limit parameter must be an integer between 1 and 100.',
        received: rawQuery.limit,
      });
    } else {
      limit = parsedLimit;
    }
  }

  // 7. Sorting: Sort Field
  let sortBy: AllowedSortField = 'name';
  if (rawQuery.sortBy !== undefined && rawQuery.sortBy !== null && rawQuery.sortBy !== '') {
    if (typeof rawQuery.sortBy !== 'string' || !ALLOWED_SORT_FIELDS.includes(rawQuery.sortBy as AllowedSortField)) {
      errors.push({
        field: 'sortBy',
        message: `Sort field must be one of: ${ALLOWED_SORT_FIELDS.join(', ')}.`,
        received: rawQuery.sortBy,
      });
    } else {
      sortBy = rawQuery.sortBy as AllowedSortField;
    }
  }

  // 8. Sorting: Sort Order
  let sortOrder: AllowedSortOrder = 'asc';
  if (rawQuery.sortOrder !== undefined && rawQuery.sortOrder !== null && rawQuery.sortOrder !== '') {
    if (typeof rawQuery.sortOrder !== 'string') {
      errors.push({
        field: 'sortOrder',
        message: `Sort order must be one of: ${ALLOWED_SORT_ORDERS.join(', ')}.`,
        received: rawQuery.sortOrder,
      });
    } else {
      const lowerOrder = rawQuery.sortOrder.toLowerCase();
      if (!ALLOWED_SORT_ORDERS.includes(lowerOrder as AllowedSortOrder)) {
        errors.push({
          field: 'sortOrder',
          message: `Sort order must be one of: ${ALLOWED_SORT_ORDERS.join(', ')}.`,
          received: rawQuery.sortOrder,
        });
      } else {
        sortOrder = lowerOrder as AllowedSortOrder;
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Invalid query parameters provided for employee search.', errors);
  }

  return {
    search,
    country,
    department,
    currency,
    page,
    limit,
    sortBy,
    sortOrder,
  };
}
