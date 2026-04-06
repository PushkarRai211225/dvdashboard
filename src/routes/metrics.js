import express from 'express';
import {
  submitMetrics,
  getEmployeeMetrics,
  getTeamMetrics,
  getOrganizationMetrics,
  getAggregatedMetrics,
  getActivityReport,
} from '../controllers/metricsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All endpoints require authentication
router.use(authenticate);

// Employee submits their own metrics
router.post('/submit', submitMetrics);

// Get employee metrics (Employee can see own, Admin/Super Admin can see all)
router.get('/employee/:employeeId', getEmployeeMetrics);

// Get team metrics (Admin/Super Admin only)
router.get('/team/:team', authorize('super-admin', 'admin'), getTeamMetrics);

// Get organization metrics (Admin/Super Admin only)
router.get('/organization', authorize('super-admin', 'admin'), getOrganizationMetrics);

// Get aggregated metrics with period filter
router.get('/aggregated', getAggregatedMetrics);

// Get activity filing report (Admin/Super Admin only)
router.get('/report/activity', authorize('super-admin', 'admin'), getActivityReport);

export default router;
