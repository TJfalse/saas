/**
 * kot.validators.ts
 * Validation schemas for KOT (Kitchen Order Ticket) endpoints
 */

const Joi = require("joi");

export const branchIdParamSchema = Joi.object({
  branchId: Joi.string().uuid().required().messages({
    "string.guid": "branchId must be a valid UUID",
  }),
});

export const kotIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "id must be a valid UUID",
  }),
});

export const kotQuerySchema = Joi.object({
  page: Joi.number().optional().positive(),
  limit: Joi.number().optional().positive().max(100),
  printed: Joi.boolean().optional(),
});
