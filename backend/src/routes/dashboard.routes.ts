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

// Apply auth middleware to all dashboard routes
router.use(authMiddleware);

// Apply tenant middleware AFTER tenantId is extracted from params
router.get(
  "/overview/:tenantId",
  validateParams(tenantIdParamSchema),
  tenantMiddleware,
  DashboardController.getDashboardOverview
);
router.get(
  "/analytics/:tenantId",
  validateParams(tenantIdParamSchema),
  tenantMiddleware,
  validateQuery(analyticsQuerySchema),
  DashboardController.getSalesAnalytics
);
router.get(
  "/charts/:tenantId",
  validateParams(tenantIdParamSchema),
  tenantMiddleware,
  DashboardController.getRevenueCharts
);
router.get(
  "/top-products/:tenantId",
  validateParams(tenantIdParamSchema),
  tenantMiddleware,
  validateQuery(topProductsQuerySchema),
  DashboardController.getTopProducts
);

export default router;
