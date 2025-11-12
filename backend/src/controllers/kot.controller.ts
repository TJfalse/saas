/**
 * kot.controller.ts
 * Kitchen Order Ticket (KOT) endpoints - list and manual print trigger.
 */

import { Request, Response, NextFunction } from "express";
import KOTService from "../services/kot.service";

class KOTController {
  static async listByBranch(
    req: Request & any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { branchId } = req.params;
      const tenantId = req.user?.tenantId;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;

      if (!tenantId) {
        throw new Error("Tenant ID is required");
      }

      const list = await KOTService.listByBranch(
        branchId,
        tenantId,
        page,
        limit
      );
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  static async printKOT(req: Request & any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new Error("Tenant ID is required");
      }
      await KOTService.printKOT(id, tenantId);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
}

export default KOTController;
