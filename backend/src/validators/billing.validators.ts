/**
 * billing.validators.ts
 * Validation schemas for billing routes
 */

const Joi = require("joi");

export const createInvoiceSchema = Joi.object({
  orderId: Joi.string().uuid().required().messages({
    "string.guid": "orderId must be a valid UUID",
    "any.required": "orderId is required",
  }),
  amount: Joi.number().positive().required().messages({
    "number.positive": "amount must be greater than 0",
    "any.required": "amount is required",
  }),
  tax: Joi.number().min(0).default(0),
  discount: Joi.number().min(0).default(0),
  dueDate: Joi.date().optional(),
});

export const processPaymentSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    "number.positive": "amount must be greater than 0",
    "any.required": "amount is required",
  }),
  method: Joi.string()
    .valid("CASH", "CARD", "UPI", "BANK_TRANSFER", "WALLET", "CHEQUE")
    .required()
    .messages({
      "any.only":
        "method must be one of: CASH, CARD, UPI, BANK_TRANSFER, WALLET, CHEQUE",
      "any.required": "method is required",
    }),
  reference: Joi.string().optional(),
});

export const tenantIdParamSchema = Joi.object({
  tenantId: Joi.string().uuid().required().messages({
    "string.guid": "tenantId must be a valid UUID",
    "any.required": "tenantId is required",
  }),
});

export const invoiceIdParamSchema = Joi.object({
  tenantId: Joi.string().uuid().required(),
  invoiceId: Joi.string().uuid().required().messages({
    "string.guid": "invoiceId must be a valid UUID",
    "any.required": "invoiceId is required",
  }),
});
