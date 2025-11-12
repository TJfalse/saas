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
router.use(tenantMiddleware);

// More specific routes FIRST (before generic :tenantId)
router.get(
  "/:tenantId/low-stock",
  validateParams(tenantIdParamSchema),
  validateQuery(lowStockQuerySchema),
  InventoryController.getLowStockItems
);

// Generic routes after specific ones
router.get(
  "/:tenantId",
  validateParams(tenantIdParamSchema),
  validateQuery(inventoryQuerySchema),
  InventoryController.getInventoryItems
);
router.post(
  "/:tenantId",
  validateParams(tenantIdParamSchema),
  validateRequest(createInventoryItemSchema),
  InventoryController.createInventoryItem
);
router.put(
  "/:itemId",
  validateParams(itemIdParamSchema),
  validateRequest(updateInventoryItemSchema),
  InventoryController.updateInventoryItem
);
router.delete(
  "/:itemId",
  validateParams(itemIdParamSchema),
  InventoryController.deleteInventoryItem
);

export default router;
