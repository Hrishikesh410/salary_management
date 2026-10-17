import { Request, Response, NextFunction } from 'express';
import { validateEmployeeQueryParams } from '../validators/employee.validator';
import { EmployeeService, employeeService as defaultEmployeeService } from '../services/employee.service';

export class EmployeeController {
  constructor(private readonly service: EmployeeService = defaultEmployeeService) {}

  getEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedParams = validateEmployeeQueryParams(req.query);
      const result = await this.service.getEmployees(validatedParams);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const employeeController = new EmployeeController();
