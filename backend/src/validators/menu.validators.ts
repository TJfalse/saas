/**
 * menu.validators.ts
 * Validation schemas for menu management endpoints
 */

const Joi = require("joi");

export const createMenuItemSchema = Joi.object({
  sku: Joi.string().optional(),
  name: Joi.string().required().min(1).max(100),
  description: Joi.string().optional().max(500),
  category: Joi.string().optional().max(50),
  price: Joi.number().required().positive(),
  costPrice: Joi.number().optional().positive(),
  isInventoryTracked: Joi.boolean().optional(),
});

export const updateMenuItemSchema = Joi.object({
  name: Joi.string().optional().min(1).max(100),
  description: Joi.string().optional().max(500),
  category: Joi.string().optional().max(50),
  price: Joi.number().optional().positive(),
  costPrice: Joi.number().optional().positive(),
  isInventoryTracked: Joi.boolean().optional(),
});

export const tenantIdParamSchema = Joi.object({
  tenantId: Joi.string().uuid().required().messages({
    "string.guid": "tenantId must be a valid UUID",
    "any.required": "tenantId is required",
  }),
});

export const itemIdParamSchema = Joi.object({
  itemId: Joi.string().uuid().required().messages({
    "string.guid": "itemId must be a valid UUID",
    "any.required": "itemId is required",
  }),
});

export const categoryParamSchema = Joi.object({
  category: Joi.string().required().max(50),
});

export const menuQuerySchema = Joi.object({
  category: Joi.string().optional().max(50),
  branchId: Joi.string().optional().uuid(),
  page: Joi.number().optional().positive(),
  limit: Joi.number().optional().positive().max(100),
});
