import { Router } from "express";
import {
  getAllStaff,
  createStaff,
  getStaffById,
  updateStaff,
  deactivateStaff,
  assignRole,
  getStaffByBranch,
} from "../controllers/staff.controller";
import authMiddleware from "../middlewares/auth.middleware";
import tenantMiddleware from "../middlewares/tenant.middleware";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  createStaffSchema,
  updateStaffSchema,
  assignRoleSchema,
  tenantIdParamSchema,
  staffIdParamSchema,
  branchIdParamSchema,
  staffQuerySchema,
} from "../validators/staff.validators";

const router = Router();

router.use(authMiddleware);

router.get(
  "/:tenantId",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  validateQuery(staffQuerySchema),
  getAllStaff
);
router.post(
  "/:tenantId",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  validateRequest(createStaffSchema),
  createStaff
);
router.get(
  "/:tenantId/:staffId",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  getStaffById
);
router.put(
  "/:tenantId/:staffId",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  validateRequest(updateStaffSchema),
  updateStaff
);
router.patch(
  "/:tenantId/:staffId/deactivate",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  deactivateStaff
);
router.post(
  "/:tenantId/:staffId/role",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  validateRequest(assignRoleSchema),
  assignRole
);
router.get(
  "/:tenantId/branch/:branchId",
  tenantMiddleware,
  validateParams(tenantIdParamSchema),
  getStaffByBranch
);

export default router;
