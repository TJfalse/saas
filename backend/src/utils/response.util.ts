/**
 * response.util.ts
 * Helper to standardize API responses.
 */

import { Response } from "express";

export function success(data: any, message = "OK") {
  return { success: true, message, data };
}

export function fail(message = "Error", details?: any) {
  return { success: false, message, details };
}

/**
 * Convenience function to send response directly
 */
export function successResponse(
  res: Response,
  data: any,
  message = "OK",
  statusCode = 200
) {
  return res.status(statusCode).json(success(data, message));
}

/**
 * Convenience function to send error response directly
 */
export function errorResponse(
  res: Response,
  message = "Error",
  details?: any,
  statusCode = 400
) {
  return res.status(statusCode).json(fail(message, details));
}
