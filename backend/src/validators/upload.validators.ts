/**
 * upload.validators.ts
 * Validation schemas for file upload endpoints
 */

const Joi = require("joi");

export const bulkUploadQuerySchema = Joi.object({
  type: Joi.string().optional().valid("menu", "inventory", "staff").messages({
    "any.only": "type must be one of: menu, inventory, staff",
  }),
});

export const bulkUploadSchema = Joi.object({
  filename: Joi.string().required().messages({
    "any.required": "filename is required",
  }),
  mimeType: Joi.string()
    .optional()
    .valid(
      "text/csv",
      "application/json",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ),
});
