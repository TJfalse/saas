import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validators/auth.validators";

const router = Router();

/**
 * POST /api/v1/auth/register
 * Body: { email, password, name, tenantName }
 */
router.post(
  "/register",
  validateRequest(registerSchema),
  AuthController.register
);

/**
 * POST /api/v1/auth/login
 * Body: { email, password }
 */
router.post("/login", validateRequest(loginSchema), AuthController.login);

/**
 * POST /api/v1/auth/refresh
 * Body: { refreshToken }
 */
router.post(
  "/refresh",
  validateRequest(refreshTokenSchema),
  AuthController.refresh
);

export default router;
