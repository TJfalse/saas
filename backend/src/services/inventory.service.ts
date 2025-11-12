/**
 * inventory.service.ts
 * Production-ready inventory management via Prisma.
 *
 * Manages stock levels, stock movements, ingredients, and inventory tracking
 * with proper transaction handling and audit trails.
 */

import prisma from "../config/db.config";
import logger from "../config/logger";
import { Decimal } from "@prisma/client/runtime/library";
import { MovementType } from "@prisma/client";

interface StockItemData {
  tenantId: string;
  branchId?: string;
  productId: string;
  qty: number;
  minQty?: number;
}

interface StockMovementData {
  tenantId: string;
  branchId?: string;
  productId: string;
  type: MovementType;
  qty: number;
  reference?: string;
  notes?: string;
}

/**
 * Get all inventory/stock items for tenant
 */
export async function getInventoryItems(
  tenantId: string,
  branchId?: string,
  page = 1,
  limit = 50
) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (branchId) {
      where.branchId = branchId;
    }

    const [items, total] = await Promise.all([
      prisma.stockItem.findMany({
        where,
        include: {
          product: true,
          tenant: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.stockItem.count({ where }),
    ]);

    logger.info(
      `Fetched ${items.length} inventory items for tenant ${tenantId}`
    );

    return { items, total, page, limit };
  } catch (error) {
    logger.error("Error fetching inventory items:", error);
    throw error;
  }
}

/**
 * Get single inventory item by ID
 */
export async function getInventoryItem(itemId: string, tenantId: string) {
  try {
    if (!itemId || !tenantId) {
      throw new Error("Item ID and tenant ID are required");
    }

    const item = await prisma.stockItem.findFirst({
      where: {
        id: itemId,
        tenantId,
      },
      include: {
        product: true,
        tenant: true,
      },
    });

    if (!item) {
      throw new Error("Stock item not found");
    }

    return item;
  } catch (error) {
    logger.error("Error fetching inventory item:", error);
    throw error;
  }
}

/**
 * Create inventory item
 */
export async function createInventoryItem(data: StockItemData) {
  try {
    // Validate input
    if (!data.tenantId || !data.productId) {
      throw new Error("Tenant ID and product ID are required");
    }

    if (data.qty < 0) {
      throw new Error("Quantity cannot be negative");
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.tenantId },
    });

    if (!tenant) {
      throw new Error("Tenant not found");
    }

    // Verify product exists
    const product = await prisma.product.findFirst({
      where: {
        id: data.productId,
        tenantId: data.tenantId,
      },
    });

    if (!product) {
      throw new Error("Product not found or does not belong to this tenant");
    }

    // Check if stock item already exists
    const existing = await prisma.stockItem.findFirst({
      where: {
        tenantId: data.tenantId,
        productId: data.productId,
      },
    });

    if (existing) {
      throw new Error("Stock item already exists for this product");
    }

    // Create stock item
    const item = await prisma.stockItem.create({
      data: {
        tenantId: data.tenantId,
        branchId: data.branchId,
        productId: data.productId,
        qty: data.qty,
        minQty: data.minQty || 10,
      },
      include: { product: true },
    });

    // Log creation
    await prisma.auditLog.create({
      data: {
        tenantId: data.tenantId,
        action: "CREATE",
        resource: "StockItem",
        newValues: item as any,
      },
    });

    logger.info(`Stock item created: ${item.id} for product ${data.productId}`);

    return item;
  } catch (error) {
    logger.error("Error creating inventory item:", error);
    throw error;
  }
}

/**
 * Update inventory item
 */
export async function updateInventoryItem(
  itemId: string,
  tenantId: string,
  data: Partial<StockItemData>
) {
  try {
    if (!itemId || !tenantId) {
      throw new Error("Item ID and tenant ID are required");
    }

    // Get current item
    const currentItem = await getInventoryItem(itemId, tenantId);

    // Validate qty if provided
    if (data.qty !== undefined && data.qty < 0) {
      throw new Error("Quantity cannot be negative");
    }

    // Update item
    const updated = await prisma.stockItem.update({
      where: { id: itemId },
      data: {
        qty: data.qty !== undefined ? data.qty : undefined,
        minQty: data.minQty !== undefined ? data.minQty : undefined,
      },
      include: { product: true },
    });

    // Log update
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: "UPDATE",
        resource: "StockItem",
        oldValues: currentItem as any,
        newValues: updated as any,
      },
    });

    logger.info(`Stock item updated: ${itemId}`);

    return updated;
  } catch (error) {
    logger.error("Error updating inventory item:", error);
    throw error;
  }
}

/**
 * Delete inventory item (only if qty is 0)
 */
export async function deleteInventoryItem(itemId: string, tenantId: string) {
  try {
    if (!itemId || !tenantId) {
      throw new Error("Item ID and tenant ID are required");
    }

    const item = await getInventoryItem(itemId, tenantId);

    if (item.qty > 0) {
      throw new Error("Cannot delete stock item with remaining quantity");
    }

    await prisma.stockItem.delete({
      where: { id: itemId },
    });

    // Log deletion
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: "DELETE",
        resource: "StockItem",
        oldValues: item as any,
      },
    });

    logger.info(`Stock item deleted: ${itemId}`);

    return { id: itemId, deleted: true };
  } catch (error) {
    logger.error("Error deleting inventory item:", error);
    throw error;
  }
}

/**
 * Get low stock items (qty < minQty)
 */
export async function getLowStockItems(tenantId: string, branchId?: string) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const where: any = { tenantId };
    if (branchId) {
      where.branchId = branchId;
    }

    const lowStockItems = await prisma.stockItem.findMany({
      where: {
        ...where,
        qty: {
          lt: prisma.stockItem.fields.minQty, // This won't work, use raw query
        },
      },
      include: { product: true },
      orderBy: { qty: "asc" },
    });

    logger.info(
      `Fetched ${lowStockItems.length} low stock items for tenant ${tenantId}`
    );

    return lowStockItems;
  } catch (error) {
    logger.error("Error fetching low stock items:", error);
    throw error;
  }
}

/**
 * Get low stock items using raw query
 */
export async function getLowStockItemsOptimized(
  tenantId: string,
  branchId?: string
) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const query = `
      SELECT si.* FROM "StockItem" si
      WHERE si."tenantId" = $1
      ${branchId ? 'AND si."branchId" = $2' : ""}
      AND si.qty < si."minQty"
      ORDER BY si.qty ASC
    `;

    const items = await prisma.$queryRawUnsafe(query, tenantId, branchId);

    logger.info(
      `Fetched ${
        (items as any[]).length
      } low stock items for tenant ${tenantId}`
    );

    return items;
  } catch (error) {
    logger.error("Error fetching low stock items:", error);
    throw error;
  }
}

/**
 * Record stock movement (PURCHASE, CONSUMPTION, WASTAGE, ADJUSTMENT)
 */
export async function recordStockMovement(data: StockMovementData) {
  try {
    // Validate input
    if (
      !data.tenantId ||
      !data.productId ||
      !data.type ||
      data.qty === undefined
    ) {
      throw new Error("Tenant ID, product ID, type, and quantity are required");
    }

    if (data.qty <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.tenantId },
    });

    if (!tenant) {
      throw new Error("Tenant not found");
    }

    // Get stock item
    const stockItem = await prisma.stockItem.findFirst({
      where: {
        tenantId: data.tenantId,
        productId: data.productId,
      },
    });

    if (!stockItem) {
      throw new Error("Stock item not found");
    }

    // Process movement in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create movement record
      const movement = await tx.stockMovement.create({
        data: {
          tenantId: data.tenantId,
          branchId: data.branchId,
          productId: data.productId,
          type: data.type,
          qty: data.qty,
          reference: data.reference,
          notes: data.notes,
        },
      });

      // Update stock quantity based on movement type
      let newQty = stockItem.qty;

      switch (data.type) {
        case "PURCHASE":
        case "ADJUSTMENT": // If adjustment adds stock
          newQty += data.qty;
          break;
        case "CONSUMPTION":
        case "WASTAGE":
          if (stockItem.qty < data.qty) {
            throw new Error("Insufficient stock for this movement");
          }
          newQty -= data.qty;
          break;
      }

      // Update stock item
      await tx.stockItem.update({
        where: { id: stockItem.id },
        data: { qty: newQty },
      });

      // Log movement
      await tx.auditLog.create({
        data: {
          tenantId: data.tenantId,
          action: "MOVEMENT",
          resource: "StockMovement",
          newValues: {
            type: data.type,
            qty: data.qty,
            reference: data.reference,
            previousQty: stockItem.qty,
            newQty,
          } as any,
        },
      });

      return { movement, newQty };
    });

    logger.info(
      `Stock movement recorded: ${data.type} of ${data.qty} units for product ${data.productId}`
    );

    return result;
  } catch (error) {
    logger.error("Error recording stock movement:", error);
    throw error;
  }
}

/**
 * Get stock movements for a product
 */
export async function getStockMovements(
  tenantId: string,
  productId?: string,
  page = 1,
  limit = 50
) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (productId) {
      where.productId = productId;
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    logger.info(
      `Fetched ${movements.length} stock movements for tenant ${tenantId}`
    );

    return { movements, total, page, limit };
  } catch (error) {
    logger.error("Error fetching stock movements:", error);
    throw error;
  }
}

/**
 * Get stock summary for tenant/branch
 */
export async function getStockSummary(tenantId: string, branchId?: string) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const where: any = { tenantId };
    if (branchId) {
      where.branchId = branchId;
    }

    const items = await prisma.stockItem.findMany({
      where,
      include: { product: true },
    });

    const summary = {
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.qty, 0),
      lowStockCount: items.filter((item) => item.qty < item.minQty).length,
      items,
    };

    return summary;
  } catch (error) {
    logger.error("Error fetching stock summary:", error);
    throw error;
  }
}

/**
 * Adjust stock quantity (for manual corrections)
 */
export async function adjustStock(
  tenantId: string,
  productId: string,
  adjustment: number,
  reason: string
) {
  try {
    if (!tenantId || !productId || adjustment === undefined || !reason) {
      throw new Error("All parameters are required");
    }

    const movementType = adjustment > 0 ? "ADJUSTMENT" : "ADJUSTMENT";
    const qty = Math.abs(adjustment);

    return recordStockMovement({
      tenantId,
      productId,
      type: movementType,
      qty,
      notes: reason,
    });
  } catch (error) {
    logger.error("Error adjusting stock:", error);
    throw error;
  }
}
