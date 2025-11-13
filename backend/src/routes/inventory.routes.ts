import { Router } from "express";
import * as InventoryController from "../controllers/inventory.controller";
import authMiddleware from "../middlewares/auth.middleware";
import tenantMiddleware from "../middlewares/tenant.middleware";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  tenantIdParamSchema,
  itemIdParamSchema,
  inventoryQuerySchema,
  lowStockQuerySchema,
} from "../validators/inventory.validators";

const router = Router();

router.use(authMiddleware);

// More specific routes FIRST (before generic :tenantId)
router.get(
  "/:tenantId/low-stock",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  validateQuery(lowStockQuerySchema),
  InventoryController.getLowStockItems
);

// Generic routes after specific ones
router.get(
  "/:tenantId",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  validateQuery(inventoryQuerySchema),
  InventoryController.getInventoryItems
);
router.post(
  "/:tenantId",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  validateRequest(createInventoryItemSchema),
  InventoryController.createInventoryItem
);
router.put(
  "/:itemId",
  tenantMiddleware,
  validateParams(itemIdParamSchema),
  validateRequest(updateInventoryItemSchema),
  InventoryController.updateInventoryItem
);
router.delete(
  "/:itemId",
  tenantMiddleware,
  validateParams(itemIdParamSchema),
  InventoryController.deleteInventoryItem
);

export default router;
