/**
 * inventory.controller.ts
 * Handles inventory management endpoints.
 *
 * Manages stock, ingredients, and inventory tracking.
 */

import { Request, Response, NextFunction } from "express";
import { successResponse } from "../utils/response.util";
import * as InventoryService from "../services/inventory.service";
import {
  validateTenantAccess,
  withTenantScope,
  buildPaginatedQuery,
} from "../utils/tenant.utils";

/**
 * Get all inventory items
 */
export const getInventoryItems = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;
    const branchId = req.query.branchId as string;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    if (!branchId) {
      return res.status(400).json({
        error:
          "branchId query parameter is required - inventory is branch-scoped",
      });
    }

    // Validate tenant access
    validateTenantAccess(userTenantId, tenantId);

    const items = await InventoryService.getInventoryItems(
      tenantId,
      branchId,
      page,
      limit
    );
    return successResponse(res, items, "Inventory items fetched");
  } catch (error) {
    next(error);
  }
};

/**
 * Create inventory item
 */
export const createInventoryItem = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;

    // Validate tenant access
    validateTenantAccess(userTenantId, tenantId);

    const item = await InventoryService.createInventoryItem({
      ...req.body,
      tenantId,
    });
    return successResponse(res, item, "Inventory item created", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update inventory item
 */
export const updateInventoryItem = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { itemId } = req.params;
    const userTenantId = req.user?.tenantId;

    // Validate tenant has user tenantId
    if (!userTenantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const item = await InventoryService.updateInventoryItem(
      itemId,
      userTenantId,
      req.body
    );
    return successResponse(res, item, "Inventory item updated");
  } catch (error) {
    next(error);
  }
};

/**
 * Delete inventory item
 */
export const deleteInventoryItem = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { itemId } = req.params;
    const userTenantId = req.user?.tenantId;

    if (!userTenantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await InventoryService.deleteInventoryItem(itemId, userTenantId);
    return successResponse(res, null, "Inventory item deleted");
  } catch (error) {
    next(error);
  }
};

/**
 * Get low stock items
 */
export const getLowStockItems = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;
    const branchId = req.query.branchId as string;

    if (!branchId) {
      return res.status(400).json({
        error:
          "branchId query parameter is required - inventory is branch-scoped",
      });
    }

    // Validate tenant access
    validateTenantAccess(userTenantId, tenantId);

    const items = await InventoryService.getLowStockItemsOptimized(
      tenantId,
      branchId
    );
    return successResponse(res, items, "Low stock items fetched");
  } catch (error) {
    next(error);
  }
};
