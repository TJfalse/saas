/**
 * booking.validators.ts
 * Validation schemas for booking routes
 */

const Joi = require("joi");

export const createBookingSchema = Joi.object({
  branchId: Joi.string().min(1).required().messages({
    "string.empty": "branchId cannot be empty",
    "any.required": "branchId is required",
  }),
  tableId: Joi.string().min(1).optional(),
  customerName: Joi.string().min(2).max(100).required().messages({
    "string.min": "customerName must be at least 2 characters",
    "any.required": "customerName is required",
  }),
  customerPhone: Joi.string().optional(),
  partySize: Joi.number().integer().positive().required().messages({
    "number.positive": "partySize must be greater than 0",
    "any.required": "partySize is required",
  }),
  startTime: Joi.date().iso().required().messages({
    "date.iso": "startTime must be a valid ISO date",
    "any.required": "startTime is required",
  }),
  endTime: Joi.date().iso().required().messages({
    "date.iso": "endTime must be a valid ISO date",
    "any.required": "endTime is required",
  }),
  deposit: Joi.number().min(0).optional(),
  notes: Joi.string().optional(),
}).with("startTime", "endTime");

export const branchIdParamSchema = Joi.object({
  branchId: Joi.string().min(1).required().messages({
    "string.empty": "branchId cannot be empty",
    "any.required": "branchId is required",
  }),
});
