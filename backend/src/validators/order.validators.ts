/**
 * order.validators.ts
 * Validation schemas for order management endpoints
 */

const Joi = require("joi");

export const createOrderSchema = Joi.object({
  branchId: Joi.string().uuid().required().messages({
    "string.guid": "branchId must be a valid UUID",
    "any.required": "branchId is required",
  }),
  tableId: Joi.string().optional().uuid(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required().messages({
          "string.guid": "productId must be a valid UUID",
        }),
        qty: Joi.number().required().positive().integer(),
        price: Joi.number().required().positive(),
        specialRequest: Joi.string().optional().max(200),
      })
    )
    .required()
    .min(1),
  tax: Joi.number().optional().min(0),
  discount: Joi.number().optional().min(0),
  notes: Joi.string().optional().max(500),
});

export const addOrderItemSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    "string.guid": "productId must be a valid UUID",
  }),
  qty: Joi.number().required().positive().integer(),
  price: Joi.number().required().positive(),
  specialRequest: Joi.string().optional().max(200),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .required()
    .valid("PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"),
});

export const updateOrderItemStatusSchema = Joi.object({
  status: Joi.string()
    .required()
    .valid(
      "PENDING",
      "SENT_TO_KITCHEN",
      "PREPARING",
      "READY",
      "SERVED",
      "CANCELLED"
    ),
});

export const orderIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "id must be a valid UUID",
  }),
});

export const itemIdParamSchema = Joi.object({
  itemId: Joi.string().uuid().required().messages({
    "string.guid": "itemId must be a valid UUID",
  }),
});
