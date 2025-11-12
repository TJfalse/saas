import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import tenantMiddleware from "../middlewares/tenant.middleware";
import {
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  branchIdParamSchema,
  kotIdParamSchema,
  kotQuerySchema,
} from "../validators/kot.validators";
import KOTController from "../controllers/kot.controller";

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get(
  "/branch/:branchId",
  validateParams(branchIdParamSchema),
  validateQuery(kotQuerySchema),
  KOTController.listByBranch
);
router.post(
  "/:id/print",
  validateParams(kotIdParamSchema),
  KOTController.printKOT
);

export default router;
