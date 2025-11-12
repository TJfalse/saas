/**
 * tenant.service.ts
 * Production-ready tenant management service.
 * Handles tenant creation, updates, and branch management.
 */

import prisma from "../config/db.config";
import logger from "../config/logger";
import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 10;

interface CreateTenantData {
  name: string;
  domain?: string;
  branchName?: string;
  email: string;
  password: string;
}

class TenantService {
  /**
   * Create new tenant with default branch and owner user
   */
  static async createTenant(data: CreateTenantData) {
    try {
      // Validate input
      if (!data.name || !data.email || !data.password) {
        throw new Error("Tenant name, email, and password are required");
      }

      // Check if tenant name already exists
      const existingTenant = await prisma.tenant.findUnique({
        where: { name: data.name },
      });

      if (existingTenant) {
        throw new Error("Tenant name already exists");
      }

      // Check if email already exists
      const existingUser = await prisma.user.findFirst({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

      // Create tenant with branch and user in transaction
      const tenant = await prisma.$transaction(async (tx) => {
        const newTenant = await tx.tenant.create({
          data: {
            name: data.name,
            domain: data.domain,
            isActive: true,
          },
        });

        // Create default branch
        await tx.branch.create({
          data: {
            tenantId: newTenant.id,
            name: data.branchName || "Main Branch",
          },
        });

        // Create owner user
        await tx.user.create({
          data: {
            tenantId: newTenant.id,
            email: data.email,
            password: passwordHash,
            role: "OWNER",
            isActive: true,
          },
        });

        return newTenant;
      });

      logger.info(`Tenant created: ${tenant.id} (${tenant.name})`);

      return {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        isActive: tenant.isActive,
      };
    } catch (error) {
      logger.error("Error creating tenant:", error);
      throw error;
    }
  }

  /**
   * Get tenant details
   */
  static async getTenant(tenantId: string) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          branches: true,
          _count: {
            select: { users: true, products: true, orders: true },
          },
        },
      });

      if (!tenant) {
        throw new Error("Tenant not found");
      }

      return tenant;
    } catch (error) {
      logger.error("Error getting tenant:", error);
      throw error;
    }
  }

  /**
   * Get all tenants
   */
  static async getAllTenants() {
    try {
      const tenants = await prisma.tenant.findMany({
        include: {
          branches: true,
          _count: {
            select: { users: true, products: true, orders: true },
          },
        },
      });

      return tenants;
    } catch (error) {
      logger.error("Error getting all tenants:", error);
      throw error;
    }
  }

  /**
   * Update tenant
   */
  static async updateTenant(tenantId: string, data: Partial<CreateTenantData>) {
    try {
      const tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          name: data.name,
          domain: data.domain,
        },
      });

      logger.info(`Tenant updated: ${tenantId}`);

      return tenant;
    } catch (error) {
      logger.error("Error updating tenant:", error);
      throw error;
    }
  }

  /**
   * Create new branch for tenant
   */
  static async createBranch(tenantId: string, branchData: any) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new Error("Tenant not found");
      }

      const branch = await prisma.branch.create({
        data: {
          tenantId,
          name: branchData.name,
          address: branchData.address,
          phone: branchData.phone,
          email: branchData.email,
        },
      });

      logger.info(`Branch created: ${branch.id} for tenant ${tenantId}`);

      return branch;
    } catch (error) {
      logger.error("Error creating branch:", error);
      throw error;
    }
  }

  /**
   * Get tenant branches
   */
  static async getBranches(tenantId: string) {
    try {
      const branches = await prisma.branch.findMany({
        where: { tenantId },
        include: {
          _count: { select: { tables: true, users: true } },
        },
      });

      return branches;
    } catch (error) {
      logger.error("Error getting branches:", error);
      throw error;
    }
  }

  /**
   * Deactivate tenant
   */
  static async deactivateTenant(tenantId: string) {
    try {
      const tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: { isActive: false },
      });

      logger.info(`Tenant deactivated: ${tenantId}`);

      return tenant;
    } catch (error) {
      logger.error("Error deactivating tenant:", error);
      throw error;
    }
  }
}

export default TenantService;
