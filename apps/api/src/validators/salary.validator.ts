import { Prisma } from '@prisma/client';
import { ValidationError, ValidationErrorItem } from '../errors/AppError';

export interface ValidatedSalaryUpdate {
  id: string;
  salary: Prisma.Decimal;
  requestedCurrency?: string;
}

const MIN_SALARY = new Prisma.Decimal('0.01');
const MAX_SALARY = new Prisma.Decimal('999999999.99');

export function validateSalaryUpdateInput(
  params: Record<string, unknown>,
  body: Record<string, unknown>
): ValidatedSalaryUpdate {
  const errors: ValidationErrorItem[] = [];

  // 1. Validate employee ID in URL params
  const rawId = params.id;
  let id = '';
  if (!rawId || typeof rawId !== 'string' || rawId.trim().length === 0) {
    errors.push({
      field: 'id',
      message: 'Employee ID must be a valid non-empty string.',
      received: rawId,
    });
  } else {
    id = rawId.trim();
    if (id.length > 128) {
      errors.push({
        field: 'id',
        message: 'Employee ID is too long (maximum 128 characters).',
        received: id.length,
      });
    }
  }

  // 2. Extract and validate salary amount
  const rawSalary = body.salary ?? body.amount;
  let validatedSalary: Prisma.Decimal | null = null;

  if (rawSalary === undefined || rawSalary === null || rawSalary === '') {
    errors.push({
      field: 'salary',
      message: 'Salary amount is required.',
      received: rawSalary,
    });
  } else if (typeof rawSalary !== 'string' && typeof rawSalary !== 'number') {
    errors.push({
      field: 'salary',
      message: 'Salary must be a valid number or numeric string.',
      received: typeof rawSalary,
    });
  } else {
    const salaryStr = typeof rawSalary === 'number' ? rawSalary.toString() : rawSalary.trim();

    // Reject scientific notation, negative signs, non-numeric characters
    const numericRegex = /^\d+(\.\d+)?$/;
    if (!numericRegex.test(salaryStr)) {
      errors.push({
        field: 'salary',
        message: 'Salary must be a positive numeric value without symbols or scientific notation.',
        received: rawSalary,
      });
    } else {
      const parts = salaryStr.split('.');
      if (parts[1] && parts[1].length > 2) {
        errors.push({
          field: 'salary',
          message: 'Salary cannot have more than 2 decimal places.',
          received: salaryStr,
        });
      } else {
        try {
          const decimalVal = new Prisma.Decimal(salaryStr);

          if (decimalVal.lessThan(MIN_SALARY)) {
            errors.push({
              field: 'salary',
              message: `Salary must be at least ${MIN_SALARY.toFixed(2)}.`,
              received: salaryStr,
            });
          } else if (decimalVal.greaterThan(MAX_SALARY)) {
            errors.push({
              field: 'salary',
              message: `Salary cannot exceed ${MAX_SALARY.toFixed(2)}.`,
              received: salaryStr,
            });
          } else {
            validatedSalary = decimalVal;
          }
        } catch {
          errors.push({
            field: 'salary',
            message: 'Invalid decimal format for salary.',
            received: salaryStr,
          });
        }
      }
    }
  }

  // 3. Optional currency field validation (currency is immutable)
  let requestedCurrency: string | undefined;
  if (body.currency !== undefined && body.currency !== null && body.currency !== '') {
    if (typeof body.currency !== 'string') {
      errors.push({
        field: 'currency',
        message: 'Currency must be a string.',
        received: body.currency,
      });
    } else {
      requestedCurrency = body.currency.trim().toUpperCase();
      if (!/^[A-Z]{3}$/.test(requestedCurrency)) {
        errors.push({
          field: 'currency',
          message: 'Currency must be a valid 3-letter ISO code.',
          received: body.currency,
        });
      }
    }
  }

  if (errors.length > 0 || !validatedSalary) {
    throw new ValidationError('Invalid salary update request.', errors);
  }

  return {
    id,
    salary: validatedSalary,
    requestedCurrency,
  };
}
