/**
 * tenant.middleware.ts
 * Verifies tenant membership and attaches tenant context to request.
 *
 * Ensures user belongs to the tenant they're trying to access.
 */

import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export default function tenantMiddleware(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;

    if (!tenantId || !userTenantId) {
      return res.status(400).json({ error: "Tenant ID missing" });
    }

    // Verify user belongs to this tenant
    if (userTenantId !== tenantId) {
      logger.warn(
        `Unauthorized tenant access attempt: user ${req.user?.id} tried to access tenant ${tenantId}`
      );
      return res.status(403).json({ error: "Forbidden - Tenant mismatch" });
    }

    req.tenantId = tenantId;
    next();
  } catch (error) {
    logger.error("Tenant middleware error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
