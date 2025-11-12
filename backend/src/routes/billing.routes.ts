/**
 * billing.routes.ts
 * Routes for billing operations.
 */

import { Router } from "express";
import * as BillingController from "../controllers/billing.controller";
import authMiddleware from "../middlewares/auth.middleware";
import tenantMiddleware from "../middlewares/tenant.middleware";
import {
  validateRequest,
  validateParams,
} from "../middlewares/validate.middleware";
import {
  createInvoiceSchema,
  processPaymentSchema,
  tenantIdParamSchema,
  invoiceIdParamSchema,
} from "../validators/billing.validators";

const router = Router();

// All billing routes require authentication AND tenant verification
router.use(authMiddleware);
router.use(tenantMiddleware);

// More specific routes must come FIRST (before :tenantId param)
router.get(
  "/:tenantId/summary",
  validateParams(tenantIdParamSchema),
  BillingController.getBillingSummary
);
router.get(
  "/:tenantId/invoices/:invoiceId",
  validateParams(invoiceIdParamSchema),
  BillingController.getInvoiceById
);
router.post(
  "/:tenantId/invoices/:invoiceId/payments",
  validateParams(invoiceIdParamSchema),
  validateRequest(processPaymentSchema),
  BillingController.processPayment
);

// Generic routes after specific ones
router.get(
  "/:tenantId",
  validateParams(tenantIdParamSchema),
  BillingController.getInvoices
);
router.post(
  "/:tenantId",
  validateParams(tenantIdParamSchema),
  validateRequest(createInvoiceSchema),
  BillingController.createInvoice
);

export default router;
