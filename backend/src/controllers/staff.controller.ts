/**
 * staff.controller.ts
 * Handles staff/employee management endpoints.
 *
 * Manages team members, roles, and permissions.
 */

import { Request, Response, NextFunction } from "express";
import { successResponse } from "../utils/response.util";
import StaffService from "../services/staff.service";
import { validateTenantAccess } from "../utils/tenant.utils";

/**
 * Get all staff members
 */
export const getAllStaff = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;

    validateTenantAccess(userTenantId, tenantId);

    const staff = await StaffService.getAllStaff(tenantId);
    return successResponse(res, staff, "Staff fetched");
  } catch (error) {
    next(error);
  }
};

/**
 * Create new staff member
 */
export const createStaff = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const userTenantId = req.user?.tenantId;

    validateTenantAccess(userTenantId, tenantId);

    const staff = await StaffService.createStaff(tenantId, req.body);
    return successResponse(res, staff, "Staff created", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get staff by ID
 */
export const getStaffById = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId, staffId } = req.params;
    const userTenantId = req.user?.tenantId;

    validateTenantAccess(userTenantId, tenantId);

    const staff = await StaffService.getStaffById(staffId, tenantId);
    return successResponse(res, staff, "Staff fetched");
  } catch (error) {
    next(error);
  }
};

/**
 * Update staff
 */
export const updateStaff = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId, staffId } = req.params;
    const userTenantId = req.user?.tenantId;

    validateTenantAccess(userTenantId, tenantId);

    const staff = await StaffService.updateStaff(staffId, tenantId, req.body);
    return successResponse(res, staff, "Staff updated");
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate staff
 */
export const deactivateStaff = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId, staffId } = req.params;
    const userTenantId = req.user?.tenantId;

    validateTenantAccess(userTenantId, tenantId);

    const staff = await StaffService.deactivateStaff(staffId, tenantId);
    return successResponse(res, staff, "Staff deactivated");
  } catch (error) {
    next(error);
  }
};

/**
 * Assign role to staff
 */
export const assignRole = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId, staffId } = req.params;
    const userTenantId = req.user?.tenantId;
    const { role } = req.body;

    validateTenantAccess(userTenantId, tenantId);

    const staff = await StaffService.assignRole(staffId, tenantId, role);
    return successResponse(res, staff, "Role assigned");
  } catch (error) {
    next(error);
  }
};

/**
 * Get staff by branch
 */
export const getStaffByBranch = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId, branchId } = req.params;
    const userTenantId = req.user?.tenantId;

    validateTenantAccess(userTenantId, tenantId);

    const staff = await StaffService.getStaffByBranch(tenantId, branchId);
    return successResponse(res, staff, "Branch staff fetched");
  } catch (error) {
    next(error);
  }
};
