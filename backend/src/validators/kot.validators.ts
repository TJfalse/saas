/**
 * kot.validators.ts
 * Validation schemas for KOT (Kitchen Order Ticket) endpoints
 */

const Joi = require("joi");

export const branchIdParamSchema = Joi.object({
  branchId: Joi.string().min(1).required().messages({
    "string.empty": "branchId cannot be empty",
  }),
});

export const kotIdParamSchema = Joi.object({
  id: Joi.string().min(1).required().messages({
    "string.empty": "id cannot be empty",
  }),
});

export const kotQuerySchema = Joi.object({
  page: Joi.number().optional().positive(),
  limit: Joi.number().optional().positive().max(100),
  printed: Joi.boolean().optional(),
});
