import { Router } from "express";
import BookingController from "../controllers/booking.controller";
import authMiddleware from "../middlewares/auth.middleware";
import {
  validateRequest,
  validateParams,
} from "../middlewares/validate.middleware";
import {
  createBookingSchema,
  branchIdParamSchema,
} from "../validators/booking.validators";

const router = Router();

// Apply auth middleware to all booking routes
router.use(authMiddleware);

// POST / doesn't need tenantMiddleware (no tenantId in URL)
router.post(
  "/",
  validateRequest(createBookingSchema),
  BookingController.createBooking
);

// GET /branch/:branchId doesn't need tenantMiddleware (has branchId, not tenantId)
// Service will verify branch belongs to user's tenant
router.get(
  "/branch/:branchId",
  validateParams(branchIdParamSchema),
  BookingController.listByBranch
);

export default router;
