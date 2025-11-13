/**
 * inventory.validators.ts
 * Validation schemas for inventory routes
 */

const Joi = require("joi");

export const createInventoryItemSchema = Joi.object({
  productId: Joi.string().required().messages({
    "any.required": "productId is required",
  }),
  qty: Joi.number().integer().min(0).required().messages({
    "number.min": "qty cannot be negative",
    "any.required": "qty is required",
  }),
  minQty: Joi.number().integer().min(0).default(10),
});

export const updateInventoryItemSchema = Joi.object({
  qty: Joi.number().integer().min(0).optional(),
  minQty: Joi.number().integer().min(0).optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

export const tenantIdParamSchema = Joi.object({
  tenantId: Joi.string().required().messages({
    "any.required": "tenantId is required",
  }),
});

export const itemIdParamSchema = Joi.object({
  itemId: Joi.string().required().messages({
    "any.required": "itemId is required",
  }),
});

export const inventoryQuerySchema = Joi.object({
  branchId: Joi.string().uuid().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

export const lowStockQuerySchema = Joi.object({
  branchId: Joi.string().uuid().optional(),
});
