/**
 * billing.controller.ts
 * Handles billing-related endpoints.
 *
 * Manages invoices, payments, and billing information for tenants.
 */

import { Request, Response, NextFunction } from "express";
import { success } from "../utils/response.util";
import * as BillingService from "../services/billing.service";
import {
  validateTenantAccess,
  withTenantScope,
  buildPaginatedQuery,
} from "../utils/tenant.utils";

/**
 * Get billing summary for a tenant
 * GET /api/billing/summary?tenantId=xxx
 */
export const getBillingSummary = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;

    // Validate tenant access
    validateTenantAccess(userTenantId, tenantId);

    const summary = await BillingService.getBillingSummary(tenantId);
    return res
      .status(200)
      .json(success(summary, "Billing summary fetched successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * Get all invoices for a tenant with pagination
 * GET /api/billing/:tenantId/invoices?page=1&limit=10
 */
export const getInvoices = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userTenantId = req.user?.tenantId;

    // Validate tenant access
    validateTenantAccess(userTenantId, tenantId);

    const invoices = await BillingService.getInvoices(
      tenantId,
      Number(page),
      Number(limit)
    );
    return res
      .status(200)
      .json(success(invoices, "Invoices fetched successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new invoice
 * POST /api/billing/:tenantId/invoices
 * Body: { orderId, amount, tax?, discount?, dueDate? }
 */
export const createInvoice = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const invoiceData = req.body;
    const userTenantId = req.user?.tenantId;

    // Validate tenant access
    validateTenantAccess(userTenantId, tenantId);

    const invoice = await BillingService.createInvoice(tenantId, invoiceData);
    return res
      .status(201)
      .json(success(invoice, "Invoice created successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * Get invoice by ID with full details
 * GET /api/billing/:tenantId/invoices/:invoiceId
 */
export const getInvoiceById = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId, invoiceId } = req.params;
    const userTenantId = req.user?.tenantId;

    // Validate tenant access
    validateTenantAccess(userTenantId, tenantId);

    const invoice = await BillingService.getInvoiceById(invoiceId, tenantId);
    return res
      .status(200)
      .json(success(invoice, "Invoice fetched successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * Process payment for an invoice
 * POST /api/billing/:tenantId/invoices/:invoiceId/payment
 * Body: { amount, method, reference? }
 * Methods: CASH, CARD, UPI, BANK_TRANSFER, WALLET, CHEQUE
 */
export const processPayment = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId, invoiceId } = req.params;
    const { amount, method, reference } = req.body;
    const userTenantId = req.user?.tenantId;

    // Validate tenant access
    validateTenantAccess(userTenantId, tenantId);

    const result = await BillingService.processPayment(
      invoiceId,
      tenantId,
      amount,
      method.toUpperCase(),
      reference
    );
    return res
      .status(201)
      .json(success(result, "Payment processed successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * Update invoice status
 * PUT /api/billing/:tenantId/invoices/:invoiceId/status
 * Body: { status }
 * Valid statuses: DRAFT, SENT, VIEWED, PAID, OVERDUE, CANCELLED
 */
export const updateInvoiceStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId, invoiceId } = req.params;
    const { status } = req.body;

    if (!tenantId || !invoiceId) {
      return res.status(400).json({
        success: false,
        error: "tenantId and invoiceId are required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "status is required",
      });
    }

    const invoice = await BillingService.updateInvoiceStatus(
      invoiceId,
      tenantId,
      status.toUpperCase()
    );
    return res
      .status(200)
      .json(success(invoice, "Invoice status updated successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue analytics for date range
 * GET /api/billing/:tenantId/analytics?startDate=2025-01-01&endDate=2025-01-31
 */
export const getRevenueAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const { startDate, endDate } = req.query;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: "tenantId is required",
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "startDate and endDate are required",
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        error: "startDate must be before endDate",
      });
    }

    const analytics = await BillingService.getRevenueAnalytics(
      tenantId,
      start,
      end
    );
    return res
      .status(200)
      .json(success(analytics, "Revenue analytics fetched successfully"));
  } catch (error) {
    next(error);
  }
};
