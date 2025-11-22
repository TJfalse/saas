/**
 * dashboard.validators.ts
 * Validation schemas for dashboard routes
 */

const Joi = require("joi");

export const tenantIdParamSchema = Joi.object({
  tenantId: Joi.string().min(1).required().messages({
    "string.empty": "tenantId cannot be empty",
    "any.required": "tenantId is required",
  }),
});

export const analyticsQuerySchema = Joi.object({
  startDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "startDate must be in format YYYY-MM-DD",
      "any.required": "startDate is required",
    }),
  endDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "endDate must be in format YYYY-MM-DD",
      "any.required": "endDate is required",
    }),
});

export const topProductsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(10),
});
