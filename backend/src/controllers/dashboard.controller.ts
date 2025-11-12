/**
 * dashboard.controller.ts
 * Handles dashboard and analytics endpoints.
 *
 * Provides statistics, charts, and overview data for tenants.
 */

import { Request, Response, NextFunction } from "express";
import { successResponse } from "../utils/response.util";
import * as DashboardService from "../services/dashboard.service";
import { validateTenantAccess, withTenantScope } from "../utils/tenant.utils";

/**
 * Get dashboard overview
 */
export const getDashboardOverview = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;

    // Validate tenant access
    validateTenantAccess(userTenantId, tenantId);

    const overview = await DashboardService.getDashboardOverview(tenantId);
    return successResponse(res, overview, "Dashboard overview fetched");
  } catch (error) {
    next(error);
  }
};

/**
 * Get sales analytics
 */
export const getSalesAnalytics = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;
    const { startDate, endDate } = req.query;

    // Validate tenant access
    validateTenantAccess(userTenantId, tenantId);

    const analytics = await DashboardService.getSalesAnalytics(
      tenantId,
      startDate as string,
      endDate as string
    );
    return successResponse(res, analytics, "Sales analytics fetched");
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue charts
 */
export const getRevenueCharts = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;

    // Validate tenant access
    validateTenantAccess(userTenantId, tenantId);

    const charts = await DashboardService.getRevenueCharts(tenantId);
    return successResponse(res, charts, "Revenue charts fetched");
  } catch (error) {
    next(error);
  }
};

/**
 * Get top products
 */
export const getTopProducts = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;
    const { limit = 10 } = req.query;

    // Validate tenant access
    validateTenantAccess(userTenantId, tenantId);

    const products = await DashboardService.getTopProducts(
      tenantId,
      Number(limit)
    );
    return successResponse(res, products, "Top products fetched");
  } catch (error) {
    next(error);
  }
};
