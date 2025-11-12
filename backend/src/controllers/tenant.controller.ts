/**
 * tenant.controller.ts
 * Tenant onboarding & basic details.
 * In a SaaS environment tenant creation will also create default roles, sample data and billing setup.
 */

import { Request, Response, NextFunction } from "express";
import TenantService from "../services/tenant.service";

class TenantController {
  static async createTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const tenant = await TenantService.createTenant(data);
      res.status(201).json(tenant);
    } catch (err) {
      next(err);
    }
  }

  static async getTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await TenantService.getTenant(req.params.id);
      res.json(tenant);
    } catch (err) {
      next(err);
    }
  }

  static async getAllTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const tenants = await TenantService.getAllTenants();
      res.json(tenants);
    } catch (err) {
      next(err);
    }
  }
}

export default TenantController;
