import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import tenantMiddleware from "../middlewares/tenant.middleware";
import {
  validateRequest,
  validateParams,
} from "../middlewares/validate.middleware";
import {
  createOrderSchema,
  orderIdParamSchema,
} from "../validators/order.validators";
import OrderController from "../controllers/order.controller";

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post(
  "/",
  validateRequest(createOrderSchema),
  OrderController.createOrder
);
router.get(
  "/:id",
  validateParams(orderIdParamSchema),
  OrderController.getOrder
);

export default router;
