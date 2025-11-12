/**
 * tenantScope.utils.ts
 * Tenant context and scoping utilities for multi-tenant operations
 *
 * Ensures all queries are properly scoped to tenant
 */

import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

/**
 * Ensure tenant context is available on request
 * Accepts tenantId from:
 * 1. X-Tenant-ID header
 * 2. req.user.tenantId (from JWT)
 * 3. URL params
 */
export const ensureTenantContext = (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Priority order for tenant resolution
    const tenantId =
      (req.headers["x-tenant-id"] as string) ||
      req.user?.tenantId ||
      req.params.tenantId;

    if (!tenantId) {
      logger.warn("Missing tenant context");
      return res.status(400).json({ error: "Tenant context required" });
    }

    req.tenantId = tenantId;
    next();
  } catch (error) {
    logger.error("Tenant context error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Verify user has access to specific tenant
 */
export const verifyTenantAccess = (
  userTenantId: string | undefined,
  requiredTenantId: string,
  userRole?: string
) => {
  // ADMIN can access any tenant
  if (userRole === "ADMIN") {
    return true;
  }

  // Regular users can only access their own tenant
  return userTenantId === requiredTenantId;
};

/**
 * Build tenant-scoped where clause for queries
 */
export const buildTenantWhere = (tenantId: string, additional?: any) => {
  return {
    tenantId,
    ...additional,
  };
};

/**
 * Middleware to apply tenant scoping to all requests
 */
export const applyTenantScoping = (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant context required" });
    }

    // Add helper methods to request
    req.getTenantWhere = (additional?: any) =>
      buildTenantWhere(tenantId, additional);

    req.verifyTenantAccess = (accessTenantId: string) =>
      verifyTenantAccess(req.user?.tenantId, accessTenantId, req.user?.role);

    next();
  } catch (error) {
    logger.error("Tenant scoping error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
