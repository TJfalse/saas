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
router.use(tenantMiddleware);

router.get(
  "/:tenantId",
  validateParams(tenantIdParamSchema),
  validateQuery(menuQuerySchema),
  getAllMenuItems
);
router.post(
  "/:tenantId",
  validateParams(tenantIdParamSchema),
  validateRequest(createMenuItemSchema),
  createMenuItem
);
router.get(
  "/:tenantId/item/:itemId",
  validateParams(tenantIdParamSchema),
  getMenuItemById
);
router.put(
  "/:tenantId/:itemId",
  validateParams(tenantIdParamSchema),
  validateRequest(updateMenuItemSchema),
  updateMenuItem
);
router.patch(
  "/:tenantId/:itemId/deactivate",
  validateParams(tenantIdParamSchema),
  deactivateMenuItem
);
router.get(
  "/:tenantId/categories",
  validateParams(tenantIdParamSchema),
  getMenuCategories
);
router.get(
  "/:tenantId/category/:category",
  validateParams(tenantIdParamSchema),
  getMenuItemsByCategory
);

export default router;
