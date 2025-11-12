/**
 * subscription.controller.ts
 * Subscription Management Endpoints
 *
 * Handles subscription creation, updates, cancellations for SaaS customers
 * Admin-only endpoints for managing restaurant subscriptions
 */

import { Request, Response, NextFunction } from "express";
import { successResponse } from "../utils/response.util";
import * as SubscriptionService from "../services/subscription.service";
import { validateTenantAccess } from "../utils/tenant.utils";
import { Role } from "@prisma/client";

/**
 * GET /api/subscriptions/:tenantId
 * Get subscription for specific tenant
 */
export const getSubscription = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;

    // Validate access - can only view own subscription or if admin
    if (userTenantId !== tenantId && req.user?.role !== Role.ADMIN) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const subscription = await SubscriptionService.getSubscription(tenantId);
    return successResponse(res, subscription, "Subscription fetched");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/subscriptions
 * Get all subscriptions (admin dashboard)
 */
export const getAllSubscriptions = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verify admin access
    if (req.user?.role !== Role.ADMIN && req.user?.role !== Role.OWNER) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { status, plan, search, page = 1, limit = 50 } = req.query;

    const result = await SubscriptionService.getAllSubscriptions(
      status as string | undefined,
      plan as string | undefined,
      search as string | undefined,
      parseInt(page as string),
      parseInt(limit as string)
    );

    return successResponse(res, result, "Subscriptions fetched");
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/subscriptions
 * Create subscription for new tenant
 */
export const createSubscription = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verify admin access
    if (req.user?.role !== Role.ADMIN && req.user?.role !== Role.OWNER) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const {
      tenantId,
      plan,
      provider,
      providerCustomerId,
      billingCycle,
      amount,
      currency,
      trialDays,
    } = req.body;

    // Validation
    if (!tenantId || !plan || !provider || !billingCycle || !amount) {
      return res.status(400).json({
        error:
          "tenantId, plan, provider, billingCycle, and amount are required",
      });
    }

    const subscription = await SubscriptionService.createSubscription({
      tenantId,
      plan,
      provider,
      providerCustomerId,
      billingCycle,
      amount,
      currency,
      trialDays,
    });

    return successResponse(res, subscription, "Subscription created", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/subscriptions/:tenantId
 * Update subscription (plan, amount, status)
 */
export const updateSubscription = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verify admin access
    if (req.user?.role !== Role.ADMIN && req.user?.role !== Role.OWNER) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { tenantId } = req.params;
    const { plan, amount, status, billingCycle, cancelAtPeriodEnd } = req.body;

    const subscription = await SubscriptionService.updateSubscription(
      tenantId,
      {
        plan,
        amount,
        status,
        billingCycle,
        cancelAtPeriodEnd,
      }
    );

    return successResponse(res, subscription, "Subscription updated");
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/subscriptions/:tenantId
 * Cancel subscription
 */
export const cancelSubscription = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verify admin access
    if (req.user?.role !== Role.ADMIN && req.user?.role !== Role.OWNER) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { tenantId } = req.params;
    const { immediate = false } = req.query;

    const subscription = await SubscriptionService.cancelSubscription(
      tenantId,
      immediate === "true"
    );

    return successResponse(
      res,
      subscription,
      immediate === "true"
        ? "Subscription canceled immediately"
        : "Subscription scheduled for cancellation"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/subscriptions/expiring/soon
 * Get subscriptions expiring soon
 */
export const getExpiringSubscriptions = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verify admin access
    if (req.user?.role !== Role.ADMIN && req.user?.role !== Role.OWNER) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { daysUntil = 7 } = req.query;

    const expiring = await SubscriptionService.getExpiringSoon(
      parseInt(daysUntil as string)
    );

    return successResponse(res, expiring, "Expiring subscriptions fetched");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/subscriptions/trials/expiring
 * Get trials expiring soon
 */
export const getExpiringTrials = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verify admin access
    if (req.user?.role !== Role.ADMIN && req.user?.role !== Role.OWNER) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { daysUntil = 7 } = req.query;

    const expiring = await SubscriptionService.getTrialsExpiringSoon(
      parseInt(daysUntil as string)
    );

    return successResponse(res, expiring, "Expiring trials fetched");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/subscriptions/trials/expired
 * Get expired trials ready to charge
 */
export const getExpiredTrials = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verify admin access
    if (req.user?.role !== Role.ADMIN && req.user?.role !== Role.OWNER) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const expired = await SubscriptionService.getExpiredTrials();

    return successResponse(res, expired, "Expired trials fetched");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/dashboard/metrics
 * Get SaaS dashboard metrics
 */
export const getDashboardMetrics = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verify admin access
    if (req.user?.role !== Role.ADMIN && req.user?.role !== Role.OWNER) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const metrics = await SubscriptionService.getDashboardMetrics();

    return successResponse(res, metrics, "Dashboard metrics fetched");
  } catch (error) {
    next(error);
  }
};
