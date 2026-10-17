import { Router } from 'express';
import { EmployeeController, employeeController as defaultEmployeeController } from '../controllers/employee.controller';

export function createEmployeeRouter(controller: EmployeeController = defaultEmployeeController): Router {
  const router = Router();

  // GET /api/employees
  router.get('/', controller.getEmployees);

  return router;
}

export const employeeRouter = createEmployeeRouter();
