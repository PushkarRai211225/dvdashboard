import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All endpoints require authentication
router.use(authenticate);

// Get all employees (Super Admin and Admin)
router.get('/', authorize('super-admin', 'admin'), getAllEmployees);

// Get specific employee (Super Admin and Admin)
router.get('/:id', authorize('super-admin', 'admin'), getEmployeeById);

// Create employee (Super Admin only)
router.post('/', authorize('super-admin'), createEmployee);

// Update employee (Super Admin only)
router.put('/:id', authorize('super-admin'), updateEmployee);

// Delete employee (Super Admin only)
router.delete('/:id', authorize('super-admin'), deleteEmployee);

export default router;
