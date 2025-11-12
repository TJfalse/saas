/**
 * report.controller.ts
 * Handles reporting and export endpoints.
 *
 * Generates reports, exports data, and provides analytics exports.
 */

import { Request, Response, NextFunction } from "express";
import { successResponse } from "../utils/response.util";
import ReportService from "../services/report.service";
import { validateTenantAccess } from "../utils/tenant.utils";

/**
 * Get sales report
 */
export const getSalesReport = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;
    const { startDate, endDate } = req.query;

    validateTenantAccess(userTenantId, tenantId);

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    const report = await ReportService.getSalesReport(
      tenantId,
      startDate as string,
      endDate as string
    );

    return successResponse(res, report, "Sales report generated");
  } catch (error) {
    next(error);
  }
};

/**
 * Get inventory report
 */
export const getInventoryReport = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;
    const { branchId } = req.query;

    validateTenantAccess(userTenantId, tenantId);

    const report = await ReportService.getInventoryReport(
      tenantId,
      branchId as string | undefined
    );

    return successResponse(res, report, "Inventory report generated");
  } catch (error) {
    next(error);
  }
};

/**
 * Get staff performance report
 */
export const getStaffPerformanceReport = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;
    const { startDate, endDate } = req.query;

    validateTenantAccess(userTenantId, tenantId);

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    const report = await ReportService.getStaffPerformanceReport(
      tenantId,
      startDate as string,
      endDate as string
    );
    return successResponse(res, report, "Staff performance report generated");
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment report
 */
export const getPaymentReport = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;
    const { startDate, endDate } = req.query;

    validateTenantAccess(userTenantId, tenantId);

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    const report = await ReportService.getPaymentReport(
      tenantId,
      startDate as string,
      endDate as string
    );
    return successResponse(res, report, "Payment report generated");
  } catch (error) {
    next(error);
  }
};

/**
 * Export sales data
 */
export const exportSalesData = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;
    const { startDate, endDate } = req.query;

    validateTenantAccess(userTenantId, tenantId);

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    const data = await ReportService.exportSalesData(
      tenantId,
      startDate as string,
      endDate as string
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="sales-export.json"`
    );
    res.setHeader("Content-Type", "application/json");
    return res.send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard summary
 */
export const getDashboardSummary = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;

    validateTenantAccess(userTenantId, tenantId);

    const summary = await ReportService.getDashboardSummary(tenantId);
    return successResponse(res, summary, "Dashboard summary generated");
  } catch (error) {
    next(error);
  }
};
