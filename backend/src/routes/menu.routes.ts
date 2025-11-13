/**
 * menu.routes.ts
 * Routes for menu management.
 */

import { Router } from "express";
import {
  getAllMenuItems,
  createMenuItem,
  getMenuItemById,
  updateMenuItem,
  deactivateMenuItem,
  getMenuCategories,
  getMenuItemsByCategory,
} from "../controllers/menu.controller";
import authMiddleware from "../middlewares/auth.middleware";
import tenantMiddleware from "../middlewares/tenant.middleware";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  tenantIdParamSchema,
  itemIdParamSchema,
  categoryParamSchema,
  menuQuerySchema,
} from "../validators/menu.validators";

const router = Router();

router.use(authMiddleware);

router.get(
  "/:tenantId",
  validateParams(tenantIdParamSchema),
  validateQuery(menuQuerySchema),
  getAllMenuItems
);
router.post(
  "/:tenantId",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  validateRequest(createMenuItemSchema),
  createMenuItem
);
router.get(
  "/:tenantId/item/:itemId",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  getMenuItemById
);
router.put(
  "/:tenantId/:itemId",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  validateRequest(updateMenuItemSchema),
  updateMenuItem
);
router.patch(
  "/:tenantId/:itemId/deactivate",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  deactivateMenuItem
);
router.get(
  "/:tenantId/categories",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  getMenuCategories
);
router.get(
  "/:tenantId/category/:category",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  getMenuItemsByCategory
);

export default router;
