/**
 * staff.service.ts
 * Production-ready staff/employee management via User model.
 * Handles team members, roles, permissions, and lifecycle.
 */

import prisma from "../config/db.config";
import logger from "../config/logger";
import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 10;

interface CreateStaffData {
  email: string;
  name?: string;
  password: string;
  role:
    | "OWNER"
    | "ADMIN"
    | "MANAGER"
    | "WAITER"
    | "KITCHEN"
    | "ACCOUNTANT"
    | "STAFF";
  branchId: string;
}

class StaffService {
  /**
   * Get all staff for tenant
   */
  static async getAllStaff(tenantId: string, branchId?: string) {
    try {
      const query: any = { where: { tenantId } };

      if (branchId) {
        query.where.branchId = branchId;
      }

      const staff = await prisma.user.findMany({
        ...query,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
          branch: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      logger.info(
        `Fetched ${staff.length} staff members for tenant ${tenantId}`
      );
      return staff;
    } catch (error) {
      logger.error("Error fetching staff:", error);
      throw error;
    }
  }

  /**
   * Create new staff member
   */
  static async createStaff(tenantId: string, staffData: CreateStaffData) {
    try {
      // Validate input
      if (
        !staffData.email ||
        !staffData.password ||
        !staffData.role ||
        !staffData.branchId
      ) {
        throw new Error("Email, password, role, and branchId are required");
      }

      // Check if email already exists for this tenant
      const existingUser = await prisma.user.findFirst({
        where: {
          tenantId,
          email: staffData.email,
        },
      });

      if (existingUser) {
        throw new Error("Email already registered for this tenant");
      }

      // Verify branch exists and belongs to tenant
      const branch = await prisma.branch.findFirst({
        where: {
          id: staffData.branchId,
          tenantId,
        },
      });

      if (!branch) {
        throw new Error("Branch not found for tenant");
      }

      // Hash password
      const passwordHash = await bcrypt.hash(staffData.password, BCRYPT_ROUNDS);

      // Create staff member
      const staff = await prisma.user.create({
        data: {
          tenantId,
          branchId: staffData.branchId,
          email: staffData.email,
          name: staffData.name || staffData.email.split("@")[0],
          password: passwordHash,
          role: staffData.role,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          branch: { select: { id: true, name: true } },
        },
      });

      logger.info(`Staff member created: ${staff.id} (${staff.email})`);
      return staff;
    } catch (error) {
      logger.error("Error creating staff:", error);
      throw error;
    }
  }

  /**
   * Get staff by ID
   */
  static async getStaffById(staffId: string, tenantId: string) {
    try {
      const staff = await prisma.user.findFirst({
        where: {
          id: staffId,
          tenantId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
          branch: { select: { id: true, name: true } },
        },
      });

      if (!staff) {
        throw new Error("Staff member not found");
      }

      return staff;
    } catch (error) {
      logger.error("Error fetching staff:", error);
      throw error;
    }
  }

  /**
   * Update staff details
   */
  static async updateStaff(
    staffId: string,
    tenantId: string,
    staffData: Partial<CreateStaffData>
  ) {
    try {
      const staff = await prisma.user.findFirst({
        where: { id: staffId, tenantId },
      });

      if (!staff) {
        throw new Error("Staff member not found");
      }

      const updateData: any = {};

      if (staffData.name) updateData.name = staffData.name;
      if (staffData.role) updateData.role = staffData.role;
      if (staffData.branchId !== undefined)
        updateData.branchId = staffData.branchId;
      if (staffData.password) {
        updateData.password = await bcrypt.hash(
          staffData.password,
          BCRYPT_ROUNDS
        );
      }

      const updated = await prisma.user.update({
        where: { id: staffId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          branch: { select: { id: true, name: true } },
        },
      });

      logger.info(`Staff member updated: ${staffId}`);
      return updated;
    } catch (error) {
      logger.error("Error updating staff:", error);
      throw error;
    }
  }

  /**
   * Deactivate staff member
   */
  static async deactivateStaff(staffId: string, tenantId: string) {
    try {
      const staff = await prisma.user.findFirst({
        where: { id: staffId, tenantId },
      });

      if (!staff) {
        throw new Error("Staff member not found");
      }

      const deactivated = await prisma.user.update({
        where: { id: staffId },
        data: { isActive: false },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
        },
      });

      logger.info(`Staff member deactivated: ${staffId}`);
      return deactivated;
    } catch (error) {
      logger.error("Error deactivating staff:", error);
      throw error;
    }
  }

  /**
   * Assign role to staff member
   */
  static async assignRole(
    staffId: string,
    tenantId: string,
    role:
      | "OWNER"
      | "ADMIN"
      | "MANAGER"
      | "WAITER"
      | "KITCHEN"
      | "ACCOUNTANT"
      | "STAFF"
  ) {
    try {
      const staff = await prisma.user.findFirst({
        where: { id: staffId, tenantId },
      });

      if (!staff) {
        throw new Error("Staff member not found");
      }

      const updated = await prisma.user.update({
        where: { id: staffId },
        data: { role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      logger.info(`Role assigned to ${staffId}: ${role}`);
      return updated;
    } catch (error) {
      logger.error("Error assigning role:", error);
      throw error;
    }
  }

  /**
   * Get staff by branch
   */
  static async getStaffByBranch(tenantId: string, branchId: string) {
    try {
      const staff = await prisma.user.findMany({
        where: {
          tenantId,
          branchId,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          lastLogin: true,
        },
        orderBy: { name: "asc" },
      });

      return staff;
    } catch (error) {
      logger.error("Error fetching branch staff:", error);
      throw error;
    }
  }

  /**
   * Get staff count by role
   */
  static async getStaffCountByRole(tenantId: string) {
    try {
      const counts = await prisma.user.groupBy({
        by: ["role"],
        where: { tenantId, isActive: true },
        _count: { role: true },
      });

      return counts;
    } catch (error) {
      logger.error("Error getting staff count by role:", error);
      throw error;
    }
  }
}

export default StaffService;
