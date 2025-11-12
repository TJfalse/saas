/**
 * validate.middleware.ts
 * Request validation middleware.
 *
 * Can be used with validation schemas for request body/params validation.
 */

import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

/**
 * Validates request against a schema
 * Usage: app.post('/route', validateRequest(schema), controller);
 */
export function validateRequest(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!schema || !schema.validate) {
        logger.error("Invalid validation schema provided");
        return res.status(500).json({ error: "Server configuration error" });
      }

      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const messages = error.details?.map(
          (detail: any) => detail.message
        ) || [error.message];
        logger.warn("Validation error:", messages);
        return res.status(400).json({
          error: "Validation failed",
          details: messages,
        });
      }

      req.body = value;
      next();
    } catch (err: any) {
      logger.error("Validation middleware error:", err);
      return res.status(400).json({
        error: "Validation failed",
        details: [err?.message || "Invalid request body"],
      });
    }
  };
}

/**
 * Validates URL parameters against a schema
 */
export function validateParams(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!schema || !schema.validate) {
        logger.error("Invalid validation schema provided");
        return res.status(500).json({ error: "Server configuration error" });
      }

      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const messages = error.details?.map(
          (detail: any) => detail.message
        ) || [error.message];
        logger.warn("Params validation error:", messages);
        return res.status(400).json({
          error: "Invalid parameters",
          details: messages,
        });
      }

      req.params = value;
      next();
    } catch (err: any) {
      logger.error("Params validation error:", err);
      return res.status(400).json({
        error: "Invalid parameters",
        details: [err?.message || "Invalid URL parameters"],
      });
    }
  };
}

/**
 * Validates query parameters against a schema
 */
export function validateQuery(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!schema || !schema.validate) {
        logger.error("Invalid validation schema provided");
        return res.status(500).json({ error: "Server configuration error" });
      }

      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const messages = error.details?.map(
          (detail: any) => detail.message
        ) || [error.message];
        logger.warn("Query validation error:", messages);
        return res.status(400).json({
          error: "Invalid query parameters",
          details: messages,
        });
      }

      req.query = value;
      next();
    } catch (err: any) {
      logger.error("Query validation error:", err);
      return res.status(400).json({
        error: "Invalid query parameters",
        details: [err?.message || "Invalid query parameters"],
      });
    }
  };
}
