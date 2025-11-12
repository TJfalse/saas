/**
 * Central error handler middleware.
 * In production, map known errors to sanitized messages and codes.
 */

import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export default function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(err);
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ error: message });
}
