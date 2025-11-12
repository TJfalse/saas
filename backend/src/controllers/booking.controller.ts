/**
 * booking.controller.ts
 * Booking endpoints for reservations. Includes minimal validation.
 */

import { Request, Response, NextFunction } from "express";
import BookingService from "../services/booking.service";
import { validateTenantAccess, withTenantScope } from "../utils/tenant.utils";

class BookingController {
  static async createBooking(
    req: Request & any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const payload = req.body;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const booking = await BookingService.create({ ...payload, tenantId });
      res.status(201).json(booking);
    } catch (err) {
      next(err);
    }
  }

  static async listByBranch(
    req: Request & any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { branchId } = req.params;
      const userTenantId = req.user?.tenantId;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;

      if (!userTenantId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const list = await BookingService.listByBranch(
        branchId,
        userTenantId,
        page,
        limit
      );
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
}

export default BookingController;
