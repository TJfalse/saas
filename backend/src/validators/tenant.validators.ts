/**
 * tenant.validators.ts
 * Validation schemas for tenant management endpoints
 */

const Joi = require("joi");

export const createTenantSchema = Joi.object({
  name: Joi.string().required().min(2).max(100).messages({
    "string.min": "Tenant name must be at least 2 characters",
    "any.required": "Tenant name is required",
  }),
  domain: Joi.string().optional().max(100),
  branchName: Joi.string().optional().max(100),
  email: Joi.string().required().email().max(100).messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().min(8).max(100).messages({
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is required",
  }),
});

export const updateTenantSchema = Joi.object({
  name: Joi.string().optional().min(2).max(100),
  domain: Joi.string().optional().max(100),
});

export const createBranchSchema = Joi.object({
  name: Joi.string().required().min(1).max(100).messages({
    "any.required": "Branch name is required",
  }),
  address: Joi.string().optional().max(500),
  phone: Joi.string().optional().max(20),
  email: Joi.string().optional().email(),
});

export const tenantIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "id must be a valid UUID",
  }),
});
