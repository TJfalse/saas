/**
 * subscriptionRoutes.ts
 * SaaS Subscription Management Routes
 *
 * All routes require authentication and proper RBAC
 */

import express, { Router } from "express";
import * as SubscriptionController from "../controllers/subscription.controller";
import authMiddleware from "../middlewares/auth.middleware";
import tenantMiddleware from "../middlewares/tenant.middleware";

const router: Router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/subscriptions/:tenantId
 * Get subscription for specific tenant (customer view)
 */
router.get(
  "/:tenantId",
  tenantMiddleware,
  SubscriptionController.getSubscription
);

// ==================== ADMIN-ONLY ROUTES ====================

/**
 * GET /api/admin/subscriptions
 * List all subscriptions with filtering (admin dashboard)
 */
router.get("/admin", SubscriptionController.getAllSubscriptions);

/**
 * POST /api/admin/subscriptions
 * Create new subscription for tenant
 */
router.post("/admin", SubscriptionController.createSubscription);

/**
 * PATCH /api/admin/subscriptions/:tenantId
 * Update subscription (plan, amount, status)
 */
router.patch("/admin/:tenantId", SubscriptionController.updateSubscription);

/**
 * DELETE /api/admin/subscriptions/:tenantId
 * Cancel subscription (gracefully or immediately)
 */
router.delete("/admin/:tenantId", SubscriptionController.cancelSubscription);

/**
 * GET /api/admin/subscriptions/expiring/soon
 * Get subscriptions expiring in next N days
 */
router.get(
  "/admin/expiring/soon",
  SubscriptionController.getExpiringSubscriptions
);

/**
 * GET /api/admin/subscriptions/trials/expiring
 * Get trials expiring soon
 */
router.get("/admin/trials/expiring", SubscriptionController.getExpiringTrials);

/**
 * GET /api/admin/subscriptions/trials/expired
 * Get expired trials ready to charge
 */
router.get("/admin/trials/expired", SubscriptionController.getExpiredTrials);

/**
 * GET /api/admin/dashboard/metrics
 * Get SaaS dashboard metrics
 */
router.get(
  "/admin/dashboard/metrics",
  SubscriptionController.getDashboardMetrics
);

export default router;
