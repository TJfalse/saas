/**
 * report.routes.ts
 * Routes for reporting and exports.
 */

import { Router } from "express";
import {
  getSalesReport,
  getInventoryReport,
  getStaffPerformanceReport,
  getPaymentReport,
  exportSalesData,
  getDashboardSummary,
} from "../controllers/report.controller";
import authMiddleware from "../middlewares/auth.middleware";
import tenantMiddleware from "../middlewares/tenant.middleware";
import {
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  salesReportQuerySchema,
  inventoryReportQuerySchema,
  staffPerformanceQuerySchema,
  paymentReportQuerySchema,
  tenantIdParamSchema,
} from "../validators/report.validators";

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get(
  "/sales/:tenantId",
  validateParams(tenantIdParamSchema),
  validateQuery(salesReportQuerySchema),
  getSalesReport
);
router.get(
  "/inventory/:tenantId",
  validateParams(tenantIdParamSchema),
  validateQuery(inventoryReportQuerySchema),
  getInventoryReport
);
router.get(
  "/staff/:tenantId",
  validateParams(tenantIdParamSchema),
  validateQuery(staffPerformanceQuerySchema),
  getStaffPerformanceReport
);
router.get(
  "/payment/:tenantId",
  validateParams(tenantIdParamSchema),
  validateQuery(paymentReportQuerySchema),
  getPaymentReport
);
router.get(
  "/dashboard/:tenantId",
  validateParams(tenantIdParamSchema),
  getDashboardSummary
);
router.post(
  "/export/sales/:tenantId",
  validateParams(tenantIdParamSchema),
  exportSalesData
);

export default router;
