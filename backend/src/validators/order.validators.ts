/**
 * order.validators.ts
 * Validation schemas for order management endpoints
 */

import Joi from "joi";

export const createOrderSchema = Joi.object({
  branchId: Joi.string().required(),
  tableId: Joi.string().optional(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        qty: Joi.number().required().positive().integer(),
        price: Joi.number().required().positive(),
        specialRequest: Joi.string().optional().max(200).allow(null),
      })
    )
    .required()
    .min(1),
  tax: Joi.number().optional().min(0),
  discount: Joi.number().optional().min(0),
  notes: Joi.string().optional().max(500),
});

export const addOrderItemSchema = Joi.object({
  productId: Joi.string().required(),
  qty: Joi.number().required().positive().integer(),
  price: Joi.number().required().positive(),
  specialRequest: Joi.string().optional().max(200).allow(null),
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
  id: Joi.string().required(),
});

export const itemIdParamSchema = Joi.object({
  itemId: Joi.string().required(),
});
