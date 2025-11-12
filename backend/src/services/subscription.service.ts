/**
 * subscription.service.ts
 * SaaS Subscription Management Service
 *
 * Handles subscription lifecycle: creation, updates, cancellations, and billing management
 * Critical for multi-tenant SaaS control where your company manages restaurant subscriptions
 */

import prisma from "../config/db.config";
import logger from "../config/logger";
import { Decimal } from "@prisma/client/runtime/library";

interface CreateSubscriptionData {
  tenantId: string;
  plan: string;
  provider: string; // "stripe", "razorpay", etc.
  providerCustomerId?: string;
  billingCycle: string; // "MONTHLY" | "YEARLY"
  amount: string | number;
  currency?: string;
  trialDays?: number;
}

interface UpdateSubscriptionData {
  plan?: string;
  amount?: string | number;
  status?: string; // SubscriptionStatus
  billingCycle?: string; // BillingCycle
  cancelAtPeriodEnd?: boolean;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
}

/**
 * Create a new subscription for tenant (initial setup)
 */
export async function createSubscription(data: CreateSubscriptionData) {
  try {
    if (!data.tenantId) {
      throw new Error("Tenant ID is required");
    }

    // Validate tenant exists and is active
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.tenantId },
    });

    if (!tenant) {
      throw new Error("Tenant not found");
    }

    if (!tenant.isActive) {
      throw new Error("Cannot create subscription for inactive tenant");
    }

    // Check if subscription already exists
    const existing = await prisma.subscription.findUnique({
      where: { tenantId: data.tenantId },
    });

    if (existing) {
      throw new Error("Subscription already exists for this tenant");
    }

    // Calculate trial period
    const now = new Date();
    const trialDays = data.trialDays || 14;
    const trialEndsAt = new Date(
      now.getTime() + trialDays * 24 * 60 * 60 * 1000
    );
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subscription = await prisma.subscription.create({
      data: {
        tenantId: data.tenantId,
        plan: data.plan,
        provider: data.provider,
        providerCustomerId: data.providerCustomerId,
        billingCycle: (data.billingCycle || "MONTHLY") as any,
        amount: new Decimal(data.amount).toDecimalPlaces(2),
        currency: data.currency || "USD",
        status: "TRIALING" as any,
        trialEndsAt,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      include: { tenant: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "SUBSCRIPTION_CREATED",
        resource: "Subscription",
        tenantId: data.tenantId,
        newValues: {
          subscriptionId: subscription.id,
          plan: subscription.plan,
          amount: subscription.amount.toString(),
          status: subscription.status,
        } as any,
      },
    });

    logger.info(
      `Subscription created for tenant ${data.tenantId}: ${subscription.id}`
    );

    return subscription;
  } catch (error) {
    logger.error("Error creating subscription:", error);
    throw error;
  }
}

/**
 * Get subscription for tenant
 */
export async function getSubscription(tenantId: string) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const subscription = await prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        tenant: { select: { name: true, domain: true, isActive: true } },
      },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    return subscription;
  } catch (error) {
    logger.error("Error fetching subscription:", error);
    throw error;
  }
}

/**
 * Get all subscriptions (admin dashboard)
 */
export async function getAllSubscriptions(
  status?: string,
  plan?: string,
  search?: string,
  page = 1,
  limit = 50
) {
  try {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (plan) {
      where.plan = plan;
    }

    if (search) {
      where.tenant = {
        name: { contains: search, mode: "insensitive" },
      };
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              domain: true,
              isActive: true,
              currency: true,
              _count: { select: { users: true, branches: true, orders: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.subscription.count({ where }),
    ]);

    return { subscriptions, total, page, limit };
  } catch (error) {
    logger.error("Error fetching subscriptions:", error);
    throw error;
  }
}

/**
 * Update subscription (plan, amount, status)
 */
export async function updateSubscription(
  tenantId: string,
  data: UpdateSubscriptionData
) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const subscription = await prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const updateData: any = {};

    if (data.plan) updateData.plan = data.plan;
    if (data.amount)
      updateData.amount = new Decimal(data.amount).toDecimalPlaces(2);
    if (data.status) updateData.status = data.status;
    if (data.billingCycle) updateData.billingCycle = data.billingCycle;
    if (data.cancelAtPeriodEnd !== undefined)
      updateData.cancelAtPeriodEnd = data.cancelAtPeriodEnd;
    if (data.providerCustomerId)
      updateData.providerCustomerId = data.providerCustomerId;
    if (data.providerSubscriptionId)
      updateData.providerSubscriptionId = data.providerSubscriptionId;

    const updated = await prisma.subscription.update({
      where: { tenantId },
      data: updateData,
      include: { tenant: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "SUBSCRIPTION_UPDATED",
        resource: "Subscription",
        tenantId,
        oldValues: {
          plan: subscription.plan,
          amount: subscription.amount.toString(),
          status: subscription.status,
        } as any,
        newValues: {
          plan: updated.plan,
          amount: updated.amount.toString(),
          status: updated.status,
        } as any,
      },
    });

    logger.info(`Subscription updated for tenant ${tenantId}`);

    return updated;
  } catch (error) {
    logger.error("Error updating subscription:", error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(tenantId: string, immediate = false) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const subscription = await prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const updated = await prisma.subscription.update({
      where: { tenantId },
      data: {
        status: "CANCELED",
        cancelAtPeriodEnd: !immediate, // If not immediate, cancel at period end
      },
      include: { tenant: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: immediate
          ? "SUBSCRIPTION_CANCELED_IMMEDIATE"
          : "SUBSCRIPTION_CANCELED_AT_PERIOD_END",
        resource: "Subscription",
        tenantId,
        newValues: { status: updated.status } as any,
      },
    });

    logger.info(
      `Subscription ${
        immediate ? "immediately " : ""
      }canceled for tenant ${tenantId}`
    );

    return updated;
  } catch (error) {
    logger.error("Error canceling subscription:", error);
    throw error;
  }
}

/**
 * Get subscriptions expiring soon (for billing reminders)
 */
export async function getExpiringSoon(daysUntil = 7) {
  try {
    const futureDate = new Date(Date.now() + daysUntil * 24 * 60 * 60 * 1000);

    const expiring = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        currentPeriodEnd: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      include: {
        tenant: { select: { name: true, domain: true } },
      },
      orderBy: { currentPeriodEnd: "asc" },
    });

    return expiring;
  } catch (error) {
    logger.error("Error fetching expiring subscriptions:", error);
    throw error;
  }
}

/**
 * Get trials expiring soon (for charge reminders)
 */
export async function getTrialsExpiringSoon(daysUntil = 7) {
  try {
    const futureDate = new Date(Date.now() + daysUntil * 24 * 60 * 60 * 1000);

    const expiring = await prisma.subscription.findMany({
      where: {
        status: "TRIALING",
        trialEndsAt: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      include: {
        tenant: { select: { name: true } },
      },
      orderBy: { trialEndsAt: "asc" },
    });

    return expiring;
  } catch (error) {
    logger.error("Error fetching expiring trials:", error);
    throw error;
  }
}

/**
 * Get expired trials (ready to charge)
 */
export async function getExpiredTrials() {
  try {
    const expired = await prisma.subscription.findMany({
      where: {
        status: "TRIALING",
        trialEndsAt: { lte: new Date() },
      },
      include: {
        tenant: { select: { name: true } },
      },
    });

    return expired;
  } catch (error) {
    logger.error("Error fetching expired trials:", error);
    throw error;
  }
}

/**
 * Get dashboard metrics (for admin panel)
 */
export async function getDashboardMetrics() {
  try {
    // Active subscriptions count
    const activeCount = await prisma.subscription.count({
      where: { status: "ACTIVE" },
    });

    // Trial subscriptions count
    const trialCount = await prisma.subscription.count({
      where: { status: "TRIALING" },
    });

    // Past due subscriptions
    const pastDueCount = await prisma.subscription.count({
      where: { status: "PAST_DUE" },
    });

    // Monthly Recurring Revenue
    const mrrResult = await prisma.subscription.aggregate({
      where: { status: "ACTIVE" },
      _sum: { amount: true },
    });

    const mrr = mrrResult._sum.amount || new Decimal(0);

    // Monthly revenue (payments completed this month)
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const monthEnd = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    );

    const monthlyRevenueResult = await prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    });

    const monthlyRevenue = monthlyRevenueResult._sum.amount || new Decimal(0);

    // Churn rate (canceled in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const churnCount = await prisma.subscription.count({
      where: {
        status: "CANCELED",
        updatedAt: { gte: thirtyDaysAgo },
      },
    });

    // Breakdown by plan
    const planBreakdown = await prisma.subscription.groupBy({
      by: ["plan"],
      _count: { id: true },
      _sum: { amount: true },
    });

    return {
      activeSubscriptions: activeCount,
      trialSubscriptions: trialCount,
      pastDueSubscriptions: pastDueCount,
      mrr: mrr.toString(),
      monthlyRevenue: monthlyRevenue.toString(),
      churnCount,
      planBreakdown,
      health: {
        mrrPercentage: (activeCount / (activeCount + trialCount)) * 100,
        trialConversion: (activeCount / (activeCount + trialCount)) * 100 || 0,
      },
    };
  } catch (error) {
    logger.error("Error fetching dashboard metrics:", error);
    throw error;
  }
}

/**
 * Update subscription period (for billing cycle extensions)
 */
export async function updateBillingPeriod(
  tenantId: string,
  periodStart: Date,
  periodEnd: Date
) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const updated = await prisma.subscription.update({
      where: { tenantId },
      data: {
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    });

    // Audit
    await prisma.auditLog.create({
      data: {
        action: "BILLING_PERIOD_UPDATED",
        resource: "Subscription",
        tenantId,
        newValues: {
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
        } as any,
      },
    });

    logger.info(`Billing period updated for tenant ${tenantId}`);

    return updated;
  } catch (error) {
    logger.error("Error updating billing period:", error);
    throw error;
  }
}
