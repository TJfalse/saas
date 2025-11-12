/**
 * report.validators.ts
 * Validation schemas for reporting endpoints
 */

const Joi = require("joi");

export const dateRangeSchema = Joi.object({
  startDate: Joi.date().required().iso().messages({
    "date.iso": "startDate must be a valid ISO date",
    "any.required": "startDate is required",
  }),
  endDate: Joi.date().required().iso().min(Joi.ref("startDate")).messages({
    "date.iso": "endDate must be a valid ISO date",
    "any.required": "endDate is required",
    "date.min": "endDate must be after or equal to startDate",
  }),
});

export const salesReportQuerySchema = Joi.object({
  startDate: Joi.date().required().iso().messages({
    "date.iso": "startDate must be a valid ISO date",
  }),
  endDate: Joi.date().required().iso().min(Joi.ref("startDate")).messages({
    "date.iso": "endDate must be a valid ISO date",
    "date.min": "endDate must be after or equal to startDate",
  }),
});

export const inventoryReportQuerySchema = Joi.object({
  branchId: Joi.string().optional().uuid(),
});

export const staffPerformanceQuerySchema = Joi.object({
  startDate: Joi.date().required().iso(),
  endDate: Joi.date().required().iso().min(Joi.ref("startDate")),
});

export const paymentReportQuerySchema = Joi.object({
  startDate: Joi.date().required().iso(),
  endDate: Joi.date().required().iso().min(Joi.ref("startDate")),
});

export const tenantIdParamSchema = Joi.object({
  tenantId: Joi.string().uuid().required().messages({
    "string.guid": "tenantId must be a valid UUID",
  }),
});
