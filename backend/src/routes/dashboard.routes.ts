/**
 * dashboard.routes.ts
 * Routes for dashboard and analytics.
 */

import { Router } from "express";
import * as DashboardController from "../controllers/dashboard.controller";
import authMiddleware from "../middlewares/auth.middleware";
import tenantMiddleware from "../middlewares/tenant.middleware";
import {
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  tenantIdParamSchema,
  analyticsQuerySchema,
  topProductsQuerySchema,
} from "../validators/dashboard.validators";

const router = Router();

// Apply auth and tenant middleware to all dashboard routes
router.use(authMiddleware);
router.use(tenantMiddleware);

router.get(
  "/overview/:tenantId",
  validateParams(tenantIdParamSchema),
  DashboardController.getDashboardOverview
);
router.get(
  "/analytics/:tenantId",
  validateParams(tenantIdParamSchema),
  validateQuery(analyticsQuerySchema),
  DashboardController.getSalesAnalytics
);
router.get(
  "/charts/:tenantId",
  validateParams(tenantIdParamSchema),
  DashboardController.getRevenueCharts
);
router.get(
  "/top-products/:tenantId",
  validateParams(tenantIdParamSchema),
  validateQuery(topProductsQuerySchema),
  DashboardController.getTopProducts
);

export default router;
