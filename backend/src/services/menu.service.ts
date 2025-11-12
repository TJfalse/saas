/**
 * menu.service.ts
 * Production-ready menu management via Product model.
 * Handles menu items, categories, pricing, and visibility.
 */

import prisma from "../config/db.config";
import logger from "../config/logger";

interface CreateMenuItemData {
  sku?: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  costPrice?: number;
  isInventoryTracked?: boolean;
}

class MenuService {
  /**
   * Get all menu items for tenant
   */
  static async getAllMenuItems(
    tenantId: string,
    category?: string,
    branchId?: string
  ) {
    try {
      const query: any = {
        where: {
          tenantId,
          isActive: true,
        },
      };

      if (category) {
        query.where.category = category;
      }

      if (branchId) {
        query.where.branchId = branchId;
      }

      const items = await prisma.product.findMany({
        ...query,
        select: {
          id: true,
          sku: true,
          name: true,
          description: true,
          category: true,
          price: true,
          costPrice: true,
          isInventoryTracked: true,
          createdAt: true,
        },
        orderBy: { category: "asc" },
      });

      logger.info(`Fetched ${items.length} menu items for tenant ${tenantId}`);
      return items;
    } catch (error) {
      logger.error("Error fetching menu items:", error);
      throw error;
    }
  }

  /**
   * Create new menu item
   */
  static async createMenuItem(
    tenantId: string,
    itemData: CreateMenuItemData,
    branchId?: string
  ) {
    try {
      // Validate input
      if (!itemData.name || !itemData.price) {
        throw new Error("Name and price are required");
      }

      if (itemData.price < 0) {
        throw new Error("Price cannot be negative");
      }

      if (itemData.costPrice && itemData.costPrice < 0) {
        throw new Error("Cost price cannot be negative");
      }

      // Check if SKU already exists for tenant (if provided)
      if (itemData.sku) {
        const existing = await prisma.product.findFirst({
          where: {
            tenantId,
            sku: itemData.sku,
          },
        });

        if (existing) {
          throw new Error("SKU already exists for this tenant");
        }
      }

      // Create menu item
      const item = await prisma.product.create({
        data: {
          tenantId,
          branchId: branchId || null,
          sku: itemData.sku || `SKU-${Date.now()}`,
          name: itemData.name,
          description: itemData.description,
          category: itemData.category,
          price: itemData.price,
          costPrice: itemData.costPrice,
          isInventoryTracked: itemData.isInventoryTracked || true,
          isActive: true,
        },
        select: {
          id: true,
          sku: true,
          name: true,
          description: true,
          category: true,
          price: true,
          costPrice: true,
          isInventoryTracked: true,
          createdAt: true,
        },
      });

      logger.info(`Menu item created: ${item.id} (${item.name})`);
      return item;
    } catch (error) {
      logger.error("Error creating menu item:", error);
      throw error;
    }
  }

  /**
   * Get menu item by ID
   */
  static async getMenuItemById(itemId: string, tenantId: string) {
    try {
      const item = await prisma.product.findFirst({
        where: {
          id: itemId,
          tenantId,
        },
        select: {
          id: true,
          sku: true,
          name: true,
          description: true,
          category: true,
          price: true,
          costPrice: true,
          isInventoryTracked: true,
          isActive: true,
          createdAt: true,
          recipes: {
            select: {
              id: true,
              ingredients: {
                select: {
                  id: true,
                  quantity: true,
                  unit: true,
                },
              },
            },
          },
        },
      });

      if (!item) {
        throw new Error("Menu item not found");
      }

      return item;
    } catch (error) {
      logger.error("Error fetching menu item:", error);
      throw error;
    }
  }

  /**
   * Update menu item
   */
  static async updateMenuItem(
    itemId: string,
    tenantId: string,
    itemData: Partial<CreateMenuItemData>
  ) {
    try {
      const item = await prisma.product.findFirst({
        where: { id: itemId, tenantId },
      });

      if (!item) {
        throw new Error("Menu item not found");
      }

      const updateData: any = {};

      if (itemData.name) updateData.name = itemData.name;
      if (itemData.description !== undefined)
        updateData.description = itemData.description;
      if (itemData.category !== undefined)
        updateData.category = itemData.category;
      if (itemData.price !== undefined) {
        if (itemData.price < 0) throw new Error("Price cannot be negative");
        updateData.price = itemData.price;
      }
      if (itemData.costPrice !== undefined) {
        if (itemData.costPrice < 0)
          throw new Error("Cost price cannot be negative");
        updateData.costPrice = itemData.costPrice;
      }
      if (itemData.isInventoryTracked !== undefined)
        updateData.isInventoryTracked = itemData.isInventoryTracked;

      const updated = await prisma.product.update({
        where: { id: itemId },
        data: updateData,
        select: {
          id: true,
          sku: true,
          name: true,
          description: true,
          category: true,
          price: true,
          costPrice: true,
          isInventoryTracked: true,
          updatedAt: true,
        },
      });

      logger.info(`Menu item updated: ${itemId}`);
      return updated;
    } catch (error) {
      logger.error("Error updating menu item:", error);
      throw error;
    }
  }

  /**
   * Deactivate menu item
   */
  static async deactivateMenuItem(itemId: string, tenantId: string) {
    try {
      const item = await prisma.product.findFirst({
        where: { id: itemId, tenantId },
      });

      if (!item) {
        throw new Error("Menu item not found");
      }

      const deactivated = await prisma.product.update({
        where: { id: itemId },
        data: { isActive: false },
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      });

      logger.info(`Menu item deactivated: ${itemId}`);
      return deactivated;
    } catch (error) {
      logger.error("Error deactivating menu item:", error);
      throw error;
    }
  }

  /**
   * Get menu categories
   */
  static async getMenuCategories(tenantId: string) {
    try {
      const categories = await prisma.product.groupBy({
        by: ["category"],
        where: {
          tenantId,
          isActive: true,
          category: { not: null },
        },
        _count: { id: true },
      });

      return categories.map((c: any) => ({
        name: c.category,
        count: c._count.id,
      }));
    } catch (error) {
      logger.error("Error fetching menu categories:", error);
      throw error;
    }
  }

  /**
   * Get menu items by category
   */
  static async getMenuItemsByCategory(tenantId: string, category: string) {
    try {
      const items = await prisma.product.findMany({
        where: {
          tenantId,
          category,
          isActive: true,
        },
        select: {
          id: true,
          sku: true,
          name: true,
          description: true,
          price: true,
          costPrice: true,
        },
        orderBy: { name: "asc" },
      });

      return items;
    } catch (error) {
      logger.error("Error fetching items by category:", error);
      throw error;
    }
  }

  /**
   * Calculate profit margin for item
   */
  static calculateProfitMargin(price: number, costPrice?: number): number {
    if (!costPrice || costPrice === 0) return 0;
    return ((price - costPrice) / price) * 100;
  }

  /**
   * Get menu with profit analysis
   */
  static async getMenuWithAnalysis(tenantId: string) {
    try {
      const items = await prisma.product.findMany({
        where: { tenantId, isActive: true },
        select: {
          id: true,
          name: true,
          category: true,
          price: true,
          costPrice: true,
        },
      });

      return items.map((item: any) => ({
        ...item,
        profitMargin: this.calculateProfitMargin(item.price, item.costPrice),
      }));
    } catch (error) {
      logger.error("Error generating menu analysis:", error);
      throw error;
    }
  }
}

export default MenuService;
