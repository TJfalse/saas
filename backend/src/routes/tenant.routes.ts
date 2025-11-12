import { Router } from "express";
import TenantController from "../controllers/tenant.controller";
import authMiddleware from "../middlewares/auth.middleware";
import {
  validateRequest,
  validateParams,
} from "../middlewares/validate.middleware";
import {
  createTenantSchema,
  tenantIdParamSchema,
} from "../validators/tenant.validators";

const router = Router();

// POST /api/v1/tenants - create tenant (requires auth)
router.post(
  "/",
  authMiddleware,
  validateRequest(createTenantSchema),
  TenantController.createTenant
);

// GET /api/v1/tenants - list all tenants (requires auth)
router.get("/", authMiddleware, TenantController.getAllTenants);

// GET /api/v1/tenants/:id (requires auth)
router.get(
  "/:id",
  authMiddleware,
  validateParams(tenantIdParamSchema),
  TenantController.getTenant
);

export default router;
