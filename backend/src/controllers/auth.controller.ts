/**
 * auth.controller.ts
 * Minimal auth controller - for production you must add rate limiting, account lockouts, MFA.
 */

import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.service";

class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, tenantName } = req.body;
      const result = await AuthService.register({
        email,
        password,
        name,
        tenantName,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: "Validation failed",
          details: ["Refresh token is required"],
        });
      }

      const result = await AuthService.refreshToken(refreshToken);
      res.json(result);
    } catch (err: any) {
      next(err);
    }
  }
}

export default AuthController;
