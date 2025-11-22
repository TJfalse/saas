/**
 * billing.validators.ts
 * Validation schemas for billing routes
 */

const Joi = require("joi");

export const createInvoiceSchema = Joi.object({
  orderId: Joi.string().min(1).required().messages({
    "string.empty": "orderId cannot be empty",
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
  tenantId: Joi.string().min(1).required().messages({
    "string.empty": "tenantId cannot be empty",
    "any.required": "tenantId is required",
  }),
});

export const invoiceIdParamSchema = Joi.object({
  tenantId: Joi.string().min(1).required(),
  invoiceId: Joi.string().min(1).required().messages({
    "string.empty": "invoiceId cannot be empty",
    "any.required": "invoiceId is required",
  }),
});
