/**
 * order.controller.ts
 * Handles POS order creation and retrieval.
 */

import { Request, Response, NextFunction } from "express";
import OrderService from "../services/order.service";

class OrderController {
  static async createOrder(
    req: Request & any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new Error("Tenant ID is required");
      }
      const payload = req.body;
      const order = await OrderService.createOrder({
        ...payload,
        tenantId,
        userId: req.user?.userId,
      });
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }

  static async getOrder(req: Request & any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new Error("Tenant ID is required");
      }
      const order = await OrderService.getOrder(req.params.id, tenantId);
      res.json(order);
    } catch (err) {
      next(err);
    }
  }
}

export default OrderController;
