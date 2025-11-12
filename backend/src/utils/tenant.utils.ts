/**
 * tenant.utils.ts
 * Production-ready utility functions for tenant-scoped database operations
 * Ensures ALL queries are tenant-isolated to prevent data leaks
 */

/**
 * Add tenant filter to any query where clause
 * Usage: withTenantScope({ status: "ACTIVE" }, tenantId)
 * Returns: { status: "ACTIVE", tenantId }
 */
export const withTenantScope = (where: any = {}, tenantId: string) => {
  if (!tenantId) {
    throw new Error("tenantId is required for scoped queries");
  }

  return {
    ...where,
    tenantId,
  };
};

/**
 * Validate tenant access - compare user's tenant with requested tenant
 * Throws error if tenant mismatch
 */
export const validateTenantAccess = (
  userTenantId: string,
  requestTenantId: string
): void => {
  if (!userTenantId || !requestTenantId) {
    throw new Error("Invalid tenant context");
  }

  if (userTenantId !== requestTenantId) {
    throw new Error("Forbidden - Tenant mismatch");
  }
};

/**
 * Build paginated query with tenant scope
 * Usage: buildPaginatedQuery({ page: 1, limit: 10 }, { status: "ACTIVE" }, tenantId)
 */
export const buildPaginatedQuery = (
  pagination: { page?: number; limit?: number },
  where: any = {},
  tenantId: string
) => {
  const page = Math.max(1, pagination.page || 1);
  const limit = Math.min(100, Math.max(1, pagination.limit || 10));
  const skip = (page - 1) * limit;

  return {
    where: withTenantScope(where, tenantId),
    skip,
    take: limit,
    page,
    limit,
  };
};

/**
 * Format pagination response
 * Usage: formatPaginationResponse(items, total, page, limit)
 */
export const formatPaginationResponse = (
  items: any[],
  total: number,
  page: number,
  limit: number
) => {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };
};

/**
 * Ensure user has permission to access resource
 * Checks user's tenantId against resource's tenantId
 */
export const ensureResourceAccess = (
  resourceTenantId: string,
  userTenantId: string
): void => {
  if (resourceTenantId !== userTenantId) {
    throw new Error("Unauthorized - Resource not found");
  }
};

/**
 * Build filter for multiple tenant operations
 * Usage: buildTenantFilter({ branchId: "123" }, tenantId)
 */
export const buildTenantFilter = (
  additionalFilters: any = {},
  tenantId: string
) => {
  return withTenantScope(additionalFilters, tenantId);
};
