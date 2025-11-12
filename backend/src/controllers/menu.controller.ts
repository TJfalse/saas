/**
 * menu.controller.ts
 * Handles menu management endpoints.
 *
 * Manages menu items, categories, pricing, and item details.
 */

import { Request, Response, NextFunction } from "express";
import { successResponse } from "../utils/response.util";
import MenuService from "../services/menu.service";
import { validateTenantAccess } from "../utils/tenant.utils";

/**
 * Get all menu items
 */
export const getAllMenuItems = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;
    const { category, branchId } = req.query;

    validateTenantAccess(userTenantId, tenantId);

    const items = await MenuService.getAllMenuItems(
      tenantId,
      category as string | undefined,
      branchId as string | undefined
    );
    return successResponse(res, items, "Menu items fetched");
  } catch (error) {
    next(error);
  }
};

/**
 * Create menu item
 */
export const createMenuItem = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;
    const { branchId } = req.query;

    validateTenantAccess(userTenantId, tenantId);

    const item = await MenuService.createMenuItem(
      tenantId,
      req.body,
      branchId as string | undefined
    );
    return successResponse(res, item, "Menu item created", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get menu item by ID
 */
export const getMenuItemById = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId, itemId } = req.params;
    const userTenantId = req.user?.tenantId;

    validateTenantAccess(userTenantId, tenantId);

    const item = await MenuService.getMenuItemById(itemId, tenantId);
    return successResponse(res, item, "Menu item fetched");
  } catch (error) {
    next(error);
  }
};

/**
 * Update menu item
 */
export const updateMenuItem = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId, itemId } = req.params;
    const userTenantId = req.user?.tenantId;

    validateTenantAccess(userTenantId, tenantId);

    const item = await MenuService.updateMenuItem(itemId, tenantId, req.body);
    return successResponse(res, item, "Menu item updated");
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate menu item
 */
export const deactivateMenuItem = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId, itemId } = req.params;
    const userTenantId = req.user?.tenantId;

    validateTenantAccess(userTenantId, tenantId);

    const item = await MenuService.deactivateMenuItem(itemId, tenantId);
    return successResponse(res, item, "Menu item deactivated");
  } catch (error) {
    next(error);
  }
};

/**
 * Get menu categories
 */
export const getMenuCategories = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;

    validateTenantAccess(userTenantId, tenantId);

    const categories = await MenuService.getMenuCategories(tenantId);
    return successResponse(res, categories, "Menu categories fetched");
  } catch (error) {
    next(error);
  }
};

/**
 * Get menu items by category
 */
export const getMenuItemsByCategory = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId, category } = req.params;
    const userTenantId = req.user?.tenantId;

    validateTenantAccess(userTenantId, tenantId);

    const items = await MenuService.getMenuItemsByCategory(tenantId, category);
    return successResponse(res, items, "Category items fetched");
  } catch (error) {
    next(error);
  }
};
